from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import Base, engine
from routers import onboarding, submission

# Creates students / skill_profiles / project_ideas tables on first run
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agentic Mentoring System - Backend (Milestone 1)")

# TODO: tighten allow_origins to the actual frontend URL once deployed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(onboarding.router, tags=["onboarding"])
app.include_router(submission.router, tags=["submission"])


from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.get("/")
def health_check():
    return {"status": "backend running"}

@app.get("/ideas")
def get_all_ideas(db: Session = Depends(get_db)):
    ideas = db.query(models.ProjectIdea).all()
    return [
        {
            "id": i.id,
            "student_id": i.student_id,
            "title": i.title,
            "desc": i.desc,
            "domain": i.domain,
            "team_size": i.team_size,
            "duration_days": i.duration_days,
            "status": i.status,
            "created_at": i.created_at.isoformat() if i.created_at else None,
        }
        for i in ideas
    ]

@app.get("/students")
def get_all_students(db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    result = []
    for s in students:
        sp = s.skill_profile
        result.append({
            "id": s.id,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "email": s.email,
            "roll_no": s.roll_no,
            "branch": s.branch,
            "year": s.year,
            "skills": sp.skills if sp else None,
            "domains": sp.domains if sp else None,
            "team_size": sp.team_size if sp else None,
            "ideas_count": len(s.ideas)
        })
    return result
