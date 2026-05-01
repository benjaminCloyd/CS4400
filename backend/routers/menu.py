from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse

router = APIRouter()


@router.get("/", response_model=list[MenuItemResponse])
def get_all_menu_items(cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT * FROM MenuItem ORDER BY category, item_name")
    rows = cursor.fetchall()
    cursor.close()
    return rows


@router.get("/{menu_item_id}", response_model=MenuItemResponse)
def get_menu_item(menu_item_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT * FROM MenuItem WHERE menu_item_id = %s", (menu_item_id,))
    row = cursor.fetchone()
    cursor.close()
    if not row:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return row


@router.post("/", response_model=MenuItemResponse, status_code=201)
def create_menu_item(body: MenuItemCreate, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute(
        "INSERT INTO MenuItem (item_name, price, category) VALUES (%s, %s, %s)",
        (body.item_name, body.price, body.category),
    )
    cnx.commit()
    item_id = cursor.lastrowid
    cursor.execute("SELECT * FROM MenuItem WHERE menu_item_id = %s", (item_id,))
    row = cursor.fetchone()
    cursor.close()
    return row


@router.put("/{menu_item_id}", response_model=MenuItemResponse)
def update_menu_item(menu_item_id: int, body: MenuItemUpdate, cnx=Depends(get_db)):
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("SELECT menu_item_id FROM MenuItem WHERE menu_item_id = %s", (menu_item_id,))
    if not cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=404, detail="Menu item not found")

    updates = body.model_dump(exclude_none=True)
    set_clause = ", ".join(f"{k} = %s" for k in updates)
    cursor.execute(
        f"UPDATE MenuItem SET {set_clause} WHERE menu_item_id = %s",
        (*updates.values(), menu_item_id),
    )
    cnx.commit()
    cursor.execute("SELECT * FROM MenuItem WHERE menu_item_id = %s", (menu_item_id,))
    row = cursor.fetchone()
    cursor.close()
    return row


@router.delete("/{menu_item_id}", status_code=204)
def delete_menu_item(menu_item_id: int, cnx=Depends(get_db)):
    cursor = cnx.cursor()
    cursor.execute("SELECT menu_item_id FROM MenuItem WHERE menu_item_id = %s", (menu_item_id,))
    if not cursor.fetchone():
        cursor.close()
        raise HTTPException(status_code=404, detail="Menu item not found")
    cursor.execute("DELETE FROM MenuItem WHERE menu_item_id = %s", (menu_item_id,))
    cnx.commit()
    cursor.close()
