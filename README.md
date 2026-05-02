# QuickBite Rewards Website Setup

## Requirements
- Python 3.10+
- Node.js LTS
- MySQL Server
- npm

## Database Setup
1. Open MySQL Workbench.
2. Run the provided SQL file: `Deliverable_5_Data_cleaned.sql`.
3. Confirm the database `reward_program` is created.

## Backend Setup
1. Open PowerShell.
2. Navigate to backend folder:
   cd backend

3. Create a `.env` file with:
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_NAME=reward_program

4. Install dependencies:
   pip install -r requirements.txt

5. Start backend:
   uvicorn main:app --reload

6. Open:
   http://127.0.0.1:8000/docs

## Frontend Setup
1. Open a second PowerShell.
2. Navigate to frontend folder:
   cd frontend

3. Install dependencies:
   npm install

4. Start frontend:
   npm run dev

5. Open:
   http://localhost:5173

## Website Features
- CRUD operations for core tables
- Displays required SQL queries with descriptions
- Adding an order triggers reward updates and transaction logging
