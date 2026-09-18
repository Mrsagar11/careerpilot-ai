from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chatbot import ChatMessage
from app.models.profile import StudentProfile
from app.schemas.chatbot import ChatRequest, ChatResponseOut
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponseOut)
def chat_with_assistant(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
        
    # Log user message
    user_msg = ChatMessage(user_id=current_user.id, sender="user", content=req.message)
    db.add(user_msg)
    
    # Get user profile context
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    profile_dict = {
        "target_role": profile.target_role if profile else "Software Engineer",
        "skills": profile.skills if profile else []
    }
    
    response_data = ai_service.chat_with_career_assistant(
        message=req.message,
        user_profile=profile_dict
    )
    
    # Log assistant reply
    bot_msg = ChatMessage(user_id=current_user.id, sender="assistant", content=response_data["reply"])
    db.add(bot_msg)
    db.commit()
    
    return response_data

@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.id.asc()).all()
    return [{"id": m.id, "sender": m.sender, "content": m.content, "created_at": m.created_at} for m in messages]
