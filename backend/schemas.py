from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime


# ── Customer ──────────────────────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    first_name:  str
    last_name:   str
    email:       str
    phone:       Optional[str] = None
    date_joined: date


class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name:  Optional[str] = None
    email:      Optional[str] = None
    phone:      Optional[str] = None


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    customer_id: int
    first_name:  str
    last_name:   str
    email:       str
    phone:       Optional[str]
    date_joined: date


# ── Employee ──────────────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    first_name: str
    last_name:  str
    hire_date:  date


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_id: int
    first_name:  str
    last_name:   str
    hire_date:   date


# ── MenuItem ──────────────────────────────────────────────────────────────────

class MenuItemCreate(BaseModel):
    item_name: str
    price:     float
    category:  str


class MenuItemUpdate(BaseModel):
    item_name: Optional[str]   = None
    price:     Optional[float] = None
    category:  Optional[str]   = None


class MenuItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    menu_item_id: int
    item_name:    str
    price:        float
    category:     str


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity:     int


class OrderCreate(BaseModel):
    customer_id:     Optional[int] = None
    employee_id:     int
    items:           List[OrderItemCreate]
    points_redeemed: int = 0


# ── Reward ────────────────────────────────────────────────────────────────────

class RewardAccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reward_account_id: int
    customer_id:       int
    points_balance:    int
