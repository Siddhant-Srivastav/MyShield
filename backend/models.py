from pydantic import BaseModel, Field
from typing import List, Optional


class EmergencyContact(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10, max_length=15)
    relationship: Optional[str] = None


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10, max_length=15)
    preferred_language: str = "English"
    emergency_contacts: List[EmergencyContact] = Field(default_factory=list)

class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)


class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)


class UserResponse(BaseModel):
    id: str
    name: str
    phone: str
    preferred_language: str
    emergency_contacts: List[EmergencyContact]