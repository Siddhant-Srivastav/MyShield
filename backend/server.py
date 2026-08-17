from contextlib import asynccontextmanager
from uuid import uuid4
import logging
import secrets
import time 
import os
import httpx

from fastapi import FastAPI,HTTPException,UploadFile,File
from fastapi.responses import Response 
from fastapi.middleware.cors import CORSMiddleware

from database import check_database_connection, close_database,users_collection
from models import (
    UserCreate,
    UserResponse,
    LoginRequest,
    SendOTPRequest,
    VerifyOTPRequest,
)
from pydantic import BaseModel

class EmergencyActivationRequest(BaseModel):
    user_id: str
    latitude: float
    longitude: float

from typing import List 


# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("myshield")


# ---------------------------------------------------------
# Application lifespan
# ---------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once when the application starts
    and once when the application shuts down.
    """

    logger.info("Starting MyShield API...")

    try:
        await check_database_connection()
        logger.info("MongoDB connection successful.")
    except Exception as exc:
        logger.error("MongoDB connection failed: %s", exc)

    yield

    logger.info("Shutting down MyShield API...")

    try:
        await close_database()
        logger.info("MongoDB connection closed.")
    except Exception as exc:
        logger.error("Error while closing MongoDB: %s", exc)


# ---------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="MyShield API",
    description="Backend API for the MyShield emergency assistance platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# Temporary OTP storage
otp_store = {}

# ---------------------------------------------------------
# SMS Configuration
# ---------------------------------------------------------

FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY")

PUBLIC_API_URL = os.getenv(
    "PUBLIC_API_URL",
    "https://playstation-dose-becoming-spray.trycloudflare.com"
)


async def send_emergency_sms(
    mobile: str,
    message: str
):
    if not FAST2SMS_API_KEY:
        raise Exception("FAST2SMS_API_KEY is not configured.")

    url = "https://www.fast2sms.com/dev/bulkV2"

    headers = {
        "Authorization": FAST2SMS_API_KEY,
        "Content-Type": "application/json",
    }

    payload = {
        "route": "q",
        "message": message,
        "numbers": mobile,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:

        response = await client.post(
            url,
            headers=headers,
            json=payload,
        )

    logger.info(
        "Fast2SMS response: %s",
        response.text
    )

    if response.status_code != 200:
        raise Exception(
            f"SMS provider error: {response.text}"
        )

    result = response.json()

    if not result.get("return"):
        raise Exception(
            f"SMS sending failed: {result}"
        )

    return result
# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------

@app.get("/")
async def root():
    return {
        "success": True,
        "message": "MyShield API is running",
        "version": "1.0.0",
    }


# ---------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------

@app.get("/api/health")
async def health_check():
    try:
        await check_database_connection()

        return {
            "success": True,
            "api": "online",
            "database": "connected",
        }

    except Exception as exc:
        logger.error("Health check failed: %s", exc)

        return {
            "success": False,
            "api": "online",
            "database": "disconnected",
        }

    # ---------------------------------------------------------
# OTP - Send OTP
# ---------------------------------------------------------

@app.post("/api/users/send-otp")
async def send_otp(data: SendOTPRequest):
    try:
        phone = data.phone.strip()

        # Check whether user exists
        user = await users_collection.find_one({
            "phone": phone
        })

        if not user:
            return {
                "success": False,
                "message": "User not found. Please register first."
            }

        # Generate 6-digit OTP
        otp = str(secrets.randbelow(900000) + 100000)

        # OTP valid for 5 minutes
        expires_at = time.time() + 300

        otp_store[phone] = {
            "otp": otp,
            "expires_at": expires_at
        }

        # TEMPORARY: show OTP in backend terminal
        print("=" * 50)
        print("MYSHIELD OTP")
        print(f"Phone: {phone}")
        print(f"OTP: {otp}")
        print("Valid for 5 minutes")
        print("=" * 50)

        return {
            "success": True,
            "message": "OTP generated successfully."
        }

    except Exception as exc:
        logger.error("Send OTP failed: %s", exc)

        return {
            "success": False,
            "message": "Failed to generate OTP."
        }

    # ---------------------------------------------------------
# OTP - Verify OTP
# ---------------------------------------------------------

@app.post("/api/users/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    try:
        phone = data.phone.strip()
        otp = data.otp.strip()

        saved_otp = otp_store.get(phone)

        if not saved_otp:
            return {
                "success": False,
                "message": "OTP not found. Please request a new OTP."
            }

        # Check expiry
        if time.time() > saved_otp["expires_at"]:
            del otp_store[phone]

            return {
                "success": False,
                "message": "OTP expired. Please request a new OTP."
            }

        # Check OTP
        if otp != saved_otp["otp"]:
            return {
                "success": False,
                "message": "Invalid OTP."
            }

        # Find user
        user = await users_collection.find_one({
            "phone": phone
        })

        if not user:
            del otp_store[phone]

            return {
                "success": False,
                "message": "User not found."
            }

        # OTP can only be used once
        del otp_store[phone]

        return {
            "success": True,
            "message": "OTP verified successfully.",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "phone": user["phone"],
                "preferred_language": user.get(
                    "preferred_language",
                    "English"
                ),
                "emergency_contacts": user.get(
                    "emergency_contacts",
                    []
                )
            }
        }

    except Exception as exc:
        logger.error("Verify OTP failed: %s", exc)

        return {
            "success": False,
            "message": "Failed to verify OTP."
        }
  # ------------------------------------------------------------
# User Registration
# ------------------------------------------------------------

@app.post("/api/users/register", response_model=UserResponse)
async def register_user(user: UserCreate):

    # Check whether phone number already exists
    existing_user = await users_collection.find_one(
        {"phone": user.phone}
    )

    if existing_user:
     raise HTTPException(
        status_code=400,
        detail="Account already exists. Please login."
    )
    # Create new user
    user_data = {
        "id": str(uuid4()),
        "name": user.name,
        "phone": user.phone,
        "preferred_language": user.preferred_language,
        "emergency_contacts": [
            contact.model_dump()
            for contact in user.emergency_contacts
        ],
    }

    # Save user in MongoDB
    await users_collection.insert_one(user_data)

    return user_data


class LoginRequest(BaseModel):
    phone: str

@app.post("/api/users/login")
async def login_user(data: LoginRequest):
    try:
        user = await users_collection.find_one({
            "phone": data.phone
        })

        if not user:
            return {
                "success": False,
                "message": "User not found. Please register first."
            }

        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "phone": user["phone"],
                "preferred_language": user.get("preferred_language", "English"),
                "emergency_contacts": user.get("emergency_contacts", [])
            }
        }

    except Exception as exc:
        logger.error("Login failed: %s", exc)

        return {
            "success": False,
            "message": "Login failed. Please try again."
        }

@app.post("/api/users/{user_id}/photo")
async def upload_user_photo(
    user_id: str,
    photo: UploadFile = File(...)
):
    try:
        # Check that the uploaded file is an image
        if not photo.content_type or not photo.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Only image files are allowed."
            )

        # Read the image
        photo_data = await photo.read()

        # Limit photo size to 5 MB
        if len(photo_data) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Photo must be smaller than 5 MB."
            )

        # Check whether user exists
        user = await users_collection.find_one({"id": user_id})

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        # Save photo in MongoDB
        await users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "photo_data": photo_data,
                    "photo_content_type": photo.content_type
                }
            }
        )

        logger.info("Photo uploaded successfully for user %s", user_id)

        return {
            "success": True,
            "message": "Photo uploaded successfully."
        }

    except HTTPException:
        raise

    except Exception as exc:
        logger.error("Photo upload failed: %s", exc)

        raise HTTPException(
            status_code=500,
            detail="Photo upload failed."
        )

    # ---------------------------------------------------------
# Get User Photo
# ---------------------------------------------------------

@app.get("/api/users/{user_id}/photo")
async def get_user_photo(user_id: str):

    user = await users_collection.find_one({
        "id": user_id
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    photo_data = user.get("photo_data")

    photo_content_type = user.get(
        "photo_content_type",
        "image/jpeg"
    )

    if not photo_data:
        raise HTTPException(
            status_code=404,
            detail="User photo not found."
        )

    return Response(
        content=photo_data,
        media_type=photo_content_type
    )
    
class EmergencyContact(BaseModel):
     name: str
     relationship: str
     mobile: str


class EmergencyContactsRequest(BaseModel):
    contacts: List[EmergencyContact]

@app.put("/api/users/{user_id}/emergency-contacts")
async def update_emergency_contacts(
    user_id: str,
    data: EmergencyContactsRequest
):
    try:
        if len(data.contacts) < 1:
            return {
                "success": False,
                "message": "At least 2 emergency contacts are required."
            }

        if len(data.contacts) > 5:
            return {
                "success": False,
                "message": "Maximum 5 emergency contacts are allowed."
            }

        contacts = [
            contact.model_dump()
            for contact in data.contacts
        ]

        result = await users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "emergency_contacts": contacts
                }
            }
        )

        if result.matched_count == 0:
            return {
                "success": False,
                "message": "User not found."
            }

        return {
            "success": True,
            "message": "Emergency contacts saved successfully.",
            "emergency_contacts": contacts
        }

    except Exception as exc:
        logger.error("Emergency contacts update failed: %s", exc)

        return {
            "success": False,
            "message": "Failed to save emergency contacts."
        }

    # ---------------------------------------------------------
# Get Emergency Contacts
# ---------------------------------------------------------

@app.get("/api/users/{user_id}/emergency-contacts")
async def get_emergency_contacts(user_id: str):

    try:
        user = await users_collection.find_one(
            {"id": user_id}
        )

        if not user:
            return {
                "success": False,
                "message": "User not found."
            }

        contacts = user.get(
            "emergency_contacts",
            []
        )

        return {
            "success": True,
            "emergency_contacts": contacts
        }

    except Exception as exc:

        logger.error(
            "Failed to get emergency contacts: %s",
            exc
        )

        return {
            "success": False,
            "message": "Failed to load emergency contacts."
        }


    # ---------------------------------------------------------
# SAFETY EMERGENCY
# ---------------------------------------------------------

@app.post("/api/emergency/safety")
async def activate_safety_emergency(
    data: EmergencyActivationRequest
):

    try:

        # 1. Find the user
        user = await users_collection.find_one({
            "id": data.user_id
        })

        if not user:
            return {
                "success": False,
                "message": "User not found."
            }

        # 2. Get user information
        name = user.get("name", "Unknown user")
        phone = user.get("phone", "")

        # 3. Get emergency contacts
        contacts = user.get(
            "emergency_contacts",
            []
        )

        if not contacts:
            return {
                "success": False,
                "message": "No emergency contacts found."
            }

        # 4. Get GPS coordinates
        latitude = data.latitude
        longitude = data.longitude

        # 5. Create Google Maps location
        maps_url = (
            "https://www.google.com/maps/"
            "search/?api=1&query="
            f"{latitude},{longitude}"
        )

        # 6. Create photo URL
        photo_url = (
            f"{PUBLIC_API_URL}"
            f"/api/users/{data.user_id}/photo"
        )

        # 7. Create emergency message
        message = (
            "MYSHIELD EMERGENCY ALERT\n\n"
            f"{name} needs immediate help.\n"
            f"Mobile: {phone}\n\n"
            f"Location:\n{maps_url}\n\n"
            f"GPS: {latitude}, {longitude}\n\n"
            f"Photo:\n{photo_url}\n\n"
            "Please contact the person immediately."
        )

        sent_contacts = []
        failed_contacts = []

        # 8. Send SMS to every emergency contact
        for contact in contacts:

            contact_mobile = contact.get("mobile")

            if not contact_mobile:
                continue

            contact_mobile = "".join(
                char
                for char in contact_mobile
                if char.isdigit()
            )

            if len(contact_mobile) == 10:

                sms_number = contact_mobile

            elif contact_mobile.startswith("91"):

                sms_number = contact_mobile[-10:]

            else:

                failed_contacts.append({
                    "mobile": contact_mobile,
                    "reason": "Invalid mobile number"
                })

                continue

            try:

                await send_emergency_sms(
                    sms_number,
                    message
                )

                sent_contacts.append(
                    sms_number
                )

            except Exception as sms_error:

                logger.error(
                    "SMS failed for %s: %s",
                    sms_number,
                    sms_error
                )

                failed_contacts.append({
                    "mobile": sms_number,
                    "reason": str(sms_error)
                })

        # 9. Check whether at least one SMS was sent
        if not sent_contacts:

            return {
                "success": False,
                "message": "Emergency activated but SMS could not be sent.",
                "failed_contacts": failed_contacts
            }

        # 10. Success
        return {
            "success": True,
            "message": "Emergency alert sent successfully.",
            "user": {
                "name": name,
                "phone": phone
            },
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "maps_url": maps_url
            },
            "photo_url": photo_url,
            "sent_contacts": sent_contacts,
            "failed_contacts": failed_contacts
        }

    except Exception as exc:

        logger.error(
            "Safety emergency failed: %s",
            exc
        )

        return {
            "success": False,
            "message": "Emergency activation failed."
        }