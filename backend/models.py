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

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    symptoms = Column(String)
    triage_level = Column(String, index=True) # E.g., "Emergency", "Urgent", "Routine"
    status = Column(String, default="Queued") # E.g., "Queued", "Completed", "Cancelled"
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    patient = relationship("Patient", back_populates="appointments")
