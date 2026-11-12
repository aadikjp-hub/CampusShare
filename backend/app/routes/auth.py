
import os
import secrets
import hashlib
import hmac
import smtplib

from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

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

OTP_EXPIRE_MINUTES = 5
OTP_RESEND_SECONDS = 60
OTP_MAX_ATTEMPTS = 5


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


class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")


class ResendOTP(BaseModel):
    email: EmailStr


# ==========================================
# DATETIME HELPERS
# ==========================================

def current_time():
    # Store UTC timestamps as naive UTC datetimes.
    # PyMongo returns naive UTC datetimes by default.
    return datetime.now(timezone.utc).replace(tzinfo=None)


def normalize_datetime(value):
    # Convert timezone-aware or naive MongoDB dates
    # into comparable naive UTC datetimes.
    if value is None:
        return None

    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)

    return value


def normalize_email(email):
    return str(email).strip().lower()


# ==========================================
# JWT TOKEN
# ==========================================

def create_access_token(user_id: str):
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET is missing from .env")

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
# OTP HASHING
# ==========================================

def hash_otp(email, otp):
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET is missing from .env")

    message = f"{email}:{otp}".encode("utf-8")

    return hmac.new(
        JWT_SECRET.encode("utf-8"),
        message,
        hashlib.sha256
    ).hexdigest()


# ==========================================
# USER FORMAT
# ==========================================

def format_user(user):
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"]
    }


# ==========================================
# SEND OTP EMAIL
# ==========================================

def send_otp_email(email, otp):

    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if not smtp_email or not smtp_password:
        raise HTTPException(
            status_code=500,
            detail="Email service is not configured. Check backend .env."
        )

    message = EmailMessage()

    message["Subject"] = "CampusShare Email Verification"
    message["From"] = smtp_email
    message["To"] = email

    message.set_content(
        f"""
Hello,

Welcome to CampusShare!

Your email verification OTP is:

{otp}

This OTP expires in {OTP_EXPIRE_MINUTES} minutes.

Please do not share this code with anyone.

Thank you,
CampusShare Team
"""
    )

    try:
        with smtplib.SMTP(
            smtp_host,
            smtp_port,
            timeout=15
        ) as server:

            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(message)

    except Exception as error:
        print("SMTP EMAIL ERROR:", repr(error))

        raise HTTPException(
            status_code=503,
            detail="Unable to send OTP email. Check Gmail SMTP settings."
        )


# ==========================================
# AUTHENTICATED USER
# ==========================================

def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET is missing from .env")

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

    if not user.get("email_verified", False):
        raise HTTPException(
            status_code=403,
            detail="Please verify your email first."
        )

    return user


# ==========================================
# REGISTER USER AND SEND OTP
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

    pending = db.email_verifications.find_one({
        "email": email
    })

    now = current_time()

    if pending:
        resend_after = normalize_datetime(
            pending.get("resend_after")
        )

        if resend_after and now < resend_after:
            remaining = int(
                (resend_after - now).total_seconds()
            )

            raise HTTPException(
                status_code=429,
                detail=f"Please wait {remaining} seconds before requesting another OTP."
            )

    otp = f"{secrets.randbelow(1000000):06d}"

    pending_data = {
        "name": user.name.strip(),
        "email": email,
        "password": password_hash.hash(user.password),
        "otp_hash": hash_otp(email, otp),
        "expires_at": now + timedelta(
            minutes=OTP_EXPIRE_MINUTES
        ),
        "resend_after": now + timedelta(
            seconds=OTP_RESEND_SECONDS
        ),
        "attempts": 0,
        "created_at": now
    }

    db.email_verifications.update_one(
        {"email": email},
        {"$set": pending_data},
        upsert=True
    )

    try:
        send_otp_email(email, otp)

    except HTTPException:
        db.email_verifications.delete_one({
            "email": email
        })
        raise

    return {
        "message": "Verification OTP sent successfully.",
        "email": email
    }


# ==========================================
# VERIFY EMAIL OTP
# ==========================================

