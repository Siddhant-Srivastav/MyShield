from contextlib import asynccontextmanager
from dotenv import load_dotenv
from pathlib import Path
load_dotenv()
from uuid import uuid4
import logging
import secrets
import time
import os
import asyncio
import httpx
import boto3
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ============ AWS S3 ============
AWS_ACCESS_KEY = ""
AWS_SECRET_KEY = ""
AWS_BUCKET = ""
AWS_REGION = ""

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
)

def upload_photo_to_s3(user_id: str, photo_data: bytes, content_type: str) -> str:
    key = f"{user_id}.jpg"
    s3_client.put_object(
        Bucket=AWS_BUCKET, Key=key, Body=photo_data,
        ContentType=content_type or "image/jpeg",
    )
    return f"https://{AWS_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from database import check_database_connection, close_database, users_collection
from models import (
    UserCreate,
    UserResponse,
    LoginRequest,
    SendOTPRequest,
    VerifyOTPRequest,
)
from pydantic import BaseModel
from typing import List
from bson import ObjectId

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)


class EmergencyActivationRequest(BaseModel):
    user_id: str
    latitude: float
    longitude: float


class EmergencyContact(BaseModel):
    name: str
    relationship: str
    mobile: str
    email: str = ""


class EmergencyContactsRequest(BaseModel):
    contacts: List[EmergencyContact]


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("myshield")

active_emergencies = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
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
    except Exception as exc:
        logger.error("Error while closing MongoDB: %s", exc)


app = FastAPI(
    title="MyShield API",
    description="Backend API for the MyShield emergency assistance platform.",
    version="1.2.0",
    lifespan=lifespan,
)

otp_store = {}

# =========================================================
# ✅ WHATSAPP (Twilio Sandbox)
# =========================================================
TWILIO_ACCOUNT_SID = ""
TWILIO_AUTH_TOKEN = ""
TWILIO_WHATSAPP_SENDER = ""

# =========================================================
# ✅ GMAIL SMTP (FREE - send to ANYONE)
# =========================================================
GMAIL_ADDRESS = ""
GMAIL_APP_PASSWORD = ""
DEMO_EMAILS = [""]

PUBLIC_API_URL = os.getenv("PUBLIC_API_URL", "http://192.168.1.3:8000")

print("=" * 60)
print("WHATSAPP SENDER:", TWILIO_WHATSAPP_SENDER)
print("GMAIL SENDER:", GMAIL_ADDRESS)
print("=" * 60)


# =========================================================
# ✅ WHATSAPP SENDER
# =========================================================
async def send_whatsapp_message(mobile: str, message: str):
    to_number = mobile if mobile.startswith("+") else f"+91{mobile}"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
    data = {
        "To": f"whatsapp:{to_number}",
        "From": TWILIO_WHATSAPP_SENDER,
        "Body": message,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(url, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN), data=data)
        print(f"WHATSAPP RESPONSE ({to_number}): {r.status_code} {r.text}")
        if r.status_code >= 300:
            raise Exception(f"WhatsApp error {r.status_code}: {r.text}")
        return r.json()


# =========================================================
# ✅ GMAIL SMTP — DONO FUNCTIONS (yeh missing tha!)
# =========================================================
def _send_email_sync(to_emails, subject: str, html: str):
    """Synchronous Gmail send — runs in thread pool"""
    if isinstance(to_emails, str):
        to_emails = [to_emails]
    msg = MIMEMultipart("alternative")
    msg["From"] = f"MyShield <{GMAIL_ADDRESS}>"
    msg["To"] = ", ".join(to_emails)
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=20) as server:
        server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_ADDRESS, to_emails, msg.as_string())
    return {"sent": to_emails}


async def send_email(to_emails, subject: str, html: str):
    """Async wrapper — calls _send_email_sync in thread pool"""
    return await asyncio.to_thread(_send_email_sync, to_emails, subject, html)


async def send_sms(mobile: str, message: str):
    """WhatsApp bhejo; fail hone par sirf mock print."""
    try:
        result = await send_whatsapp_message(mobile, message)
        print("✅ REAL MESSAGE SENT VIA WHATSAPP to", mobile)
        return result
    except Exception as e:
        print("WhatsApp failed:", e)
    print(f"\n[MOCK MESSAGE TO {mobile}]\n{message}\n")
    return {"return": True, "mock": True}


# =========================================================
# HELPER
# =========================================================
async def find_user_by_any_id(user_id: str):
    if not user_id:
        return None
    user = await users_collection.find_one({"id": user_id})
    if user:
        return user
    try:
        return await users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"success": True, "message": "MyShield API is running", "version": "1.2.0"}


