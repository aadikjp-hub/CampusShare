
from datetime import datetime, timezone
import os

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel

from app.database import db
from app.schemas.resource_schema import ResourceCreate


class RequestStatusUpdate(BaseModel):
    status: str


router = APIRouter(prefix="/resources", tags=["Resources"])
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"


def now_utc():
    return datetime.now(timezone.utc)


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


def format_resource(resource):
    created_at = resource.get("created_at")

    return {
        "id": str(resource["_id"]),
        "title": resource.get("title", ""),
        "description": resource.get("description", ""),
        "category": resource.get("category", ""),
        "price": resource.get("price", 0),
        "condition": resource.get("condition", ""),
        "resource_type": resource.get("resource_type", ""),
        "image_id": resource.get("image_id"),
        "owner_id": resource.get("owner_id", ""),
        "owner_name": resource.get("owner_name", ""),
        "created_at": (
            created_at.isoformat()
            if created_at
            else None
        ),
        "status": resource.get("status", "Available")
    }


def reconcile_stale_requests(resource_id):
    """
    If a resource is Available, any Accepted or ReturnRequested
    request for it is stale. Mark those requests Returned so
    they cannot block a new borrow cycle.
    """
    resource = db.resources.find_one({
        "_id": ObjectId(resource_id)
    })

    if not resource:
        return

    if resource.get("status", "Available") == "Available":
        db.requests.update_many(
            {
                "resource_id": str(resource_id),
                "status": {
                    "$in": ["Accepted", "ReturnRequested"]
                }
            },
            {
                "$set": {
                    "status": "Returned",
                    "returned_at": now_utc(),
                    "reconciled": True
                }
            }
        )


# Create resource
@router.post("/", status_code=201)
def create_resource(
    resource: ResourceCreate,
    current_user: dict = Depends(get_current_user)
):
    resource_data = resource.model_dump()

    resource_data.update({
        "owner_id": str(current_user["_id"]),
        "owner_name": current_user["name"],
        "created_at": now_utc(),
        "status": "Available"
    })

    result = db.resources.insert_one(resource_data)

    saved_resource = db.resources.find_one({
        "_id": result.inserted_id
    })

    return {
        "message": "Resource added successfully",
        "resource": format_resource(saved_resource)
    }


# Get all resources
@router.get("/")
def get_all_resources():
    resources = db.resources.find().sort("created_at", -1)

    return [
        format_resource(resource)
        for resource in resources
    ]


# Get current user's resources
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


# Get one resource
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


# Update resource
@router.put("/{resource_id}")
def update_resource(
    resource_id: str,
    resource: ResourceCreate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resource ID"
        )

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
    updated_data.pop("status", None)

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


