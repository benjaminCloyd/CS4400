import math
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from schemas import OrderCreate

router = APIRouter()


@router.get("/")
def get_all_orders(cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT
            o.order_id,
            o.order_datetime,
            o.customer_id,
            CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
            o.employee_id,
            CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
            o.total_amount,
            o.points_earned,
            o.points_redeemed
        FROM Orders o
        LEFT JOIN Customer c ON o.customer_id = c.customer_id
        JOIN Employee e ON o.employee_id = e.employee_id
        ORDER BY o.order_datetime DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    # Convert Decimal/datetime to serialisable types
    for r in rows:
        r["total_amount"] = float(r["total_amount"])
        r["order_datetime"] = r["order_datetime"].isoformat()
    return rows


@router.get("/customer/{customer_id}")
def get_customer_orders(customer_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT
            o.order_id, o.order_datetime,
            CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
            o.total_amount, o.points_earned, o.points_redeemed
        FROM Orders o
        JOIN Employee e ON o.employee_id = e.employee_id
        WHERE o.customer_id = %s
        ORDER BY o.order_datetime DESC
    """, (customer_id,))
    orders = cursor.fetchall()

    for o in orders:
        o["total_amount"]    = float(o["total_amount"])
        o["order_datetime"]  = o["order_datetime"].isoformat()

        cursor.execute("""
            SELECT oi.order_item_id, oi.menu_item_id, m.item_name,
                   m.price, oi.quantity
            FROM OrderItem oi
            JOIN MenuItem m ON oi.menu_item_id = m.menu_item_id
            WHERE oi.order_id = %s
        """, (o["order_id"],))
        items = cursor.fetchall()
        for i in items:
            i["price"] = float(i["price"])
        o["items"] = items

    cursor.close()
    return orders


@router.get("/{order_id}")
def get_order(order_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT o.*, CONCAT(c.first_name,' ',c.last_name) AS customer_name,
               CONCAT(e.first_name,' ',e.last_name) AS employee_name
        FROM Orders o
        LEFT JOIN Customer c ON o.customer_id = c.customer_id
        JOIN Employee e ON o.employee_id = e.employee_id
        WHERE o.order_id = %s
    """, (order_id,))
    row = cursor.fetchone()
    if not row:
        cursor.close()
        raise HTTPException(status_code=404, detail="Order not found")

    row["total_amount"]   = float(row["total_amount"])
    row["order_datetime"] = row["order_datetime"].isoformat()

    cursor.execute("""
        SELECT oi.order_item_id, oi.menu_item_id, m.item_name,
               m.price, oi.quantity
        FROM OrderItem oi
        JOIN MenuItem m ON oi.menu_item_id = m.menu_item_id
        WHERE oi.order_id = %s
    """, (order_id,))
    items = cursor.fetchall()
    for i in items:
        i["price"] = float(i["price"])
    row["items"] = items

    cursor.close()
    return row


@router.post("/", status_code=201)
def create_order(body: OrderCreate, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)

    # Calculate total from live menu prices
    total_amount = 0.0
    resolved = []
    for oi in body.items:
        cursor.execute("SELECT price FROM MenuItem WHERE menu_item_id = %s", (oi.menu_item_id,))
        row = cursor.fetchone()
        if not row:
            cursor.close()
            raise HTTPException(status_code=404, detail=f"Menu item {oi.menu_item_id} not found")
        total_amount += float(row["price"]) * oi.quantity
        resolved.append((oi.menu_item_id, oi.quantity))

    total_amount  = round(total_amount, 2)
    points_earned = math.floor(total_amount)   # 1 pt per $1

    try:
        # INSERT into Orders — triggers fire automatically here:
        #   BEFORE INSERT: trg_validate_points_before_order
        #   AFTER INSERT:  trg_update_points_after_order
        #   AFTER INSERT:  trg_log_reward_transaction_after_order
        cursor.execute("""
            INSERT INTO Orders
                (customer_id, employee_id, order_datetime,
                 total_amount, points_earned, points_redeemed)
            VALUES (%s, %s, NOW(), %s, %s, %s)
        """, (
            body.customer_id,
            body.employee_id,
            total_amount,
            points_earned,
            body.points_redeemed,
        ))
        order_id = cursor.lastrowid

        # Insert line items
        for menu_item_id, quantity in resolved:
            cursor.execute(
                "INSERT INTO OrderItem (order_id, menu_item_id, quantity) VALUES (%s, %s, %s)",
                (order_id, menu_item_id, quantity),
            )

        cnx.commit()
        cursor.close()
        return {
            "order_id":      order_id,
            "total_amount":  total_amount,
            "points_earned": points_earned,
            "message":       "Order placed successfully",
        }

    except Exception as exc:
        cnx.rollback()
        cursor.close()
        msg = str(exc)
        if any(k in msg for k in ("enough reward points", "Guest orders", "negative")):
            raise HTTPException(status_code=400, detail=msg)
        raise HTTPException(status_code=500, detail=f"Order failed: {msg}")


@router.post("/via-procedure", status_code=201)
def create_order_via_procedure(body: OrderCreate, cnx=Depends(get_db)):
    """Explicitly calls the AddCustomerOrder stored procedure."""
    cursor = cnx.cursor(dictionary=True)

    total_amount = 0.0
    resolved = []
    for oi in body.items:
        cursor.execute("SELECT price FROM MenuItem WHERE menu_item_id = %s", (oi.menu_item_id,))
        row = cursor.fetchone()
        if not row:
            cursor.close()
            raise HTTPException(status_code=404, detail=f"Menu item {oi.menu_item_id} not found")
        total_amount += float(row["price"]) * oi.quantity
        resolved.append((oi.menu_item_id, oi.quantity))

    total_amount = round(total_amount, 2)

    try:
        cursor.callproc("AddCustomerOrder", [
            body.customer_id,
            body.employee_id,
            total_amount,
            body.points_redeemed,
        ])
        # Consume any result sets the procedure produces
        for _ in cursor.stored_results():
            pass

        cursor.execute("SELECT LAST_INSERT_ID() AS order_id")
        order_id = cursor.fetchone()["order_id"]

        for menu_item_id, quantity in resolved:
            cursor.execute(
                "INSERT INTO OrderItem (order_id, menu_item_id, quantity) VALUES (%s, %s, %s)",
                (order_id, menu_item_id, quantity),
            )

        cnx.commit()
        cursor.close()
        return {
            "order_id":    order_id,
            "total_amount": total_amount,
            "message":     "Order placed via stored procedure",
        }

    except Exception as exc:
        cnx.rollback()
        cursor.close()
        msg = str(exc)
        if any(k in msg for k in ("enough reward points", "Guest orders", "negative")):
            raise HTTPException(status_code=400, detail=msg)
        raise HTTPException(status_code=500, detail=f"Procedure call failed: {msg}")
