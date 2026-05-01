from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from schemas import EmployeeCreate, EmployeeResponse

router = APIRouter()


@router.get("/", response_model=list[EmployeeResponse])
def get_all_employees(cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Employee ORDER BY last_name")
    rows = cursor.fetchall()
    cursor.close()
    return rows


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Employee WHERE employee_id = %s", (employee_id,))
    row = cursor.fetchone()
    cursor.close()
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    return row


@router.post("/", response_model=EmployeeResponse, status_code=201)
def create_employee(body: EmployeeCreate, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute(
        "INSERT INTO Employee (first_name, last_name, hire_date) VALUES (%s, %s, %s)",
        (body.first_name, body.last_name, body.hire_date),
    )
    cnx.commit()
    emp_id = cursor.lastrowid
    cursor.execute("SELECT * FROM Employee WHERE employee_id = %s", (emp_id,))
    row = cursor.fetchone()
    cursor.close()
    return row


@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor()
    cursor.execute("SELECT employee_id FROM Employee WHERE employee_id = %s", (employee_id,))
    if not cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=404, detail="Employee not found")
    cursor.execute("DELETE FROM Employee WHERE employee_id = %s", (employee_id,))
    cnx.commit()
    cursor.close()
