# 💰 FinTrack

A full-stack personal finance intelligence platform for tracking income and expenses, analyzing spending patterns, managing budgets and savings goals, monitoring recurring commitments, generating financial reports, and getting AI-powered insights.

## ✨ Features

- JWT-based authentication
- Income and expense tracking
- Category management
- Financial dashboard and spending analytics
- Cash-flow and monthly trend analysis
- Savings-rate calculation
- Monthly budgets with usage and status tracking
- Savings goals with contribution tracking
- Recurring income and expenses
- Explainable financial health score
- AI financial assistant using Ollama + Llama 3.2
- AI transaction categorization and financial insights
- Monthly financial reports
- CSV and PDF exports
- Backend testing with Pytest

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Charts | Chart.js / React chart components |
| API Client | Axios |
| Backend | Python + FastAPI |
| Validation | Pydantic |
| ORM | SQLAlchemy |
| Database | SQLite |
| Analytics | Pandas |
| Authentication | JWT + bcrypt |
| AI | Ollama + Llama 3.2 |
| Reports | ReportLab |
| Testing | Pytest |

## 🏗️ Architecture

```text
React + TypeScript
        │
        │ REST API / JWT
        ▼
     FastAPI
        │
   ┌────┼───────────────┐
   │    │               │
   ▼    ▼               ▼
SQLite Analytics      AI Service
       │              │
       │              ▼
       │         Ollama / Llama 3.2
       │              │
       └──────────────┘
```

The application keeps financial calculations in the backend analytics/services layer. AI features receive structured financial summaries rather than raw transaction records.

## 📁 Project Structure

```text
itanshkaa-personal-finance-tracker/
│
├── README.md
│
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── routes/
│   │   │       ├── ai.py
│   │   │       ├── analytics.py
│   │   │       ├── auth.py
│   │   │       ├── budgets.py
│   │   │       ├── categories.py
│   │   │       ├── goals.py
│   │   │       ├── recurring.py
│   │   │       ├── reports.py
│   │   │       └── transactions.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── budget.py
│   │   │   ├── category.py
│   │   │   ├── goal.py
│   │   │   ├── recurring.py
│   │   │   ├── transaction.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── ai.py
│   │   │   ├── analytics.py
│   │   │   ├── auth.py
│   │   │   ├── budget.py
│   │   │   ├── category.py
│   │   │   ├── goal.py
│   │   │   ├── health.py
│   │   │   ├── recurring.py
│   │   │   ├── report.py
│   │   │   └── transaction.py
│   │   └── services/
│   │       ├── ai_client.py
│   │       ├── ai_context_service.py
│   │       ├── ai_service.py
│   │       ├── analytics_service.py
│   │       ├── auth_service.py
│   │       ├── budget_service.py
│   │       ├── category_service.py
│   │       ├── default_categories.py
│   │       ├── goal_service.py
│   │       ├── health_service.py
│   │       ├── recurring_service.py
│   │       ├── report_service.py
│   │       └── transaction_service.py
│   └── tests/
│       ├── conftest.py
│       └── test_expenses.py
│
└── frontend/
    ├── package.json
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        ├── routes/
        ├── types/
        └── utils/
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js and npm
- Ollama
- Llama 3.2 model

### 1. Clone the repository

```bash
git clone https://github.com/itanishkaa/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

**Windows:**
```bash
.venv\Scripts\activate
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create `.env` inside `backend/`:

```env
DATABASE_URL=sqlite:///./finance.db

SECRET_KEY=change-this-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

CORS_ORIGINS=http://localhost:5173
```

Do not commit `.env` or production secrets.

### 4. Set up Ollama

```bash
ollama pull llama3.2
ollama serve
```

The application expects Ollama at:

```text
http://localhost:11434
```

### 5. Start the FastAPI backend

From `backend/`:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

Health check:

```text
http://localhost:8000/health
```

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🔑 Authentication

FinTrack uses JWT-based authentication.

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

Protected requests use:

```text
Authorization: Bearer <token>
```

User-specific resources are scoped to the authenticated user.

## 🔌 API Overview

### Transactions

```text
GET    /api/v1/transactions
POST   /api/v1/transactions
GET    /api/v1/transactions/{transaction_id}
PUT    /api/v1/transactions/{transaction_id}
DELETE /api/v1/transactions/{transaction_id}
```

Supports filtering by date range, transaction type, and category.

### Categories

```text
GET    /api/v1/categories
POST   /api/v1/categories
PUT    /api/v1/categories/{category_id}
DELETE /api/v1/categories/{category_id}
```

### Analytics

```text
GET /api/v1/analytics/overview
GET /api/v1/analytics/cashflow
GET /api/v1/analytics/categories
GET /api/v1/analytics/spending
GET /api/v1/analytics/trends
GET /api/v1/analytics/health
```

### Budgets

```text
GET    /api/v1/budgets
POST   /api/v1/budgets
PUT    /api/v1/budgets/{budget_id}
DELETE /api/v1/budgets/{budget_id}
```

### Goals

```text
GET    /api/v1/goals
POST   /api/v1/goals
PUT    /api/v1/goals/{goal_id}
DELETE /api/v1/goals/{goal_id}
POST   /api/v1/goals/{goal_id}/contribute
```

### Recurring Transactions

```text
GET    /api/v1/recurring
POST   /api/v1/recurring
PUT    /api/v1/recurring/{recurring_id}
DELETE /api/v1/recurring/{recurring_id}
```

### AI

```text
POST /api/v1/ai/chat
POST /api/v1/ai/categorize
POST /api/v1/ai/insights
```

### Reports

```text
GET /api/v1/reports/monthly
GET /api/v1/reports/export/csv
GET /api/v1/reports/export/pdf
```

## 📊 Analytics

FinTrack calculates:

- Total income
- Total expenses
- Current balance
- Savings rate
- Cash flow
- Spending by category
- Spending by payment method
- Average daily spending
- Highest and lowest spending categories
- Month-over-month spending changes
- Monthly income, expenses, and savings

### Savings Rate

```text
Savings = Income - Expenses

