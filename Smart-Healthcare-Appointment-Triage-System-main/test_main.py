import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from backend.database import Base, get_db
from backend import crud

# ----------------- Test Database Setup -----------------
# Create an in-memory SQLite database for testing, so we don't pollute the real DB.
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the database dependency in FastAPI
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Pytest fixture to clear the database before each test
@pytest.fixture(autouse=True)
def setup_and_teardown():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    
# ----------------- 1. Test Triage Logic -----------------

def test_triage_logic_emergency():
    """Test that severe keywords trigger an 'Emergency' triage level."""
    assert crud.evaluate_triage_level("I have severe chest pain") == "Emergency"
    assert crud.evaluate_triage_level("Patient is unconscious") == "Emergency"
    assert crud.evaluate_triage_level("heavy bleeding from arm") == "Emergency"

def test_triage_logic_urgent():
    """Test that moderate keywords trigger an 'Urgent' triage level."""
    assert crud.evaluate_triage_level("High fever and chills") == "Urgent"
    assert crud.evaluate_triage_level("Broken arm pain") == "Urgent"

def test_triage_logic_routine():
    """Test that normal symptoms trigger a 'Routine' triage level."""
    assert crud.evaluate_triage_level("Need a regular checkup") == "Routine"
    assert crud.evaluate_triage_level("Slight rash on arm") == "Routine"

# ----------------- 2. Test Booking API -----------------

def test_book_appointment():
    """Test the booking endpoint correctly creates an appointment and patient."""
    response = client.post(
        "/book",
        json={
            "patient": {"name": "Test User", "age": 45, "contact": "123-456-7890"},
            "symptoms": "Mild headache"
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["symptoms"] == "Mild headache"
    assert data["triage_level"] == "Routine"
    assert data["status"] == "Queued"
    assert "id" in data
    assert data["patient"]["name"] == "Test User"
    
def test_book_emergency_appointment():
    """Test the booking endpoint correctly assigns an emergency priority."""
    response = client.post(
        "/book",
        json={
            "patient": {"name": "Critical User", "age": 60, "contact": "999-999-9999"},
            "symptoms": "Severe chest pain and difficulty breathing"
        },
    )
    assert response.status_code == 201
    assert response.json()["triage_level"] == "Emergency"


# ----------------- 3. Test Queue Prioritization -----------------

def test_queue_prioritization():
    """
    Test that the /appointments queue always returns 'Emergency' patients 
    before 'Urgent' or 'Routine' regardless of booking order.
    """
    # 1. Book a Routine Patient
    client.post(
        "/book",
        json={
            "patient": {"name": "Routine Patient", "age": 25, "contact": "111"},
            "symptoms": "Just a checkup"
        },
    )
    
    # 2. Book an Urgent Patient
    client.post(
        "/book",
        json={
            "patient": {"name": "Urgent Patient", "age": 30, "contact": "222"},
            "symptoms": "High fever"
        },
    )
    
    # 3. Book an Emergency Patient (Booked LAST)
    client.post(
        "/book",
        json={
            "patient": {"name": "Emergency Patient", "age": 50, "contact": "333"},
            "symptoms": "Heart attack!"
        },
    )

    # Fetch Queue
    response = client.get("/appointments")
    assert response.status_code == 200
    queue = response.json()

    # The Emergency patient was booked last but should be first in the queue
    assert len(queue) == 3
    assert queue[0]["triage_level"] == "Emergency"
    assert queue[0]["patient"]["name"] == "Emergency Patient"
    
    assert queue[1]["triage_level"] == "Urgent"
    assert queue[1]["patient"]["name"] == "Urgent Patient"

    assert queue[2]["triage_level"] == "Routine"
    assert queue[2]["patient"]["name"] == "Routine Patient"

# ----------------- 4. Test Appointment Deletion -----------------

def test_delete_appointment():
    """Test deleting an appointment works."""
    # Create appointment
    create_response = client.post(
        "/book",
        json={
            "patient": {"name": "Cancel Test", "age": 20, "contact": "000"},
            "symptoms": "Routine check"
        },
    )
    appt_id = create_response.json()["id"]

    # Delete appointment
    delete_response = client.delete(f"/appointment/{appt_id}")
    assert delete_response.status_code == 204

    # Verify queue is empty
    queue_response = client.get("/appointments")
    assert len(queue_response.json()) == 0