@app.get("/api/health")
async def health_check():
    try:
        await check_database_connection()
        return {"success": True, "api": "online", "database": "connected"}
    except Exception as exc:
        logger.error("Health check failed: %s", exc)
        return {"success": False, "api": "online", "database": "disconnected"}


# =========================================================
# OTP
# =========================================================
@app.post("/api/users/send-otp")
async def send_otp(data: SendOTPRequest):
    try:
        phone = data.phone.strip()
        user = await users_collection.find_one({"phone": phone})
        if not user:
            return {"success": False, "message": "User not found. Please register first."}

        otp = str(secrets.randbelow(900000) + 100000)
        otp_store[phone] = {"otp": otp, "expires_at": time.time() + 300}

        message = (
            f"MyShield: Your login OTP is {otp}. "
            f"Valid for 5 minutes. Do not share with anyone."
        )

        print("=" * 60)
        print(f"SENDING OTP to {phone} | OTP: {otp}")
        await send_sms(phone, message)

        # ⬇️ EMAIL OTP (guaranteed delivery)
        user_email = user.get("email", "").strip()
        target = user_email if user_email else DEMO_EMAILS
        try:
            otp_html = f"""
            <div style="font-family:sans-serif;max-width:450px;margin:auto;padding:24px;border:2px solid #1A56DB;border-radius:16px">
              <h2 style="color:#1A56DB">🛡️ MyShield Login OTP</h2>
              <div style="background:#EEF4FF;padding:18px;text-align:center;font-size:34px;font-weight:bold;letter-spacing:8px;color:#1A56DB;border-radius:12px">{otp}</div>
              <p style="color:#6B7280">Valid for 5 minutes. Do not share with anyone.</p>
            </div>"""
            await send_email(target, "MyShield Login OTP", otp_html)
            print("✅ OTP EMAIL SENT to", target)
        except Exception as e:
            print("Email OTP failed:", e)
        print("=" * 60)

        return {"success": True, "message": "OTP sent to your WhatsApp and email."}
    except Exception as exc:
        logger.error("Send OTP failed: %s", exc)
        return {"success": False, "message": "Failed to generate OTP."}


@app.post("/api/users/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    try:
        phone = data.phone.strip()
        otp = data.otp.strip()
        saved_otp = otp_store.get(phone)

        if not saved_otp:
            return {"success": False, "message": "OTP not found. Please request a new OTP."}
        if time.time() > saved_otp["expires_at"]:
            del otp_store[phone]
            return {"success": False, "message": "OTP expired. Please request a new OTP."}
        if otp != saved_otp["otp"]:
            return {"success": False, "message": "Invalid OTP."}

        user = await users_collection.find_one({"phone": phone})
        if not user:
            del otp_store[phone]
            return {"success": False, "message": "User not found."}

        del otp_store[phone]
        return {
            "success": True,
            "message": "OTP verified successfully.",
            "user": {
                "id": user.get("id") or str(user["_id"]),
                "name": user["name"],
                "phone": user["phone"],
                "preferred_language": user.get("preferred_language", "English"),
                "emergency_contacts": user.get("emergency_contacts", []),
            },
        }
    except Exception as exc:
        logger.error("Verify OTP failed: %s", exc)
        return {"success": False, "message": "Failed to verify OTP."}


# =========================================================
# Register / Login
# =========================================================
@app.post("/api/users/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    existing_user = await users_collection.find_one({"phone": user.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Account already exists. Please login.")

    user_data = {
        "id": str(uuid4()),
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "preferred_language": user.preferred_language,
        "emergency_contacts": [c.model_dump() for c in user.emergency_contacts],
    }
    await users_collection.insert_one(user_data)
    return user_data


@app.post("/api/users/login")
async def login_user(data: LoginRequest):
    try:
        user = await users_collection.find_one({"phone": data.phone})
        if not user:
            return {"success": False, "message": "User not found. Please register first."}
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.get("id") or str(user["_id"]),
                "name": user["name"],
                "phone": user["phone"],
                "preferred_language": user.get("preferred_language", "English"),
                "emergency_contacts": user.get("emergency_contacts", []),
            },
        }
    except Exception as exc:
        logger.error("Login failed: %s", exc)
        return {"success": False, "message": "Login failed. Please try again."}


# =========================================================
# Photo
# =========================================================
@app.post("/api/users/{user_id}/photo")
async def upload_user_photo(user_id: str, photo: UploadFile = File(...)):
    try:
        if not photo.content_type or not photo.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")
        photo_data = await photo.read()
        if len(photo_data) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Photo must be smaller than 5 MB.")

        user = await find_user_by_any_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        photo_url = upload_photo_to_s3(user["id"], photo_data, photo.content_type)
        await users_collection.update_one(
            {"_id": user["_id"]}, {"$set": {"photo_url": photo_url}}
        )
        logger.info("Photo uploaded to S3: %s", photo_url)
        return {"success": True, "photo_url": photo_url}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Photo upload failed: %s", exc)
        raise HTTPException(status_code=500, detail="Photo upload failed.")


