from typing import List, Optional
from pydantic import BaseModel, Field

class ContactInfo(BaseModel):
    full_name: str = Field(description="Full name of the candidate")
    headline: Optional[str] = Field(None, description="Professional title or headline tailored to target position")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="City, Country or Remote status")
    linkedin: Optional[str] = Field(None, description="LinkedIn profile URL or handle")
    github: Optional[str] = Field(None, description="GitHub profile URL or handle")
    website: Optional[str] = Field(None, description="Personal website or portfolio URL")

class WorkExperience(BaseModel):
    company: str = Field(description="Company or organization name")
    position: str = Field(description="Job title/role")
    location: Optional[str] = Field(None, description="Location (City, State/Country or Remote)")
    start_date: str = Field(description="Start date (e.g. Jan 2022)")
    end_date: str = Field(description="End date or 'Present'")
    highlights: List[str] = Field(default_factory=list, description="Quantified, action-oriented bullet points tailored to the job description keywords")

class Education(BaseModel):
    institution: str = Field(description="University, college or institution name")
    degree: str = Field(description="Degree name (e.g. B.S. in Computer Science)")
    location: Optional[str] = Field(None, description="Location")
    graduation_date: Optional[str] = Field(None, description="Graduation date or expected graduation")
    details: Optional[List[str]] = Field(default_factory=list, description="Honors, relevant coursework, or GPA if applicable")

class SkillGroup(BaseModel):
    category: str = Field(description="Category name (e.g., Technical Skills, Frameworks, Developer Tools, Core Competencies)")
    skills: List[str] = Field(description="List of specific skills")

class Project(BaseModel):
    name: str = Field(description="Project title")
    technologies: Optional[List[str]] = Field(default_factory=list, description="Technologies used")
    link: Optional[str] = Field(None, description="URL or repository link")
    description: List[str] = Field(default_factory=list, description="Bullet points describing achievements and tech stack used")

class Certification(BaseModel):
    name: str = Field(description="Certification title")
    issuer: str = Field(description="Issuing organization")
    date: Optional[str] = Field(None, description="Issue date")

class TailoredCV(BaseModel):
    contact: ContactInfo
    summary: str = Field(description="Powerful 2-4 sentence executive summary tailored directly to the target role")
    work_experience: List[WorkExperience] = Field(default_factory=list)
    skills: List[SkillGroup] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    certifications: List[Certification] = Field(default_factory=list)
    ats_score_estimate: Optional[int] = Field(default=85, description="Estimated ATS match score out of 100")
    key_improvements: List[str] = Field(default_factory=list, description="Summary of key modifications and keyword additions made")

class TailorResponse(BaseModel):
    status: str
    file_id: str
    download_url: str
    tailored_cv: TailoredCV
