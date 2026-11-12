
import os
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr, Field

from app.database import db
from app.schemas.user_schema import UserUpdate


router = APIRouter(prefix="/auth", tags=["Authentication"])

password_hash = PasswordHash.recommended()
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60


# ==========================================
# REQUEST MODELS
# ==========================================

class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ==========================================
# HELPERS
# ==========================================

def current_time():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def normalize_email(email):
    return str(email).strip().lower()


def format_user(user):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"]
    }


# ==========================================
# JWT TOKEN
# ==========================================

def create_access_token(user_id: str):
    if not JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET is missing from environment variables"
        )

    expire = current_time() + timedelta(
        minutes=TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "exp": expire
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


# ==========================================
# AUTHENTICATED USER
# ==========================================

def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET is missing from environment variables"
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
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
            detail="Invalid or expired authentication token"
        )

    user = db.users.find_one({
        "_id": ObjectId(user_id)
    })

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# ==========================================
# REGISTER USER
# No email OTP required for college demo
# ==========================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register_user(user: UserRegister):

    email = normalize_email(user.email)

    existing_user = db.users.find_one({
        "email": email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered. Please log in."
        )

    hashed_password = password_hash.hash(user.password)

    user_data = {
        "name": user.name.strip(),
        "email": email,
        "password": hashed_password,
        "email_verified": True,
        "created_at": current_time()
    }

    result = db.users.insert_one(user_data)

    created_user = db.users.find_one({
        "_id": result.inserted_id
    })

    token = create_access_token(
        str(result.inserted_id)
    )

    return {
        "message": "Registration successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": format_user(created_user)
    }


# ==========================================
# OLD OTP ENDPOINTS
# OTP verification is disabled for demo
# ==========================================

@router.post("/verify-otp")
def verify_email_otp():

    raise HTTPException(
        status_code=410,
        detail="Email OTP verification is disabled for the college demo. Please register or log in directly."
    )


@router.post("/resend-otp")
def resend_otp():

    raise HTTPException(
        status_code=410,
        detail="Email OTP verification is disabled for the college demo."
    )


# ==========================================
# LOGIN
# ==========================================

@router.post("/login")
def login_user(user: UserLogin):

    email = normalize_email(user.email)

    existing_user = db.users.find_one({
        "email": email
    })

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not password_hash.verify(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        str(existing_user["_id"])
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": format_user(existing_user)
    }


# ==========================================
# UPDATE PROFILE
# ==========================================

@router.put("/profile")
def update_profile(
    profile: UserUpdate,
    current_user: dict = Depends(get_authenticated_user)
):

    email = normalize_email(profile.email)

    if email != current_user["email"]:
        raise HTTPException(
            status_code=400,
            detail="Changing email is not supported."
        )

    db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "name": profile.name
            }
        }
    )

    updated_user = db.users.find_one({
        "_id": current_user["_id"]
    })

    return {
        "message": "Profile updated successfully",
        "user": format_user(updated_user)
    }
