from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import StudentProfile
from app.schemas.profile import ProfileUpdate, ProfileOut

router = APIRouter()

@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id, skills=["Python", "JavaScript", "SQL"])
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        
    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
        
    db.commit()
    db.refresh(profile)
    return profile
