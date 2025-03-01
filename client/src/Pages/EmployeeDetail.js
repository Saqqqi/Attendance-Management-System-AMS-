import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import Header from '../Components/Header';
import { Link } from 'react-router-dom';

const EmployeeDetail = () => {
  const { id } = useParams(); // Get employee ID from URL params
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('employeeId'); // Define userId in the component scope

  // Fetch employee details
  useEffect(() => {
    const fetchEmployeeDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/employee-detail/${id}`, {
          headers: {
            Authorization: `Bearer ${userId}`,
            'user-id': userId, // Use userId directly
          },
        });
        setEmployee(response.data.employee);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch employee details');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetail();
  }, [id, userId]); // Add `userId` as a dependency

  // Helper function to get initials from the name
  const getInitials = (name) => {
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[1] || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };


  // Handle delete employee
  const handleDelete = async (e, employeeId) => {
    e.preventDefault();
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this employee?');
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:5000/delete-employee/${employeeId}`);
      toast.success('Employee deleted successfully');

      // Redirect back to employee list
      window.location.href = '/all-employees';
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  if (loading) return <p className='text-white text-xl'>Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-full mx-auto px-6 pb-4 pt-1 bg-transparent border border-2 border-gray-700 rounded-xl shadow-xl">

      <Header employee={employee} goBackLink="/all-employees" />
      <h3 className="text-3xl text-gray-100">Employee Detail</h3>
      <p className="text-gray-500 text-sm mt-2">See a list of employee detail</p>

      {employee ? (
        <>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4 relative">
              <div className="w-40 h-40 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 text-4xl font-bold border-8 border-teal-400 shadow-lg">
                {/* Initials of the employee */}
                {getInitials(employee.name)}
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-white tracking-wide">{employee.name}</h2>
            <p className="text-xl text-teal-200 mt-2">{employee.designation?.role || "N/A"}</p>
          </div>

          {/* Employee details */}
          <div className="space-y-8">
            <div className="bg-transparent p-8 rounded-lg border-2 border-gray-600 shadow-teal-500">
              <h3 className="text-3xl font-semibold text-teal-500 text-center">Basic Information</h3>
              {/* Display employee info */}
              <ul className="mt-4 text-lg text-gray-700 space-y-2 px-20">
                <li className='flex items-center justify-between'><strong className="text-[#B1B1B1] py-4 text-xl font-semibold">Email:</strong> <span className='text-gray-500 text-xl font-semibold'>{employee.email}</span></li>
                <hr className="border-t-2 border-gray-800" />
                <li className='flex items-center justify-between'><strong className="text-[#B1B1B1] py-4">CNIC No:</strong> <span className='text-gray-500 text-xl font-semibold'>{employee.CNIC_No}</span></li>
                <hr className="border-t-2 border-gray-800" />
                <li className='flex items-center justify-between'><strong className="text-[#B1B1B1] py-4">Address:</strong> <span className='text-gray-500 text-xl font-semibold'>{employee.address}</span></li>
                <hr className="border-t-2 border-gray-800" />
                <li className='flex items-center justify-between'><strong className="text-[#B1B1B1] py-4">Joining Date:</strong> <span className='text-gray-500 text-xl font-semibold'>{new Date(employee.joining_date).toLocaleDateString()}</span></li>
                <hr className="border-t-2 border-gray-800" />
                <li className='flex items-center justify-between'><strong className="text-[#B1B1B1] py-4">Role:</strong> <span className='text-gray-500 text-xl font-semibold'>{employee.role_company}</span></li>
                <hr className="border-t-2 border-gray-800" />
                <li className='flex items-center justify-between'><strong className="text-[#B1B1B1] py-4">Time_In:</strong> <span className='text-gray-500 text-xl font-semibold'>{employee.in_time} PM</span></li>
                <hr className="border-t-2 border-gray-800" />
                <li className='flex items-center justify-between'><strong className="text-[#B1B1B1] py-4">Time_Out:</strong> <span className='text-gray-500 text-xl font-semibold'>{employee.out_time} AM</span></li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 text-center flex items-center justify-between">
            <div>
              <Link to={`/update-employee/${employee._id}`} state={{ employee }}>
                <button className="inline-block px-8 py-2 text-lg text-black font-semibold bg-[#36BCBA] hover:bg-teal-600 rounded-full shadow-md transition duration-200 ease-in-out transform hover:scale-105">
                  Edit
                </button>
              </Link>
            </div>
            <div>
              <button
                onClick={(e) => handleDelete(e, employee._id)}
                className="inline-block px-8 py-2 text-lg font-semibold text-white bg-red-700 hover:bg-teal-600 rounded-full shadow-md transition duration-200 ease-in-out transform hover:scale-105">
                Delete
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-white">No employee found</p>
      )}
    </div>
  );
};

export default EmployeeDetail;
