import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import { salaryService } from '../services/api';
import { formatCurrency, formatDate, downloadFile } from '../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalaryHistory = () => {
  const { employeeId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalaryHistory();
  }, [employeeId]);

  const fetchSalaryHistory = async () => {
    try {
      const result = await salaryService.getEmployeeHistory(employeeId);
      setData(result);
    } catch {
      setError('Failed to load salary history');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data?.salaries?.length) return;
    
    const headers = 'Payment Date,Base Salary,Bonus,Deductions,Tax %,Tax Amount,Net Salary,Notes\n';
    const rows = data.salaries.map(s => 
      `"${s.payment_date}",${s.base_salary},${s.bonus},${s.deductions},${s.tax_percentage},${s.tax_amount},${s.net_salary},"${s.notes || ''}"`
    ).join('\n');
    
    downloadFile(headers + rows, `salary_history_${data.employee.name.replace(/\s/g, '_')}.csv`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Link to="/employees" className="text-primary-500 hover:text-primary-600 mt-4 inline-block">
            ← Back to Employees
          </Link>
        </div>
      </Layout>
    );
  }

  const { employee, salaries } = data;

  // Prepare chart data (sorted by date ascending)
  const sortedSalaries = [...salaries].sort((a, b) => 
    new Date(a.payment_date) - new Date(b.payment_date)
  );

  const chartData = {
    labels: sortedSalaries.map(s => formatDate(s.payment_date)),
    datasets: [
      {
        label: 'Net Salary',
        data: sortedSalaries.map(s => s.net_salary),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Base Salary',
        data: sortedSalaries.map(s => s.base_salary),
        borderColor: '#10B981',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4
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
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  };

  // Calculate statistics
  const stats = {
    totalPaid: salaries.reduce((sum, s) => sum + s.net_salary, 0),
    avgSalary: salaries.length ? salaries.reduce((sum, s) => sum + s.net_salary, 0) / salaries.length : 0,
    highestSalary: salaries.length ? Math.max(...salaries.map(s => s.net_salary)) : 0,
    totalPayments: salaries.length
  };

  const columns = [
    {
      key: 'payment_date',
      label: 'Payment Date',
      render: (row) => formatDate(row.payment_date)
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
        <span className="text-gray-600">{row.tax_percentage}%</span>
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
      key: 'notes',
      label: 'Notes',
      render: (row) => row.notes || '-'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Link 
              to="/employees" 
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center mb-2"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Employees
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-gray-500 mt-1">{employee.position} • Salary History</p>
          </div>
          <Button onClick={exportToCSV} variant="secondary">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(stats.totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Average Salary</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgSalary)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Highest Payment</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.highestSalary)}</p>
          </div>
        </div>

        {/* Chart */}
        <Card title="Salary Trend">
          <div className="h-72">
            {salaries.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No salary data to display
              </div>
            )}
          </div>
        </Card>

        {/* Payment History Table */}
        <Card title="Payment History">
          <Table 
            columns={columns} 
            data={salaries}
            emptyMessage="No salary records found"
          />
        </Card>
      </div>
    </Layout>
  );
};

export default SalaryHistory;
