from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeOut, ResumeAnalysisOut
from app.services.pdf_parser_service import extract_text_from_pdf_bytes, parse_resume_content

router = APIRouter()

@router.post("/upload", response_model=ResumeAnalysisOut)
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    contents = await file.read()
    raw_text = extract_text_from_pdf_bytes(contents)
    
    if len(raw_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF. Ensure the file is not scanned or password-protected.")
        
    analysis = parse_resume_content(raw_text)
    
    # Save to database
    resume_record = Resume(
        user_id=current_user.id,
        filename=file.filename,
        raw_text=raw_text,
        score=analysis["scores"]["overall"],
        parsed_data=analysis
    )
    db.add(resume_record)
    db.commit()
    db.refresh(resume_record)
    
    return {
        "filename": file.filename,
        "raw_text_length": analysis["raw_text_length"],
        "extracted_skills": analysis["extracted_skills"],
        "detected_sections": analysis["detected_sections"],
        "scores": analysis["scores"],
        "strengths": analysis["strengths"],
        "improvements": analysis["improvements"],
        "action_verbs_found": analysis["action_verbs_found"],
        "missing_critical_keywords": analysis["missing_critical_keywords"]
    }

@router.get("/latest", response_model=ResumeOut)
def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet.")
    return resume

@router.get("/history", response_model=List[ResumeOut])
def get_resume_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).all()
