import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter()


@router.post("/onboarding", response_model=schemas.OnboardingResponse)
def create_profile(data: schemas.OnboardingRequest, db: Session = Depends(get_db)):
    # Check if student with this email already exists
    student = db.query(models.Student).filter(models.Student.email == data.email).first()
    if not student:
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
    else:
        student.first_name = data.firstName
        student.last_name = data.lastName
        student.roll_no = data.rollNo
        student.branch = data.branch
        student.year = data.year
        db.commit()
        db.refresh(student)

    # Upsert skill profile
    profile = db.query(models.SkillProfile).filter(models.SkillProfile.student_id == student.id).first()
    if not profile:
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
    else:
        profile.skills = json.dumps(data.skills)
        profile.other_skills = data.otherSkills
        profile.domains = json.dumps(data.domains)
        profile.other_domains = data.otherDomains
        profile.about_me = data.aboutMe
        profile.team_size = data.teamSize

    db.commit()

    return {"student_id": student.id, "status": "onboarded"}