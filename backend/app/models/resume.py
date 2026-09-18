from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    raw_text = Column(Text, nullable=False)
    score = Column(Float, default=0.0)
    parsed_data = Column(JSON, default=dict) # JSON containing sections, extracted skills, experience, education, suggestions
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="resumes")
