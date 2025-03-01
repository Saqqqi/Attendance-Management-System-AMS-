const Attendance = require('../Models/Attendance');
const Employee = require('../Models/Employee');
const moment = require('moment-timezone');


exports.getLoggedInEmployeeAttendance = async (req, res) => {
  const currentTime = moment().tz('Asia/Karachi');
  const currentDate = currentTime.format('YYYY-MM-DD');
  
  // Define shift timings
  const shiftStartTime = currentTime.clone().hour(17).minute(0).second(0); // 5 PM
  const shiftEndTime = currentTime.clone().hour(8).minute(0).second(0).add(1, 'day'); // 8 AM next day
  
  // Determine the date for filtering records
  const filterDate = currentTime.isBefore(shiftStartTime) ? currentTime.clone().subtract(1, 'day').format('YYYY-MM-DD') : currentDate;

  try {
    // Fetch attendance records for the determined date
    const attendanceRecords = await Attendance.aggregate([
      {
        $addFields: {
          fullLoginTime: {
            $dateFromString: {
              dateString: { $concat: [{ $dateToString: { format: '%Y-%m-%d', date: '$date' } }, ' ', '$in_time'] },
              timezone: 'Asia/Karachi'
            }
          },
          fullLogoutTime: {
            $dateFromString: {
              dateString: { $concat: [{ $dateToString: { format: '%Y-%m-%d', date: '$date' } }, ' ', '$out_time'] },
              timezone: 'Asia/Karachi'
            }
          }
        }
      },
      { $match: { date: { $eq: new Date(filterDate) } } },
      { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'employeeDetails' } },
      { $unwind: { path: '$employeeDetails', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'designations', localField: 'employeeDetails.designation', foreignField: '_id', as: 'designationDetails' } },
      { $unwind: { path: '$designationDetails', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          'employeeDetails.role': '$designationDetails.role',
          formattedLoginTime: {
            $cond: {
              if: { $not: ['$in_time'] },
              then: 'Not Logged In',
              else: { $dateToString: { format: '%H:%M:%S', date: '$fullLoginTime' } }
            }
          },
          formattedLogoutTime: {
            $cond: {
              if: { $not: ['$out_time'] },
              then: { $cond: { if: { $eq: ['$is_logged_in', true] }, then: 'Not Logged Out Yet', else: 'Not Logged Out Yet' } },
              else: { $dateToString: { format: '%H:%M:%S', date: '$fullLogoutTime' } }
            }
          }
        }
      }
    ]);

    const allEmployees = await Employee.find();
    const totalEmployeeCount = allEmployees.length;
    const loggedInEmployees = [];
    const leaveEmployees = [];

    // Process attendance records
    attendanceRecords.forEach(record => {
      const { employeeDetails, in_time, out_time, is_logged_in, date } = record;
      const scheduledTime = moment(`${filterDate} ${employeeDetails?.in_time}`, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Karachi');
      const loginMoment = in_time ? moment(`${filterDate} ${in_time}`, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Karachi') : null;

      const diffInMinutes = loginMoment ? loginMoment.diff(scheduledTime, 'minutes') : null;
      const isOnTime = diffInMinutes !== null && diffInMinutes >= -160 && diffInMinutes <= 16;

      const employeeData = {
        employeeId: employeeDetails?._id || 'Unknown',
        employeeName: employeeDetails?.name || 'Unknown',
        employeeEmail: employeeDetails?.email || 'Unknown',
        designation: employeeDetails?.role || 'Unknown',
        loginTime: in_time ? loginMoment.format('HH:mm:ss') : 'Not Logged In',
        logoutTime: out_time ? moment(`${filterDate} ${out_time}`, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Karachi').format('HH:mm:ss') : (is_logged_in ? 'Not Logged Out Yet' : 'Not Logged Out Yet'),
        isLoggedIn: is_logged_in,
        date: moment(date).tz('Asia/Karachi').format('YYYY-MM-DD'),
        totalEmployees: totalEmployeeCount,
        isOnTime,
        status: in_time ? (out_time ? 'Attendance Marked' : 'Present') : 'Leave'
      };

      (in_time ? loggedInEmployees : leaveEmployees).push(employeeData);
    });

    // Add employees who did not log in
    allEmployees.forEach(employee => {
      if (!attendanceRecords.some(record => String(record.employee) === String(employee._id))) {
        leaveEmployees.push({
          employeeId: employee._id,
          employeeName: employee.name,
          employeeEmail: employee.email,
          designation: employee.designation?.role || 'Unknown',
          loginTime: 'Not Logged In',
          logoutTime: 'Not Logged Out Yet',
          isLoggedIn: false,
          date: currentDate,
          status: 'Leave',
          totalEmployees: totalEmployeeCount,
          isOnTime: false
        });
      }
    });

    return res.status(200).json({ loggedInEmployees, leaveEmployees });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params; // Get employeeId from URL params

    // Validate if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Fetch all attendance records for the employee and populate breaks
    const attendanceRecords = await Attendance.find({ employee: employeeId })
      .populate('employee', 'name email')
      .populate('breaks')  // Populate the breaks field to get all breaks
      .lean();

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this employee' });
    }

    // Initialize counters for total presents, leaves, and breaks
    let totalPresents = 0;
    let totalLeaves = 0;
    let totalBreakMinutes = 0;

    // Format attendance records and calculate total presents, leaves, and breaks
    const formattedRecords = attendanceRecords.map(record => {
      const { in_time, out_time, is_logged_in, date, breaks } = record;

      // Ensure 'date' is a valid Date object and format it properly
      const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;

      // Count presents and leaves
      if (in_time) {
        totalPresents += 1; // Count present if both login and logout times are present
      } else {
        totalLeaves += 1; // Count leave if either login or logout time is missing
      }

      // Calculate total break duration for the day
      let dailyBreakDuration = 0;
      const breakDetails = breaks.map(b => {
        const breakStart = b.break_start;
        const breakEnd = b.break_end || new Date().toISOString().split('T')[1];  // Use current time if not ended

        // Calculate break duration in minutes
        const breakStartTime = new Date(`1970-01-01T${breakStart}Z`);
        const breakEndTime = new Date(`1970-01-01T${breakEnd}Z`);
        const breakDuration = Math.round((breakEndTime - breakStartTime) / 60000); // duration in minutes

        dailyBreakDuration += breakDuration;

        return {
          breakStartTime: breakStart,
          breakEndTime: breakEnd,
          breakDuration: formatDuration(breakDuration), // Format break duration
          breakType: b.break_type,
          breakNotes: b.notes,
        };
      });

      // Add the total break time for this attendance record
      totalBreakMinutes += dailyBreakDuration;

      return {
        loginTime: in_time || 'Not Logged In',
        logoutTime: is_logged_in ? 'Not Logged Out Yet' : out_time || 'Not Logged Out Yet',
        isLoggedIn: is_logged_in,
        date: formattedDate,
        breaks: breakDetails,
        dailyBreakDuration: formatDuration(dailyBreakDuration), // Format total break duration for the day
        employee,
      };
    });

    // Return the attendance records along with the counts for presents, leaves, and break details
    return res.status(200).json({
      attendanceRecords: formattedRecords,
      totalPresents,
      totalLeaves,
      totalBreakMinutes: formatDuration(totalBreakMinutes),  // Total break time formatted
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to format duration in hours and minutes
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let formattedDuration = '';

  if (hours > 0) {
    formattedDuration += `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  if (remainingMinutes > 0) {
    if (hours > 0) {
      formattedDuration += ' and ';
    }
    formattedDuration += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  }

  return formattedDuration || '0 minutes';
}




// Get all present employee record
exports.getPresentEmployees = async (req, res) => {
  try {
    const { employeeId } = req.params; // Get employeeId from URL params



    // Validate if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Fetch attendance records where the employee was present (both in_time and out_time are present)
    const presentRecords = await Attendance.find({
      employee: employeeId,
      in_time: { $ne: null },
      out_time: { $ne: null },
    })
      .populate('employee', 'name designation') // Fetch only name and designation from the employee
      .lean();

    if (presentRecords.length === 0) {
      return res.status(404).json({ message: 'No present attendance records found for this employee' });
    }

    // Extract only name and designation from each present record
    const presentEmployeeDetails = presentRecords.map(record => ({
      name: record.employee.name,
      designation: record.employee.designation,
    }));
    // Return the names and designations of employees present
    return res.status(200).json({
      presentEmployees: presentEmployeeDetails,
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


