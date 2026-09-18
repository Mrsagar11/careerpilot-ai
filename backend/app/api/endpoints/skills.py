from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.resume import Resume
from app.schemas.skills import SkillGapOut, SkillCategory

router = APIRouter()

ROLE_REQUIRED_SKILLS = {
    "Software Development Engineer": {
        "Programming & Languages": ["Python", "Java", "C++", "JavaScript"],
        "Backend & APIs": ["REST API", "FastAPI", "Node.js", "Django"],
        "Databases": ["SQL", "PostgreSQL", "MongoDB"],
        "DevOps & Tools": ["Git", "Docker", "Linux", "CI/CD"]
    },
    "Frontend Engineer": {
        "Core Web": ["HTML", "CSS", "JavaScript", "TypeScript"],
        "Frameworks": ["React", "Next.js", "Tailwind CSS"],
        "Testing & Tools": ["Git", "Webpack/Vite", "Jest", "Postman"]
    }
}

@router.get("/gap-analysis", response_model=SkillGapOut)
def analyze_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    target_role = profile.target_role if profile and profile.target_role else "Software Development Engineer"
    
    # Collect all user skills from profile + resume
    user_skills_set = set([s.lower() for s in (profile.skills if profile and profile.skills else [])])
    
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
    if latest_resume and latest_resume.parsed_data.get("extracted_skills"):
        for s in latest_resume.parsed_data["extracted_skills"]:
            user_skills_set.add(s.lower())

    role_reqs = ROLE_REQUIRED_SKILLS.get(target_role, ROLE_REQUIRED_SKILLS["Software Development Engineer"])
    
    total_required = 0
    total_mastered = 0
    categories = []
    priority_list = []
    
    for cat_name, skill_list in role_reqs.items():
        mastered = []
        missing = []
        for sk in skill_list:
            total_required += 1
            if sk.lower() in user_skills_set:
                mastered.append(sk)
                total_mastered += 1
            else:
                missing.append(sk)
                priority_list.append(sk)
                
        rate = round((len(mastered) / len(skill_list)) * 100, 1) if skill_list else 0.0
        categories.append(SkillCategory(
            category_name=cat_name,
            mastered=mastered,
            missing=missing,
            completion_rate=rate
        ))
        
    overall_readiness = round((total_mastered / total_required) * 100, 1) if total_required > 0 else 0.0
    
    return SkillGapOut(
        target_role=target_role,
        overall_readiness=overall_readiness,
        total_required_skills=total_required,
        mastered_skills_count=total_mastered,
        missing_skills_count=len(priority_list),
        categories=categories,
        priority_learning_list=priority_list[:6]
    )
