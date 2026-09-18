from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.interview import InterviewSession
from app.schemas.interview import (
    QuestionsRequest,
    QuestionItem,
    MockAnswerRequest,
    QnAPair,
    SessionOut
)
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/questions", response_model=List[QuestionItem])
def get_interview_questions(
    req: QuestionsRequest,
    current_user: User = Depends(get_current_user)
):
    questions = ai_service.generate_interview_questions(role=req.role or "Software Engineer", count=req.count or 5)
    return questions

@router.post("/mock/evaluate", response_model=QnAPair)
def evaluate_single_mock_answer(
    req: MockAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    evaluation = ai_service.evaluate_mock_answer(
        question=req.question,
        category=req.category,
        user_answer=req.user_answer
    )
    
    qna_pair = QnAPair(
        question_id=req.question_id,
        question=req.question,
        category=req.category,
        user_answer=req.user_answer,
        clarity_score=evaluation["clarity_score"],
        relevance_score=evaluation["relevance_score"],
        technical_accuracy_score=evaluation["technical_accuracy_score"],
        overall_score=evaluation["overall_score"],
        feedback=evaluation["feedback"],
        model_answer_comparison=evaluation["model_answer_comparison"]
    )
    
    if req.session_id:
        session = db.query(InterviewSession).filter(InterviewSession.id == req.session_id, InterviewSession.user_id == current_user.id).first()
        if session:
            qa_list = list(session.qa_pairs or [])
            qa_list.append(qna_pair.model_dump())
            session.qa_pairs = qa_list
            
            # Recalculate session overall score
            scores = [q["overall_score"] for q in qa_list]
            session.overall_score = round(sum(scores) / len(scores), 1) if scores else 0.0
            db.commit()
            
    return qna_pair

@router.post("/sessions/start", response_model=SessionOut)
def start_interview_session(
    role: str = "Software Engineer",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = InterviewSession(
        user_id=current_user.id,
        role=role,
        mode="Technical & Behavioral",
        overall_score=0.0,
        feedback_summary="Session started",
        qa_pairs=[]
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions", response_model=List[SessionOut])
def list_interview_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.id.desc()).all()
