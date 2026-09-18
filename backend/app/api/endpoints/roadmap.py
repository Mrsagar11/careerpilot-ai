from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.roadmap import Roadmap
from app.models.profile import StudentProfile
from app.schemas.roadmap import RoadmapCreate, RoadmapOut, RoadmapTaskToggle
from app.services.roadmap_service import generate_learning_roadmap

router = APIRouter()

@router.post("/generate", response_model=RoadmapOut)
def generate_or_get_roadmap(
    req: RoadmapCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    target_role = req.target_role or (profile.target_role if profile else "Software Development Engineer")
    
    # Check if active roadmap exists
    existing = db.query(Roadmap).filter(Roadmap.user_id == current_user.id, Roadmap.target_role == target_role).first()
    if existing:
        # Calculate progress percentage
        total_tasks = sum(len(p["tasks"]) for p in existing.phases)
        completed_count = len(existing.completed_task_ids or [])
        progress = round((completed_count / total_tasks) * 100, 1) if total_tasks > 0 else 0.0
        
        return RoadmapOut(
            id=existing.id,
            user_id=existing.user_id,
            target_role=existing.target_role,
            title=existing.title,
            total_days=existing.total_days,
            phases=existing.phases,
            completed_task_ids=existing.completed_task_ids or [],
            progress_percentage=progress,
            created_at=existing.created_at
        )

    generated = generate_learning_roadmap(target_role=target_role, missing_skills=req.missing_skills)
    
    new_roadmap = Roadmap(
        user_id=current_user.id,
        target_role=generated["target_role"],
        title=generated["title"],
        total_days=generated["total_days"],
        phases=generated["phases"],
        completed_task_ids=[]
    )
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)

    return RoadmapOut(
        id=new_roadmap.id,
        user_id=new_roadmap.user_id,
        target_role=new_roadmap.target_role,
        title=new_roadmap.title,
        total_days=new_roadmap.total_days,
        phases=new_roadmap.phases,
        completed_task_ids=[],
        progress_percentage=0.0,
        created_at=new_roadmap.created_at
    )

@router.get("/my-roadmap", response_model=RoadmapOut)
def get_current_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = db.query(Roadmap).filter(Roadmap.user_id == current_user.id).order_by(Roadmap.id.desc()).first()
    if not roadmap:
        # Auto generate one
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        target_role = profile.target_role if profile else "Software Development Engineer"
        generated = generate_learning_roadmap(target_role=target_role)
        roadmap = Roadmap(
            user_id=current_user.id,
            target_role=generated["target_role"],
            title=generated["title"],
            total_days=generated["total_days"],
            phases=generated["phases"],
            completed_task_ids=[]
        )
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)

    total_tasks = sum(len(p["tasks"]) for p in roadmap.phases)
    completed_count = len(roadmap.completed_task_ids or [])
    progress = round((completed_count / total_tasks) * 100, 1) if total_tasks > 0 else 0.0

    return RoadmapOut(
        id=roadmap.id,
        user_id=roadmap.user_id,
        target_role=roadmap.target_role,
        title=roadmap.title,
        total_days=roadmap.total_days,
        phases=roadmap.phases,
        completed_task_ids=roadmap.completed_task_ids or [],
        progress_percentage=progress,
        created_at=roadmap.created_at
    )

@router.post("/toggle-task", response_model=RoadmapOut)
def toggle_roadmap_task(
    body: RoadmapTaskToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = db.query(Roadmap).filter(Roadmap.user_id == current_user.id).order_by(Roadmap.id.desc()).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No active roadmap found.")
        
    completed_list = list(roadmap.completed_task_ids or [])
    if body.task_id in completed_list:
        completed_list.remove(body.task_id)
    else:
        completed_list.append(body.task_id)
        
    # Mark task completion in phase task objects
    updated_phases = []
    for phase in roadmap.phases:
        phase_copy = dict(phase)
        updated_tasks = []
        for task in phase["tasks"]:
            task_copy = dict(task)
            task_copy["completed"] = (task["id"] in completed_list)
            updated_tasks.append(task_copy)
        phase_copy["tasks"] = updated_tasks
        updated_phases.append(phase_copy)

    roadmap.completed_task_ids = completed_list
    roadmap.phases = updated_phases
    
    db.commit()
    db.refresh(roadmap)

    total_tasks = sum(len(p["tasks"]) for p in roadmap.phases)
    completed_count = len(roadmap.completed_task_ids or [])
    progress = round((completed_count / total_tasks) * 100, 1) if total_tasks > 0 else 0.0

    return RoadmapOut(
        id=roadmap.id,
        user_id=roadmap.user_id,
        target_role=roadmap.target_role,
        title=roadmap.title,
        total_days=roadmap.total_days,
        phases=roadmap.phases,
        completed_task_ids=roadmap.completed_task_ids or [],
        progress_percentage=progress,
        created_at=roadmap.created_at
    )
