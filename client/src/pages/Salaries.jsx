import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import { salaryService, employeeService } from '../services/api';
import { formatCurrency, formatDate, getMonthOptions, getYearOptions, getCurrentMonth } from '../utils/helpers';

const Salaries = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [filters, setFilters] = useState({
    employee_id: '',
    year: '',
    month: '',
    minSalary: '',
    maxSalary: ''
  });
  const [formData, setFormData] = useState({
    employee_id: '',
    base_salary: '',
    bonus: '0',
    deductions: '0',
    tax_percentage: '0',
    payment_date: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
  }, [filters]);

  const fetchSalaries = async () => {
    try {
      const data = await salaryService.getAll(filters);
      setSalaries(data);
    } catch {
      console.error('Failed to fetch salaries');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch {
      console.error('Failed to fetch employees');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateNetSalary = () => {
    const base = parseFloat(formData.base_salary) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const taxPercentage = parseFloat(formData.tax_percentage) || 0;
    
    const gross = base + bonus - deductions;
    const tax = (gross * taxPercentage) / 100;
    return gross - tax;
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      base_salary: '',
      bonus: '0',
      deductions: '0',
      tax_percentage: '0',
      payment_date: '',
      notes: ''
    });
    setFormError('');
    setEditingSalary(null);
  };

  const openAddModal = () => {
    resetForm();
    const { year, month } = getCurrentMonth();
    setFormData(prev => ({
      ...prev,
      payment_date: `${year}-${month}-25`
    }));
    setShowModal(true);
  };

  const openEditModal = (salary) => {
    setEditingSalary(salary);
    setFormData({
      employee_id: salary.employee_id.toString(),
      base_salary: salary.base_salary.toString(),
      bonus: salary.bonus.toString(),
      deductions: salary.deductions.toString(),
      tax_percentage: salary.tax_percentage.toString(),
      payment_date: salary.payment_date,
      notes: salary.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        employee_id: parseInt(formData.employee_id),
        base_salary: parseFloat(formData.base_salary),
        bonus: parseFloat(formData.bonus),
        deductions: parseFloat(formData.deductions),
        tax_percentage: parseFloat(formData.tax_percentage)
      };

      if (editingSalary) {
        await salaryService.update(editingSalary.id, payload);
      } else {
        await salaryService.create(payload);
      }
      setShowModal(false);
      resetForm();
      fetchSalaries();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save salary record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this salary record?')) {
      return;
    }

    try {
      await salaryService.delete(id);
      fetchSalaries();
    } catch {
      alert('Failed to delete salary record');
    }
  };

  const clearFilters = () => {
    setFilters({
      employee_id: '',
      year: '',
      month: '',
      minSalary: '',
      maxSalary: ''
    });
  };

  const columns = [
    {
      key: 'employee_name',
      label: 'Employee',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.employee_name}</div>
          <div className="text-sm text-gray-500">{row.employee_position}</div>
        </div>
      )
    },
    {
      key: 'base_salary',
      label: 'Base Salary',
      render: (row) => formatCurrency(row.base_salary)
    },
    {
      key: 'bonus',
      label: 'Bonus',
      render: (row) => (
        <span className="text-green-600">+{formatCurrency(row.bonus)}</span>
      )
    },
    {
      key: 'deductions',
      label: 'Deductions',
      render: (row) => (
        <span className="text-red-600">-{formatCurrency(row.deductions)}</span>
      )
    },
    {
      key: 'tax',
      label: 'Tax',
      render: (row) => (
        <div className="text-sm">
          <span className="text-gray-600">{row.tax_percentage}%</span>
          <span className="text-red-600 ml-1">({formatCurrency(row.tax_amount)})</span>
        </div>
      )
    },
    {
      key: 'net_salary',
      label: 'Net Salary',
      render: (row) => (
        <span className="font-semibold text-primary-600">
          {formatCurrency(row.net_salary)}
        </span>
      )
    },
    {
      key: 'payment_date',
      label: 'Payment Date',
      render: (row) => formatDate(row.payment_date)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="text-gray-500 hover:text-gray-600"
            title="Edit"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-500 hover:text-red-600"
            title="Delete"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Salaries</h1>
            <p className="text-gray-500 mt-1">Manage salary records</p>
          </div>
          <Button onClick={openAddModal}>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Salary Record
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select
              name="employee_id"
              value={filters.employee_id}
              onChange={handleFilterChange}
              placeholder="All Employees"
              options={employees.map(e => ({ value: e.id.toString(), label: e.name }))}
            />
            <Select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              placeholder="Year"
              options={getYearOptions()}
            />
            <Select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              placeholder="Month"
              options={getMonthOptions()}
            />
            <Input
              type="number"
              name="minSalary"
              value={filters.minSalary}
              onChange={handleFilterChange}
              placeholder="Min Salary"
            />
            <Input
              type="number"
              name="maxSalary"
              value={filters.maxSalary}
              onChange={handleFilterChange}
              placeholder="Max Salary"
            />
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <Table 
              columns={columns} 
              data={salaries}
              emptyMessage="No salary records found"
            />
          )}
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSalary ? 'Edit Salary Record' : 'Add Salary Record'}
        size="md"
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Employee"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            placeholder="Select Employee"
            options={employees.map(e => ({ value: e.id.toString(), label: `${e.name} - ${e.position}` }))}
            required
            disabled={!!editingSalary}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Salary"
              type="number"
              name="base_salary"
              value={formData.base_salary}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
            <Input
              label="Bonus"
              type="number"
              name="bonus"
              value={formData.bonus}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deductions"
              type="number"
              name="deductions"
              value={formData.deductions}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <Input
              label="Tax Percentage"
              type="number"
              name="tax_percentage"
              value={formData.tax_percentage}
              onChange={handleChange}
              placeholder="0"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <Input
            label="Payment Date"
            type="date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            required
          />
          <Input
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes..."
          />
          
          {/* Net Salary Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Calculated Net Salary:</span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(calculateNetSalary())}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingSalary ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Salaries;
