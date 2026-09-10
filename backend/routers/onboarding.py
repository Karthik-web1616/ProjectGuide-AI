import datetime
from fastapi import APIRouter, HTTPException
import schemas
from database import get_students_collection
from models import make_student_doc, now_utc

router = APIRouter()


@router.post("/onboarding", response_model=schemas.OnboardingResponse)
def create_profile(data: schemas.OnboardingRequest):
    try:
        students = get_students_collection()
        student_doc = make_student_doc(data)

        # Check if student with this email already exists; update if so, else insert
        existing = students.find_one({"email": data.email})
        if existing:
            students.update_one({"_id": existing["_id"]}, {"$set": student_doc})
            student_id = str(existing["_id"])
        else:
            student_doc["created_at"] = now_utc()
            result = students.insert_one(student_doc)
            student_id = str(result.inserted_id)

        return {"student_id": student_id, "status": "onboarded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")