@app.get("/api/users/{user_id}/photo")
async def get_user_photo(user_id: str):
    user = await find_user_by_any_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    photo_data = user.get("photo_data")
    if not photo_data:
        raise HTTPException(status_code=404, detail="User photo not found.")
    return Response(content=photo_data, media_type=user.get("photo_content_type", "image/jpeg"))


# =========================================================
# Emergency Contacts
# =========================================================
@app.put("/api/users/{user_id}/emergency-contacts")
async def update_emergency_contacts(user_id: str, data: EmergencyContactsRequest):
    try:
        if len(data.contacts) < 1:
            return {"success": False, "message": "At least 1 emergency contact is required."}
        if len(data.contacts) > 5:
            return {"success": False, "message": "Maximum 5 emergency contacts are allowed."}

        user = await find_user_by_any_id(user_id)
        if not user:
            return {"success": False, "message": "User not found."}

        contacts = [c.model_dump() for c in data.contacts]
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"emergency_contacts": contacts}},
        )
        return {
            "success": True,
            "message": "Emergency contacts saved successfully.",
            "emergency_contacts": contacts,
        }
    except Exception as exc:
        logger.error("Emergency contacts update failed: %s", exc)
        return {"success": False, "message": "Failed to save emergency contacts."}


@app.get("/api/users/{user_id}/emergency-contacts")
async def get_emergency_contacts(user_id: str):
    try:
        user = await find_user_by_any_id(user_id)
        if not user:
            return {"success": False, "message": "User not found."}
        return {"success": True, "emergency_contacts": user.get("emergency_contacts", [])}
    except Exception as exc:
        logger.error("Failed to get emergency contacts: %s", exc)
        return {"success": False, "message": "Failed to load emergency contacts."}


