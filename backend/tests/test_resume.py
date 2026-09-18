from app.services.pdf_parser_service import parse_resume_content

def test_resume_parser_scoring():
    sample_text = """
    Jane Doe
    Email: jane.doe@example.com
    
    Education
    B.Tech in Computer Science Engineering, 2026
    
    Skills
    Python, JavaScript, React, PostgreSQL, Docker, Git, REST API, Linux
    
    Experience & Projects
    Full-Stack Developer Intern
    - Developed scalable web application using React and Python FastAPI.
    - Optimized database queries, reducing response times by 40%.
    - Engineered Docker container pipelines for deployment.
    """
    
    parsed = parse_resume_content(sample_text)
    assert parsed["scores"]["overall"] >= 60.0
    assert "Python" in parsed["extracted_skills"]
    assert "React" in parsed["extracted_skills"]
    assert "Education" in parsed["detected_sections"]
    assert len(parsed["action_verbs_found"]) >= 2
