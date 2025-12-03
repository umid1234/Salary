const express = require('express');
const router = express.Router();
const { getDashboardStats, getPayrollSummary } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get dashboard stats
router.get('/stats', getDashboardStats);

// Get payroll summary
router.get('/payroll-summary', getPayrollSummary);

module.exports = router;
