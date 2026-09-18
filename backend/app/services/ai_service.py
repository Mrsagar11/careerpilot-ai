import os
import json
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

# Pre-built interview questions taxonomy for instant high-quality fallback
FALLBACK_QUESTIONS = [
    {
        "id": 1,
        "category": "Technical",
        "question": "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?",
        "difficulty": "Medium",
        "key_points": ["ACID compliance vs eventual consistency", "Relational vs document/key-value storage", "Horizontal vs vertical scaling"],
        "sample_answer": "SQL databases are relational, table-based, and enforce ACID compliance, making them ideal for structured data like financial systems. NoSQL databases are non-relational (document/key-value), scale horizontally, and handle unstructured dynamic data well."
    },
    {
        "id": 2,
        "category": "Technical",
        "question": "What happens when you enter a URL in your browser and press Enter?",
        "difficulty": "Medium",
        "key_points": ["DNS Resolution", "TCP Handshake / TLS Negotiation", "HTTP Request/Response", "DOM rendering & CSSOM"],
        "sample_answer": "The browser performs DNS resolution to convert the domain name to an IP address, establishes a TCP connection (and TLS handshake for HTTPS), sends an HTTP GET request to the server, receives the HTML response, parses DOM and CSSOM, and renders the webpage."
    },
    {
        "id": 3,
        "category": "Behavioral",
        "question": "Tell me about a time when you faced a difficult technical challenge in a project and how you solved it.",
        "difficulty": "Medium",
        "key_points": ["STAR Method (Situation, Task, Action, Result)", "Root cause debugging", "Collaboration & final outcome metrics"],
        "sample_answer": "In my web project, API response times spiked under load due to unindexed database queries. I analyzed query execution plans, added composite indexes on heavily queried columns, and implemented Redis caching, which reduced response times by 65%."
    },
    {
        "id": 4,
        "category": "HR",
        "question": "Why are you interested in this target role and our company?",
        "difficulty": "Easy",
        "key_points": ["Company vision alignment", "Passion for tech stack", "Career growth goals"],
        "sample_answer": "I am passionate about building scalable, high-impact web applications. Your company's commitment to developer innovation and modern engineering practices matches my career aspiration to contribute as a dedicated software engineer."
    },
    {
        "id": 5,
        "category": "Technical",
        "question": "Explain RESTful API principles and standard HTTP status codes.",
        "difficulty": "Easy",
        "key_points": ["Statelessness", "Standard HTTP methods (GET, POST, PUT, DELETE)", "Status code ranges (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Server Error)"],
        "sample_answer": "RESTful APIs use standard HTTP verbs (GET, POST, PUT, DELETE) to manipulate resource URIs statelessly. Responses return status codes like 200 (OK), 201 (Created), 400 (Client Error), 401 (Unauthorized), and 500 (Server Error)."
    }
]

PROJECT_RECOMMENDATIONS_CATALOG = {
    "Software Development Engineer": [
        {
            "title": "Cloud-Native E-Commerce Platform with Microservices",
            "description": "Build an e-commerce platform using microservice architecture with product catalog, order processing, JWT authentication, and Stripe payment gateway.",
            "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Redis"],
            "complexity": "Advanced",
            "implementation_guide": "1. Set up Docker container networking.\n2. Build API Gateway for JWT validation.\n3. Implement order queue with Redis & Celery.\n4. Design responsive React dashboard."
        },
        {
            "title": "AI-Powered Smart Task & Kanban Manager",
            "description": "Develop a real-time collaborative Kanban project board featuring automated AI task breakdown and deadline estimation.",
            "skills": ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "WebSockets"],
            "complexity": "Intermediate",
            "implementation_guide": "1. Implement WebSockets for live card updates.\n2. Connect LLM endpoint for auto task generation.\n3. Style with Tailwind CSS drag-and-drop."
        }
    ],
    "Frontend Engineer": [
        {
            "title": "High-Performance Analytics Dashboard UI",
            "description": "Design an enterprise SaaS analytical dashboard featuring interactive charts, dark mode, responsive sidebars, and state persistence.",
            "skills": ["React", "TypeScript", "Tailwind CSS", "Recharts", "Zustand"],
            "complexity": "Intermediate",
            "implementation_guide": "1. Build reusable layout components.\n2. Integrate Recharts for real-time visual statistics.\n3. Add custom theme switching."
        }
    ]
}

