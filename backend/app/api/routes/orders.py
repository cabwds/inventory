import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models.order_models import *
from app.models.user_models import Message
from pydantic import BaseModel

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/{id}", response_model=Order)
def read_order(session: SessionDep, current_user: CurrentUser, id: str) -> Any:
    """
    Get order by ID.
    """
    order = session.get(Order, id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    #if not current_user.is_superuser:
    #    raise HTTPException(status_code=400, detail="Not enough permissions")
    return order

@router.get("/", response_model=OrdersPublic)
def read_orders(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve orders.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Order)
        count = session.exec(count_statement).one()
        statement = select(Order).offset(skip).limit(limit)
        orders = session.exec(statement).all()

    return OrdersPublic(data=orders, count=count)

@router.post("/", response_model=Order)
def create_order(
    *, session: SessionDep, current_user: CurrentUser, order_in: OrderCreate
) -> Any:
    """
    Create new order.
    """
    count_statement = select(func.count()).select_from(Order)
    count = session.exec(count_statement).one()
    new_id = count + 1
    order = Order.model_validate(order_in, update={"id": str(new_id)})
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@router.put("/{id}", response_model=OrderPublic)
def update_order(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
    order_in: OrderUpdate,
) -> Any:
    """
    Update an order.
    """
    order = session.get(Order, id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    #if not order.is_valid:
    #    raise HTTPException(status_code=404, detail="Order is not valid")
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = order_in.model_dump(exclude_unset=True)
    order.sqlmodel_update(update_dict)
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

@router.delete("/{id}")
def delete_order(
    session: SessionDep, current_user: CurrentUser, id: str
) -> Message:
    """
    Delete an order. To mark order invalid
    """
    order = session.get(Order, id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    #if not current_user.is_superuser:
    #    raise HTTPException(status_code=400, detail="Not enough permissions")
    order_invalid = OrderUpdate(is_valid=False)
    update_dict = order_invalid.model_dump(exclude_unset=True)
    order.sqlmodel_update(update_dict)
    session.add(order)
    session.commit()
    session.refresh(order)
    return Message(message="Order deleted successfully, mark as invalid")