@router.post("/verify-otp")
def verify_email_otp(data: VerifyOTP):

    email = normalize_email(data.email)

    pending = db.email_verifications.find_one({
        "email": email
    })

    if not pending:
        raise HTTPException(
            status_code=404,
            detail="No pending registration found. Please sign up again or request verification."
        )

    now = current_time()

    expires_at = normalize_datetime(
        pending.get("expires_at")
    )

    if not expires_at or now > expires_at:

        db.email_verifications.delete_one({
            "_id": pending["_id"]
        })

        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new one."
        )

    if pending.get("attempts", 0) >= OTP_MAX_ATTEMPTS:

        db.email_verifications.delete_one({
            "_id": pending["_id"]
        })

        raise HTTPException(
            status_code=429,
            detail="Too many incorrect attempts. Please request a new OTP."
        )

    submitted_hash = hash_otp(
        email,
        data.otp
    )

    if not hmac.compare_digest(
        submitted_hash,
        pending["otp_hash"]
    ):

        db.email_verifications.update_one(
            {"_id": pending["_id"]},
            {"$inc": {"attempts": 1}}
        )

        raise HTTPException(
            status_code=400,
            detail="Incorrect OTP. Please try again."
        )

    # Check whether this account existed before OTP was introduced.
    existing_user = db.users.find_one({
        "email": email
    })

    if existing_user:

        if existing_user.get("email_verified", False):

            db.email_verifications.delete_one({
                "_id": pending["_id"]
            })

            raise HTTPException(
                status_code=400,
                detail="Email is already verified. Please log in."
            )

        db.users.update_one(
            {"_id": existing_user["_id"]},
            {
                "$set": {
                    "email_verified": True
                }
            }
        )

        user_id = existing_user["_id"]
        user_name = existing_user["name"]

    else:

        user_data = {
            "name": pending["name"],
            "email": email,
            "password": pending["password"],
            "email_verified": True,
            "created_at": now
        }

        result = db.users.insert_one(user_data)

        user_id = result.inserted_id
        user_name = pending["name"]

    db.email_verifications.delete_one({
        "_id": pending["_id"]
    })

    return {
        "message": "Email verified and account activated successfully.",
        "user": {
            "id": str(user_id),
            "name": user_name,
            "email": email
        }
    }


# ==========================================
# RESEND OTP
# ==========================================

@router.post("/resend-otp")
def resend_otp(data: ResendOTP):

    email = normalize_email(data.email)
    now = current_time()

    pending = db.email_verifications.find_one({
        "email": email
    })

    # Support old accounts that were created before OTP verification.
    if not pending:

        existing_user = db.users.find_one({
            "email": email
        })

        if not existing_user:
            raise HTTPException(
                status_code=404,
                detail="No account found with this email. Please sign up first."
            )

        if existing_user.get("email_verified", False):
            raise HTTPException(
                status_code=400,
                detail="This email is already verified. Please log in."
            )

        pending = {
            "name": existing_user["name"],
            "email": email,
            "password": existing_user["password"],
            "created_at": now
        }

    resend_after = normalize_datetime(
        pending.get("resend_after")
    )

    if resend_after and now < resend_after:

        remaining = int(
            (resend_after - now).total_seconds()
        )

        raise HTTPException(
            status_code=429,
            detail=f"Please wait {remaining} seconds before requesting another OTP."
        )

    otp = f"{secrets.randbelow(1000000):06d}"

    pending.update({
        "otp_hash": hash_otp(email, otp),
        "expires_at": now + timedelta(
            minutes=OTP_EXPIRE_MINUTES
        ),
        "resend_after": now + timedelta(
            seconds=OTP_RESEND_SECONDS
        ),
        "attempts": 0
    })

    db.email_verifications.update_one(
        {"email": email},
        {"$set": pending},
        upsert=True
    )

    send_otp_email(email, otp)

    return {
        "message": "A new verification OTP has been sent."
    }


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

    if not existing_user.get("email_verified", False):

        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in."
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
            detail="Changing email requires a separate email verification process."
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
