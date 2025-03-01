import uuid
from typing import Any
import base64

from fastapi import APIRouter, HTTPException, UploadFile
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models.product_models import *
from app.models.user_models import Message

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/product_count", response_model=ProductsCount)
def read_product_count(
    session: SessionDep, current_user: CurrentUser, display_invalid: bool = False,
) -> Any:
    """
    Retrieve customers only for the count.
    """

    # Build base query
    count_query = select(func.count()).select_from(Product)
    # Add filters
    if not display_invalid:
        count_query = count_query.where(Product.is_valid == True)

    count = session.exec(count_query).one()

    return ProductsCount(count=count)

@router.get("/{id}", response_model=Product)
def read_product(session: SessionDep, current_user: CurrentUser, id: str) -> Any:
    """
    Get Product by ID.
    """
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product

@router.get("/", response_model=ProductsPublic)
def read_products(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100,
    display_invalid: bool = False, brand: str = None, type: str = None
) -> Any:
    """
    Retrieve products.
    """

     # Build base query
    query = select(Product)
    count_query = select(func.count()).select_from(Product)

    # Add filters
    if not display_invalid:
        query = query.where(Product.is_valid == True)
        count_query = count_query.where(Product.is_valid == True)

    if brand:
        query = query.where(Product.brand == brand)
        count_query = count_query.where(Product.brand == brand)

    if type:
        query = query.where(Product.type == type)
        count_query = count_query.where(Product.type == type)

    # Add pagination
    query = query.offset(skip).limit(limit)
        
    count = session.exec(count_query).one()
    products = session.exec(query).all()

    return ProductsPublic(data=products, count=count)


@router.post("/", response_model=Product)
def create_product(
    *, session: SessionDep, product_in: ProductCreate
) -> Any:
    """
    Create new product.
    """
    product = Product.model_validate(product_in)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.put("/{id}", response_model=ProductPublic)
def update_product(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: str,
    product_in: ProductUpdate,
) -> Any:
    """
    Update a product.
    """
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    update_dict = product_in.model_dump(exclude_unset=True)
    product.sqlmodel_update(update_dict)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.delete("/{id}")
def delete_product(
    session: SessionDep, current_user: CurrentUser, id: str
) -> Message:
 
    """
    Delete a product.
    """
    product = session.get(Product, id)
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_in = ProductUpdate(is_valid=False, product_id=product.id, description="Marked as Deleted")

    update_dict = product_in.model_dump(exclude_unset=True)
    #update_dict = order.model_dump(exclude_unset=True, update={"is_valid": False} )
    product.sqlmodel_update(update_dict)
    session.add(product)
    session.commit()
    session.refresh(product)
    return Message(message="Product deleted successfully, mark as invalid")