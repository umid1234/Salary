const express = require('express');
const router = express.Router();
const { 
  getAllSalaries, 
  getSalaryById, 
  getEmployeeSalaryHistory,
  createSalary, 
  updateSalary, 
  deleteSalary,
  getMonthlyPayroll,
  exportPayroll
} = require('../controllers/salaryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get monthly payroll
router.get('/monthly', getMonthlyPayroll);

// Export payroll
router.get('/export', exportPayroll);

// Get employee salary history
router.get('/employee/:employeeId', getEmployeeSalaryHistory);

// Get all salaries
router.get('/', getAllSalaries);

// Get single salary record
router.get('/:id', getSalaryById);

// Create salary record (admin only)
router.post('/', requireAdmin, createSalary);

// Update salary record (admin only)
router.put('/:id', requireAdmin, updateSalary);

// Delete salary record (admin only)
router.delete('/:id', requireAdmin, deleteSalary);

module.exports = router;
