const { getOne, getAll } = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // Get total employees
    const employeeCount = await getOne('SELECT COUNT(*) as count FROM employees WHERE status = "active"');
    
    // Get current month's payroll
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const monthlyPayroll = await getOne(`
      SELECT 
        SUM(net_salary) as total_payout,
        COUNT(*) as payment_count
      FROM salaries 
      WHERE strftime("%Y", payment_date) = ? AND strftime("%m", payment_date) = ?
    `, [currentYear, currentMonth]);

    // Get highest paid employee (based on latest salary)
    const highestPaid = await getOne(`
      SELECT e.id, e.name, e.position, s.net_salary
      FROM employees e
      JOIN (
        SELECT employee_id, MAX(net_salary) as net_salary
        FROM salaries
        GROUP BY employee_id
      ) s ON e.id = s.employee_id
      ORDER BY s.net_salary DESC
      LIMIT 1
    `);

    // Get salary trend (last 12 months)
    const salaryTrend = await getAll(`
      SELECT 
        strftime("%Y-%m", payment_date) as month,
        SUM(net_salary) as total,
        COUNT(*) as employee_count
      FROM salaries
      WHERE payment_date >= date('now', '-12 months')
      GROUP BY strftime("%Y-%m", payment_date)
      ORDER BY month ASC
    `);

    // Get recent salary payments
    const recentPayments = await getAll(`
      SELECT s.*, e.name as employee_name, e.position as employee_position
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      ORDER BY s.payment_date DESC
      LIMIT 5
    `);

    // Get employee positions breakdown
    const positionBreakdown = await getAll(`
      SELECT position, COUNT(*) as count
      FROM employees
      WHERE status = 'active'
      GROUP BY position
      ORDER BY count DESC
    `);

    res.json({
      totalEmployees: employeeCount.count,
      monthlyPayroll: {
        total: monthlyPayroll.total_payout || 0,
        paymentCount: monthlyPayroll.payment_count || 0,
        month: `${currentYear}-${currentMonth}`
      },
      highestPaidEmployee: highestPaid,
      salaryTrend,
      recentPayments,
      positionBreakdown
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

const getPayrollSummary = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear().toString();

    const monthlySummary = await getAll(`
      SELECT 
        strftime("%m", payment_date) as month,
        SUM(base_salary) as total_base,
        SUM(bonus) as total_bonus,
        SUM(deductions) as total_deductions,
        SUM(tax_amount) as total_tax,
        SUM(net_salary) as total_net,
        COUNT(DISTINCT employee_id) as employee_count
      FROM salaries
      WHERE strftime("%Y", payment_date) = ?
      GROUP BY strftime("%m", payment_date)
      ORDER BY month
    `, [targetYear]);

    const yearTotal = await getOne(`
      SELECT 
        SUM(base_salary) as total_base,
        SUM(bonus) as total_bonus,
        SUM(deductions) as total_deductions,
        SUM(tax_amount) as total_tax,
        SUM(net_salary) as total_net,
        COUNT(*) as payment_count
      FROM salaries
      WHERE strftime("%Y", payment_date) = ?
    `, [targetYear]);

    res.json({
      year: targetYear,
      monthlySummary,
      yearTotal: {
        totalBase: yearTotal.total_base || 0,
        totalBonus: yearTotal.total_bonus || 0,
        totalDeductions: yearTotal.total_deductions || 0,
        totalTax: yearTotal.total_tax || 0,
        totalNet: yearTotal.total_net || 0,
        paymentCount: yearTotal.payment_count || 0
      }
    });
  } catch (error) {
    console.error('Payroll summary error:', error);
    res.status(500).json({ error: 'Failed to fetch payroll summary' });
  }
};

module.exports = {
  getDashboardStats,
  getPayrollSummary
};
