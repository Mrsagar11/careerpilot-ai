from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.job import JobDescription
from app.schemas.job import JobCreate, JobOut
from app.services.match_service import extract_jd_details

router = APIRouter()

@router.post("/analyze", response_model=JobOut)
def analyze_and_save_job(
    job_in: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if len(job_in.raw_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Job description text is too short.")
        
    extracted = extract_jd_details(job_in.raw_text)
    
    job = JobDescription(
        user_id=current_user.id,
        title=job_in.title,
        company=job_in.company or "Unknown Company",
        location=job_in.location or "Remote",
        raw_text=job_in.raw_text,
        extracted_skills=extracted["extracted_skills"],
        responsibilities=extracted["responsibilities"],
        qualifications=extracted["qualifications"],
        keywords=extracted["keywords"]
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/saved", response_model=List[JobOut])
def list_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(JobDescription).filter(JobDescription.user_id == current_user.id).order_by(JobDescription.id.desc()).all()

@router.get("/{job_id}", response_model=JobOut)
def get_job_by_id(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(JobDescription).filter(JobDescription.id == job_id, JobDescription.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")
    return job
