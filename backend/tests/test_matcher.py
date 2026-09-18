from app.services.match_service import calculate_resume_job_match

def test_resume_job_match_calculator():
    resume_skills = ["Python", "React", "SQL", "Git"]
    resume_text = "Experienced software developer in Python, React, SQL, Git."
    
    job_skills = ["Python", "React", "SQL", "Docker", "Kubernetes"]
    job_text = "We are seeking a developer proficient in Python, React, SQL, Docker, and Kubernetes."
    
    result = calculate_resume_job_match(
        resume_skills=resume_skills,
        resume_text=resume_text,
        job_skills=job_skills,
        job_text=job_text
    )
    
    assert result["match_percentage"] > 40.0
    assert "Python" in result["matching_skills"]
    assert "Docker" in result["missing_skills"]
    assert len(result["recommendations"]) >= 1
