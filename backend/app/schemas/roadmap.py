from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TaskItem(BaseModel):
    id: str
    title: str
    description: str
    resource_url: Optional[str] = None
    estimated_hours: int = 5
    completed: bool = False

class RoadmapPhase(BaseModel):
    phase_number: int # 1 for 30 days, 2 for 60 days, 3 for 90 days
    phase_title: str
    duration_days: int
    focus_skills: List[str]
    tasks: List[TaskItem]

class RoadmapCreate(BaseModel):
    target_role: Optional[str] = None
    missing_skills: Optional[List[str]] = None

class RoadmapTaskToggle(BaseModel):
    task_id: str

class RoadmapOut(BaseModel):
    id: int
    user_id: int
    target_role: str
    title: str
    total_days: int
    phases: List[RoadmapPhase]
    completed_task_ids: List[str]
    progress_percentage: float
    created_at: Any

    class Config:
        from_attributes = True
