from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import check_db_connection
<<<<<<< HEAD
from routers import onboarding, submission, feasibility, scope, chat, auth, tech_stack, tracking
=======
from routers import onboarding, submission, feasibility, scope, chat, auth, tech_stack
>>>>>>> 4a642e878f362a881e451424b7b7a885d9dca796

app = FastAPI(title="Agentic Mentoring System - Backend (Milestone 1 - MongoDB)")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(onboarding.router, tags=["onboarding"])
app.include_router(submission.router, tags=["submission"])
app.include_router(feasibility.router, tags=["agents"])
app.include_router(scope.router, tags=["agents"])
app.include_router(tech_stack.router, tags=["agents"])
<<<<<<< HEAD
app.include_router(tracking.router, tags=["agents"])
=======
>>>>>>> 4a642e878f362a881e451424b7b7a885d9dca796
app.include_router(chat.router, tags=["chat"])


@app.get("/")
def health_check():
    return {"status": "backend running"}


@app.get("/db-health")
def db_health_check():
    """Live check for MongoDB Atlas connectivity"""
    return check_db_connection()
