from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    degree = Column(String, default="B.Tech")
    branch = Column(String, default="Computer Science & Engineering")
    graduation_year = Column(Integer, default=2026)
    target_role = Column(String, default="Software Development Engineer")
    skills = Column(JSON, default=list) # List of skill strings
    experience_level = Column(String, default="Entry Level / Graduate")
    location_preference = Column(String, default="Remote / Flexible")
    bio = Column(String, default="")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")
