import uuid

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from enum import Enum
from datetime import datetime

# Enum for Product Type
class ProductType(str, Enum):
    DECORATING_FILM = 'Decorating Film'
    VINYL_WRAP = 'Vinyl Wrap'
    WALL_DECALS = 'Wall Decals'


class Address(SQLModel):
    street: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=255)
    state: str = Field(min_length=1, max_length=255)
    zipCode: str = Field(min_length=1, max_length=255)
    country: str = Field(min_length=1, max_length=255)

class Product(SQLModel):
    id: str = Field(min_length=1, primary_key=True)
    serial_number: str = Field(min_length=1)
    brand: str = Field(min_length=1)
    type: ProductType
    unit_price: float = Field(default=0)
    unit_cost: float = Field(default=0)
    width: float  # Width of the film (e.g., 1.5 meters)
    length: float  # Length of the film (e.g., 10 meters)
    thickness: float  # Thickness of the film (e.g., 0.014 meters)

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
    id: str = Field(min_length=1, primary_key=True)
    order_items: list[str]
    order_quantity: list[int]
    customer_id: str = Field(min_length=1)
    order_date: str = Field(min_length=1)
    order_status: OrderStatus
    payment_status: PaymentStatus
    notes: str | None = Field(default=None)
    total_price: float = Field(default=0)


# Shared properties
class CustomerBase(SQLModel):
    description: str | None = Field(default=None)
    #company: str = Field(min_length=1, index=True)
    #first_name: str | None = Field(default=None)
    #last_name: str | None = Field(default=None)
    #email: EmailStr = Field(max_length=255)
    #phone: str = Field(min_length=1, max_length=255)
    #gender: str = Field(min_length=1, max_length=255)
    #address: Address
    #preferred_language: str | None = Field(default=None)


# Database model, database table inferred from class name
class Customer(CustomerBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    #payment_method: str | None = Field(default=None)
    #preferences: str | None = Field(default=None)
    #orders: list[str]
    #order_id = Column(Integer, ForeignKey("order.id"))

class CustomersPublic(SQLModel):
    data: list[Customer]
    count: int

# Properties to receive on item update
class CustomerUpdate(CustomerBase):
    description: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore

class CustomerPublic(CustomerBase):
    id: uuid.UUID

# Properties to receive on customer creation
class CustomerCreate(Customer):
    pass
