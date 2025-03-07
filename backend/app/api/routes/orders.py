import uuid
import json
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, cast, DateTime, and_
#from sqlalchemy import func, cast, DateTime  

from app.api.deps import CurrentUser, SessionDep
from app.models.order_models import *
from app.models.customer_models import *
from app.models.product_models import *
from app.models.user_models import Message
from app.utilities.currency_utils import convert_to_sgd, convert_to_target_currency
from pydantic import BaseModel
from fastapi.responses import FileResponse, Response
from openpyxl import load_workbook
from pathlib import Path

router = APIRouter(prefix="/orders", tags=["orders"])
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent  # Adjust if needed


# Route to get an order invoice
@router.get("/get-order-invoice/{order_id}")
def get_order_invoice(session: SessionDep, order_id: str, output_currency: str = "SGD"):

    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    customer = session.get(Customer, order.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    current_date = datetime.now().strftime("%d-%m-%Y")

    template_path = BASE_DIR / "Invoice Template.xlsx"
    output_dir = BASE_DIR / "temp"
    output_dir.mkdir(parents=True, exist_ok=True)  # Ensure 'temp' directory exists
    output_path = output_dir / f"Invoice_{order_id}_{current_date}.xlsx"

    # Load the workbook (this preserves formatting)
    wb = load_workbook(template_path)

    # Select the correct sheet
    sheet = wb["Invoice"]  # Ensure this sheet exists in your template

    # General Info - Modify the required cell (example: setting Order ID)
    sheet["G2"] = current_date # Adjust to the current date
    sheet["G3"] = order_id # Adjust to the order id
    sheet["B7"] = customer.company # Adjust to the customer company name
    sheet["C11"] = customer.phone # Adjust to the customer contact number 
    sheet["F14"] = "UNIT PRICE ({})".format(output_currency)
    sheet["G14"] = "SUBTOTAL ({})".format(output_currency)

    # Product - Write with order product list
    process_order_item_excel(session=session,
                            sheet=sheet, 
                            output_currency=output_currency,
                            order_items=order.order_items,
                            total_price=order.total_price,
                            start_row=15,
                            end_row=36)

    # Save the modified file
    wb.save(output_path)

    # Return file as response
    return FileResponse(
        path=output_path, 
        filename=f"Invoice_{order_id}_{current_date}.xlsx", 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

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

def parse_str2dict(input:str):
    try:
        # Convert JSON string to dictionary
        out_dict = json.loads(input)
        return out_dict
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None  # Return None or an empty dict {} as needed
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def process_order_item_excel(session, sheet, output_currency: str, order_items:str, total_price: float, start_row: int = 15, end_row: int = 36):

    ITEM_COLUMN = "B{}"
    DESCRIPTION_COLUMN = "C{}"
    QTY_COLUMN = "E{}"
    UNIT_PRICE_COLUMN = "F{}"
    SUBTOTAL_COLUMN = "G{}"
    
    row_count = start_row
    item_count = 0
    order_dict = parse_str2dict(order_items)
    
    for product_name in order_dict:
        product : Product = session.get(Product, product_name)
        
        item_count+=1
        product_quantity = order_dict[product_name]
        
        item_column_str = ITEM_COLUMN.format(row_count)
        description_column_str = DESCRIPTION_COLUMN.format(row_count)
        qty_column_str = QTY_COLUMN.format(row_count)
        unit_price_column_str = UNIT_PRICE_COLUMN.format(row_count)
        subtotal_column_str = SUBTOTAL_COLUMN.format(row_count)
        row_count+=2

        sheet[item_column_str] = item_count
        sheet[description_column_str] = product_name
        sheet[qty_column_str] = product_quantity
        if product.price_currency == output_currency:
            unit_price_converted = product.unit_price
        else:
            unit_price_converted = convert_to_target_currency(product.unit_price, product.price_currency, target_currency=output_currency)
        sheet[unit_price_column_str] = round(unit_price_converted, 2)
        sheet[subtotal_column_str] = round(product_quantity * unit_price_converted, 2)

    return