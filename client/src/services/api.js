import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export const employeeService = {
  getAll: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  create: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.post('/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  update: async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.put(`/employees/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
  getPositions: async () => {
    const response = await api.get('/employees/positions');
    return response.data;
  }
};

export const salaryService = {
  getAll: async (params = {}) => {
    const response = await api.get('/salaries', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/salaries/${id}`);
    return response.data;
  },
  getEmployeeHistory: async (employeeId) => {
    const response = await api.get(`/salaries/employee/${employeeId}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/salaries', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/salaries/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/salaries/${id}`);
    return response.data;
  },
  getMonthlyPayroll: async (year, month) => {
    const response = await api.get('/salaries/monthly', { params: { year, month } });
    return response.data;
  },
  exportPayroll: async (year, month, format = 'csv') => {
    const response = await api.get('/salaries/export', { 
      params: { year, month, format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  }
};

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getPayrollSummary: async (year) => {
    const response = await api.get('/dashboard/payroll-summary', { params: { year } });
    return response.data;
  }
};

export default api;