Savings Rate =
(Savings / Income) × 100
```

### Month-over-Month Analysis

The application compares current and previous monthly spending and identifies categories contributing to the change.

## 💰 Budgets

Budgets are created for a category and a specific month/year.

Usage is calculated from actual expense transactions.

```text
Spent
Remaining
Percent Used
Status
```

Budget statuses:

```text
healthy
warning
near_limit
over_budget
```

## 🎯 Financial Goals

Users can create savings goals with:

- Goal name
- Target amount
- Current amount
- Target date

Progress is calculated as:

```text
Progress % =
(Current Amount / Target Amount) × 100
```

Contributions are added through the dedicated goal contribution endpoint.

## 🔁 Recurring Transactions

Recurring transactions represent predictable income or expenses.

Supported frequencies:

```text
daily
weekly
monthly
yearly
```

FinTrack calculates a monthly equivalent so recurring commitments can be compared consistently.

## ❤️ Financial Health

FinTrack provides an explainable financial health score from 0–100.

The score considers:

- Savings rate
- Budget adherence
- Expense stability
- Goal progress
- Income/expense ratio

The response also provides individual factor scores and human-readable observations.

## 🤖 AI Features

FinTrack integrates a locally running Ollama model using **Llama 3.2**.

### AI Finance Assistant

Users can ask questions such as:

```text
Where am I spending the most?

How much did I save this month?

Why did my spending increase?

Which category is taking most of my budget?

How much did I spend on food?
```

### AI Transaction Categorization

The AI can suggest a category based on a transaction description.

Example:

```text
"Uber ride"

→ Transport
```

The backend matches the model's suggestion against the user's actual categories before returning a category ID.

### AI Financial Insights

The application can generate concise insights about:

- Spending changes
- High-spending categories
- Budget issues
- Savings
- Goal progress

### AI Context Design

The AI layer uses structured financial summaries instead of sending the complete raw transaction table for normal questions.

```text
Transactions
     ↓
Analytics Services
     ↓
Aggregated Financial Context
     ↓
Ollama / Llama 3.2
     ↓
Natural-language response
```

## 📄 Reports & Export

### Monthly Report

Includes:

- Income
- Expenses
- Savings
- Savings rate
- Top spending category
- Largest expense

### CSV Export

Transaction data can be exported with filters for date range, transaction type, and category.

### PDF Export

Monthly financial reports can be generated as PDF files.

## 🗄️ Database

FinTrack uses SQLite for local development.

Core entities:

```text
User
 │
 ├── Categories
 ├── Transactions
 ├── Budgets
 ├── Goals
 └── Recurring Transactions
```

The database is managed with SQLAlchemy models and relationships.

## 🧪 Testing

Backend tests use Pytest.

```bash
cd backend
pytest
```

AI-related tests can replace the real Ollama client with a test double so tests do not require Ollama to be running.

## 🔒 Security

The application includes:

- JWT authentication
- bcrypt password hashing
- Protected API routes
- User-scoped database access
- Pydantic request validation
- Environment-based configuration
- No plaintext password storage
- No API secrets committed to source control

## ⚠️ Disclaimer

FinTrack is a personal finance tracking and analytics application. It does not connect to bank accounts, execute transactions, or provide regulated financial advice.

AI-generated responses are informational and should not be treated as professional financial advice.

## 🔄 Project Evolution

The project started as a simpler expense tracker using React and Java Spring Boot.

It has since been expanded into a full-stack financial application:

```text
Basic Expense Tracker
        ↓
FastAPI Backend
        ↓
Authentication
        ↓
Income + Expense Management
        ↓
Financial Analytics
        ↓
Budgets + Goals
        ↓
Recurring Transactions
        ↓
Financial Health
        ↓
Reports
        ↓
AI Finance Assistant
```

## 📌 Project Highlights

- Full-stack React + TypeScript development
- Python/FastAPI REST API development
- SQLAlchemy relational data modeling
- JWT authentication
- Financial data analytics
- Dashboard and chart development
- Budget and goal business logic
- Local LLM integration with Ollama
- AI-assisted categorization and insights
- CSV/PDF report generation
- Automated backend testing

## 📜 License

This project is intended for personal and portfolio use.
