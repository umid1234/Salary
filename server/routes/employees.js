const express = require('express');
const router = express.Router();
const { 
  getAllEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  getPositions
} = require('../controllers/employeeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authenticateToken);

// Get all positions (for filtering)
router.get('/positions', getPositions);

// Get all employees
router.get('/', getAllEmployees);

// Get single employee
router.get('/:id', getEmployeeById);

// Create employee (admin only)
router.post('/', requireAdmin, upload.single('profile_picture'), createEmployee);

// Update employee (admin only)
router.put('/:id', requireAdmin, upload.single('profile_picture'), updateEmployee);

// Delete employee (admin only)
router.delete('/:id', requireAdmin, deleteEmployee);

module.exports = router;
