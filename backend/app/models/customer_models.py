import uuid
import json
from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy.dialects.postgresql import JSON
from enum import Enum
from datetime import datetime
from typing import List

class Address(SQLModel):
    street: str
    city: str
    state: str
    zipCode: str
    country: str

# Shared properties
class CustomerBase(SQLModel):
    company: str = Field(min_length=1, index=True, default=None)
    description: str | None = Field(default=None)
    full_name: str | None = Field(default=None)
    email: EmailStr = Field(max_length=255)
    phone: str = Field(min_length=1, max_length=255, default=None)
    gender: str = Field(min_length=1, max_length=255, default=None)
    preferred_language: str | None = Field(default=None)
    address: str = Field(default="{}")  # Store as serialized JSON
    order_ids: str = Field(default="[]")  # Store as serialized JSON

    def get_address(self) -> dict:
        return json.loads(self.address)

    def set_address(self, address: dict):
        self.address = json.dumps(address)

    def get_order_ids(self) -> list:
        return json.loads(self.order_ids)

    def set_order_ids(self, order_ids: list):
        self.order_ids = json.dumps(order_ids)


# Database model, database table inferred from class name
class Customer(CustomerBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    #payment_method: str | None = Field(default=None)
    #preferences: str | None = Field(default=None)
    #orders: list[str]

# Properties to receive on item update
class CustomerUpdate(CustomerBase):
    description: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore

class CustomerPublic(CustomerBase):
    id: uuid.UUID

class CustomersPublic(SQLModel):
    data: list[CustomerPublic]
    count: int

# Properties to receive on customer creation
class CustomerCreate(Customer):
    pass
