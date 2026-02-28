# Smart Healthcare Appointment & Triage System

An intelligent, full-stack healthcare platform designed to automate patient triage, prioritize emergency cases, and streamline hospital queuing. Built for modern medical facilities to cut down wait times and save lives.

---

##  Problem Statement

In crowded emergency rooms, patients are frequently triaged manually, leading to human errors and life-threatening delays. Routine queries often congest the pipeline, causing critical patients to wait longer than they should. **Our solution** automates the initial assessment, identifying emergency keywords (like "chest pain" or "unconscious") to immediately prioritize at-risk individuals and present doctors with a real-time, sorted queue.

---

## ✨ Key Features

- **Automated AI/Rule-Based Triage:** Instantly classifies symptoms into `Emergency`, `Urgent`, or `Routine`.
- **Dynamic Priority Queueing:** Automatically moves critical patients to the top of the line regardless of their arrival time.
- **Real-Time Staff Dashboard:** A sleek, self-updating React interface for medical staff to view the current queue.
- **Priority Visualization:** Calculates a 0-100 severity score with visual progress bars.
- **Emergency Alerting:** Highlights critical patients in flashing red boxes with immediate visual indicators.

---

## 🛠 Tech Stack

**Backend (API & Logic):**
- **Python / FastAPI:** Lightning-fast, modern REST API.
- **SQLite & SQLAlchemy:** Lightweight, robust relational database for patient records.
- **Pydantic:** Strict data validation and schema definitions.
- **PyTest:** Automated test suite for triage logic and endpoint validation.
- *Optional:* Scikit-learn (for Phase 2 Machine Learning triage).

**Frontend (UI):**
- **React + Vite:** Ridiculously fast development server and optimized build.
- **Tailwind CSS:** Utility-first CSS framework for a beautiful, responsive, and modern interface.
- **Axios:** Promise-based HTTP client to bind the frontend to the FastAPI backend.
- **Lucide-React:** Crisp, beautiful vector icons for medical dashboards.

---

## 🏗 Architecture Diagram

```text
[ Patient / User ] 
       │
       ▼ (Submits Form)
┌──────────────────────┐
│  React Frontend (UI) │ ◄────┐
│  (Tailwind, Axios)   │      │ (Polls every 3s)
└──────────┬───────────┘      │
           │ POST /book       │ GET /appointments
           ▼                  v
┌───────────────────────────────────────┐
│              FastAPI                  │
│  ───────────           ────────────   │
│ │ Schemas   │ ◄──────►│ crud.py    │  │
│  ───────────           ────────────   │
│                             │         │
│                        (Triage Logic) │
└──────────┬──────────────────┬─────────┘
           │                  │
           ▼                  ▼
┌───────────────────────────────────────┐
│           SQLite Database             │
│   [ Patients Table ] [ Appts Table ]  │
└───────────────────────────────────────┘
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/triage` | Evaluates given symptoms and returns suggested triage level. |
| **POST** | `/book` | Admits a new patient, calculates priority, and queues them. |
| **GET** | `/appointments` | Fetches the live priority-sorted queue (Emergencies first). |
| **GET** | `/patients/{id}` | Retrieves detailed record for a specific patient. |
| **DELETE** | `/appointment/{id}`| Removes a completed or canceled appointment from the queue. |

---

## 🚦 Demo Flow

1. **The Scenario:** A busy waiting room with multiple walk-ins.
2. **Action 1 (Routine):** A patient approaches the kiosk and inputs: *"I have a slight headache and a rash."*
   - *Result:* Sent to the backend -> Triaged as `Routine` -> Placed at the bottom of the queue.
3. **Action 2 (Emergency):** The next patient rushes in and types: *"My dad is having severe chest pain and struggling to breathe!"*
   - *Result:* Sent to the backend -> Keyword triggered (`chest pain`) -> Triaged as `Emergency` -> Moves to **Position #1** in the dashboard.
4. **Action 3 (Resolution):** The flashing red indicator immediately alerts the doctor on the React dashboard. The doctor clicks delete (or finishes the appointment), removing them from the queue.

---

## ⚙️ Setup Instructions

### 1. Start the Backend server

Open a terminal and install dependencies, then run FastAPI:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
*The API will start at `http://127.0.0.1:8000`.*
*(Interactive docs available at `http://127.0.0.1:8000/docs`)*

### 2. Start the Frontend dashboard

Open a **second** terminal, navigate to the `frontend` folder, and start Vite:
```bash
cd frontend
npm install
npm run dev
```
*The dashboard will be live at `http://localhost:5173`.*

---
*Built with ❤️ for the Hackathon.*
