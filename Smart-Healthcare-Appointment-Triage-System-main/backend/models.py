from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime

from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String, default="Other")
    contact = Column(String)

    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="patient", cascade="all, delete-orphan")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    symptoms = Column(String)
    triage_level = Column(String, index=True) # E.g., "Emergency", "Urgent", "Routine"
    status = Column(String, default="Queued") # E.g., "Queued", "Completed", "Cancelled"
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    patient = relationship("Patient", back_populates="appointments")
    notifications = relationship("Notification", back_populates="appointment", cascade="all, delete-orphan")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    message = Column(String)
    contact_number = Column(String)
    notification_type = Column(String, default="Status Update") # E.g., "Confirmation", "Status Update", "Reminder"
    status = Column(String, default="Pending") # E.g., "Pending", "Sent", "Failed"
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    sent_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="notifications")
    appointment = relationship("Appointment", back_populates="notifications")
