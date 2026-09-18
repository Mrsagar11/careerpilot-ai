import re
import io
from pypdf import PdfReader
from typing import Dict, Any, List

SKILL_TAXONOMY = [
    # Programming Languages
    "python", "java", "c++", "c#", "javascript", "typescript", "go", "golang", "rust", "php", "ruby", "kotlin", "swift", "sql", "r", "html", "css",
    # Frameworks & Libraries
    "react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "express", "fastapi", "flask", "django", "spring boot", "dot net", ".net", "tailwind", "bootstrap", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras",
    # Databases
    "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "dynamodb", "oracle", "cassandra",
    # DevOps & Tools
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "gitlab", "ci/cd", "jenkins", "linux", "bash", "jira", "postman", "nginx", "rest api", "graphql", "microservices"
]

ACTION_VERBS = [
    "built", "developed", "created", "designed", "implemented", "engineered", "optimized", "spearheaded", "architected", "automated", "reduced", "increased", "boosted", "deployed", "scaled", "lead", "integrated", "transformed", "managed", "refactored"
]

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text.strip()
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def parse_resume_content(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    
    # Extract skills
    found_skills = set()
    for skill in SKILL_TAXONOMY:
        # Use boundary matching for accurate skills detection
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Normalize display name
            found_skills.add(skill.title() if len(skill) > 3 else skill.upper())
            
    # Detect Sections
    sections = []
    section_keywords = {
        "Education": ["education", "academic", "degree", "university", "college"],
        "Experience": ["experience", "employment", "work history", "internship", "professional experience"],
        "Projects": ["projects", "personal projects", "key projects", "academic projects"],
        "Skills": ["skills", "technical skills", "technologies", "competencies", "tools"],
        "Certifications": ["certifications", "certificates", "courses", "achievements"]
    }
    
    for section_name, keywords in section_keywords.items():
        if any(re.search(r'\b' + re.escape(kw) + r'\b', text_lower) for kw in keywords):
            sections.append(section_name)
            
    # Found action verbs
    found_verbs = [verb for verb in ACTION_VERBS if re.search(r'\b' + re.escape(verb) + r'\b', text_lower)]
    
    # Quantified achievements check (contains numbers, %, $, metrics)
    quantified_matches = re.findall(r'\b\d+%\b|\$\d+|\b\d+\s*(?:users|clients|requests|ms|seconds|hours|percent|increase|reduction|growth)\b', text_lower)
    
    # Calculate ATS & Resume Scores
    # 1. Format score based on detected core sections (max 25)
    format_score = min(25.0, (len(sections) / 4.0) * 25.0)
    
    # 2. Skills density score (max 35)
    skills_score = min(35.0, (len(found_skills) / 10.0) * 35.0)
    
    # 3. Action verbs & Impact score (max 40)
    impact_score = min(40.0, (len(found_verbs) / 5.0) * 20.0 + (len(quantified_matches) / 2.0) * 20.0)
    
    overall_score = round(format_score + skills_score + impact_score, 1)
    overall_score = min(100.0, max(20.0, overall_score))
    
    # Generate actionable improvements
    strengths = []
    improvements = []
    
    if len(found_skills) >= 7:
        strengths.append(f"Strong technical skill set detected ({len(found_skills)} relevant skills identified).")
    else:
        improvements.append("Expand technical skills section with relevant framework, database, and tool keywords.")
        
    if "Projects" in sections or "Experience" in sections:
        strengths.append("Clear project/experience sections present for ATS parsing.")
    else:
        improvements.append("Add clear 'Projects' or 'Experience' section headers so ATS software can parse your history.")
        
    if len(found_verbs) >= 4:
        strengths.append("Good usage of strong action verbs (e.g. " + ", ".join(found_verbs[:3]) + ").")
    else:
        improvements.append("Use more strong action verbs (e.g. Developed, Engineered, Optimized, Architected) at the start of bullet points.")
        
    if len(quantified_matches) >= 2:
        strengths.append("Contains measurable outcomes and metric quantification.")
    else:
        improvements.append("Quantify your achievements with numbers or percentages (e.g., 'Improved API response time by 35%').")

    missing_keywords = []
    critical_check = ["Git", "SQL", "Docker", "REST API", "Testing"]
    for kw in critical_check:
        if kw not in found_skills:
            missing_keywords.append(kw)

    return {
        "raw_text_length": len(text),
        "extracted_skills": sorted(list(found_skills)),
        "detected_sections": sections,
        "scores": {
            "overall": overall_score,
            "format_score": round(format_score, 1),
            "skills_score": round(skills_score, 1),
            "impact_score": round(impact_score, 1)
        },
        "strengths": strengths,
        "improvements": improvements,
        "action_verbs_found": sorted(list(set(found_verbs))),
        "missing_critical_keywords": missing_keywords
    }
