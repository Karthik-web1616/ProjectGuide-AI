import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter()


@router.post("/onboarding", response_model=schemas.OnboardingResponse)
def create_profile(data: schemas.OnboardingRequest, db: Session = Depends(get_db)):
    student = models.Student(
        first_name=data.firstName,
        last_name=data.lastName,
        email=data.email,
        roll_no=data.rollNo,
        branch=data.branch,
        year=data.year,
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    profile = models.SkillProfile(
        student_id=student.id,
        skills=json.dumps(data.skills),
        other_skills=data.otherSkills,
        domains=json.dumps(data.domains),
        other_domains=data.otherDomains,
        about_me=data.aboutMe,
        team_size=data.teamSize,
    )
    db.add(profile)
    db.commit()

    return {"student_id": student.id, "status": "onboarded"}