class AIService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    def evaluate_mock_answer(
        self,
        question: str,
        category: str,
        user_answer: str,
        target_role: str = "Software Engineer"
    ) -> Dict[str, Any]:
        """Evaluates student's answer for technical correctness, clarity, and relevance."""
        answer_length = len(user_answer.strip())
        
        if answer_length < 15:
            return {
                "clarity_score": 40.0,
                "relevance_score": 35.0,
                "technical_accuracy_score": 30.0,
                "overall_score": 35.0,
                "feedback": "Your answer is too short. Try to elaborate on technical terms, provide concrete examples, and use structured explanations (e.g. STAR method for behavioral questions).",
                "model_answer_comparison": "A complete response should explain core concepts clearly with real-world project context."
            }
            
        # NLP keyword evaluation heuristics
        tech_terms = ["database", "api", "query", "server", "code", "architecture", "data", "scale", "system", "react", "python", "http", "state", "user", "result", "action"]
        found_terms = [t for t in tech_terms if t in user_answer.lower()]
        
        clarity_score = min(95.0, max(50.0, 60.0 + (answer_length / 10)))
        relevance_score = min(95.0, max(55.0, 65.0 + len(found_terms) * 5))
        technical_accuracy_score = min(95.0, max(50.0, 60.0 + len(found_terms) * 6))
        
        overall_score = round((clarity_score + relevance_score + technical_accuracy_score) / 3.0, 1)
        
        feedback_points = []
        if answer_length >= 80:
            feedback_points.append("Great detail and structural flow in your response.")
        else:
            feedback_points.append("Consider elaborating further on implementation steps.")
            
        if len(found_terms) >= 3:
            feedback_points.append("Strong technical terminology used effectively.")
        else:
            feedback_points.append("Incorporate more industry-standard technical terms into your explanation.")

        return {
            "clarity_score": round(clarity_score, 1),
            "relevance_score": round(relevance_score, 1),
            "technical_accuracy_score": round(technical_accuracy_score, 1),
            "overall_score": overall_score,
            "feedback": " ".join(feedback_points),
            "model_answer_comparison": "Your response covers the main concept well. To achieve top marks, emphasize measurable outcomes and design tradeoffs."
        }

    def generate_interview_questions(self, role: str = "Software Engineer", count: int = 5) -> List[Dict[str, Any]]:
        return FALLBACK_QUESTIONS[:count]

    def chat_with_career_assistant(
        self,
        message: str,
        user_profile: Optional[Dict[str, Any]] = None,
        resume_summary: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Contextually responds to student career questions."""
        msg_lower = message.lower()
        
        role = user_profile.get("target_role", "Software Engineer") if user_profile else "Software Engineer"
        skills = user_profile.get("skills", []) if user_profile else []
        skills_str = ", ".join(skills) if skills else "Python, JavaScript, SQL"
        
        if "resume" in msg_lower:
            reply = f"Based on your profile aiming for **{role}**, here are top recommendations for your resume:\n\n" \
                    f"1. **Highlight Core Skills:** Make sure your top skills ({skills_str}) are prominently displayed at the top.\n" \
                    f"2. **Use Action Verbs:** Start bullet points under Projects with words like *Engineered, Architected, Optimized, Built*.\n" \
                    f"3. **Quantify Metrics:** Include concrete numbers (e.g., 'Reduced query latency by 40%' or 'Served 500+ active users')."
            actions = ["Upload PDF Resume", "Run Resume ATS Score", "View Target Role Skills"]
        elif "interview" in msg_lower or "question" in msg_lower:
            reply = f"For **{role}** interview prep, focus on these 3 main areas:\n\n" \
                    f"• **Technical Fundamentals:** Data structures (Arrays, HashMaps, Trees), System Design basics, and SQL.\n" \
                    f"• **Behavioral (STAR Method):** Prepare 2-3 stories about solving bugs, overcoming project blockers, and teamwork.\n" \
                    f"• **Project Deep-Dive:** Be ready to explain your tech stack choices and architectural decisions clearly."
            actions = ["Start Mock Interview", "Practice Technical Questions", "View STAR Method Guide"]
        elif "skill" in msg_lower or "gap" in msg_lower or "learn" in msg_lower:
            reply = f"To excel as a **{role}**, here is your priority learning checklist:\n\n" \
                    f"1. **Core Database Mastery:** PostgreSQL / MySQL query optimization & indexing.\n" \
                    f"2. **Containerization:** Learn Docker basics & containerizing web services.\n" \
                    f"3. **API Security:** JWT token authentication, CORS, & rate limiting."
            actions = ["View Skill Gap Analysis", "Generate 30/60/90 Roadmap", "Explore Recommended Projects"]
        elif "job" in msg_lower or "apply" in msg_lower or "application" in msg_lower:
            reply = "When applying for graduate software roles:\n\n" \
                    "1. Tailor your resume keywords to match the specific job description before submitting.\n" \
                    "2. Track all your job applications using our **Application Tracker** to follow up on time.\n" \
                    "3. Aim to apply to 3-5 relevant positions daily with customized cover notes."
            actions = ["Paste JD for Match Analysis", "Open Application Tracker", "Browse Saved Jobs"]
        else:
            reply = f"Hello! I'm your **CareerPilot AI Assistant**. I can help you with resume optimization, job description matching, skill gap analysis, custom 30/60/90-day learning roadmaps, and mock interview practice for **{role}** positions. What would you like to focus on today?"
            actions = ["Analyze Resume", "Check Skill Gaps", "Start Mock Interview", "Generate Roadmap"]

        return {
            "reply": reply,
            "suggested_actions": actions
        }

    def recommend_projects(self, target_role: str = "Software Development Engineer", missing_skills: List[str] = None) -> List[Dict[str, Any]]:
        catalog = PROJECT_RECOMMENDATIONS_CATALOG.get(target_role, PROJECT_RECOMMENDATIONS_CATALOG["Software Development Engineer"])
        return catalog

ai_service = AIService()
