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


@app.get("/")
def health_check():
    return {"status": "backend running"}
