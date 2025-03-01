const Authentication = require('../Models/Authentication');
const Employee = require('../Models/Employee');
const Attendance = require('../Models/Attendance');
const moment = require('moment-timezone');



function calculateSessionDuration(inTime, outTime) {
  const inTimeParts = inTime.split(':');
  const outTimeParts = outTime.split(':');

  const inMinutes = parseInt(inTimeParts[0]) * 60 + parseInt(inTimeParts[1]);
  const outMinutes = parseInt(outTimeParts[0]) * 60 + parseInt(outTimeParts[1]);

  return outMinutes - inMinutes;
}

exports.login = async (req, res) => {
  try {
    const { secretKey } = req.body;
    const authRecord = await Authentication.findOne({ Secretkey: secretKey }).populate('employeeId');
    if (!authRecord) {
      return res.status(401).json({ error: 'Invalid Secret Key' });
    }

    const employee = authRecord.employeeId;
    const now = moment().tz('Asia/Karachi');
    const currentTime = now.format('HH:mm:ss');
    const hour = now.hour();

    let shiftDate = now.clone();
    if (hour < 9) {
      shiftDate = now.subtract(1, 'day');
    }

    const formattedShiftDate = shiftDate.format('YYYY-MM-DD');
    let attendance = await Attendance.findOne({
      employee: employee._id,
      date: formattedShiftDate,
    });

    const expirationTime = shiftDate.clone().add(16, 'hours').format('HH:mm:ss');

    if (!attendance) {
      attendance = await Attendance.create({
        employee: employee._id,
        date: formattedShiftDate,
        in_time: currentTime,
        is_logged_in: true,
      });

      return res.status(200).json({
        message: 'Login successful (Time-In recorded)',
        employeeId: employee._id,
        attendanceId: attendance._id,
        roleCompany: employee.role_company,
        employeeName: employee.name,
        inTime: attendance.in_time,
        isLoggedIn: attendance.is_logged_in,
        expirationTime: expirationTime,
      });
    } else if (attendance.is_logged_in) {
      return res.status(200).json({
        message: 'You are still logged in. Please go to the logout page to log out.',
        employeeId: employee._id,
        employeeName: employee.name,
        roleCompany: employee.role_company,
        inTime: attendance.in_time,
        isLoggedIn: attendance.is_logged_in,
      });
    } else if (hour >= 17) {
      const newShiftDate = now.format('YYYY-MM-DD');
      const newAttendance = await Attendance.create({
        employee: employee._id,
        date: newShiftDate,
        in_time: currentTime,
        is_logged_in: true,
      });

      return res.status(200).json({
        message: 'New shift login successful (Time-In recorded)',
        employeeId: employee._id,
        attendanceId: newAttendance._id,
        roleCompany: employee.role_company,
        employeeName: employee.name,
        inTime: newAttendance.in_time,
        isLoggedIn: newAttendance.is_logged_in,
        expirationTime: expirationTime,
      });
    } else {
      return res.status(400).json({ error: 'Attendance already marked for today' });
    }
  } catch (error) {
    res.status(500).json({ error: 'This employee has been deleted from record.!' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { secretKey } = req.body;

    // Validate the secret key
    const authRecord = await Authentication.findOne({ Secretkey: secretKey }).populate('employeeId');
    if (!authRecord) {
      return res.status(401).json({ error: 'Invalid Secret Key' });
    }

    const employee = authRecord.employeeId;

    // Get current date and time in Pakistan's timezone
    const now = moment().tz('Asia/Karachi');
    const currentTime = now.format('HH:mm:ss');

    // Find the latest attendance record for the employee
    const attendance = await Attendance.findOne({
      employee: employee._id,
      is_logged_in: true, // Ensure the user is currently logged in
    }).sort({ date: -1 }).limit(1);

    if (!attendance) {
      return res.status(400).json({
        error: 'No active login session found or user already logged out.',
      });
    }

    // Update logout time and session duration
    attendance.out_time = currentTime;
    attendance.session_duration = calculateSessionDuration(attendance.in_time, attendance.out_time);
    attendance.is_logged_in = false;

    await attendance.save();

    return res.status(200).json({
      message: 'Logout successful (Time-Out recorded)',
      employeeId: employee._id,
      attendanceId: attendance._id,
      inTime: attendance.in_time,
      outTime: attendance.out_time,
      sessionDuration: attendance.session_duration,
      isLoggedIn: attendance.is_logged_in,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to calculate session duration in minutes
function calculateSessionDuration(inTime, outTime) {
  const inMoment = moment(inTime, 'HH:mm:ss');
  const outMoment = moment(outTime, 'HH:mm:ss');
  return outMoment.diff(inMoment, 'minutes'); // Returns duration in minutes
}
