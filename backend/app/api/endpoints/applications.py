from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationOut

router = APIRouter()

@router.get("/", response_model=List[ApplicationOut])
def list_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.id.desc()).all()

@router.post("/", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = Application(
        user_id=current_user.id,
        company=app_in.company,
        role=app_in.role,
        status=app_in.status or "Applied",
        applied_date=app_in.applied_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        job_url=app_in.job_url or "",
        salary_range=app_in.salary_range or "",
        notes=app_in.notes or "",
        interview_date=app_in.interview_date or ""
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app

@router.put("/{app_id}", response_model=ApplicationOut)
def update_application(
    app_id: int,
    app_in: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
        
    for field, val in app_in.model_dump(exclude_unset=True).items():
        setattr(app, field, val)
        
    db.commit()
    db.refresh(app)
    return app

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    db.delete(app)
    db.commit()
    return None
