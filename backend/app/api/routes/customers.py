import uuid
from typing import Any
import base64

from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models.customer_models import *
from app.models.user_models import Message
from pydantic import BaseModel

router = APIRouter(prefix="/customers", tags=["customers"])

# Route to get an image
@router.get("/get-profile-image/{customer_id}")
def get_profile_image(session: SessionDep, customer_id: uuid.UUID):
    
    profile = session.get(CustomerProfile, customer_id)

    if not profile or not profile.profile_image:
        raise HTTPException(status_code=404, detail="Profile image not found.")
    
    base64image = base64.b64encode(profile.profile_image)
    # to return the image file but in base64 encoded form
    return base64image

# Route to upload an image for customer profile
@router.post("/upload-profile-image/{customer_id}")
async def upload_profile_image(session: SessionDep, current_user: CurrentUser,
                                customer_id: uuid.UUID, file: UploadFile) -> Any:
    
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG files are allowed.")
    
    profile = session.get(CustomerProfile, customer_id)
    if not profile:
        profile = CustomerProfile(id=customer_id)
    
    # Read file content as bytes
    profile.profile_image = await file.read()
    session.add(profile)
    session.commit()
    return {"message": "Profile image uploaded successfully."}


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
    Create new customer.
    """
    new_uuid = uuid.uuid4()
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
    Update a customer.
    """
    customer = session.get(Customer, id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
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
    Delete a customer.
    """
    customer = session.get(Customer, id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    #if not current_user.is_superuser:
    #    raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(customer)
    session.commit()
    return Message(message="Customer deleted successfully")