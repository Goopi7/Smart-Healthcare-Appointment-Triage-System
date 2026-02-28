from sqlalchemy.orm import Session
from sqlalchemy import case
import datetime

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

# ============ NOTIFICATION FUNCTIONS ============

def send_sms_notification(phone_number: str, message: str) -> bool:
    """
    Mock SMS sending function. In production, integrate with Twilio or similar.
    For demo purposes, logs the notification and returns success.
    """
    try:
        print(f"\n📱 SMS NOTIFICATION SENT:")
        print(f"   To: {phone_number}")
        print(f"   Message: {message}")
        print()
        return True
    except Exception as e:
        print(f"Failed to send SMS to {phone_number}: {str(e)}")
        return False

def create_notification(db: Session, notification: schemas.NotificationCreate):
    """Create a new notification record"""
    db_notification = models.Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def send_notification(db: Session, notification_data: schemas.NotificationSend):
    """Send a notification to patient and log it"""
    patient = get_patient(db, notification_data.patient_id)
    if not patient or not patient.contact:
        return None
    
    # Send the SMS
    sms_sent = send_sms_notification(patient.contact, notification_data.message)
    
    # Create and save notification record
    notification_create = schemas.NotificationCreate(
        patient_id=notification_data.patient_id,
        appointment_id=notification_data.appointment_id,
        message=notification_data.message,
        contact_number=patient.contact,
        notification_type=notification_data.notification_type
    )
    
    db_notification = models.Notification(**notification_create.model_dump())
    db_notification.status = "Sent" if sms_sent else "Failed"
    db_notification.sent_at = datetime.datetime.now(datetime.timezone.utc) if sms_sent else None
    
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_notifications_by_patient(db: Session, patient_id: int, skip: int = 0, limit: int = 50):
    """Get all notifications for a patient"""
    return (
        db.query(models.Notification)
        .filter(models.Notification.patient_id == patient_id)
        .order_by(models.Notification.created_at.desc())
        .offset(skip).limit(limit).all()
    )

def get_notifications_by_appointment(db: Session, appointment_id: int):
    """Get all notifications for an appointment"""
    return (
        db.query(models.Notification)
        .filter(models.Notification.appointment_id == appointment_id)
        .order_by(models.Notification.created_at.desc())
        .all()
    )

def get_all_notifications(db: Session, skip: int = 0, limit: int = 100):
    """Get all notifications"""
    return (
        db.query(models.Notification)
        .order_by(models.Notification.created_at.desc())
        .offset(skip).limit(limit).all()
    )

def get_pending_notifications(db: Session):
    """Get all pending notifications (for retry logic)"""
    return (
        db.query(models.Notification)
        .filter(models.Notification.status == "Pending")
        .all()
    )

def get_notification(db: Session, notification_id: int):
    """Get a specific notification"""
    return db.query(models.Notification).filter(models.Notification.id == notification_id).first()

def send_appointment_confirmation(db: Session, appointment_id: int, message: str = None):
    """Send confirmation notification when appointment is booked"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment or not appointment.patient.contact:
        return None
    
    if message is None:
        message = f"Your appointment has been confirmed. Triage Level: {appointment.triage_level}. Please arrive on time."
    
    notification_data = schemas.NotificationSend(
        patient_id=appointment.patient_id,
        appointment_id=appointment_id,
        message=message,
        notification_type="Confirmation"
    )
    
    return send_notification(db, notification_data)

def send_status_update(db: Session, appointment_id: int, message: str = None):
    """Send status update notification"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment or not appointment.patient.contact:
        return None
    
    if message is None:
        message = f"Status update: Your appointment status is {appointment.status}."
    
    notification_data = schemas.NotificationSend(
        patient_id=appointment.patient_id,
        appointment_id=appointment_id,
        message=message,
        notification_type="Status Update"
    )
    
    return send_notification(db, notification_data)
