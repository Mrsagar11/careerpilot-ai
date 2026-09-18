from fastapi import APIRouter
from app.api.endpoints import (
    auth,
    profile,
    resume,
    jobs,
    matcher,
    skills,
    roadmap,
    applications,
    interview,
    chatbot,
    analytics,
    projects
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile.router, prefix="/profile", tags=["Student Profile"])
api_router.include_router(resume.router, prefix="/resume", tags=["AI Resume Analyzer"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Job Description Analyzer"])
api_router.include_router(matcher.router, prefix="/matcher", tags=["AI Resume-Job Matcher"])
api_router.include_router(skills.router, prefix="/skills", tags=["Skill Gap Analyzer"])
api_router.include_router(roadmap.router, prefix="/roadmap", tags=["AI Learning Roadmap"])
api_router.include_router(applications.router, prefix="/applications", tags=["Job Application Tracker"])
api_router.include_router(interview.router, prefix="/interview", tags=["AI Mock Interview"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["AI Career Chatbot"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Dashboard Analytics"])
api_router.include_router(projects.router, prefix="/projects", tags=["Project Recommendations"])
