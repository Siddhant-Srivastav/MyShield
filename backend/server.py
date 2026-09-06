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
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ============ RENDER IPv6 FIX (Gmail SMTP ke liye) ============
import socket as _socket

_original_getaddrinfo = _socket.getaddrinfo

def _ipv4_only_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _original_getaddrinfo(host, port, _socket.AF_INET, type, proto, flags)

_socket.getaddrinfo = _ipv4_only_getaddrinfo
# ==============================================================

# ============ AWS S3 - LAZY INIT (server start nahi tootega) ============
s3_client = None

def get_s3_client():
    global s3_client
    if s3_client is None:
        try:
            import boto3
            s3_client = boto3.client(
                "s3",
                region_name="ap-south-1",
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            )
            print("✅ AWS S3 client initialized successfully")
        except Exception as e:
            print(f"⚠️ AWS S3 init failed: {e}")
            print("⚠️ Photo upload will not work, but app will continue")
            s3_client = None
    return s3_client


def upload_photo_to_s3(user_id: str, photo_data: bytes, content_type: str) -> str:
    client = get_s3_client()
    if client is None:
        raise Exception("AWS S3 not available")
    key = f"{user_id}.jpg"
    client.put_object(
        Bucket=AWS_STORAGE_BUCKET_NAME,
        Key=key,
        Body=photo_data,
        ContentType=content_type or "image/jpeg",
    )
    return f"https://{AWS_STORAGE_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/{key}"


def get_presigned_photo_url(user_id: str) -> str:
    """Private bucket se 7-din valid photo link banata hai"""
    try:
        client = get_s3_client()
        if client is None:
            return ""
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": AWS_STORAGE_BUCKET_NAME, "Key": f"{user_id}.jpg"},
            ExpiresIn=604800,  # 7 days
        )
    except Exception as e:
        print("Presigned URL failed:", e)
        return ""


from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from database import check_database_connection, close_database, users_collection
from models import (
    UserCreate, UserResponse, LoginRequest, SendOTPRequest, VerifyOTPRequest,
)
from pydantic import BaseModel
from typing import List
from bson import ObjectId

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)
# ============ SAARE SECRETS .ENV SE (code me ZERO secrets) ============
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_STORAGE_BUCKET_NAME = os.getenv("AWS_STORAGE_BUCKET_NAME", "myshield-photos-2026")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_SENDER = os.getenv("TWILIO_WHATSAPP_SENDER", "whatsapp:+14155238886")
GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS", "")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")
DEMO_EMAILS = [e.strip() for e in os.getenv("DEMO_EMAILS", "").split(",") if e.strip()]


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

# ============ SENDGRID HTTPS EMAIL SHIM v2 (Render-safe) ============
import os as _os
import json as _json
import urllib.request as _urlreq
import email as _emailmod
import smtplib as _smtplib

_SENDGRID_KEY = _os.getenv("SENDGRID_API_KEY", "").strip()
_FROM_EMAIL = _os.getenv("GMAIL_ADDRESS", "myshield360@gmail.com").strip()

def _decode_part(part):
    try:
        raw = part.get_payload(decode=True)
        if not raw:
            return ""
        charset = part.get_content_charset() or "utf-8"
        return raw.decode(charset, errors="replace")
    except Exception:
        return ""