# =========================================================
# Escalation (2-min timer)
# =========================================================
async def escalate_to_authorities(user_id: str, lat: float, lon: float, emergency_type: str):
    logger.info("Escalation timer started (%s) for user %s", emergency_type, user_id)
    await asyncio.sleep(120)

    if user_id not in active_emergencies:
        logger.info("Emergency cancelled by user %s. Escalation aborted.", user_id)
        return

    user = await find_user_by_any_id(user_id)
    if not user:
        return

    name = user.get("name", "Unknown user")
    phone = user.get("phone", "")
    photo_url = user.get("photo_url", "")
    contacts = user.get("emergency_contacts", [])
    maps_url = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"

    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#7F1D1D;border-radius:20px;overflow:hidden;">
      <div style="background:#000000;padding:24px;text-align:center;">
        <div style="font-size:48px;">⚠️</div>
        <h1 style="color:#DC2626;margin:0;font-size:22px;font-weight:800;">CRITICAL ESCALATION</h1>
        <p style="color:#FCA5A5;margin:4px 0 0;font-size:13px;">{name} did not respond for 2 minutes</p>
      </div>
      <div style="background:#FFFFFF;padding:24px;">
        <p style="color:#1A1A2E;font-size:14px;line-height:1.7;">
          This is a <strong>critical escalation</strong>. The user has not cancelled the
          <strong> {emergency_type} emergency</strong> alert within 2 minutes. Please reach them immediately.
        </p>
        <a href="{maps_url}" style="display:block;background:#DC2626;color:#FFF;text-align:center;padding:14px;border-radius:12px;text-decoration:none;font-weight:800;margin-top:16px;">
          📍 OPEN LIVE LOCATION
        </a>
        <p style="margin-top:12px;font-size:13px;">📱 Call: <strong>+91 {phone}</strong></p>
        {"<p><a href='"+photo_url+"'>View photo</a></p>" if photo_url else ""}
      </div>
    </div>
    """

    contact_emails = [c.get("email", "").strip() for c in contacts if c.get("email", "").strip()]
    recipients = contact_emails if contact_emails else DEMO_EMAILS

    try:
        await send_email(recipients, f"⚠️ CRITICAL: {name} — No response for 2 min", html)
        print(f"✅ ESCALATION EMAIL SENT to {len(recipients)} people")
    except Exception as e:
        print("Escalation email failed:", e)

    active_emergencies.discard(user_id)


# =========================================================
# Safety / Medical emergency
# =========================================================
async def trigger_emergency(data: EmergencyActivationRequest, emergency_type: str):
    print(f"🚨 TRIGGER EMERGENCY CALLED: {emergency_type} | user={data.user_id} | lat={data.latitude}, lon={data.longitude}")
    user = await find_user_by_any_id(data.user_id)
    if not user:
        return {"success": False, "message": "User not found."}

    name = user.get("name", "Unknown user")
    phone = user.get("phone", "")
    user_email = user.get("email", "").strip()
    photo_url = user.get("photo_url", "")
    contacts = user.get("emergency_contacts", [])

    maps_url = f"https://www.google.com/maps/search/?api=1&query={data.latitude},{data.longitude}"

    if photo_url:
        photo_html = f"<img src='{photo_url}' style='width:90px;height:90px;border-radius:45px;object-fit:cover;border:3px solid #DC2626;' />"
    else:
        photo_html = f"<div style='width:90px;height:90px;border-radius:45px;background:#DC2626;color:#FFF;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;'>{name[0].upper()}</div>"

    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#FEF2F2;border-radius:20px;overflow:hidden;border:3px solid #DC2626;">
      <div style="background:#DC2626;padding:24px;text-align:center;">
        <div style="font-size:44px;">🚨</div>
        <h1 style="color:#FFF;margin:8px 0 0;font-size:22px;font-weight:800;">MYSHIELD {emergency_type} EMERGENCY</h1>
        <p style="color:#FEE2E2;margin:6px 0 0;font-size:13px;">IMMEDIATE HELP REQUIRED</p>
      </div>
      <div style="background:#FFF;padding:24px;">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:18px;">
          {photo_html}
          <div>
            <h2 style="margin:0;color:#1A1A2E;font-size:20px;font-weight:800;">{name}</h2>
            <p style="margin:4px 0 0;color:#6B7280;font-size:13px;">📱 <a href='tel:+91{phone}' style='color:#1A56DB;font-weight:700;'>+91 {phone}</a></p>
          </div>
        </div>
        <div style="background:#FEF2F2;border-left:4px solid #DC2626;padding:14px;border-radius:8px;margin-bottom:18px;">
          <p style="margin:0;color:#991B1B;font-size:14px;font-weight:600;">
            <strong>{name}</strong> is in a <strong>{emergency_type} emergency</strong> and needs your immediate help.
          </p>
        </div>
        <a href='{maps_url}' style="display:block;background:#1A56DB;color:#FFF;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:800;font-size:16px;">
          📍 VIEW LIVE LOCATION ON MAPS
        </a>
        <p style="background:#F3F4F6;padding:10px;border-radius:8px;font-family:monospace;font-size:12px;color:#4B5563;margin-top:12px;">
          GPS: {data.latitude}, {data.longitude}
        </p>
      </div>
      <div style="background:#F9FAFB;padding:14px;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="margin:0;color:#6B7280;font-size:11px;">Sent by <strong style="color:#1A56DB;">MyShield</strong> • Emergency Assistance App</p>
      </div>
    </div>
    """

    contact_emails = [c.get("email", "").strip() for c in contacts if c.get("email", "").strip()]
    recipients = list(set(contact_emails + ([user_email] if user_email else [])))
    if not recipients:
        recipients = DEMO_EMAILS
        print("⚠️ No emails found in DB — using DEMO_EMAILS")

    try:
        await send_email(recipients, f"🚨 MYSHIELD {emergency_type} EMERGENCY: {name}", html)
        print(f"✅ EMERGENCY EMAIL SENT to {len(recipients)}: {recipients}")
    except Exception as e:
        print("❌ Email alert failed:", e)

    active_emergencies.add(data.user_id)
    return {
        "success": True,
        "message": f"{emergency_type} emergency alert sent.",
        "emails_sent_to": recipients,
    }


@app.post("/api/emergency/safety")
async def activate_safety_emergency(data: EmergencyActivationRequest, background_tasks: BackgroundTasks):
    try:
        result = await trigger_emergency(data, "SAFETY")
        if result.get("success"):
            background_tasks.add_task(escalate_to_authorities, data.user_id, data.latitude, data.longitude, "SAFETY")
        return result
    except Exception as exc:
        logger.error("Safety emergency failed: %s", exc)
        return {"success": False, "message": "Emergency activation failed."}


@app.post("/api/emergency/medical")
async def activate_medical_emergency(data: EmergencyActivationRequest, background_tasks: BackgroundTasks):
    try:
        result = await trigger_emergency(data, "MEDICAL")
        if result.get("success"):
            background_tasks.add_task(escalate_to_authorities, data.user_id, data.latitude, data.longitude, "MEDICAL")
        return result
    except Exception as exc:
        logger.error("Medical emergency failed: %s", exc)
        return {"success": False, "message": "Emergency activation failed."}


@app.post("/api/emergency/cancel/{user_id}")
async def cancel_emergency(user_id: str):
    if user_id in active_emergencies:
        active_emergencies.remove(user_id)
        return {"success": True, "message": "Emergency cancelled successfully."}
    return {"success": True, "message": "No active emergency to cancel."}