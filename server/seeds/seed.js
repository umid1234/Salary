const bcrypt = require('bcryptjs');
const { initializeDatabase, runQuery, getOne } = require('../config/database');

const seedData = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    // Check if data already exists
    const existingUser = await getOne('SELECT * FROM users LIMIT 1');
    if (existingUser) {
      console.log('Data already seeded. Skipping...');
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await runQuery(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@salarytracker.com', hashedPassword, 'admin']
    );
    console.log('Admin user created: admin@salarytracker.com / admin123');

    // Create sample employees
    const employees = [
      { name: 'John Smith', position: 'Software Engineer', phone: '555-0101', email: 'john.smith@company.com', starting_date: '2023-01-15' },
      { name: 'Sarah Johnson', position: 'Product Manager', phone: '555-0102', email: 'sarah.johnson@company.com', starting_date: '2022-06-01' },
      { name: 'Michael Brown', position: 'UX Designer', phone: '555-0103', email: 'michael.brown@company.com', starting_date: '2023-03-20' },
      { name: 'Emily Davis', position: 'Software Engineer', phone: '555-0104', email: 'emily.davis@company.com', starting_date: '2023-08-10' },
      { name: 'David Wilson', position: 'DevOps Engineer', phone: '555-0105', email: 'david.wilson@company.com', starting_date: '2022-11-05' },
      { name: 'Jessica Martinez', position: 'Data Analyst', phone: '555-0106', email: 'jessica.martinez@company.com', starting_date: '2023-05-15' },
      { name: 'Christopher Lee', position: 'Software Engineer', phone: '555-0107', email: 'christopher.lee@company.com', starting_date: '2024-01-08' },
      { name: 'Amanda Taylor', position: 'HR Manager', phone: '555-0108', email: 'amanda.taylor@company.com', starting_date: '2021-04-12' }
    ];

    for (const emp of employees) {
      await runQuery(
        'INSERT INTO employees (name, position, phone, email, starting_date) VALUES (?, ?, ?, ?, ?)',
        [emp.name, emp.position, emp.phone, emp.email, emp.starting_date]
      );
    }
    console.log(`${employees.length} employees created`);

    // Create sample salaries for the last 12 months
    const salaryRecords = [];
    const now = new Date();
    
    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      const paymentDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 25);
      const dateStr = paymentDate.toISOString().split('T')[0];
      
      // Employee 1 - John Smith
      salaryRecords.push({ employee_id: 1, base_salary: 7500, bonus: 500, deductions: 200, tax_percentage: 15, payment_date: dateStr });
      // Employee 2 - Sarah Johnson
      salaryRecords.push({ employee_id: 2, base_salary: 8500, bonus: 1000, deductions: 300, tax_percentage: 15, payment_date: dateStr });
      // Employee 3 - Michael Brown
      salaryRecords.push({ employee_id: 3, base_salary: 6500, bonus: 300, deductions: 150, tax_percentage: 15, payment_date: dateStr });
      // Employee 4 - Emily Davis
      if (monthOffset <= 4) { // Started 5 months ago
        salaryRecords.push({ employee_id: 4, base_salary: 7000, bonus: 200, deductions: 100, tax_percentage: 15, payment_date: dateStr });
      }
      // Employee 5 - David Wilson
      salaryRecords.push({ employee_id: 5, base_salary: 8000, bonus: 600, deductions: 250, tax_percentage: 15, payment_date: dateStr });
      // Employee 6 - Jessica Martinez
      if (monthOffset <= 6) { // Started 7 months ago
        salaryRecords.push({ employee_id: 6, base_salary: 6000, bonus: 400, deductions: 100, tax_percentage: 15, payment_date: dateStr });
      }
      // Employee 7 - Christopher Lee
      if (monthOffset <= 10) { // Started 11 months ago
        salaryRecords.push({ employee_id: 7, base_salary: 7200, bonus: 350, deductions: 180, tax_percentage: 15, payment_date: dateStr });
      }
      // Employee 8 - Amanda Taylor
      salaryRecords.push({ employee_id: 8, base_salary: 7800, bonus: 500, deductions: 200, tax_percentage: 15, payment_date: dateStr });
    }

    for (const salary of salaryRecords) {
      const grossSalary = salary.base_salary + salary.bonus - salary.deductions;
      const taxAmount = (grossSalary * salary.tax_percentage) / 100;
      const netSalary = grossSalary - taxAmount;
      
      await runQuery(
        'INSERT INTO salaries (employee_id, base_salary, bonus, deductions, tax_percentage, tax_amount, net_salary, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [salary.employee_id, salary.base_salary, salary.bonus, salary.deductions, salary.tax_percentage, taxAmount, netSalary, salary.payment_date]
      );
    }
    console.log(`${salaryRecords.length} salary records created`);

    console.log('\nSeeding completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@salarytracker.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
