from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter()


@router.post("/submit-idea", response_model=schemas.IdeaResponse)
def submit_idea(data: schemas.IdeaRequest, db: Session = Depends(get_db)):
    idea = models.ProjectIdea(
        student_id=data.student_id,
        title=data.title,
        desc=data.desc,
        domain=data.domain,
        team_size=data.teamSize,
        duration_days=data.durationDays,
        status="pending_review",
    )
    db.add(idea)
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