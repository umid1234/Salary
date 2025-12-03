const { runQuery, getOne, getAll } = require('../config/database');

const calculateNetSalary = (baseSalary, bonus, deductions, taxPercentage) => {
  const grossSalary = baseSalary + bonus - deductions;
  const taxAmount = (grossSalary * taxPercentage) / 100;
  const netSalary = grossSalary - taxAmount;
  return { netSalary, taxAmount };
};

const getAllSalaries = async (req, res) => {
  try {
    const { employee_id, month, year, minSalary, maxSalary } = req.query;
    
    let sql = `
      SELECT s.*, e.name as employee_name, e.position as employee_position
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (employee_id) {
      sql += ' AND s.employee_id = ?';
      params.push(employee_id);
    }

    if (month && year) {
      sql += ' AND strftime("%m", s.payment_date) = ? AND strftime("%Y", s.payment_date) = ?';
      params.push(month.padStart(2, '0'), year);
    } else if (year) {
      sql += ' AND strftime("%Y", s.payment_date) = ?';
      params.push(year);
    }

    if (minSalary) {
      sql += ' AND s.net_salary >= ?';
      params.push(parseFloat(minSalary));
    }

    if (maxSalary) {
      sql += ' AND s.net_salary <= ?';
      params.push(parseFloat(maxSalary));
    }

    sql += ' ORDER BY s.payment_date DESC';

    const salaries = await getAll(sql, params);
    res.json(salaries);
  } catch (error) {
    console.error('Get salaries error:', error);
    res.status(500).json({ error: 'Failed to fetch salaries' });
  }
};

const getSalaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await getOne(`
      SELECT s.*, e.name as employee_name, e.position as employee_position
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.id = ?
    `, [id]);

    if (!salary) {
      return res.status(404).json({ error: 'Salary record not found' });
    }

    res.json(salary);
  } catch (error) {
    console.error('Get salary error:', error);
    res.status(500).json({ error: 'Failed to fetch salary' });
  }
};

const getEmployeeSalaryHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const employee = await getOne('SELECT * FROM employees WHERE id = ?', [employeeId]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const salaries = await getAll(
      'SELECT * FROM salaries WHERE employee_id = ? ORDER BY payment_date DESC',
      [employeeId]
    );

    res.json({
      employee,
      salaries
    });
  } catch (error) {
    console.error('Get salary history error:', error);
    res.status(500).json({ error: 'Failed to fetch salary history' });
  }
};

const createSalary = async (req, res) => {
  try {
    const { employee_id, base_salary, bonus = 0, deductions = 0, tax_percentage = 0, payment_date, notes } = req.body;

    if (!employee_id || !base_salary || !payment_date) {
      return res.status(400).json({ error: 'Employee ID, base salary and payment date are required' });
    }

    // Check if employee exists
    const employee = await getOne('SELECT * FROM employees WHERE id = ?', [employee_id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { netSalary, taxAmount } = calculateNetSalary(
      parseFloat(base_salary),
      parseFloat(bonus),
      parseFloat(deductions),
      parseFloat(tax_percentage)
    );

    const result = await runQuery(
      `INSERT INTO salaries (employee_id, base_salary, bonus, deductions, tax_percentage, tax_amount, net_salary, payment_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, base_salary, bonus, deductions, tax_percentage, taxAmount, netSalary, payment_date, notes || null]
    );

    const newSalary = await getOne(`
      SELECT s.*, e.name as employee_name, e.position as employee_position
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.id = ?
    `, [result.id]);

    res.status(201).json(newSalary);
  } catch (error) {
    console.error('Create salary error:', error);
    res.status(500).json({ error: 'Failed to create salary record' });
  }
};

