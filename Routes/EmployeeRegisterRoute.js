const express = require('express');
const { createEmployee, getAllEmployees ,getEmployeeById, updateEmployee, deleteEmployee } = require('../Controllers/EmployeeController');
const checkRole = require('../Middleware/checkRole');
const checkAdmin = require('../Middleware/checkAdmin');
const { getLoggedInEmployeeAttendance, getEmployeeAttendance, getPresentEmployees } = require('../Controllers/AttendanceController');
const router = express.Router();

// Route to register an employee
router.post('/register-employee', createEmployee);
router.get('/all-employees',  getAllEmployees); // Apply middleware
router.get('/employee-detail/:id',checkAdmin, getEmployeeById); 
router.put('/update-employee/:employeeId', updateEmployee); 
router.delete('/delete-employee/:employeeId', deleteEmployee);

router.get('/attendance/summary', getLoggedInEmployeeAttendance);
router.get('/attendance/employee/:employeeId', checkRole, getEmployeeAttendance);
// router.get('/attendance/employee/present', getPresentEmployees);


module.exports = router;
