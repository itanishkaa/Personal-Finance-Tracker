# 💰 Personal Finance Tracker

A full-stack **Personal Finance Tracker** web application to help users manage their expenses effectively. Built with **React.js** on the frontend and **Java Spring Boot** on the backend.

## 🚀 Features

### ✅ Core Features

- Add, view and delete expenses
- Dashboard with total spending overview
- Expense listing with category, amount, and date
- Expense charts for visual insights

### 📊 Future Enhancements

- Budget planning and analysis
- Category-wise breakdown with filters
- User authentication and profile uploads
- Notifications for overspending

## 🛠️ Tech Stack

| Frontend                        | Backend                      |
|--------------------------------|------------------------------|
| React.js + Vite + Tailwind CSS | Java Spring Boot             |
| Axios for API calls            | RESTful API with Spring MVC |
| Recharts for charts            | Maven build tool             |

## ⚙️ Getting Started

### 📦 Prerequisites

- Node.js & npm
- Java 17+
- Maven

### 🔧 Backend Setup (Spring Boot)

```bash
cd client/expensetracker
./mvnw spring-boot:run
```

Runs the backend server on default port: ```http://localhost:8080```

### 🎨 Frontend Setup (React)

```bash
cd server/expenseTracker
npm install
npm run dev
```

Runs the frontend dev server on: ```http://localhost:5173```

## 🌐 API Endpoints

| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| GET    | `/api/expenses`     | Get all expenses        |
| POST   | `/api/expenses`     | Add a new expense       |
| PUT   | `/api/expenses/{id}`     | Update a new expense       |
| DELETE | `/api/expenses/{id}`| Delete an expense by ID |
