import re
from typing import Dict, Any, List
from app.services.pdf_parser_service import SKILL_TAXONOMY

def extract_skills_from_text(text: str) -> List[str]:
    text_lower = text.lower()
    found = set()
    for skill in SKILL_TAXONOMY:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill.title() if len(skill) > 3 else skill.upper())
    return sorted(list(found))

def extract_jd_details(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    skills = extract_skills_from_text(text)
    
    # Extract responsibilities line by line
    lines = [line.strip("-•* ").strip() for line in text.split("\n") if line.strip()]
    responsibilities = []
    qualifications = []
    
    current_section = None
    for line in lines:
        lower_line = line.lower()
        if any(h in lower_line for h in ["responsibility", "responsibilities", "what you will do", "role overview"]):
            current_section = "resp"
            continue
        elif any(h in lower_line for h in ["requirement", "qualification", "what you need", "who you are"]):
            current_section = "qual"
            continue
            
        if current_section == "resp" and len(line) > 15:
            responsibilities.append(line)
        elif current_section == "qual" and len(line) > 15:
            qualifications.append(line)
            
    if not responsibilities:
        responsibilities = [l for l in lines if len(l) > 20][:5]
    if not qualifications:
        qualifications = [l for l in lines if any(k in l.lower() for k in ["degree", "experience", "knowledge", "ability", "proficient"])][:5]

    keywords = skills + ["Teamwork", "Agile", "Problem Solving", "Communication", "Git"]
    
    return {
        "extracted_skills": skills,
        "responsibilities": responsibilities[:6],
        "qualifications": qualifications[:6],
        "keywords": list(set(keywords))
    }

def calculate_resume_job_match(
    resume_skills: List[str],
    resume_text: str,
    job_skills: List[str],
    job_text: str
) -> Dict[str, Any]:
    
    resume_skills_set = set([s.lower() for s in resume_skills])
    job_skills_set = set([s.lower() for s in job_skills])
    
    if not job_skills_set:
        job_skills_set = set([s.lower() for s in extract_skills_from_text(job_text)])
    if not resume_skills_set:
        resume_skills_set = set([s.lower() for s in extract_skills_from_text(resume_text)])

    matching_skills = [s for s in job_skills if s.lower() in resume_skills_set]
    missing_skills = [s for s in job_skills if s.lower() not in resume_skills_set]

    # Calculate skill overlap ratio
    if job_skills_set:
        skill_match_ratio = len(matching_skills) / len(job_skills_set)
    else:
        skill_match_ratio = 0.5

    # Text keyword jaccard similarity
    words_resume = set(re.findall(r'\w+', resume_text.lower()))
    words_job = set(re.findall(r'\w+', job_text.lower()))
    stop_words = {"the", "and", "a", "to", "in", "is", "for", "with", "of", "on", "or", "as", "an", "at", "by", "be", "this", "that", "you", "we", "our", "are"}
    
    words_resume -= stop_words
    words_job -= stop_words
    
    if words_job:
        keyword_overlap = len(words_resume.intersection(words_job)) / len(words_job)
    else:
        keyword_overlap = 0.5
        
    final_percentage = round((skill_match_ratio * 0.7 + keyword_overlap * 0.3) * 100, 1)
    final_percentage = max(15.0, min(98.0, final_percentage))

    # Explanation and recommendations
    explanation = f"Your resume matches {len(matching_skills)} out of {len(job_skills_set)} core technical skills required for this job posting."
    
    recommendations = []
    if missing_skills:
        recommendations.append(f"Add key missing technologies to your profile/resume: {', '.join(missing_skills[:4])}.")
    if final_percentage < 70:
        recommendations.append("Tailor your project descriptions to highlight exact keywords present in the job description.")
    recommendations.append("Ensure your target role in your student profile aligns with the role title.")

    return {
        "match_percentage": final_percentage,
        "explanation": explanation,
        "matching_skills": sorted(matching_skills),
        "missing_skills": sorted(missing_skills),
        "ats_keyword_gaps": missing_skills[:5],
        "recommendations": recommendations
    }