class _SendGridSMTP:
    def __init__(self, host="", port=0, *a, **k): pass
    def __enter__(self): return self
    def __exit__(self, *a): return False
    def ehlo(self): pass
    def helo(self): pass
    def starttls(self, *a, **k): pass
    def login(self, *a, **k): pass
    def quit(self): pass
    def close(self): pass

    def sendmail(self, from_addr, to_addrs, msg, *a, **k):
        if not _SENDGRID_KEY:
            raise _smtplib.SMTPException("SENDGRID_API_KEY not set")
        if not isinstance(msg, str):
            msg = msg.as_string()
        if isinstance(to_addrs, str):
            to_addrs = [t.strip() for t in to_addrs.split(",") if t.strip()]
        subject, body = "", ""
        try:
            m = _emailmod.message_from_string(msg)
            subject = str(m.get("Subject") or "")
            if m.is_multipart():
                for ctype in ("text/html", "text/plain"):
                    for part in m.walk():
                        if part.get_content_type() == ctype:
                            body = _decode_part(part)
                            if body:
                                break
                    if body:
                        break
            else:
                body = _decode_part(m)
        except Exception:
            body = ""
        if not body:
            body = msg
        html = body if "<html" in body.lower() else body.replace("\n", "<br>")
        data = _json.dumps({
            "personalizations": [{"to": [{"email": e} for e in to_addrs]}],
            "from": {"email": _FROM_EMAIL, "name": "MyShield Safety"},
            "subject": subject or "MyShield Alert",
            "content": [{"type": "text/html", "value": html}],
        }).encode()
        req = _urlreq.Request(
            "https://api.sendgrid.com/v3/mail/send",
            data=data,
            headers={"Authorization": "Bearer " + _SENDGRID_KEY,
                     "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with _urlreq.urlopen(req, timeout=30) as res:
                print("✅ EMAIL SENT via SendGrid to", to_addrs, res.status)
        except Exception as e:
            print("❌ SENDGRID ERROR:", e)
            raise _smtplib.SMTPException(str(e))

    def send_message(self, msg, *a, **k):
        return self.sendmail(msg.get("From", ""), msg.get_all("To") or [], msg)

if _SENDGRID_KEY:
    _smtplib.SMTP = _SendGridSMTP
    _smtplib.SMTP_SSL = _SendGridSMTP
    print("📧 SendGrid shim v2 ACTIVE")
# ====================================================================
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


app = FastAPI(title="MyShield API", version="1.2.0", lifespan=lifespan)
otp_store = {}


print("=" * 60)
print("WHATSAPP SENDER:", TWILIO_WHATSAPP_SENDER)
print("GMAIL SENDER:", GMAIL_ADDRESS)
print("=" * 60)


async def send_whatsapp_message(mobile: str, message: str):
    to_number = mobile if mobile.startswith("+") else f"+91{mobile}"
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
    data = {"To": f"whatsapp:{to_number}", "From": TWILIO_WHATSAPP_SENDER, "Body": message}
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(url, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN), data=data)
        print(f"WHATSAPP RESPONSE ({to_number}): {r.status_code}")
        if r.status_code >= 300:
            raise Exception(f"WhatsApp error {r.status_code}: {r.text}")
        return r.json()


def _send_email_sync(to_emails, subject: str, html: str):
    if isinstance(to_emails, str):
        to_emails = [to_emails]
    
    # ✅ SUPER SIMPLE EMAIL (spam filter bypass)
    msg = MIMEMultipart("alternative")
    msg["From"] = f"MyShield <{GMAIL_ADDRESS}>"
    msg["To"] = ", ".join(to_emails)
    msg["Subject"] = subject
    
    # Plain text version (zaroori hai)
    msg.attach(MIMEText(html, "html", "utf-8"))
    
    print(f"📡 Gmail SMTP attempt...")
    
    try:
        # ✅ PORT 587 + STARTTLS (Gmail recommended)
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
            server.ehlo()
            server.starttls()  # ⬅️ TLS encryption
            server.ehlo()
            
            print(f"🔐 Logging in as {GMAIL_ADDRESS}...")
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            print(f"✅ Gmail login successful!")
            
            print(f"📤 Sending to {to_emails}...")
            result = server.sendmail(GMAIL_ADDRESS, to_emails, msg.as_string())
            
            if result == {}:
                print(f"✅ Gmail accepted for: {to_emails}")
                print(f"⏱️ Check inbox/spam in 1-2 minutes")
                return {"sent": to_emails, "status": "success"}
            else:
                print(f"❌ Gmail rejected: {result}")
                raise Exception(f"Rejected: {result}")
                
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ AUTH FAILED: {e}")
        print(f"💡 App password galat hai — naya banao: https://myaccount.google.com/apppasswords")
        raise
    except Exception as e:
        print(f"❌ ERROR: {e}")
        raise


async def send_email(to_emails, subject: str, html: str):
    return await asyncio.to_thread(_send_email_sync, to_emails, subject, html)


async def send_sms(mobile: str, message: str):
    try:
        result = await send_whatsapp_message(mobile, message)
        print("✅ REAL MESSAGE SENT VIA WHATSAPP to", mobile)
        return result
    except Exception as e:
        print("WhatsApp failed:", e)
    print(f"\n[MOCK MESSAGE TO {mobile}]\n{message}\n")
    return {"return": True, "mock": True}


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
    CORSMiddleware, allow_origins=["*"], allow_credentials=False,
    allow_methods=["*"], allow_headers=["*"],
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
        return {"success": False, "api": "online", "database": "disconnected"}


@app.post("/api/users/send-otp")
async def send_otp(data: SendOTPRequest):
    try:
        phone = data.phone.strip()
        user = await users_collection.find_one({"phone": phone})
        if not user:
            return {"success": False, "message": "User not found."}

        otp = str(secrets.randbelow(900000) + 100000)
        otp_store[phone] = {"otp": otp, "expires_at": time.time() + 300}

        message = f"MyShield: Your login OTP is {otp}. Valid for 5 minutes."

        print("=" * 60)
        print(f"SENDING OTP to {phone} | OTP: {otp}")
        print(f"📧 [BACKUP OTP] Terminal par OTP: {otp} (agar email nahi aayi)")
        await send_sms(phone, message)

        user_email = user.get("email", "").strip()
        target = user_email if user_email else DEMO_EMAILS
        try:
            otp_html = f"""
            <div style="font-family:sans-serif;max-width:450px;margin:auto;padding:24px;border:2px solid #1A56DB;border-radius:16px">
              <h2 style="color:#1A56DB">🛡️ MyShield Login OTP</h2>
              <div style="background:#EEF4FF;padding:18px;text-align:center;font-size:34px;font-weight:bold;letter-spacing:8px;color:#1A56DB;border-radius:12px">{otp}</div>
              <p style="color:#6B7280">Valid for 5 minutes. Do not share.</p>
            </div>"""
            await send_email(target, "MyShield Login OTP", otp_html)
            print("✅ OTP EMAIL SENT to", target)
        except Exception as e:
            print("Email OTP failed:", e)
        print("=" * 60)
        return {"success": True, "message": "OTP sent."}
    except Exception as exc:
        logger.error("Send OTP failed: %s", exc)
        return {"success": False, "message": "Failed."}


@app.post("/api/users/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    try:
        phone = data.phone.strip()
        otp = data.otp.strip()
        saved_otp = otp_store.get(phone)
        if not saved_otp:
            return {"success": False, "message": "OTP not found."}
        if time.time() > saved_otp["expires_at"]:
            del otp_store[phone]
            return {"success": False, "message": "OTP expired."}
        if otp != saved_otp["otp"]:
            return {"success": False, "message": "Invalid OTP."}
        user = await users_collection.find_one({"phone": phone})
        if not user:
            del otp_store[phone]
            return {"success": False, "message": "User not found."}
        del otp_store[phone]
        return {
            "success": True,
            "user": {
                "id": user.get("id") or str(user["_id"]),
                "name": user["name"],
                "phone": user["phone"],
                "preferred_language": user.get("preferred_language", "English"),
                "emergency_contacts": user.get("emergency_contacts", []),
            },
        }
    except Exception as exc:
        return {"success": False, "message": "Failed."}


@app.post("/api/users/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    existing_user = await users_collection.find_one({"phone": user.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Account already exists.")
    user_data = {
        "id": str(uuid4()),
        "name": user.name, "phone": user.phone, "email": user.email,
        "preferred_language": user.preferred_language,
        "emergency_contacts": [c.model_dump() for c in user.emergency_contacts],
    }
    await users_collection.insert_one(user_data)
    return user_data


@app.post("/api/users/login")
async def login_user(data: LoginRequest):
    user = await users_collection.find_one({"phone": data.phone})
    if not user:
        return {"success": False, "message": "User not found."}
    return {
        "success": True,
        "user": {
            "id": user.get("id") or str(user["_id"]),
            "name": user["name"], "phone": user["phone"],
            "preferred_language": user.get("preferred_language", "English"),
            "emergency_contacts": user.get("emergency_contacts", []),
        },
    }


@app.post("/api/users/{user_id}/photo")
async def upload_user_photo(user_id: str, photo: UploadFile = File(...)):
    try:
        photo_data = await photo.read()
        user = await find_user_by_any_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        photo_url = upload_photo_to_s3(user["id"], photo_data, photo.content_type)
        await users_collection.update_one({"_id": user["_id"]}, {"$set": {"photo_url": photo_url}})
        return {"success": True, "photo_url": photo_url}
    except Exception as exc:
        logger.error("Photo upload failed: %s", exc)
        raise HTTPException(status_code=500, detail="Photo upload failed.")


@app.put("/api/users/{user_id}/emergency-contacts")
async def update_emergency_contacts(user_id: str, data: EmergencyContactsRequest):
    user = await find_user_by_any_id(user_id)
    if not user:
        return {"success": False, "message": "User not found."}
    contacts = [c.model_dump() for c in data.contacts]
    await users_collection.update_one({"_id": user["_id"]}, {"$set": {"emergency_contacts": contacts}})
    return {"success": True, "emergency_contacts": contacts}


@app.get("/api/users/{user_id}/emergency-contacts")
async def get_emergency_contacts(user_id: str):
    user = await find_user_by_any_id(user_id)
    if not user:
        return {"success": False, "message": "User not found."}
    return {"success": True, "emergency_contacts": user.get("emergency_contacts", [])}


async def escalate_to_authorities(user_id: str, lat: float, lon: float, emergency_type: str):
    await asyncio.sleep(120)
    if user_id not in active_emergencies:
        return
    user = await find_user_by_any_id(user_id)
    if not user:
        return
    name = user.get("name", "Unknown user")
    phone = user.get("phone", "")
    photo_url = user.get("photo_url", "")
    contacts = user.get("emergency_contacts", [])
    maps_url = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
    html = f"""<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#7F1D1D;border-radius:20px;">
      <div style="background:#000;padding:24px;text-align:center;">
        <h1 style="color:#DC2626;margin:0;">⚠️ CRITICAL ESCALATION</h1>
      </div>
      <div style="background:#FFF;padding:24px;">
        <p>{name} needs immediate help!</p>
        <a href="{maps_url}" style="display:block;background:#DC2626;color:#FFF;text-align:center;padding:14px;border-radius:12px;text-decoration:none;font-weight:800;">📍 LIVE LOCATION</a>
        <p>📱 +91 {phone}</p>
      </div>
    </div>"""
    contact_emails = [c.get("email", "").strip() for c in contacts if c.get("email", "").strip()]
    recipients = contact_emails if contact_emails else DEMO_EMAILS
    try:
        await send_email(recipients, f"⚠️ CRITICAL: {name}", html)
    except Exception as e:
        print("Escalation failed:", e)
    active_emergencies.discard(user_id)


async def trigger_emergency(data: EmergencyActivationRequest, emergency_type: str):
    print(f"🚨 TRIGGER EMERGENCY: {emergency_type} | user={data.user_id}")
    user = await find_user_by_any_id(data.user_id)
    if not user:
        return {"success": False, "message": "User not found."}
    name = user.get("name", "Unknown user")
    phone = user.get("phone", "")
    user_email = user.get("email", "").strip()
    photo_url = get_presigned_photo_url(user["id"]) or user.get("photo_url", "")
    contacts = user.get("emergency_contacts", [])
    maps_url = f"https://www.google.com/maps/search/?api=1&query={data.latitude},{data.longitude}"
        # ⬇️ PHOTO HTML (S3 URL se load hogi)
    if photo_url:
        photo_html = f"""
        <div style="text-align:center;margin:0 0 16px 0;">
            <img src="{photo_url}" alt="{name}"
                 style="width:120px;height:120px;border-radius:60px;object-fit:cover;border:4px solid #DC2626;" />
            <p style="margin:6px 0 0;color:#6B7280;font-size:11px;">📷 {name}'s photo</p>
        </div>
        """
    else:
        photo_html = f"""
        <div style="text-align:center;margin:0 0 16px 0;">
            <div style="width:120px;height:120px;border-radius:60px;background:#DC2626;color:#FFF;margin:0 auto;line-height:120px;font-size:48px;font-weight:800;">{name[0].upper()}</div>
            <p style="margin:6px 0 0;color:#6B7280;font-size:11px;">No photo uploaded</p>
        </div>
        """

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; background: #FEF2F2;">
        <h1 style="color: #DC2626;">🚨 MYSHIELD {emergency_type} EMERGENCY</h1>
        {photo_html}
        <h2>{name} needs immediate help!</h2>
        <p><strong>Mobile:</strong> +91 {phone}</p>
        <p><strong>Location:</strong> <a href="{maps_url}">View on Google Maps</a></p>
        <p>GPS: {data.latitude}, {data.longitude}</p>
        {"<p><strong>Full photo:</strong> <a href='" + photo_url + "'>Open full photo</a></p>" if photo_url else ""}
        <hr>
        <p style="color: #DC2626; font-weight: bold;">Please contact immediately!</p>
    </body>
    </html>
    """
    contact_emails = [c.get("email", "").strip() for c in contacts if c.get("email", "").strip()]
    recipients = list(set(contact_emails + ([user_email] if user_email else [])))
    if not recipients:
        recipients = DEMO_EMAILS
    try:
        await send_email(recipients, f"🚨 MYSHIELD {emergency_type} EMERGENCY: {name}", html)
        print(f"✅ EMERGENCY EMAIL SENT to {recipients}")
    except Exception as e:
        print("❌ Email alert failed:", e)
    active_emergencies.add(data.user_id)
    return {"success": True, "emails_sent_to": recipients}


@app.post("/api/emergency/safety")
async def activate_safety_emergency(data: EmergencyActivationRequest, background_tasks: BackgroundTasks):
    result = await trigger_emergency(data, "SAFETY")
    if result.get("success"):
        background_tasks.add_task(escalate_to_authorities, data.user_id, data.latitude, data.longitude, "SAFETY")
    return result


@app.post("/api/emergency/medical")
async def activate_medical_emergency(data: EmergencyActivationRequest, background_tasks: BackgroundTasks):
    result = await trigger_emergency(data, "MEDICAL")
    if result.get("success"):
        background_tasks.add_task(escalate_to_authorities, data.user_id, data.latitude, data.longitude, "MEDICAL")
    return result


@app.post("/api/emergency/cancel/{user_id}")
async def cancel_emergency(user_id: str):
    active_emergencies.discard(user_id)
    return {"success": True}