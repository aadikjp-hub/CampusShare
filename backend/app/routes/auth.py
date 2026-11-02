
import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from jose import jwt
from pwdlib import PasswordHash

from app.database import db
from app.schemas.user_schema import UserRegister, UserLogin

router = APIRouter(prefix="/auth", tags=["Authentication"])

password_hash = PasswordHash.recommended()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60


def create_access_token(user_id: str):
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET is missing from .env")

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "exp": expire
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegister):
    existing_user = db.users.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    hashed_password = password_hash.hash(user.password)

    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.users.insert_one(user_data)

    return {
        "message": "User registered successfully",
        "user": {
            "id": str(result.inserted_id),
            "name": user.name,
            "email": user.email
        }
    }


@router.post("/login")
def login_user(user: UserLogin):
    existing_user = db.users.find_one({"email": user.email})

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

    token = create_access_token(str(existing_user["_id"]))

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(existing_user["_id"]),
            "name": existing_user["name"],
            "email": existing_user["email"]
        }
    }
