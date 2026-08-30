from pydantic import BaseModel
from typing import List

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    mobile: str
    email: str = ""

class UserCreate(BaseModel):
    name: str
    phone: str
    email: str = ""
    preferred_language: str = "English"
    emergency_contacts: List[EmergencyContact] = []

class UserResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: str = ""
    preferred_language: str
    emergency_contacts: List[EmergencyContact]

class LoginRequest(BaseModel):
    phone: str

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str