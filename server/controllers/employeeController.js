const { runQuery, getOne, getAll } = require('../config/database');
const fs = require('fs');
const path = require('path');

const getAllEmployees = async (req, res) => {
  try {
    const { search, position, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR position LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (position) {
      sql += ' AND position = ?';
      params.push(position);
    }

    const validSortColumns = ['name', 'position', 'starting_date', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const column = validSortColumns.includes(sortBy) ? sortBy : 'name';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    sql += ` ORDER BY ${column} ${order}`;

    const employees = await getAll(sql, params);
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await getOne('SELECT * FROM employees WHERE id = ?', [id]);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { name, position, phone, email, starting_date } = req.body;
    const profile_picture = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !position || !starting_date) {
      return res.status(400).json({ error: 'Name, position and starting date are required' });
    }

    // Check if email already exists
    if (email) {
      const existingEmployee = await getOne('SELECT * FROM employees WHERE email = ?', [email]);
      if (existingEmployee) {
        return res.status(400).json({ error: 'Employee with this email already exists' });
      }
    }

    const result = await runQuery(
      `INSERT INTO employees (name, position, phone, email, starting_date, profile_picture) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, position, phone || null, email || null, starting_date, profile_picture]
    );

    const newEmployee = await getOne('SELECT * FROM employees WHERE id = ?', [result.id]);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, phone, email, starting_date, status } = req.body;

    const employee = await getOne('SELECT * FROM employees WHERE id = ?', [id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if email is already used by another employee
    if (email && email !== employee.email) {
      const existingEmployee = await getOne(
        'SELECT * FROM employees WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existingEmployee) {
        return res.status(400).json({ error: 'Email already used by another employee' });
      }
    }

    let profile_picture = employee.profile_picture;
    if (req.file) {
      // Delete old profile picture if it exists
      if (employee.profile_picture) {
        const oldPath = path.join(__dirname, '..', employee.profile_picture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      profile_picture = `/uploads/${req.file.filename}`;
    }

    await runQuery(
      `UPDATE employees SET 
        name = ?, position = ?, phone = ?, email = ?, 
        starting_date = ?, profile_picture = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || employee.name,
        position || employee.position,
        phone || employee.phone,
        email || employee.email,
        starting_date || employee.starting_date,
        profile_picture,
        status || employee.status,
        id
      ]
    );

    const updatedEmployee = await getOne('SELECT * FROM employees WHERE id = ?', [id]);
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await getOne('SELECT * FROM employees WHERE id = ?', [id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete profile picture if it exists
    if (employee.profile_picture) {
      const picturePath = path.join(__dirname, '..', employee.profile_picture);
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath);
      }
    }

    // Delete associated salaries first
    await runQuery('DELETE FROM salaries WHERE employee_id = ?', [id]);
    
    // Delete employee
    await runQuery('DELETE FROM employees WHERE id = ?', [id]);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

const getPositions = async (req, res) => {
  try {
    const positions = await getAll('SELECT DISTINCT position FROM employees ORDER BY position');
    res.json(positions.map(p => p.position));
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getPositions
};
