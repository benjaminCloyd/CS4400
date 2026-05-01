from fastapi import APIRouter, Depends, HTTPException
from mysql.connector import Error
from database import get_db
from schemas import CustomerCreate, CustomerUpdate, CustomerResponse
from datetime import date

router = APIRouter()


@router.get("/", response_model=list[CustomerResponse])
def get_all_customers(cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Customer ORDER BY last_name")
    rows = cursor.fetchall()
    cursor.close()
    return rows


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Customer WHERE customer_id = %s", (customer_id,))
    row = cursor.fetchone()
    cursor.close()
    if not row:
        raise HTTPException(status_code=404, detail="Customer not found")
    return row


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(body: CustomerCreate, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)

    # Check for duplicate email
    cursor.execute("SELECT customer_id FROM Customer WHERE email = %s", (body.email,))
    if cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    cursor.execute(
        """INSERT INTO Customer (first_name, last_name, email, phone, date_joined)
           VALUES (%s, %s, %s, %s, %s)""",
        (body.first_name, body.last_name, body.email, body.phone, body.date_joined),
    )
    customer_id = cursor.lastrowid

    # Every new customer automatically gets a reward account
    cursor.execute(
        "INSERT INTO RewardAccount (customer_id, points_balance) VALUES (%s, 0)",
        (customer_id,),
    )
    cnx.commit()

    cursor.execute("SELECT * FROM Customer WHERE customer_id = %s", (customer_id,))
    row = cursor.fetchone()
    cursor.close()
    return row


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, body: CustomerUpdate, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)

    cursor.execute("SELECT customer_id FROM Customer WHERE customer_id = %s", (customer_id,))
    if not cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=404, detail="Customer not found")

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = ", ".join(f"{k} = %s" for k in updates)
    cursor.execute(
        f"UPDATE Customer SET {set_clause} WHERE customer_id = %s",
        (*updates.values(), customer_id),
    )
    cnx.commit()

    cursor.execute("SELECT * FROM Customer WHERE customer_id = %s", (customer_id,))
    row = cursor.fetchone()
    cursor.close()
    return row


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor()
    cursor.execute("SELECT customer_id FROM Customer WHERE customer_id = %s", (customer_id,))
    if not cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=404, detail="Customer not found")

    cursor.execute("DELETE FROM Customer WHERE customer_id = %s", (customer_id,))
    cnx.commit()
    cursor.close()
