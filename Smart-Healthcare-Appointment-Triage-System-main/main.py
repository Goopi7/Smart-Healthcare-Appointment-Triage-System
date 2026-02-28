from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend import models, schemas, crud
from backend.database import SessionLocal, engine, get_db

# Create database tables upon startup
models.Base.metadata.create_all(bind=engine)

from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Smart Healthcare Appointment & Triage System",
    description="A clean, modular, beginner-friendly REST API for patient triage and queue management using FastAPI and SQLite.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
def docs_redirect():
    return RedirectResponse(url='/docs')

@app.post("/triage", response_model=schemas.TriageResponse, status_code=status.HTTP_200_OK)
def triage_patient(request: schemas.TriageRequest):
    """
    Evaluate a patient's symptoms and return the suggested triage level.
    """
    level = crud.evaluate_triage_level(request.symptoms)
    return schemas.TriageResponse(triage_level=level)

@app.post("/book", response_model=schemas.AppointmentResponse, status_code=status.HTTP_201_CREATED)
def book_appointment(request: schemas.BookRequest, db: Session = Depends(get_db)):
    """
    Book an appointment. Creates the patient if they don't already exist,
    determines the triage priority based on the symptoms, and places them in the queue.
    """
    # 1. Check or create the patient
    db_patient = crud.get_patient_by_details(db, name=request.patient.name, age=request.patient.age)
    if not db_patient:
        db_patient = crud.create_patient(db, patient=request.patient)
        
    # 2. Assign a triage level based on symptoms
    triage_level = crud.evaluate_triage_level(request.symptoms)
    
    # 3. Create the appointment record
    appointment_data = schemas.AppointmentCreate(
        patient_id=db_patient.id,
        symptoms=request.symptoms,
        triage_level=triage_level
    )
    db_appointment = crud.create_appointment(db, appointment=appointment_data)
    return db_appointment

@app.get("/appointments", response_model=List[schemas.AppointmentResponse])
def get_queued_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all queued appointments. Automatically prioritizes Emergency cases over others,
    then by the time the appointment was booked.
    """
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments

@app.get("/patients", response_model=List[schemas.PatientWithHistory])
def get_patients_list(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all patients with their appointment history.
    """
    patients = crud.get_all_patients(db, skip=skip, limit=limit)
    return patients

@app.get("/patients/{id}", response_model=schemas.PatientWithHistory)
def get_patient(id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a patient by their ID.
    """
    db_patient = crud.get_patient(db, patient_id=id)
    if not db_patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return db_patient

@app.delete("/appointment/{id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_appointment(id: int, db: Session = Depends(get_db)):
    """
    Cancel or remove an appointment from the queue using its ID.
    """
    db_appointment = crud.delete_appointment(db, appointment_id=id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return None
# ============ NOTIFICATION ENDPOINTS ============

@app.post("/notifications/send", response_model=schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
def send_notification(request: schemas.NotificationSend, db: Session = Depends(get_db)):
    """
    Send a notification to a patient. Requires valid patient_id and message.
    """
    patient = crud.get_patient(db, request.patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    
    if not patient.contact:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient contact number not available")
    
    notification = crud.send_notification(db, request)
    return notification

@app.post("/notifications/send-confirmation/{appointment_id}", response_model=schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
def send_confirmation_notification(appointment_id: int, db: Session = Depends(get_db)):
    """
    Send appointment confirmation notification to patient.
    """
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    notification = crud.send_appointment_confirmation(db, appointment_id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not send notification")
    
    return notification

@app.post("/notifications/send-update/{appointment_id}", response_model=schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
def send_status_update_notification(appointment_id: int, db: Session = Depends(get_db)):
    """
    Send appointment status update notification to patient.
    """
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    notification = crud.send_status_update(db, appointment_id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not send notification")
    
    return notification

@app.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_all_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all notifications.
    """
    notifications = crud.get_all_notifications(db, skip=skip, limit=limit)
    return notifications

@app.get("/notifications/patient/{patient_id}", response_model=List[schemas.NotificationResponse])
def get_patient_notifications(patient_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    Get all notifications for a specific patient.
    """
    patient = crud.get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    
    notifications = crud.get_notifications_by_patient(db, patient_id, skip=skip, limit=limit)
    return notifications

@app.get("/notifications/appointment/{appointment_id}", response_model=List[schemas.NotificationResponse])
def get_appointment_notifications(appointment_id: int, db: Session = Depends(get_db)):
    """
    Get all notifications for a specific appointment.
    """
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    notifications = crud.get_notifications_by_appointment(db, appointment_id)
    return notifications