"""
Scope Definition Agent API Router
Exposes the CrewAI scope definition agent as a REST endpoint.
"""

from fastapi import APIRouter, HTTPException

import schemas
from agents.scope_agent import run_scope_agent

router = APIRouter()


@router.post("/api/scope-definition", response_model=schemas.ScopeResponse)
def define_scope(data: schemas.ScopeRequest):
    """
    Take a raw student project idea and produce a clearly bounded scope
    using the CrewAI scope definition agent. Optionally accepts uploaded
    files (base64) and the student's skill profile for richer context.
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

        report = run_scope_agent(
            idea_data=idea_data,
            student_skills=student_skills,
            uploaded_files=uploaded_files,
        )

        return report

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Scope definition agent error: {str(e)}",
        )