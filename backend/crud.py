from sqlalchemy.orm import Session
from sqlalchemy import case

from . import models, schemas

def get_patient(db: Session, patient_id: int):
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()

def get_patient_by_details(db: Session, name: str, age: int):
    return db.query(models.Patient).filter(models.Patient.name == name, models.Patient.age == age).first()

def create_patient(db: Session, patient: schemas.PatientCreate):
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def get_all_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Patient).offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    db_appointment = models.Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    # Order by triage level using conditional logic. 
    # Emergency patients must be placed at the top of the queue.
    # We assign custom sorting weights: Emergency = 1, Urgent = 2, Routine = 3
    triage_order = case(
        (models.Appointment.triage_level == 'Emergency', 1),
        (models.Appointment.triage_level == 'Urgent', 2),
        (models.Appointment.triage_level == 'Routine', 3),
        else_=4
    )
    
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.status == "Queued")
        .order_by(triage_order, models.Appointment.created_at)
        .offset(skip).limit(limit).all()
    )

def delete_appointment(db: Session, appointment_id: int):
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment:
        db_appointment.status = "Completed"
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def evaluate_triage_level(symptoms: str) -> str:
    """
    Evaluate symptoms to determine triage priority.
    """
    symptoms_lower = symptoms.lower()
    
    # Simple keyword-based evaluation for beginner-friendly triage logic
    emergency_keywords = ['chest pain', 'heart attack', 'bleeding', 'unconscious', 'breathing', 'stroke']
    urgent_keywords = ['fever', 'fracture', 'broken', 'pain', 'vomiting', 'dizziness']
    
    for keyword in emergency_keywords:
        if keyword in symptoms_lower:
            return "Emergency"
            
    for keyword in urgent_keywords:
        if keyword in symptoms_lower:
            return "Urgent"
            
    return "Routine"
