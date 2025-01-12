import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from enum import Enum
from datetime import datetime

# Enum for Order Status
class OrderStatus(str, Enum):
    PENDING = 'Pending'
    PROCESSING = 'Processing'
    SHIPPED = 'Shipped'
    DELIVERED = 'Delivered'
    CANCELLED = 'Cancelled'

# Enum for Payment Status
class PaymentStatus(str, Enum):
    PENDING = 'Pending'
    PAID = 'Paid'
    FAILED = 'Failed'

class Order(SQLModel):
    id: int = Field(default=0, primary_key=True)
    order_items: str = Field(min_length=1, max_length=65025)
    order_quantity: str = Field(min_length=1, max_length=65025)
    customer_id: str = Field(min_length=1)
    order_date: str = Field(min_length=1)
    order_status: OrderStatus
    payment_status: PaymentStatus
    notes: str | None = Field(default=None)
    total_price: float = Field(default=0)

