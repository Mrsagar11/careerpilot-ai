from pydantic import BaseModel
from typing import List, Dict, Any

class SkillCategory(BaseModel):
    category_name: str
    mastered: List[str]
    missing: List[str]
    completion_rate: float

class SkillGapOut(BaseModel):
    target_role: str
    overall_readiness: float
    total_required_skills: int
    mastered_skills_count: int
    missing_skills_count: int
    categories: List[SkillCategory]
    priority_learning_list: List[str]
