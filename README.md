# Salary Tracker Management System

A complete, responsive web application for small businesses to manage employees, track monthly salaries, calculate totals, and visualize payroll data.

## 🚀 Features

- **Employee Management**: Add, edit, delete employees with optional profile pictures
- **Salary Tracking**: Track base salary, bonuses, deductions with automatic tax calculations
- **Dashboard**: Analytics with charts showing salary trends and key metrics
- **Salary History**: Timeline of payments with export options (CSV)
- **Payroll Reports**: Monthly payroll summaries with annual overviews
- **Authentication**: Secure admin login system with JWT tokens
- **Search & Filter**: Filter employees by name, position; filter salaries by date range and amount

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (default for development)
- **Charts**: Chart.js + react-chartjs-2
- **Authentication**: JWT (JSON Web Tokens)

## 📁 Project Structure

```
├── client/                  # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Select.jsx
│   │   │   └── Table.jsx
│   │   ├── context/         # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PayrollReports.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Salaries.jsx
│   │   │   └── SalaryHistory.jsx
│   │   ├── services/        # API calls
│   │   │   └── api.js
│   │   ├── utils/           # Helper functions
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                  # Express backend
│   ├── config/              # Database configuration
│   │   └── database.js
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── employeeController.js
│   │   └── salaryController.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── employees.js
│   │   └── salaries.js
│   ├── seeds/               # Sample data
│   │   └── seed.js
│   ├── uploads/             # Profile picture uploads
│   ├── package.json
│   └── server.js
├── .env.example             # Environment variables template
└── README.md
```

## 🏃 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/umid1234/Salary.git
cd Salary
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

4. **Set up environment variables (optional)**
```bash
cp .env.example server/.env
# Edit .env with your configuration if needed
```

5. **Seed the database with sample data**
```bash
cd server
npm run seed
```

6. **Start the application**

In Terminal 1 (Backend):
```bash
cd server
npm run dev
```

In Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

7. **Open the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Demo Credentials
After running the seed script:
- **Email**: admin@salarytracker.com
- **Password**: admin123

## 📖 How to Use

### Adding New Employees
1. Navigate to the **Employees** page
2. Click the **Add Employee** button
3. Fill in the employee details:
   - Full Name (required)
   - Position (required)
   - Phone (optional)
   - Email (optional)
   - Start Date (required)
   - Profile Picture (optional)
4. Click **Create** to save the employee

### Recording Salary Payments
1. Navigate to the **Salaries** page
2. Click **Add Salary Record**
3. Fill in the salary details:
   - Select an employee
   - Enter base salary
   - Add any bonus amounts
   - Enter deductions
   - Set tax percentage (for automatic tax calculation)
   - Select payment date
   - Add optional notes
4. Click **Create** to save the record
5. Net salary is automatically calculated: `Net = (Base + Bonus - Deductions) - Tax`

### Viewing Employee Salary History
1. Go to the **Employees** page
2. Click the chart icon next to an employee
3. View their complete salary history with:
   - Statistics (total paid, average, highest payment)
   - Salary trend chart
   - Full payment history table
   - Export to CSV option

### Generating Payroll Reports
1. Navigate to **Payroll Reports**
2. Select the year and month
3. View monthly payroll summary with:
   - Individual employee breakdowns
   - Total payroll cost
   - Annual overview chart
4. Export the report as CSV

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile

### Employees
- `GET /api/employees` - List all employees (supports search and filter)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Salaries
- `GET /api/salaries` - List all salary records (supports filters)
- `GET /api/salaries/:id` - Get salary record by ID
- `GET /api/salaries/employee/:employeeId` - Get employee's salary history
- `GET /api/salaries/monthly` - Get monthly payroll summary
- `GET /api/salaries/export` - Export payroll as CSV
- `POST /api/salaries` - Create salary record
- `PUT /api/salaries/:id` - Update salary record
- `DELETE /api/salaries/:id` - Delete salary record

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/payroll-summary` - Get annual payroll summary

## 🎨 UI/UX

The application uses a clean, professional design with:
- **Primary Color**: Blue (#3B82F6)
- **Background**: White (#FFFFFF) and Light Gray (#F3F4F6)
- **Text**: Dark Gray (#1F2937)
- **Mobile-responsive** layout with sidebar navigation
- **Interactive charts** for data visualization
- **Form validation** with error messages
- **Loading states** for better user experience

## 📝 License

MIT License