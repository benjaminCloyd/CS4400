from fastapi import APIRouter, Depends
from database import get_db

router = APIRouter()


def _floatify(rows):
    """Convert Decimal values to float so FastAPI can serialise them."""
    result = []
    for row in rows:
        result.append({
            k: float(v) if hasattr(v, "__round__") and not isinstance(v, int) else v
            for k, v in row.items()
        })
    return result


@router.get("/summary")
def get_summary(cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT COUNT(*) AS total_orders FROM Orders")
    total_orders = cursor.fetchone()["total_orders"]

    cursor.execute("SELECT IFNULL(SUM(total_amount), 0) AS rev FROM Orders")
    total_revenue = float(cursor.fetchone()["rev"])

    cursor.execute("SELECT COUNT(*) AS cnt FROM Customer")
    total_customers = cursor.fetchone()["cnt"]

    cursor.execute("SELECT IFNULL(AVG(total_amount), 0) AS avg_val FROM Orders")
    avg_order = float(cursor.fetchone()["avg_val"])

    cursor.close()
    return {
        "total_orders":    total_orders,
        "total_revenue":   round(total_revenue, 2),
        "total_customers": total_customers,
        "avg_order_value": round(avg_order, 2),
    }


@router.get("/customer-spending")
def get_customer_spending(cnx=Depends(get_db)):
    """Uses the CustomerSpendingSummary view."""
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT * FROM CustomerSpendingSummary ORDER BY total_spent DESC")
    rows = cursor.fetchall()
    cursor.close()
    return _floatify(rows)


@router.get("/menu-sales")
def get_menu_sales(cnx=Depends(get_db)):
    """Uses the MenuItemSalesSummary view."""
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT * FROM MenuItemSalesSummary ORDER BY total_quantity_sold DESC")
    rows = cursor.fetchall()
    cursor.close()
    return _floatify(rows)


@router.get("/employee-stats")
def get_employee_stats(cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT
            e.employee_id,
            CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
            COUNT(o.order_id)              AS orders_processed,
            IFNULL(SUM(o.total_amount), 0) AS total_sales
        FROM Employee e
        LEFT JOIN Orders o ON e.employee_id = o.employee_id
        GROUP BY e.employee_id, e.first_name, e.last_name
        ORDER BY total_sales DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    return _floatify(rows)


@router.get("/top-customers")
def get_top_customers(cnx=Depends(get_db)):
    """Customers whose spending exceeds the average — mirrors Query 4."""
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT
            c.customer_id,
            CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
            SUM(o.total_amount) AS total_spent
        FROM Customer c
        JOIN Orders o ON c.customer_id = o.customer_id
        GROUP BY c.customer_id, c.first_name, c.last_name
        HAVING SUM(o.total_amount) > (
            SELECT AVG(customer_total)
            FROM (
                SELECT SUM(total_amount) AS customer_total
                FROM Orders
                GROUP BY customer_id
            ) AS sub
        )
        ORDER BY total_spent DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    return _floatify(rows)
