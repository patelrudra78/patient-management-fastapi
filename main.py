from pathlib import Path
import json
from typing import Literal, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "patients.json"

app = FastAPI(title="Patient Management API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "null"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

class PatientCreate(BaseModel):
    id: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=100)
    city: str = Field(min_length=1, max_length=100)
    age: int = Field(ge=0, le=120)
    gender: Literal["Male", "Female", "Other"]
    height: float = Field(gt=0, le=2.8, description="Height in metres")
    weight: float = Field(gt=0, le=500, description="Weight in kilograms")

class PatientUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    city: Optional[str] = Field(default=None, min_length=1, max_length=100)
    age: Optional[int] = Field(default=None, ge=0, le=120)
    gender: Optional[Literal["Male", "Female", "Other"]] = None
    height: Optional[float] = Field(default=None, gt=0, le=2.8)
    weight: Optional[float] = Field(default=None, gt=0, le=500)

def load_data() -> dict:
    if not DATA_FILE.exists():
        DATA_FILE.write_text("{}", encoding="utf-8")
    try:
        with DATA_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as exc:
        raise RuntimeError("patients.json is not valid JSON. Restore a valid JSON object.") from exc
    if not isinstance(data, dict):
        raise RuntimeError("patients.json must contain a JSON object.")
    return data

def save_data(data: dict) -> None:
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def enrich(patient: dict) -> dict:
    result = dict(patient)
    bmi = round(float(result["weight"]) / float(result["height"]) ** 2, 2)
    result["bmi"] = bmi
    result["verdict"] = "Underweight" if bmi < 18.5 else "Normal" if bmi < 25 else "Overweight" if bmi < 30 else "Obese"
    return result

@app.get("/")
def home():
    return {"message": "Patient Management API is running", "docs": "/docs"}

@app.get("/about")
def about():
    return {"message": "FastAPI patient management app using JSON file storage."}

@app.get("/patients")
def list_patients():
    return [enrich(p) for p in load_data().values()]

@app.get("/patient/{patient_id}")
def get_patient(patient_id: str):
    patient = load_data().get(patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return enrich(patient)

@app.post("/patients", status_code=201)
def create_patient(patient: PatientCreate):
    data = load_data()
    if patient.id in data:
        raise HTTPException(status_code=409, detail="A patient with this ID already exists")
    record = patient.model_dump()
    data[patient.id] = record
    save_data(data)
    return enrich(record)

@app.put("/patient/{patient_id}")
def update_patient(patient_id: str, updates: PatientUpdate):
    data = load_data()
    if patient_id not in data:
        raise HTTPException(status_code=404, detail="Patient not found")
    changes = updates.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=400, detail="Provide at least one field to update")
    data[patient_id].update(changes)
    save_data(data)
    return enrich(data[patient_id])

@app.delete("/patient/{patient_id}")
def delete_patient(patient_id: str):
    data = load_data()
    if patient_id not in data:
        raise HTTPException(status_code=404, detail="Patient not found")
    deleted = data.pop(patient_id)
    save_data(data)
    return {"message": "Patient deleted successfully", "patient": deleted}

@app.get("/sort")
def sort_patients(sort_by: str = "name", order: str = "asc"):
    allowed = {"name", "age", "height", "weight", "city"}
    if sort_by not in allowed:
        raise HTTPException(status_code=400, detail=f"sort_by must be one of {sorted(allowed)}")
    if order not in {"asc", "desc"}:
        raise HTTPException(status_code=400, detail="order must be 'asc' or 'desc'")
    patients = [enrich(p) for p in load_data().values()]
    return sorted(patients, key=lambda p: p[sort_by], reverse=order == "desc")

# Serves the frontend at http://127.0.0.1:8000/app
app.mount("/app", StaticFiles(directory=BASE_DIR / "frontend", html=True), name="frontend")
