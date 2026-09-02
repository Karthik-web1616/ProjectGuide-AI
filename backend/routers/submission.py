from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter()


@router.post("/submit-idea", response_model=schemas.IdeaResponse)
def submit_idea(data: schemas.IdeaRequest, db: Session = Depends(get_db)):
    # 1. Resolve student record
    student = db.query(models.Student).filter(models.Student.id == data.student_id).first()
    if not student:
        student = db.query(models.Student).first()
        if not student:
            student = models.Student(
                first_name="Student",
                last_name="",
                email="student@college.edu.in",
                roll_no="21CS101",
                branch="CSE",
                year="3rd Year"
            )
            db.add(student)
            db.commit()
            db.refresh(student)
        student_id = student.id
    else:
        student_id = student.id

    # 2. Check if updating an existing idea by idea_id
    idea = None
    if getattr(data, 'idea_id', None):
        idea = db.query(models.ProjectIdea).filter(models.ProjectIdea.id == data.idea_id).first()

    if not idea:
        idea = models.ProjectIdea(
            student_id=student_id,
            title=data.title,
            desc=data.desc,
            domain=data.domain,
            team_size=data.teamSize,
            duration_days=data.durationDays,
            status="pending_review",
        )
        db.add(idea)
    else:
        idea.title = data.title
        idea.desc = data.desc
        idea.domain = data.domain
        idea.team_size = data.teamSize
        idea.duration_days = data.durationDays
        idea.status = "pending_review"

    db.commit()
    db.refresh(idea)

    fire_trigger(idea.id)

    return {"idea_id": idea.id, "status": idea.status}


def fire_trigger(idea_id: int):
    """
    Milestone 1: keep the trigger simple — just log that the pipeline
    would be invoked here. Milestone 2 replaces this with a real call
    to the orchestrator agent (Shobika's part).
    """
    print(f"[TRIGGER] Project idea {idea_id} queued for agent pipeline")