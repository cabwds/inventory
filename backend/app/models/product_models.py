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

class ProductBase(SQLModel):
    brand: str | None = Field(default=None)
    type: str | None = Field(default=None)
    unit_price: float | None = Field(default=None)
    price_currency: str | None = Field(default="SGD")
    unit_cost: float | None = Field(default=None)
    cost_currency: str | None = Field(default="CNY")
    width: float | None = Field(default=None) # Width of the film (e.g., 1.5 meters)
    length: float | None = Field(default=None) # Length of the film (e.g., 10 meters)
    thickness: float | None = Field(default=None) # Thickness of the film (e.g., 0.014 meters)
    is_valid: bool | None = Field(default=True)

# Database model, database table inferred from class name
class Product(ProductBase, table=True):
    id: str = Field(default=None, primary_key=True)
    is_valid: bool | None = Field(
        default=True,
        index=True,
        sa_column_kwargs={"index": True}
    )
    brand: str | None = Field(
        default=None,
        index=True,
        sa_column_kwargs={"index": True}
    )
    type: str | None = Field(
        default=None,
        index=True,
        sa_column_kwargs={"index": True}
    )

# Properties to receive on Product update
class ProductUpdate(ProductBase):
    pass

class ProductPublic(ProductBase):
    id: str = Field(default=None)

class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int

class ProductsCount(SQLModel):
    count: int

# Properties to receive on Product creation
class ProductCreate(ProductBase):
    id: str = Field(default=None)