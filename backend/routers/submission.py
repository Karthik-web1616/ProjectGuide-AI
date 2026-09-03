import datetime
from fastapi import APIRouter, HTTPException
import schemas
from database import get_project_ideas_collection

router = APIRouter()


@router.post("/submit-idea", response_model=schemas.IdeaResponse)
def submit_idea(data: schemas.IdeaRequest):
    try:
        ideas = get_project_ideas_collection()
        idea_doc = {
            "student_id": str(data.student_id),
            "title": data.title,
            "desc": data.desc,
            "domain": data.domain,
            "team_size": data.teamSize,
            "duration_days": data.durationDays,
            "status": "pending_review",
            "created_at": datetime.datetime.utcnow(),
        }

        result = ideas.insert_one(idea_doc)
        idea_id = str(result.inserted_id)

        fire_trigger(idea_id)

        return {"idea_id": idea_id, "status": "pending_review"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def fire_trigger(idea_id: str):
    """
    Milestone 1: keep the trigger simple — just log that the pipeline
    would be invoked here. Milestone 2 replaces this with a real call
    to the orchestrator agent.
    """
    print(f"[TRIGGER] Project idea {idea_id} queued for agent pipeline")