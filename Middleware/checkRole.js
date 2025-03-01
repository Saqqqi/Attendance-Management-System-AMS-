const Employee = require('../Models/Employee'); // Import your Employee model

const checkRole = async (req, res, next) => {
  console.log("Middleware: Checking role...");
  try {
    const employeeId = req.headers['employee-id']; // Get employeeId from the header
    if (!employeeId) {
      return res.status(401).json({ error: 'Employee ID is required in the header' });
    }

    // Fetch the employee from the database
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Attach the employee's role_company to the request object
    req.role = employee.role_company; // Use role_company to determine the role
    req.employeeId = employeeId; // Attach employeeId to the request object

    console.log(`Role determined: ${req.role}`);
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error in checkRole middleware:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = checkRole;