const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { base_salary, bonus, deductions, tax_percentage, payment_date, notes } = req.body;

    const salary = await getOne('SELECT * FROM salaries WHERE id = ?', [id]);
    if (!salary) {
      return res.status(404).json({ error: 'Salary record not found' });
    }

    const updatedBaseSalary = base_salary !== undefined ? parseFloat(base_salary) : salary.base_salary;
    const updatedBonus = bonus !== undefined ? parseFloat(bonus) : salary.bonus;
    const updatedDeductions = deductions !== undefined ? parseFloat(deductions) : salary.deductions;
    const updatedTaxPercentage = tax_percentage !== undefined ? parseFloat(tax_percentage) : salary.tax_percentage;

    const { netSalary, taxAmount } = calculateNetSalary(
      updatedBaseSalary,
      updatedBonus,
      updatedDeductions,
      updatedTaxPercentage
    );

    await runQuery(
      `UPDATE salaries SET 
        base_salary = ?, bonus = ?, deductions = ?, 
        tax_percentage = ?, tax_amount = ?, net_salary = ?,
        payment_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        updatedBaseSalary,
        updatedBonus,
        updatedDeductions,
        updatedTaxPercentage,
        taxAmount,
        netSalary,
        payment_date || salary.payment_date,
        notes !== undefined ? notes : salary.notes,
        id
      ]
    );

    const updatedSalary = await getOne(`
      SELECT s.*, e.name as employee_name, e.position as employee_position
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      WHERE s.id = ?
    `, [id]);

    res.json(updatedSalary);
  } catch (error) {
    console.error('Update salary error:', error);
    res.status(500).json({ error: 'Failed to update salary record' });
  }
};

const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await getOne('SELECT * FROM salaries WHERE id = ?', [id]);
    if (!salary) {
      return res.status(404).json({ error: 'Salary record not found' });
    }

    await runQuery('DELETE FROM salaries WHERE id = ?', [id]);

    res.json({ message: 'Salary record deleted successfully' });
  } catch (error) {
    console.error('Delete salary error:', error);
    res.status(500).json({ error: 'Failed to delete salary record' });
  }
};

const getMonthlyPayroll = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const salaries = await getAll(`
      SELECT s.*, e.name as employee_name, e.position as employee_position
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      WHERE strftime("%Y", s.payment_date) = ? AND strftime("%m", s.payment_date) = ?
      ORDER BY e.name
    `, [year, month.padStart(2, '0')]);

    const summary = salaries.reduce((acc, salary) => {
      acc.totalBaseSalary += salary.base_salary;
      acc.totalBonus += salary.bonus;
      acc.totalDeductions += salary.deductions;
      acc.totalTax += salary.tax_amount;
      acc.totalNetSalary += salary.net_salary;
      return acc;
    }, {
      totalBaseSalary: 0,
      totalBonus: 0,
      totalDeductions: 0,
      totalTax: 0,
      totalNetSalary: 0
    });

    res.json({
      month: `${year}-${month.padStart(2, '0')}`,
      employeeCount: salaries.length,
      salaries,
      summary
    });
  } catch (error) {
    console.error('Get monthly payroll error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly payroll' });
  }
};

const exportPayroll = async (req, res) => {
  try {
    const { year, month, format = 'csv' } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }

    const salaries = await getAll(`
      SELECT s.*, e.name as employee_name, e.position as employee_position, e.email as employee_email
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      WHERE strftime("%Y", s.payment_date) = ? AND strftime("%m", s.payment_date) = ?
      ORDER BY e.name
    `, [year, month.padStart(2, '0')]);

    if (format === 'csv') {
      const csvHeader = 'Employee Name,Position,Email,Base Salary,Bonus,Deductions,Tax %,Tax Amount,Net Salary,Payment Date\n';
      const csvRows = salaries.map(s => 
        `"${s.employee_name}","${s.employee_position}","${s.employee_email || ''}",${s.base_salary},${s.bonus},${s.deductions},${s.tax_percentage},${s.tax_amount},${s.net_salary},"${s.payment_date}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payroll_${year}_${month}.csv`);
      res.send(csvHeader + csvRows);
    } else {
      res.json(salaries);
    }
  } catch (error) {
    console.error('Export payroll error:', error);
    res.status(500).json({ error: 'Failed to export payroll' });
  }
};

module.exports = {
  getAllSalaries,
  getSalaryById,
  getEmployeeSalaryHistory,
  createSalary,
  updateSalary,
  deleteSalary,
  getMonthlyPayroll,
  exportPayroll
};
