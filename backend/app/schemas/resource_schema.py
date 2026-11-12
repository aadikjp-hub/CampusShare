
from pydantic import BaseModel, Field
from typing import Optional


class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    category: str
    image_id: str | None = None
    price: Optional[float] = Field(default=0, ge=0)
    condition: str
    resource_type: str = "Borrow"
    status: str = "Available"


class ResourceResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    price: float
    condition: str
    resource_type: str
    owner_id: str
    owner_name: str
