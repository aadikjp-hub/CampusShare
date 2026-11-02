
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from bson import ObjectId

import os

from app.database import db
from app.schemas.resource_schema import ResourceCreate


router = APIRouter(prefix="/resources", tags=["Resources"])

security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"


# Verify JWT and identify the logged-in student
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id or not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token is invalid or expired"
        )

    user = db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# Convert MongoDB document into JSON response
def format_resource(resource):
    return {
        "id": str(resource["_id"]),
        "title": resource["title"],
        "description": resource["description"],
        "category": resource["category"],
        "price": resource["price"],
        "condition": resource["condition"],
        "resource_type": resource["resource_type"],
        "owner_id": resource["owner_id"],
        "owner_name": resource["owner_name"],
        "created_at": resource["created_at"].isoformat()
    }


# Add a new resource
@router.post("/", status_code=201)
def create_resource(
    resource: ResourceCreate,
    current_user: dict = Depends(get_current_user)
):
    resource_data = resource.model_dump()

    resource_data.update({
        "owner_id": str(current_user["_id"]),
        "owner_name": current_user["name"],
        "created_at": datetime.now(timezone.utc)
    })

    result = db.resources.insert_one(resource_data)

    saved_resource = db.resources.find_one({
        "_id": result.inserted_id
    })

    return {
        "message": "Resource added successfully",
        "resource": format_resource(saved_resource)
    }


# View all resources
@router.get("/")
def get_all_resources():
    resources = db.resources.find().sort("created_at", -1)

    return [
        format_resource(resource)
        for resource in resources
    ]


# View resources posted by the logged-in student
@router.get("/my")
def get_my_resources(
    current_user: dict = Depends(get_current_user)
):
    resources = db.resources.find({
        "owner_id": str(current_user["_id"])
    }).sort("created_at", -1)

    return [
        format_resource(resource)
        for resource in resources
    ]


# View details of a single resource
@router.get("/{resource_id}")
def get_resource_details(resource_id: str):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resource ID"
        )

    resource = db.resources.find_one({
        "_id": ObjectId(resource_id)
    })

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    return format_resource(resource)


@router.put("/{resource_id}")
def update_resource(
    resource_id: str,
    resource: ResourceCreate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(status_code=400, detail="Invalid resource ID")

    existing_resource = db.resources.find_one({
        "_id": ObjectId(resource_id),
        "owner_id": str(current_user["_id"])
    })

    if not existing_resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found or you are not the owner"
        )

    updated_data = resource.model_dump()

    db.resources.update_one(
        {"_id": ObjectId(resource_id)},
        {"$set": updated_data}
    )

    updated_resource = db.resources.find_one({
        "_id": ObjectId(resource_id)
    })

    return {
        "message": "Resource updated successfully",
        "resource": format_resource(updated_resource)
    }


@router.delete("/{resource_id}")
def delete_resource(
    resource_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(status_code=400, detail="Invalid resource ID")

    result = db.resources.delete_one({
        "_id": ObjectId(resource_id),
        "owner_id": str(current_user["_id"])
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Resource not found or you are not the owner"
        )

    return {"message": "Resource deleted successfully"}


# Request to borrow a resource
@router.post("/{resource_id}/request")
def request_resource(
    resource_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Validate resource ID
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resource ID"
        )

    # Find resource
    resource = db.resources.find_one({
        "_id": ObjectId(resource_id)
    })

    if not resource:
        raise HTTPException(
            status_code=404,
            detail="Resource not found"
        )

    # Prevent requesting your own resource
    if resource["owner_id"] == str(current_user["_id"]):
        raise HTTPException(
            status_code=400,
            detail="You cannot request your own resource"
        )

    # Only Borrow resources can be requested
    if resource["resource_type"] != "Borrow":
        raise HTTPException(
            status_code=400,
            detail="This resource is not available for borrowing"
        )

    # Prevent duplicate pending requests
    existing_request = db.requests.find_one({
        "resource_id": resource_id,
        "requester_id": str(current_user["_id"]),
        "status": "Pending"
    })

    if existing_request:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending request for this resource"
        )

    # Save request in MongoDB
    request_data = {
        "resource_id": resource_id,
        "resource_title": resource["title"],
        "requester_id": str(current_user["_id"]),
        "requester_name": current_user["name"],
        "owner_id": resource["owner_id"],
        "owner_name": resource["owner_name"],
        "status": "Pending",
        "created_at": datetime.now(timezone.utc)
    }

    db.requests.insert_one(request_data)

    return {
        "message": "Borrow request submitted successfully",
        "status": "Pending"
    }
