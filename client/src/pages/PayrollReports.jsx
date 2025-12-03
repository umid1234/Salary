import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import { salaryService, dashboardService } from '../services/api';
import { formatCurrency, formatMonth, getMonthOptions, getYearOptions, getCurrentMonth, downloadFile } from '../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PayrollReports = () => {
  const [payrollData, setPayrollData] = useState(null);
  const [yearlySummary, setYearlySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => {
    const { year, month } = getCurrentMonth();
    return { year, month };
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, [filters]);

  useEffect(() => {
    fetchYearlySummary();
  }, [filters.year]);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const data = await salaryService.getMonthlyPayroll(filters.year, filters.month);
      setPayrollData(data);
    } catch {
      console.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const fetchYearlySummary = async () => {
    try {
      const data = await dashboardService.getPayrollSummary(filters.year);
      setYearlySummary(data);
    } catch {
      console.error('Failed to fetch yearly summary');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await salaryService.exportPayroll(filters.year, filters.month, 'csv');
      downloadFile(data, `payroll_${filters.year}_${filters.month}.csv`);
    } catch {
      alert('Failed to export payroll');
    } finally {
      setExporting(false);
    }
  };

  // Prepare yearly chart data
  const yearlyChartData = {
    labels: yearlySummary?.monthlySummary?.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[parseInt(item.month) - 1];
    }) || [],
    datasets: [
      {
        label: 'Net Salary',
        data: yearlySummary?.monthlySummary?.map(item => item.total_net) || [],
        backgroundColor: '#3B82F6'
      },
      {
        label: 'Tax',
        data: yearlySummary?.monthlySummary?.map(item => item.total_tax) || [],
        backgroundColor: '#EF4444'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      x: {
        stacked: false
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
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
      key: 'tax_amount',
      label: 'Tax',
      render: (row) => (
        <span className="text-gray-600">{formatCurrency(row.tax_amount)}</span>
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
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Reports</h1>
            <p className="text-gray-500 mt-1">Monthly payroll summaries and exports</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Select
                label="Year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                options={getYearOptions()}
              />
              <Select
                label="Month"
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                options={getMonthOptions()}
              />
            </div>
            <Button 
              onClick={handleExport} 
              loading={exporting}
              variant="secondary"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </Button>
          </div>
        </Card>

        {/* Summary Stats */}
        {!loading && payrollData && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Employees Paid</p>
              <p className="text-2xl font-bold text-gray-900">{payrollData.employeeCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Base</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payrollData.summary.totalBaseSalary)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Bonus</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(payrollData.summary.totalBonus)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Deductions</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(payrollData.summary.totalDeductions)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Payout</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(payrollData.summary.totalNetSalary)}</p>
            </div>
          </div>
        )}

        {/* Yearly Overview Chart */}
        <Card title={`${filters.year} Payroll Overview`}>
          <div className="h-72">
            {yearlySummary?.monthlySummary?.length > 0 ? (
              <Bar data={yearlyChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available for this year
              </div>
            )}
          </div>
        </Card>

        {/* Monthly Payroll Table */}
        <Card title={`Payroll for ${formatMonth(`${filters.year}-${filters.month}`)}`}>
          {loading ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <Table 
              columns={columns} 
              data={payrollData?.salaries || []}
              emptyMessage="No payroll records for this month"
            />
          )}
        </Card>

        {/* Yearly Summary */}
        {yearlySummary && (
          <Card title={`${filters.year} Annual Summary`}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div>
                <p className="text-sm text-gray-500">Total Payments</p>
                <p className="text-xl font-bold text-gray-900">{yearlySummary.yearTotal.paymentCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Base</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(yearlySummary.yearTotal.totalBase)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bonus</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(yearlySummary.yearTotal.totalBonus)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tax Paid</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(yearlySummary.yearTotal.totalTax)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Net Paid</p>
                <p className="text-xl font-bold text-primary-600">{formatCurrency(yearlySummary.yearTotal.totalNet)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default PayrollReports;
