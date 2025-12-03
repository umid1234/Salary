# Salary Tracker Management System

A complete, responsive web application for small businesses to manage employees, track monthly salaries, calculate totals, and visualize payroll data.

## 🚀 Features

- **Employee Management**: Add, edit, delete employees with profile pictures
- **Salary Tracking**: Track base salary, bonuses, deductions with automatic calculations
- **Dashboard**: Analytics with charts and key metrics
- **Salary History**: Timeline of payments with export options
- **Authentication**: Secure admin login system

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL / SQLite

## 📁 Project Structure

```
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth context
│   │   ├── services/        # API calls
│   │   └── utils/           # Helper functions
│   └── package.json
├── server/                  # Express backend
│   ├── config/              # Database config
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Auth middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── seeds/               # Sample data
│   └── package.json
└── README.md
```

## 🏃 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (optional, SQLite available for development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/umid1234/Salary.git
cd Salary
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run database migrations and seed data
```bash
cd ../server
npm run migrate
npm run seed
```

6. Start the application
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

## 📝 License

MIT License