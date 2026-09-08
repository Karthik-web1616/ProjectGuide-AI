from typing import Dict, List, Optional, Union
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
    student_id: Union[str, int]
    status: str


class UploadedFile(BaseModel):
    name: str
    size: int
    type: str
    uploadedAt: Optional[str] = ""


class IdeaRequest(BaseModel):
    student_id: Union[str, int]
    title: str
    desc: str
    domain: Optional[str] = "web"
    teamSize: Optional[str] = "3"
    durationDays: Optional[int] = 30
    durationUnit: Optional[str] = "days"   # "days" or "weeks"
    techIdeas: Optional[str] = ""
    refLink: Optional[str] = ""
    features: Optional[List[str]] = []
    uploadedFiles: Optional[List[UploadedFile]] = []


class IdeaResponse(BaseModel):
    idea_id: Union[str, int]
    status: str


class FileUpload(BaseModel):
    name: str
    contentBase64: str
    contentType: str


class FeasibilityRequest(BaseModel):
    title: str
    desc: str
    domain: Optional[str] = "web"
    teamSize: Optional[str] = "3"
    durationDays: Optional[int] = 30
    techIdeas: Optional[str] = ""
    features: Optional[List[str]] = []
    studentSkills: Optional[Dict[str, int]] = {}
    uploadedFiles: Optional[List[FileUpload]] = []


class FeasibilityMetrics(BaseModel):
    technical: int
    timeline: int
    resource: int
    skillMatch: int


class FeasibilityResponse(BaseModel):
    overallScore: int
    verdict: str
    metrics: FeasibilityMetrics
    strengths: List[str]
    bottlenecks: List[str]
    filesAnalyzed: Optional[List[str]] = []
    aiGenerated: Optional[bool] = False