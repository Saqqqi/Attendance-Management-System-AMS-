import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const EmployeeAttendance = () => {
    const { id } = useParams();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employeeName, setEmployeeName] = useState(null);
    const [totalPresents, setTotalPresents] = useState(0);
    const [totalLeaves, setTotalLeaves] = useState(0);

    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            try {
                const employeeId = localStorage.getItem("employeeId"); // Get employeeId from local storage
                const response = await axios.get(`http://localhost:5000/attendance/employee/${id}`, {
                  headers: {
                    'employee-id': employeeId, // Send employeeId in the header
                  },
                });
          
                // Access totalPresents and totalLeaves from the API response
                const { totalPresents, totalLeaves, attendanceRecords } = response.data;

                console.log("Response data: ",response.data);
                // Set data to state
                setEmployeeName(attendanceRecords[0]?.employee?.name || "Employee Name");
                setAttendanceRecords(attendanceRecords);
                setTotalPresents(totalPresents);
                setTotalLeaves(totalLeaves);
                
            } catch (err) {
                // Handle error and set the error state with the error message
                setError(err.response?.data?.message || 'Failed to fetch attendance records');
                console.error('Error fetching data: ', err);
            } finally {
                setLoading(false); // Set loading to false when the request is complete
            }
        };

        fetchAttendanceRecords(); // Invoke the fetch function
    }, [id]); // Depend on `id` to refetch if the `id` changes

    // Loading state
    if (loading) {
        return <p className='text-white text-xl'>Loading...</p>;
    }

    // Error state
    if (error) {
        return <div className=" inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-transparent border-2 border-red-500 rounded-lg w-full max-w-2xl mx-4 p-6 text-center">
          <p className="text-red-500 text-2xl font-bold">Only admin can access this resource</p>
        </div>
      </div>;
    }

    // Render attendance records
    return (
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow- border border-[#36BCBA]">
    <h2 className="text-xl text-[#B93E00] mb-12 border border-[#B93E00] text-center py-2 rounded-lg">Monthly Attendance Record</h2>
    <div className="text-center text-xl text-white mb-4">
        <p className="font-bold text-[#36BCBA]">{employeeName || "Loading..."}</p>
    </div>

    <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-gray-800 text-white border-collapse">
            <thead>
                <tr>
                    <th className="px-6 py-3 font-semibold border-b border-gray-600 text-left text-green-500">Date</th>
                    <th className="px-6 py-3 font-semibold border-b border-gray-600 text-left text-green-500">Day</th>
                    <th className="px-6 py-3 font-semibold border-b border-gray-600 text-left text-green-500">Login Time</th>
                    <th className="px-6 py-3 font-semibold border-b border-gray-600 text-left text-green-500">Logout Time</th>
                    <th className="px-6 py-3 font-semibold border-b border-gray-600 text-left text-green-500">Break Time</th>
                </tr>
            </thead>
            <tbody>
                {attendanceRecords.map((record, index) => {
                    // Create a new Date object from the record's date
                    const recordDate = new Date(record.date);

                    // Format the day using toLocaleDateString
                    const day = recordDate.toLocaleDateString('en-US', { weekday: 'long' });

                    // Format the date in a readable format
                    const formattedDate = recordDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    });

                    return (
                        <tr key={index} className="hover:bg-gray-700">
                            <td className="px-6 py-4 border-b border-gray-600 text-gray-400">{formattedDate}</td>
                            <td className="px-6 py-4 border-b border-gray-600 text-gray-400">{day}</td>
                            <td className="px-6 py-4 border-b border-gray-600 text-gray-400">{record.loginTime}</td>
                            <td className="px-6 py-4 border-b border-gray-600 text-gray-400">{record.logoutTime}</td>
                            <td className="px-6 py-4 border-b border-gray-600 text-gray-400">
                                {record.dailyBreakDuration }
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>

    {/* Count total presents and leaves */}
    <div className="mt-4 text-white flex justify-between">
        <div>
            <p><strong className="text-gray-400 font-semibold">Total Presents:</strong> <span className="text-green-500 text-xl">{totalPresents}</span></p>
        </div>
        <div>
            <p><strong className="text-gray-400 font-semibold">Total Leaves:</strong> <span className="text-green-500 text-xl">{totalLeaves}</span></p>
        </div>
    </div>
</div>

    );
};

export default EmployeeAttendance;
