from typing import List, Dict, Any

ROLE_TEMPLATES = {
    "Software Development Engineer": {
        "phase1": {
            "title": "Days 1-30: Core Computer Science & Primary Tech Stack Mastery",
            "skills": ["Data Structures & Algorithms", "Git & GitHub", "Object-Oriented Programming", "REST APIs"],
            "tasks": [
                {"id": "t101", "title": "Master Data Structures & Algorithm Foundations", "description": "Solve 30 LeetCode Easy/Medium problems focusing on Arrays, HashMaps, Strings, and Linked Lists.", "estimated_hours": 15},
                {"id": "t102", "title": "Version Control & GitHub Workflow", "description": "Learn git branching, PR workflows, interactive rebase, and build a GitHub profile.", "estimated_hours": 6},
                {"id": "t103", "title": "Clean Code & Object-Oriented Design", "description": "Implement SOLID principles, Factory & Observer design patterns in your primary programming language.", "estimated_hours": 10},
                {"id": "t104", "title": "RESTful API Architecture & Postman", "description": "Design clean API endpoints, handle authentication, status codes, and HTTP verbs.", "estimated_hours": 8}
            ]
        },
        "phase2": {
            "title": "Days 31-60: Full-Stack Project & Relational Database Mastery",
            "skills": ["PostgreSQL/MySQL", "System Architecture", "Docker", "Frontend/Backend Framework"],
            "tasks": [
                {"id": "t201", "title": "Database Schema Design & Query Optimization", "description": "Design normalized tables, indexes, transactions, joins, and ORM integration.", "estimated_hours": 12},
                {"id": "t202", "title": "Build a Complete Capstone Full-Stack Project", "description": "Develop an end-to-end web application with authentication, CRUD operations, and responsive UI.", "estimated_hours": 25},
                {"id": "t203", "title": "Docker Containerization", "description": "Containerize your frontend, backend API, and database using Docker & Docker Compose.", "estimated_hours": 10}
            ]
        },
        "phase3": {
            "title": "Days 61-90: System Design, Testing & Interview Preparation",
            "skills": ["System Design Basics", "Unit & Integration Testing", "CI/CD Pipelines", "Mock Interviews"],
            "tasks": [
                {"id": "t301", "title": "System Design Fundamentals", "description": "Learn load balancing, caching (Redis), database sharding, and message queues.", "estimated_hours": 15},
                {"id": "t302", "title": "Automated Testing & CI/CD", "description": "Write pytest/Jest tests and set up GitHub Actions for continuous integration.", "estimated_hours": 10},
                {"id": "t303", "title": "Mock Interviews & Placement Polish", "description": "Conduct 5 mock interviews, practice STAR method behavioral answers, and polish your resume.", "estimated_hours": 12}
            ]
        }
    },
    "Frontend Engineer": {
        "phase1": {
            "title": "Days 1-30: JavaScript / TypeScript & React Mastery",
            "skills": ["JavaScript ES6+", "TypeScript", "React Hooks", "Tailwind CSS"],
            "tasks": [
                {"id": "fe101", "title": "Deep Dive JavaScript ES6+ & Async/Await", "description": "Master closures, event loop, promises, async/await, and DOM manipulation.", "estimated_hours": 12},
                {"id": "fe102", "title": "React Component Architecture & Hooks", "description": "Master useState, useEffect, useMemo, useCallback, and custom hooks.", "estimated_hours": 15},
                {"id": "fe103", "title": "Tailwind CSS & Responsive Layouts", "description": "Build mobile-first, highly responsive user interface components.", "estimated_hours": 10}
            ]
        },
        "phase2": {
            "title": "Days 31-60: State Management & Advanced Frontend Tools",
            "skills": ["Redux Toolkit / Zustand", "TypeScript in React", "Next.js / SSR", "Formik / React Hook Form"],
            "tasks": [
                {"id": "fe201", "title": "TypeScript Integration in React Apps", "description": "Add strict prop typing, generic components, and API response typing.", "estimated_hours": 12},
                {"id": "fe202", "title": "State Management with Zustand / Redux", "description": "Manage complex global state, async thunks, and persistent store sync.", "estimated_hours": 12},
                {"id": "fe203", "title": "Next.js & Server Side Rendering", "description": "Build dynamic web apps with SSR, SSG, and file-system routing.", "estimated_hours": 15}
            ]
        },
        "phase3": {
            "title": "Days 61-90: Performance, Testing & Frontend Portfolio",
            "skills": ["Web Vitals Optimization", "Jest & React Testing Library", "Accessibility (a11y)", "Deployment"],
            "tasks": [
                {"id": "fe301", "title": "Frontend Testing with Jest & RTL", "description": "Write unit and component integration tests with user-event simulation.", "estimated_hours": 12},
                {"id": "fe302", "title": "Web Performance & Lighthouse Audit", "description": "Optimize bundle sizes, lazy loading, image assets, and web vitals.", "estimated_hours": 10},
                {"id": "fe303", "title": "Deploy Portfolio & Showcase Projects", "description": "Deploy applications on Vercel/Netlify with custom domains and live demos.", "estimated_hours": 10}
            ]
        }
    }
}

def generate_learning_roadmap(target_role: str, missing_skills: List[str] = None) -> Dict[str, Any]:
    role_key = target_role if target_role in ROLE_TEMPLATES else "Software Development Engineer"
    template = ROLE_TEMPLATES[role_key]
    
    phases = []
    for p_num, (p_key, p_data) in enumerate(template.items(), 1):
        tasks = []
        for t in p_data["tasks"]:
            tasks.append({
                "id": t["id"],
                "title": t["title"],
                "description": t["description"],
                "resource_url": "https://developer.mozilla.org" if "fe" in t["id"] else "https://roadmap.sh",
                "estimated_hours": t["estimated_hours"],
                "completed": False
            })
            
        phases.append({
            "phase_number": p_num,
            "phase_title": p_data["title"],
            "duration_days": 30 * p_num,
            "focus_skills": p_data["skills"],
            "tasks": tasks
        })
        
    return {
        "target_role": target_role or "Software Development Engineer",
        "title": f"30/60/90-Day Placement Roadmap for {target_role or 'SDE'}",
        "total_days": 90,
        "phases": phases,
        "completed_task_ids": []
    }
