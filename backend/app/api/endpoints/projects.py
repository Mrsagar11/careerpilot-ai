from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import StudentProfile
from app.services.ai_service import ai_service

router = APIRouter()

@router.get("/recommendations")
def get_project_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    target_role = profile.target_role if profile else "Software Development Engineer"
    
    projects = ai_service.recommend_projects(target_role=target_role)
    return {
        "target_role": target_role,
        "recommendations": projects
    }
