import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String)
    email = Column(String, unique=True, nullable=False)
    roll_no = Column(String)
    branch = Column(String)
    year = Column(String)

    skill_profile = relationship(
        "SkillProfile", back_populates="student", uselist=False
    )
    ideas = relationship("ProjectIdea", back_populates="student")


class SkillProfile(Base):
    __tablename__ = "skill_profiles"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    skills = Column(String)
    other_skills = Column(String)
    domains = Column(String)
    other_domains = Column(String)
    about_me = Column(String)
    team_size = Column(String)

    student = relationship("Student", back_populates="skill_profile")


class ProjectIdea(Base):
    __tablename__ = "project_ideas"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    title = Column(String, nullable=False)
    desc = Column(String)
    domain = Column(String)
    team_size = Column(String)
    duration_days = Column(Integer, default=30)
    status = Column(String, default="pending_review")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("Student", back_populates="ideas")