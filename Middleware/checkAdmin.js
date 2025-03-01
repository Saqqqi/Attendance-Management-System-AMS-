const Employee = require('../Models/Employee'); // Adjust the path as needed

const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.header('user-id'); // Get user ID from headers

    if (!userId) {
      return res.status(401).json({ message: 'User ID is required in headers' });
    }

    // Find the employee by ID
    const employee = await Employee.findById(userId);

    if (!employee) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is an admin
    if (employee.role_company !== 'Admin') {
      return res.status(403).json({ message: 'Only admin can access this resource' });
    }

    // Proceed to the next middleware/controller
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = checkAdmin;
