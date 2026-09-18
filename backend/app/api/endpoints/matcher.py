from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobDescription
from app.models.profile import StudentProfile
from app.schemas.matcher import MatchRequest, MatchResultOut
from app.services.match_service import calculate_resume_job_match, extract_skills_from_text

router = APIRouter()

@router.post("/match", response_model=MatchResultOut)
def match_resume_with_job(
    match_req: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Fetch Resume text and skills
    resume_skills = []
    resume_text = ""
    
    if match_req.resume_id:
        resume = db.query(Resume).filter(Resume.id == match_req.resume_id, Resume.user_id == current_user.id).first()
        if resume:
            resume_text = resume.raw_text
            resume_skills = resume.parsed_data.get("extracted_skills", [])
    if not resume_text:
        # Fallback to latest resume or profile skills
        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
        if latest_resume:
            resume_text = latest_resume.raw_text
            resume_skills = latest_resume.parsed_data.get("extracted_skills", [])
        else:
            profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
            resume_skills = profile.skills if profile else ["Python", "JavaScript", "SQL"]
            resume_text = " ".join(resume_skills)

    # 2. Fetch Job text and skills
    job_skills = []
    job_text = ""
    if match_req.job_id:
        job = db.query(JobDescription).filter(JobDescription.id == match_req.job_id, JobDescription.user_id == current_user.id).first()
        if job:
            job_text = job.raw_text
            job_skills = job.extracted_skills
    elif match_req.job_text:
        job_text = match_req.job_text
        job_skills = extract_skills_from_text(job_text)
    else:
        # Fallback to latest job
        latest_job = db.query(JobDescription).filter(JobDescription.user_id == current_user.id).order_by(JobDescription.id.desc()).first()
        if latest_job:
            job_text = latest_job.raw_text
            job_skills = latest_job.extracted_skills
        else:
            job_text = "Software engineer required with Python, React, PostgreSQL, Docker, Git experience."
            job_skills = ["Python", "React", "PostgreSQL", "Docker", "Git"]

    match_result = calculate_resume_job_match(
        resume_skills=resume_skills,
        resume_text=resume_text,
        job_skills=job_skills,
        job_text=job_text
    )
    
    return match_result
