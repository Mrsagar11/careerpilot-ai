from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    mode = Column(String, default="Technical & Behavioral")
    overall_score = Column(Float, default=0.0)
    feedback_summary = Column(String, default="")
    qa_pairs = Column(JSON, default=list) # List of {question, answer, evaluation, score}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="interview_sessions")
