from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MatchRequest(BaseModel):
    resume_id: Optional[int] = None
    job_id: Optional[int] = None
    job_text: Optional[str] = None
    target_role: Optional[str] = None

class MatchResultOut(BaseModel):
    match_percentage: float
    explanation: str
    matching_skills: List[str]
    missing_skills: List[str]
    ats_keyword_gaps: List[str]
    recommendations: List[str]
