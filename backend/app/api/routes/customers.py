import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models.product_models import *
from app.models.user_models import Message
from pydantic import BaseModel

router = APIRouter(prefix="/customers", tags=["customers"])

class ResponseMessage(BaseModel):
    message: str

@router.get("/{id}", response_model=Customer)
def read_customer(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get customer by ID.
    """
    customer = session.get(Customer, id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    #if not current_user.is_superuser:
    #    raise HTTPException(status_code=400, detail="Not enough permissions")
    return customer
    
@router.get("/", response_model=CustomersPublic)
def read_customers(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve customers.
    """

    if current_user.is_superuser:
        new_customer = Customer(id="7d84738f-dfb3-41eb-bc2a-689262a90989",description="test user 1")
        customer = Customer.model_validate(new_customer)
        session.add(customer)
        session.commit()
        session.refresh(customer)
        count_statement = select(func.count()).select_from(Customer)
        count = session.exec(count_statement).one()
        statement = select(Customer).offset(skip).limit(limit)
        customers = session.exec(statement).all()

    return CustomersPublic(data=customers, count=count)

@router.post("/", response_model=Customer)
def create_customer(
    *, session: SessionDep, current_user: CurrentUser, customer_in: CustomerCreate
) -> Any:
    """
    Create new item.
    """
    new_customer = {
        "id" : "7d84738f-dfb3-41eb-bc2a-689262a90989",
        "description" : "test user 1"
    }
    customer = Customer.model_validate(new_customer)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer


@router.delete("/{id}")
def delete_customer(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an item.
    """
    customer = session.get(Customer, id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    #if not current_user.is_superuser:
    #    raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(customer)
    session.commit()
    return Message(message="Customer deleted successfully")