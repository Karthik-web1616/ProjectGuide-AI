"""
Feasibility Agent API Router
Exposes the CrewAI feasibility agent as a REST endpoint.
"""

from fastapi import APIRouter, HTTPException

import schemas
from agents.feasibility_agent import run_feasibility_agent

router = APIRouter()


@router.post("/api/feasibility-check", response_model=schemas.FeasibilityResponse)
def check_feasibility(data: schemas.FeasibilityRequest):
    """
    Analyze a student project idea for feasibility using the CrewAI agent.
    Optionally accepts uploaded files (base64) for richer context.
    """
    try:
        idea_data = {
            "title": data.title,
            "desc": data.desc,
            "domain": data.domain,
            "teamSize": data.teamSize,
            "durationDays": data.durationDays,
            "techIdeas": data.techIdeas,
            "features": data.features,
        }

        student_skills = data.studentSkills or {}

        uploaded_files = [
            {
                "name": f.name,
                "contentBase64": f.contentBase64,
                "contentType": f.contentType,
            }
            for f in (data.uploadedFiles or [])
        ]

        report = run_feasibility_agent(
            idea_data=idea_data,
            student_skills=student_skills,
            uploaded_files=uploaded_files,
        )

        return report

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Feasibility agent error: {str(e)}",
        )
