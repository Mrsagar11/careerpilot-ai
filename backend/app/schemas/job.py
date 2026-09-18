from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class JobCreate(BaseModel):
    title: str
    company: Optional[str] = "Company"
    location: Optional[str] = "Remote"
    raw_text: str

class JobOut(BaseModel):
    id: int
    user_id: int
    title: str
    company: str
    location: str
    raw_text: str
    extracted_skills: List[str]
    responsibilities: List[str]
    qualifications: List[str]
    keywords: List[str]
    created_at: Any

    class Config:
        from_attributes = True
