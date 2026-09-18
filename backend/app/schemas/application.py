from pydantic import BaseModel
from typing import Optional, Any

class ApplicationCreate(BaseModel):
    company: str
    role: str
    status: Optional[str] = "Applied" # Wishlist, Applied, Assessment, Interview, Offer, Rejected
    applied_date: Optional[str] = None
    job_url: Optional[str] = ""
    salary_range: Optional[str] = ""
    notes: Optional[str] = ""
    interview_date: Optional[str] = ""

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[str] = None
    job_url: Optional[str] = None
    salary_range: Optional[str] = None
    notes: Optional[str] = None
    interview_date: Optional[str] = None

class ApplicationOut(BaseModel):
    id: int
    user_id: int
    company: str
    role: str
    status: str
    applied_date: Optional[str]
    job_url: Optional[str]
    salary_range: Optional[str]
    notes: Optional[str]
    interview_date: Optional[str]
    created_at: Any
    updated_at: Any

    class Config:
        from_attributes = True
