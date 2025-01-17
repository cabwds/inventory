import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, cast, DateTime, and_
#from sqlalchemy import func, cast, DateTime  

from app.api.deps import CurrentUser, SessionDep
from app.models.order_models import *
from app.models.user_models import Message
from pydantic import BaseModel

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/order_count", response_model=OrdersCount)
def read_customer_orders_count(
    session: SessionDep, current_user: CurrentUser, 
    display_invalid: bool = False, customer_id: str = None, order_status: str = None,
    start_date: str = None,
    end_date: str = None 
) -> Any:
    """
    Retrieve orders only for the count.
    Args:
        start_date: Optional start date in format "YYYY-MM-DD HH:MM:SS"
        end_date: Optional end date in format "YYYY-MM-DD HH:MM:SS"
    """
    # Build base query
    count_query = select(func.count()).select_from(Order)

    # Add filters
    if not display_invalid:
        count_query = count_query.where(Order.is_valid == True)

    if customer_id:
        count_query = count_query.where(Order.customer_id == customer_id)

    if order_status:
        count_query = count_query.where(Order.order_status == order_status)

    # Add date range filter
    if start_date or end_date:
        date_filters = []
        if start_date:
            date_filters.append(cast(Order.order_date, DateTime) >= cast(start_date, DateTime))
        if end_date:
            date_filters.append(cast(Order.order_date, DateTime) <= cast(end_date, DateTime))
        
        count_query = count_query.where(and_(*date_filters))
        
    count = session.exec(count_query).one()

    return OrdersCount(count=count)

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
    session: SessionDep, current_user: CurrentUser, 
    skip: int = 0, limit: int = 100, sort_order: str = "desc", 
    display_invalid: bool = False, customer_id: str = None, order_status: str = None,
    start_date: str = None,
    end_date: str = None 
) -> Any:
    """
    Retrieve orders.
    Args:
        sort_order: "asc" for ascending, "desc" for descending order by created date
        start_date: Optional start date in format "YYYY-MM-DD HH:MM:SS"
        end_date: Optional end date in format "YYYY-MM-DD HH:MM:SS"
    """

    # Build base query
    query = select(Order)
    count_query = select(func.count()).select_from(Order)

    # Add filters
    if not display_invalid:
        query = query.where(Order.is_valid == True)
        count_query = count_query.where(Order.is_valid == True)

    if customer_id:
        query = query.where(Order.customer_id == customer_id)
        count_query = count_query.where(Order.customer_id == customer_id)

    if order_status:
        query = query.where(Order.order_status == order_status)
        count_query = count_query.where(Order.order_status == order_status)

    # Add date range filter
    if start_date or end_date:
        date_filters = []
        if start_date:
            date_filters.append(cast(Order.order_date, DateTime) >= cast(start_date, DateTime))
        if end_date:
            date_filters.append(cast(Order.order_date, DateTime) <= cast(end_date, DateTime))
        
        query = query.where(and_(*date_filters))
        count_query = count_query.where(and_(*date_filters))

    # Add sorting with string to timestamp casting
    if sort_order.lower() == "asc":
        query = query.order_by(cast(Order.order_date, DateTime).asc())
    else:
        query = query.order_by(cast(Order.order_date, DateTime).desc())

    # Add pagination
    query = query.offset(skip).limit(limit)
        
    count = session.exec(count_query).one()
    orders = session.exec(query).all()

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
    
    current_time = datetime.now()
    # Format the current time as a string
    formatted_time = current_time.strftime("%Y-%m-%d %H:%M:%S")
    current_year = current_time.year
    current_month = current_time.month
    new_id = current_year * 1000000 + current_month * 10000 + count + 1
    #order_date_str = "2025-01-13 15:30:00"
    #order_date = datetime.strptime(order_date_str, "%Y-%m-%d %H:%M:%S")
    order = Order.model_validate(order_in, update={"id": str(new_id), 
                                                   "order_date" : formatted_time,
                                                   "order_update_date" : formatted_time})
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
    
    current_time = datetime.now()
    # Format the current time as a string
    formatted_time = current_time.strftime("%Y-%m-%d %H:%M:%S")
    order_in.order_update_date = formatted_time
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
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    order_in = OrderUpdate(is_valid=False, customer_id=order.customer_id)
    update_dict = order_in.model_dump(exclude_unset=True)
    #update_dict = order.model_dump(exclude_unset=True, update={"is_valid": False} )
    order.sqlmodel_update(update_dict)
    session.add(order)
    session.commit()
    session.refresh(order)
    return Message(message="Order deleted successfully, mark as invalid")