import uuid
import json
from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy.dialects.postgresql import JSON
from enum import Enum
from datetime import datetime
from typing import List

# Shared properties
class CustomerBase(SQLModel):
    company: str = Field(min_length=1, index=True, default=None)
    description: str | None = Field(default=None)
    full_name: str | None = Field(default=None)
    email: str | None = Field(max_length=255, default=None)
    phone: str | None  = Field(default=None)
    gender: str | None  = Field(default=None)
    preferred_language: str | None = Field(default=None)
    address: str | None  = Field(default=None) 
    is_valid: bool | None = Field(default=True)

class CustomerProfile(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    profile_image: bytes | None = Field(default=None)

# Database model, database table inferred from class name
class Customer(CustomerBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    is_valid: bool | None = Field(
        default=True,
        index=True,
        sa_column_kwargs={"index": True}
    )
    #payment_method: str | None = Field(default=None)
    #preferences: str | None = Field(default=None)
    #orders: list[str]

# Properties to receive on customer update
class CustomerUpdate(CustomerBase):
    description: str | None = Field(default=None, max_length=255)  # type: ignore

class CustomerPublic(CustomerBase):
    id: uuid.UUID

class CustomerCount(SQLModel):
    count: int

class CustomersPublic(SQLModel):
    data: list[CustomerPublic]
    count: int

# Properties to receive on customer creation
class CustomerCreate(CustomerBase):
    pass
