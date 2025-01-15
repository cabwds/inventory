import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from enum import Enum
from datetime import datetime

class OrderBase(SQLModel):
    order_items: str | None = Field(max_length=65025, default=None)
    order_quantity: str | None = Field(max_length=65025, default=None)
    customer_id: str | None= Field(min_length=1, index=True)
    order_date: str | None= Field(min_length=1, default=None)
    order_update_date: str | None= Field(default=None)
    order_status: str | None = Field(default=None)
    payment_status: str | None = Field(default=None)
    notes: str | None = Field(default=None)
    total_price: float | None = Field(default=0)
    is_valid: bool | None = Field(default=True)

# Database model, database table inferred from class name
class Order(OrderBase, table=True):
    id: str = Field(default=None, primary_key=True)
    customer_id: str | None = Field(
        min_length=1, 
        index=True,
        sa_column_kwargs={"index": True}
    )
    is_valid: bool | None = Field(
        default=True,
        index=True,
        sa_column_kwargs={"index": True}
    )
    order_status: str | None = Field(
        default=None,
        index=True,
        sa_column_kwargs={"index": True}
    )

# Properties to receive on order update
class OrderUpdate(OrderBase):
    pass

class OrderPublic(OrderBase):
    id: str = Field(default=None)

class OrdersPublic(SQLModel):
    data: list[OrderPublic]
    count: int

class OrdersCount(SQLModel):
    count: int

# Properties to receive on order creation
class OrderCreate(OrderBase):
    pass