from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from schemas import RewardAccountResponse

router = APIRouter()


@router.get("/{customer_id}", response_model=RewardAccountResponse)
def get_reward_account(customer_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM RewardAccount WHERE customer_id = %s",
        (customer_id,)
    )
    row = cursor.fetchone()
    cursor.close()
    if not row:
        raise HTTPException(status_code=404, detail="Reward account not found")
    return row


@router.get("/{customer_id}/points")
def get_customer_points(customer_id: int, cnx=Depends(get_db)):
    """Calls the GetCustomerPoints() SQL function."""
    cursor = cnx.cursor()
    cursor.execute("SELECT GetCustomerPoints(%s)", (customer_id,))
    result = cursor.fetchone()
    cursor.close()
    points = result[0] if result else 0
    return {"customer_id": customer_id, "points_balance": int(points or 0)}


@router.get("/{customer_id}/transactions")
def get_reward_transactions(customer_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)

    cursor.execute(
        "SELECT reward_account_id FROM RewardAccount WHERE customer_id = %s",
        (customer_id,)
    )
    account = cursor.fetchone()
    if not account:
        cursor.close()
        raise HTTPException(status_code=404, detail="Reward account not found")

    cursor.execute("""
        SELECT
            reward_transaction_id,
            order_id,
            points_earned,
            points_redeemed,
            points_earned - points_redeemed AS net_points,
            transaction_date
        FROM RewardTransaction
        WHERE reward_account_id = %s
        ORDER BY transaction_date DESC
    """, (account["reward_account_id"],))

    rows = cursor.fetchall()
    cursor.close()

    for r in rows:
        r["transaction_date"] = r["transaction_date"].isoformat()
    return rows
