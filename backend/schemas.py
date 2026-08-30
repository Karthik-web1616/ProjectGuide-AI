from typing import Dict, List, Optional

from pydantic import BaseModel


class OnboardingRequest(BaseModel):
    firstName: str
    lastName: Optional[str] = ""
    email: str
    rollNo: Optional[str] = ""
    branch: Optional[str] = ""
    year: Optional[str] = ""
    skills: Optional[Dict[str, int]] = {}
    otherSkills: Optional[str] = ""
    domains: Optional[List[str]] = []
    otherDomains: Optional[str] = ""
    aboutMe: Optional[str] = ""
    teamSize: Optional[str] = "3"


class OnboardingResponse(BaseModel):
    student_id: int
    status: str


class IdeaRequest(BaseModel):
    student_id: int
    title: str
    desc: str
    domain: Optional[str] = "web"
    teamSize: Optional[str] = "3"
    durationDays: Optional[int] = 30


class IdeaResponse(BaseModel):
    idea_id: int
    status: str