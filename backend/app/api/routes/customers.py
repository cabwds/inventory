import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models.customer_models import *
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
    new_uuid = uuid.uuid4()
    #customer_in.description = "123"
    #customer_in.full_name = "123"
    #customer_in.gender= "123"
    #customer_in.preferred_language= "123"
    #customer_in.set_address({})
    #customer_in.set_order_ids({})
    customer = Customer.model_validate(customer_in, update={"id": new_uuid})
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer

@router.put("/{id}", response_model=CustomerPublic)
def update_customer(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    customer_in: CustomerUpdate,
) -> Any:
    """
    Update an Custome.
    """
    customer = session.get(Customer, id)
    if not customer:
        raise HTTPException(status_code=404, detail="Custome not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = customer_in.model_dump(exclude_unset=True)
    customer.sqlmodel_update(update_dict)
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