import datetime
from fastapi import APIRouter, HTTPException
import schemas
from database import get_project_ideas_collection
from models import make_project_idea_doc

router = APIRouter()


@router.post("/submit-idea", response_model=schemas.IdeaResponse)
def submit_idea(data: schemas.IdeaRequest):
    try:
        ideas = get_project_ideas_collection()
        idea_doc = make_project_idea_doc(data)

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