# Delete resource
@router.delete("/{resource_id}")
def delete_resource(
    resource_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resource ID"
        )

    result = db.resources.delete_one({
        "_id": ObjectId(resource_id),
        "owner_id": str(current_user["_id"])
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Resource not found or you are not the owner"
        )

    db.requests.delete_many({
        "resource_id": resource_id
    })

    return {
        "message": "Resource deleted successfully"
    }


# Borrow request
@router.post("/{resource_id}/request")
def request_resource(
    resource_id: str,
    current_user: dict = Depends(get_current_user)
):
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

    if resource["owner_id"] == str(current_user["_id"]):
        raise HTTPException(
            status_code=400,
            detail="You cannot request your own resource"
        )

    if resource.get("resource_type") != "Borrow":
        raise HTTPException(
            status_code=400,
            detail="This resource is not available for borrowing"
        )

    # Repair old Accepted/ReturnRequested requests if the resource
    # has already become Available.
    reconcile_stale_requests(resource_id)

    resource = db.resources.find_one({
        "_id": ObjectId(resource_id)
    })

    if resource.get("status", "Available") != "Available":
        raise HTTPException(
            status_code=400,
            detail="This resource is currently unavailable"
        )

    # Pending requests still prevent duplicate requests.
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

    request_data = {
        "resource_id": resource_id,
        "resource_title": resource["title"],
        "requester_id": str(current_user["_id"]),
        "requester_name": current_user["name"],
        "owner_id": resource["owner_id"],
        "owner_name": resource["owner_name"],
        "status": "Pending",
        "created_at": now_utc()
    }

    db.requests.insert_one(request_data)

    return {
        "message": "Borrow request submitted successfully",
        "status": "Pending"
    }


# Get borrower's requests
@router.get("/requests/my")
def get_my_requests(
    current_user: dict = Depends(get_current_user)
):
    requests = list(db.requests.find({
        "requester_id": str(current_user["_id"])
    }).sort("created_at", -1))

    result = []

    for request in requests:
        resource_id = request.get("resource_id")

        # Automatically repair stale Accepted requests for resources
        # which are now Available.
        if (
            resource_id
            and ObjectId.is_valid(resource_id)
            and request.get("status") in ["Accepted", "ReturnRequested"]
        ):
            reconcile_stale_requests(resource_id)

            refreshed_request = db.requests.find_one({
                "_id": request["_id"]
            })

            if refreshed_request:
                request = refreshed_request

        created_at = request.get("created_at")

        result.append({
            "id": str(request["_id"]),
            "resource_id": request.get("resource_id"),
            "resource_title": request.get(
                "resource_title",
                "Unknown Resource"
            ),
            "owner_name": request.get("owner_name", "Unknown Owner"),
            "status": request.get("status", "Pending"),
            "created_at": (
                created_at.isoformat()
                if created_at
                else None
            )
        })

    return result


# Get owner's incoming requests
@router.get("/requests/incoming")
def get_incoming_requests(
    current_user: dict = Depends(get_current_user)
):
    requests = list(db.requests.find({
        "owner_id": str(current_user["_id"])
    }).sort("created_at", -1))

    result = []

    for request in requests:
        resource_id = request.get("resource_id")

        if (
            resource_id
            and ObjectId.is_valid(resource_id)
            and request.get("status") in ["Accepted", "ReturnRequested"]
        ):
            reconcile_stale_requests(resource_id)

            refreshed_request = db.requests.find_one({
                "_id": request["_id"]
            })

            if refreshed_request:
                request = refreshed_request

        created_at = request.get("created_at")

        result.append({
            "id": str(request["_id"]),
            "resource_id": str(request.get("resource_id", "")),
            "resource_title": request.get(
                "resource_title",
                "Unknown Resource"
            ),
            "requester_id": str(request.get("requester_id", "")),
            "requester_name": request.get(
                "requester_name",
                "Unknown User"
            ),
            "status": request.get("status", "Pending"),
            "created_at": (
                created_at.isoformat()
                if created_at
                else None
            )
        })

    return result


# Owner accepts, rejects, or confirms return
@router.put("/requests/{request_id}/status")
def update_request_status(
    request_id: str,
    update: RequestStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    if update.status not in ["Accepted", "Rejected", "Returned"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be Accepted, Rejected, or Returned"
        )

    borrow_request = db.requests.find_one({
        "_id": ObjectId(request_id)
    })

    if not borrow_request:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    if borrow_request.get("owner_id") != str(current_user["_id"]):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update this request"
        )

    resource_id = borrow_request.get("resource_id")

    if not ObjectId.is_valid(resource_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid resource ID in request"
        )

    resource_object_id = ObjectId(resource_id)
    current_status = borrow_request.get("status", "Pending")

    # Accept or reject a pending request
    if update.status in ["Accepted", "Rejected"]:
        if current_status != "Pending":
            raise HTTPException(
                status_code=400,
                detail="This request has already been processed"
            )

        if update.status == "Rejected":
            result = db.requests.update_one(
                {
                    "_id": ObjectId(request_id),
                    "status": "Pending"
                },
                {
                    "$set": {
                        "status": "Rejected",
                        "updated_at": now_utc()
                    }
                }
            )

            if result.modified_count != 1:
                raise HTTPException(
                    status_code=400,
                    detail="Request could not be rejected. Refresh and try again."
                )

            return {
                "message": "Request rejected successfully",
                "status": "Rejected"
            }

        # Claim resource only if it is still Available.
        resource_update = db.resources.update_one(
            {
                "_id": resource_object_id,
                "$or": [
                    {"status": "Available"},
                    {"status": {"$exists": False}}
                ]
            },
            {
                "$set": {
                    "status": "Borrowed",
                    "borrowed_by": borrow_request["requester_id"],
                    "borrowed_at": now_utc()
                }
            }
        )

        if resource_update.modified_count != 1:
            raise HTTPException(
                status_code=400,
                detail="This resource is no longer available"
            )

        request_update = db.requests.update_one(
            {
                "_id": ObjectId(request_id),
                "status": "Pending"
            },
            {
                "$set": {
                    "status": "Accepted",
                    "updated_at": now_utc()
                }
            }
        )

        if request_update.modified_count != 1:
            # Roll back the resource if request acceptance fails.
            db.resources.update_one(
                {
                    "_id": resource_object_id,
                    "borrowed_by": borrow_request["requester_id"]
                },
                {
                    "$set": {"status": "Available"},
                    "$unset": {
                        "borrowed_by": "",
                        "borrowed_at": ""
                    }
                }
            )

            raise HTTPException(
                status_code=400,
                detail="Request could not be accepted. Please refresh."
            )

        return {
            "message": "Request accepted successfully",
            "status": "Accepted",
            "resource_status": "Borrowed"
        }

    # Confirm return
    if update.status == "Returned":
        if current_status != "ReturnRequested":
            raise HTTPException(
                status_code=400,
                detail="The borrower has not requested a return"
            )

        resource = db.resources.find_one({
            "_id": resource_object_id
        })

        if not resource:
            raise HTTPException(
                status_code=404,
                detail="Resource not found"
            )

        # Resource must be borrowed by this specific requester.
        if (
            resource.get("status") != "Borrowed"
            or resource.get("borrowed_by")
            != borrow_request.get("requester_id")
        ):
            raise HTTPException(
                status_code=400,
                detail="Resource is not currently borrowed by this requester"
            )

        resource_update = db.resources.update_one(
            {
                "_id": resource_object_id,
                "status": "Borrowed",
                "borrowed_by": borrow_request["requester_id"]
            },
            {
                "$set": {"status": "Available"},
                "$unset": {
                    "borrowed_by": "",
                    "borrowed_at": ""
                }
            }
        )

        if resource_update.modified_count != 1:
            raise HTTPException(
                status_code=400,
                detail="Could not make resource available"
            )

        request_update = db.requests.update_one(
            {
                "_id": ObjectId(request_id),
                "status": "ReturnRequested"
            },
            {
                "$set": {
                    "status": "Returned",
                    "returned_at": now_utc()
                }
            }
        )

        if request_update.modified_count != 1:
            raise HTTPException(
                status_code=400,
                detail="Could not update request to Returned"
            )

        return {
            "message": "Resource return confirmed successfully",
            "status": "Returned",
            "resource_status": "Available"
        }


# Borrower requests return
@router.post("/{resource_id}/return-request")
def request_return(
    resource_id: str,
    current_user: dict = Depends(get_current_user)
):
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

    if resource.get("status", "Available") != "Borrowed":
        # Repair stale request if resource is already available.
        reconcile_stale_requests(resource_id)

        raise HTTPException(
            status_code=400,
            detail="This resource is not currently borrowed"
        )

    # Confirm that this borrower is the one who currently has the resource.
    if resource.get("borrowed_by") != str(current_user["_id"]):
        raise HTTPException(
            status_code=403,
            detail="You are not the current borrower of this resource"
        )

    borrow_request = db.requests.find_one({
        "resource_id": resource_id,
        "requester_id": str(current_user["_id"]),
        "status": "Accepted"
    })

    if not borrow_request:
        raise HTTPException(
            status_code=400,
            detail="You do not have an accepted borrow request for this resource"
        )

    result = db.requests.update_one(
        {
            "_id": borrow_request["_id"],
            "status": "Accepted"
        },
        {
            "$set": {
                "status": "ReturnRequested",
                "return_requested_at": now_utc()
            }
        }
    )

    if result.modified_count != 1:
        raise HTTPException(
            status_code=400,
            detail="Could not submit return request. Refresh and try again."
        )

    return {
        "message": "Return request submitted successfully",
        "status": "ReturnRequested"
    }
