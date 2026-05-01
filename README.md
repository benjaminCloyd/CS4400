# QuickBite Rewards — Deliverable 5

FastAPI + React + MySQL full-stack implementation of the fast food reward program.  
Uses **mysql.connector** (no ORM) — same driver used in class.

## Project Structure

```
reward-program/
├── backend/
│   ├── main.py              # FastAPI app + CORS
│   ├── database.py          # mysql.connector connection + get_db() dependency
│   ├── schemas.py           # Pydantic v2 request/response models
│   ├── requirements.txt
│   ├── .env.example         # Copy to .env and set your password
│   └── routers/
│       ├── customers.py     # Full CRUD + auto reward account on register
│       ├── employees.py     # Full CRUD
│       ├── menu.py          # Full CRUD
│       ├── orders.py        # POST fires all 3 triggers automatically
│       │                    # /via-procedure calls AddCustomerOrder()
│       ├── rewards.py       # /points calls GetCustomerPoints() function
│       └── analytics.py     # Both views + all 5 queries
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx           # Role switcher (Customer / Manager)
        ├── App.css           # Dark fast-food theme
        ├── api.js            # All fetch calls in one place
        └── components/
            ├── customer/
            │   ├── OrderPanel.jsx    # Menu grid, cart, point redemption
            │   └── RewardsPanel.jsx  # Points balance, history, order log
            └── manager/
                ├── AnalyticsPanel.jsx  # KPIs, views, top customers
                ├── MenuManager.jsx     # CRUD menu items
                ├── CustomerManager.jsx # CRUD customers
                ├── EmployeeManager.jsx # CRUD employees
                └── OrdersView.jsx      # All orders table
```

## Setup

### 1. Run the SQL file in MySQL Workbench (or CLI)
```sql
-- Run Deliverable_5_Data.sql to create the database, tables, triggers,
-- procedure, function, views, and sample data.
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt

cp .env.example .env
# Open .env and set your password:
#   DB_PASSWORD=your_actual_password
```

The connection in `database.py` mirrors exactly what you used in class:

```python
import mysql.connector

cnx = mysql.connector.connect(
    user="root",
    password="password1",   # set via .env
    host="127.0.0.1",
    database="reward_program",
)
```

```bash
uvicorn main:app --reload
# API running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# UI at http://localhost:5173
```

## Database Features Wired Up

| SQL Feature | API Endpoint |
|---|---|
| Trigger 1 — validate points before order | Auto-fires on `POST /orders/` |
| Trigger 2 — update balance after order   | Auto-fires on `POST /orders/` |
| Trigger 3 — log reward transaction       | Auto-fires on `POST /orders/` |
| Trigger 4 — prevent negative balance     | Auto-fires on any balance update |
| `AddCustomerOrder` procedure | `POST /orders/via-procedure` |
| `GetCustomerPoints` function | `GET /rewards/{id}/points` |
| `CustomerSpendingSummary` view | `GET /analytics/customer-spending` |
| `MenuItemSalesSummary` view | `GET /analytics/menu-sales` |
| Queries 1–5 | `/analytics/*` endpoints |
