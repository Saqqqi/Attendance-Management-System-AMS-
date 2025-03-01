import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EmployeeCard from '../Components/EmployeeCard';

const AllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [username, setUsername] = useState('');
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const userId = localStorage.getItem("employeeId");
        const response = await axios.get("http://localhost:5000/all-employees", {
          headers: {
            Authorization: `Bearer ${userId}`,
            'user-id': localStorage.getItem('employeeId'),
          },
        });

        if (response.data.message === "Only admin can access this resource") {
          setAccessDenied(true);
          setError(response.data.message);
        } else {
          setEmployees(response.data.employees);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };
    const storedUsername = localStorage.getItem('employeeName');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    fetchEmployees();
  }, []);

  const getInitials = (name) => {
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[1] || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  if (loading) return <p className='text-white text-xl'>Loading...</p>;

  return (
    <div className="max-w-full mx-auto px-6 rounded shadow-md">
      {error && (
        <div className=" inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-transparent border-2 border-red-500 rounded-lg w-full max-w-2xl mx-4 p-6 text-center">
            <p className="text-red-500 text-2xl font-bold">{error}</p>
          </div>
        </div>
      )}

      {!error && (
        <>
          <div className="max-w-full mx-auto px-6 rounded shadow-md bg-transparent ">
            <div className="flex justify-between items-center">

              <div>
                <h2 className="text-gray-100 text-3xl font-bold">All Employees</h2>
                <p className="text-gray-500 mt-2 mb-4">See a list of Employees.</p>
              </div>
              <div className="text-green-600 border border-2 border-green-600 py-2 px-6 rounded-lg   font-bold">{username}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee._id}
                id={employee._id}
                name={employee.name}
                role={employee.role}
                description={employee.description}
                initials={getInitials(employee.name)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllEmployees;