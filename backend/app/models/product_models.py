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
