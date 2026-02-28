from pydantic import BaseModel, Field
from typing import List, Optional
import datetime

class PatientBase(BaseModel):
    name: str = Field(..., example="John Doe")
    age: int = Field(..., example=30)
    gender: str = Field("Other", example="Male")
    contact: str = Field(..., example="555-0100")

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    
    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    symptoms: str = Field(..., example="Severe chest pain and shortness of breath")
    
class AppointmentCreate(AppointmentBase):
    patient_id: int
    triage_level: str

class TriageRequest(BaseModel):
    symptoms: str = Field(..., example="Severe chest pain and shortness of breath")

class TriageResponse(BaseModel):
    triage_level: str = Field(..., example="Emergency")

class BookRequest(BaseModel):
    patient: PatientCreate
    symptoms: str = Field(..., example="High fever and severe headache")

class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    triage_level: str
    status: str
    created_at: datetime.datetime
    patient: Optional[PatientResponse] = None

    class Config:
        from_attributes = True

class PatientWithHistory(PatientResponse):
    appointments: List[AppointmentResponse] = []

    class Config:
        from_attributes = True
class NotificationBase(BaseModel):
    message: str = Field(..., example="Your appointment has been confirmed")
    notification_type: str = Field("Status Update", example="Confirmation")

class NotificationCreate(NotificationBase):
    patient_id: int
    appointment_id: Optional[int] = None
    contact_number: str

class NotificationSend(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    message: str = Field(..., example="Your appointment is in 1 hour")
    notification_type: str = Field("Status Update", example="Reminder")

class NotificationResponse(NotificationBase):
    id: int
    patient_id: int
    appointment_id: Optional[int] = None
    contact_number: str
    status: str
    created_at: datetime.datetime
    sent_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class PatientNotificationHistory(PatientResponse):
    notifications: List[NotificationResponse] = []
    appointments: List[AppointmentResponse] = []

    class Config:
        from_attributes = True