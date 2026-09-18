from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    company = Column(String, default="Unknown Company")
    location = Column(String, default="Remote")
    raw_text = Column(Text, nullable=False)
    extracted_skills = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    qualifications = Column(JSON, default=list)
    keywords = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="jobs")
