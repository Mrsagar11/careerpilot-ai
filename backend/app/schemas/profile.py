from pydantic import BaseModel
from typing import List, Optional

class ProfileBase(BaseModel):
    degree: Optional[str] = "B.Tech"
    branch: Optional[str] = "Computer Science & Engineering"
    graduation_year: Optional[int] = 2026
    target_role: Optional[str] = "Software Development Engineer"
    skills: Optional[List[str]] = []
    experience_level: Optional[str] = "Entry Level / Graduate"
    location_preference: Optional[str] = "Remote / Flexible"
    bio: Optional[str] = ""

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
