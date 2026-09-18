from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ResumeOut(BaseModel):
    id: int
    user_id: int
    filename: str
    score: float
    parsed_data: Dict[str, Any]
    created_at: Any

    class Config:
        from_attributes = True

class ResumeAnalysisScore(BaseModel):
    overall: float
    format_score: float
    skills_score: float
    impact_score: float

class ResumeAnalysisOut(BaseModel):
    filename: str
    raw_text_length: int
    extracted_skills: List[str]
    detected_sections: List[str]
    scores: ResumeAnalysisScore
    strengths: List[str]
    improvements: List[str]
    action_verbs_found: List[str]
    missing_critical_keywords: List[str]
