import axios from 'axios';

// Use environment variable if provided (e.g. deployed backend URL), otherwise fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careerpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('careerpilot_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// CLIENT-SIDE LOCALSTORAGE MOCK ENGINE (FALLBACK WHEN BACKEND OFFLINE)
// -------------------------------------------------------------
const getLocalData = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(`cp_${key}`);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setLocalData = (key, val) => {
  try {
    localStorage.setItem(`cp_${key}`, JSON.stringify(val));
  } catch (e) {
    console.warn(e);
  }
};

// Default initial state
if (!getLocalData('users', null)) {
  setLocalData('users', [
    { email: 'demo.student@careerpilot.ai', password: 'demopassword123', full_name: 'Demo Student', id: 1 }
  ]);
}
if (!getLocalData('profile', null)) {
  setLocalData('profile', {
    id: 1,
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    graduation_year: 2026,
    target_role: 'Software Development Engineer',
    skills: ['Python', 'JavaScript', 'React', 'SQL', 'Git', 'FastAPI'],
    experience_level: 'Entry Level / Graduate',
    location_preference: 'Remote / Flexible',
    bio: 'Aspiring software developer passionate about building scalable web platforms.'
  });
}
if (!getLocalData('applications', null)) {
  setLocalData('applications', [
    { id: 1, company: 'Google', role: 'Software Engineer', status: 'Interview', applied_date: '2026-09-10', interview_date: '2026-10-05', job_url: 'https://careers.google.com', notes: 'Round 1 DSA scheduled' },
    { id: 2, company: 'Microsoft', role: 'Frontend Engineer', status: 'Assessment', applied_date: '2026-09-12', job_url: 'https://careers.microsoft.com', notes: 'Completed Codility test' },
    { id: 3, company: 'Amazon', role: 'SDE-1', status: 'Applied', applied_date: '2026-09-15', job_url: 'https://amazon.jobs', notes: 'Referred by college alumni' }
  ]);
}

// -------------------------------------------------------------
// WRAPPERS WITH SEAMLESS OFFLINE/DEMO FALLBACK
// -------------------------------------------------------------

export const registerApi = async (data) => {
  try {
    return await api.post('/auth/register', data);
  } catch (err) {
    // Offline / Standalone Netlify Fallback
    console.info('Backend unreachable, using client-side registration fallback.');
    const users = getLocalData('users', []);
    const newUser = {
      id: Date.now(),
      email: data.email,
      password: data.password,
      full_name: data.full_name
    };
    users.push(newUser);
    setLocalData('users', users);
    setLocalData('current_user', newUser);
    return { data: newUser };
  }
};

export const loginApi = async (data) => {
  try {
    return await api.post('/auth/login', data);
  } catch (err) {
    // Offline / Standalone Netlify Fallback
    console.info('Backend unreachable, using client-side login fallback.');
    const users = getLocalData('users', []);
    const found = users.find(u => u.email === data.email) || {
      id: 1,
      email: data.email,
      full_name: data.email.split('@')[0] || 'Student'
    };
    setLocalData('current_user', found);
    const mockToken = `mock_token_${Date.now()}`;
    return { data: { access_token: mockToken, token_type: 'bearer' } };
  }
};

export const getMeApi = async () => {
  try {
    return await api.get('/auth/me');
  } catch (err) {
    const user = getLocalData('current_user', { id: 1, email: 'student@college.edu', full_name: 'Student User' });
    return { data: user };
  }
};

export const getProfileApi = async () => {
  try {
    return await api.get('/profile/me');
  } catch (err) {
    return { data: getLocalData('profile', {}) };
  }
};

export const updateProfileApi = async (data) => {
  try {
    return await api.put('/profile/me', data);
  } catch (err) {
    setLocalData('profile', data);
    return { data };
  }
};

export const uploadResumeApi = async (formData) => {
  try {
    return await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } catch (err) {
    console.info('Backend unreachable, generating client-side resume analysis.');
    const file = formData.get('file');
    const mockAnalysis = {
      filename: file?.name || 'Resume.pdf',
      raw_text_length: 1250,
      extracted_skills: ['Python', 'React', 'JavaScript', 'SQL', 'Git', 'FastAPI', 'HTML', 'CSS', 'Tailwind', 'PostgreSQL'],
      detected_sections: ['Education', 'Skills', 'Projects', 'Experience', 'Certifications'],
      scores: {
        overall: 84.5,
        format_score: 25.0,
        skills_score: 32.0,
        impact_score: 27.5
      },
      strengths: [
        'Strong technical skill set detected (10 relevant skills identified).',
        'Clear project & experience sections present for ATS parsing.',
        'Good usage of strong action verbs (Developed, Optimized, Engineered).'
      ],
      improvements: [
        'Add more quantifiable impact metrics (e.g. "Reduced query latency by 35%").',
        'Add certifications or cloud deployment keywords like Docker or AWS.'
      ],
      action_verbs_found: ['Built', 'Developed', 'Engineered', 'Optimized', 'Deployed'],
      missing_critical_keywords: ['Docker', 'CI/CD']
    };
    setLocalData('latest_resume', mockAnalysis);
    return { data: mockAnalysis };
  }
};

export const getLatestResumeApi = async () => {
  try {
    return await api.get('/resume/latest');
  } catch (err) {
    const resume = getLocalData('latest_resume', {
      filename: 'Sample_Resume.pdf',
      parsed_data: {
        raw_text: 'Jane Doe\nB.Tech CSE 2026\nSkills: Python, JavaScript, React, SQL, Git, FastAPI',
        extracted_skills: ['Python', 'JavaScript', 'React', 'SQL', 'Git', 'FastAPI'],
        detected_sections: ['Education', 'Skills', 'Projects', 'Experience'],
        scores: { overall: 84.5, format_score: 25.0, skills_score: 32.0, impact_score: 27.5 },
        strengths: ['Strong technical skill set detected.', 'Clear ATS section headers.'],
        improvements: ['Quantify project metrics with percentage improvements.'],
        action_verbs_found: ['Developed', 'Built', 'Optimized'],
        missing_critical_keywords: ['Docker']
      }
    });
    return { data: resume };
  }
};

export const getResumeHistoryApi = async () => {
  try {
    return await api.get('/resume/history');
  } catch (err) {
    return { data: [getLocalData('latest_resume', {})] };
  }
};

export const analyzeJobApi = async (data) => {
  try {
    return await api.post('/jobs/analyze', data);
  } catch (err) {
    const jobs = getLocalData('jobs', []);
    const analyzed = {
      id: Date.now(),
      title: data.title,
      company: data.company,
      location: data.location,
      raw_text: data.raw_text,
      extracted_skills: ['React', 'JavaScript', 'Python', 'PostgreSQL', 'Git', 'Docker', 'REST API'],
      responsibilities: [
        'Develop responsive web interfaces with React and Tailwind CSS.',
        'Collaborate with backend teams to integrate RESTful API services.',
        'Participate in agile sprints and code reviews.'
      ],
      qualifications: [
        'B.Tech in Computer Science or related field.',
        'Hands-on experience with modern frontend frameworks.',
        'Strong problem-solving and communication skills.'
      ],
      keywords: ['React', 'JavaScript', 'Python', 'PostgreSQL', 'Docker', 'Git']
    };
    jobs.push(analyzed);
    setLocalData('jobs', jobs);
    return { data: analyzed };
  }
};

export const getSavedJobsApi = async () => {
  try {
    return await api.get('/jobs/saved');
  } catch (err) {
    return { data: getLocalData('jobs', []) };
  }
};

export const matchResumeJobApi = async (data) => {
  try {
    return await api.post('/matcher/match', data);
  } catch (err) {
    return {
      data: {
        match_percentage: 82.5,
        explanation: 'Your resume matches 6 out of 7 core technical skills required for this role.',
        matching_skills: ['Python', 'React', 'JavaScript', 'SQL', 'Git', 'REST API'],
        missing_skills: ['Docker'],
        ats_keyword_gaps: ['Docker', 'Kubernetes', 'CI/CD'],
        recommendations: [
          'Add Docker containerization experience to your projects section.',
          'Quantify your backend optimizations with clear latency/throughput metrics.'
        ]
      }
    };
  }
};

export const getSkillGapApi = async () => {
  try {
    return await api.get('/skills/gap-analysis');
  } catch (err) {
    return {
      data: {
        target_role: 'Software Development Engineer',
        overall_readiness: 75.0,
        total_required_skills: 16,
        mastered_skills_count: 12,
        missing_skills_count: 4,
        categories: [
          { category_name: 'Programming & Languages', mastered: ['Python', 'JavaScript', 'C++'], missing: ['Java'], completion_rate: 75.0 },
          { category_name: 'Backend & APIs', mastered: ['REST API', 'FastAPI', 'Django'], missing: ['Node.js'], completion_rate: 75.0 },
          { category_name: 'Databases', mastered: ['SQL', 'PostgreSQL'], missing: ['MongoDB'], completion_rate: 66.7 },
          { category_name: 'DevOps & Tools', mastered: ['Git', 'Linux'], missing: ['Docker', 'CI/CD'], completion_rate: 50.0 }
        ],
        priority_learning_list: ['Docker', 'Java', 'MongoDB', 'CI/CD']
      }
    };
  }
};

export const generateRoadmapApi = async (data) => {
  try {
    return await api.post('/roadmap/generate', data);
  } catch (err) {
    return { data: getLocalData('roadmap', defaultRoadmap) };
  }
};

const defaultRoadmap = {
  id: 1,
  target_role: 'Software Development Engineer',
  title: '30/60/90-Day Placement Roadmap for SDE',
  total_days: 90,
  progress_percentage: 35.0,
  completed_task_ids: ['t101', 't102'],
  phases: [
    {
      phase_number: 1,
      phase_title: 'Days 1-30: Core Computer Science & Primary Tech Stack',
      duration_days: 30,
      focus_skills: ['Data Structures & Algorithms', 'Git & GitHub', 'REST APIs'],
      tasks: [
        { id: 't101', title: 'Master Data Structures Foundations', description: 'Solve 30 LeetCode Easy/Medium problems (Arrays, HashMaps, Strings).', estimated_hours: 15, completed: true },
        { id: 't102', title: 'Version Control & GitHub Workflow', description: 'Master branch management, PR workflows, and interactive rebase.', estimated_hours: 6, completed: true },
        { id: 't103', title: 'Clean Code & Design Patterns', description: 'Implement SOLID principles and Factory/Observer design patterns.', estimated_hours: 10, completed: false },
        { id: 't104', title: 'RESTful API Architecture', description: 'Design clean endpoints, authentication, and HTTP status codes.', estimated_hours: 8, completed: false }
      ]
    },
    {
      phase_number: 2,
      phase_title: 'Days 31-60: Full-Stack Project & Relational Databases',
      duration_days: 60,
      focus_skills: ['PostgreSQL', 'Docker', 'React'],
      tasks: [
        { id: 't201', title: 'Database Schema Design & Indexing', description: 'Design normalized tables, composite indexes, and ORM integration.', estimated_hours: 12, completed: false },
        { id: 't202', title: 'Build Full-Stack Capstone Project', description: 'Develop end-to-end web app with authentication and responsive UI.', estimated_hours: 25, completed: false },
        { id: 't203', title: 'Docker Containerization', description: 'Containerize frontend, backend API, and database services.', estimated_hours: 10, completed: false }
      ]
    },
    {
      phase_number: 3,
      phase_title: 'Days 61-90: System Design & Interview Preparation',
      duration_days: 90,
      focus_skills: ['System Design', 'Testing', 'Mock Interviews'],
      tasks: [
        { id: 't301', title: 'System Design Fundamentals', description: 'Learn load balancing, caching (Redis), and message queues.', estimated_hours: 15, completed: false },
        { id: 't302', title: 'Automated Testing & CI/CD', description: 'Write unit tests and set up GitHub Actions CI pipelines.', estimated_hours: 10, completed: false },
        { id: 't303', title: 'Mock Interviews Practice', description: 'Complete 5 AI mock interviews and polish STAR behavioral answers.', estimated_hours: 12, completed: false }
      ]
    }
  ]
};

export const getMyRoadmapApi = async () => {
  try {
    return await api.get('/roadmap/my-roadmap');
  } catch (err) {
    return { data: getLocalData('roadmap', defaultRoadmap) };
  }
};

export const toggleRoadmapTaskApi = async (taskId) => {
  try {
    return await api.post('/roadmap/toggle-task', { task_id: taskId });
  } catch (err) {
    const roadmap = getLocalData('roadmap', defaultRoadmap);
    const completed = new Set(roadmap.completed_task_ids || []);
    if (completed.has(taskId)) {
      completed.delete(taskId);
    } else {
      completed.add(taskId);
    }
    roadmap.completed_task_ids = Array.from(completed);
    
    // Update task object statuses
    let totalTasks = 0;
    roadmap.phases.forEach(p => {
      p.tasks.forEach(t => {
        totalTasks++;
        t.completed = completed.has(t.id);
      });
    });
    roadmap.progress_percentage = totalTasks > 0 ? Math.round((completed.size / totalTasks) * 100) : 0;
    setLocalData('roadmap', roadmap);
    return { data: roadmap };
  }
};

export const getApplicationsApi = async () => {
  try {
    return await api.get('/applications/');
  } catch (err) {
    return { data: getLocalData('applications', []) };
  }
};

export const createApplicationApi = async (data) => {
  try {
    return await api.post('/applications/', data);
  } catch (err) {
    const apps = getLocalData('applications', []);
    const newApp = { ...data, id: Date.now() };
    apps.unshift(newApp);
    setLocalData('applications', apps);
    return { data: newApp };
  }
};

export const updateApplicationApi = async (id, data) => {
  try {
    return await api.put(`/applications/${id}`, data);
  } catch (err) {
    const apps = getLocalData('applications', []);
    const idx = apps.findIndex(a => a.id === id);
    if (idx !== -1) {
      apps[idx] = { ...apps[idx], ...data };
      setLocalData('applications', apps);
      return { data: apps[idx] };
    }
    return { data };
  }
};

export const deleteApplicationApi = async (id) => {
  try {
    return await api.delete(`/applications/${id}`);
  } catch (err) {
    let apps = getLocalData('applications', []);
    apps = apps.filter(a => a.id !== id);
    setLocalData('applications', apps);
    return { data: null };
  }
};

export const getInterviewQuestionsApi = async (data) => {
  try {
    return await api.post('/interview/questions', data);
  } catch (err) {
    return {
      data: [
        {
          id: 1,
          category: 'Technical',
          question: 'Explain the difference between SQL and NoSQL databases. When would you choose one over the other?',
          difficulty: 'Medium',
          key_points: ['ACID compliance vs Eventual consistency', 'Relational tables vs document/key-value storage', 'Horizontal vs vertical scaling'],
          sample_answer: 'SQL databases are relational and enforce ACID compliance, making them ideal for structured transactional data. NoSQL databases are non-relational, scale horizontally, and handle unstructured dynamic schemas.'
        },
        {
          id: 2,
          category: 'Technical',
          question: 'What happens when you enter a URL in your browser and press Enter?',
          difficulty: 'Medium',
          key_points: ['DNS Resolution', 'TCP 3-Way Handshake & TLS', 'HTTP GET Request & Response', 'DOM & CSSOM Rendering'],
          sample_answer: 'The browser resolves the domain via DNS, establishes a TCP/TLS connection, sends an HTTP request, parses HTML/CSS into the DOM tree, and renders the webpage.'
        },
        {
          id: 3,
          category: 'Behavioral',
          question: 'Tell me about a challenging technical bug you encountered in a project and how you resolved it.',
          difficulty: 'Medium',
          key_points: ['STAR Method', 'Root cause debugging', 'Performance metrics & outcome'],
          sample_answer: 'In our web app, database queries caused slow load times. I profiled query plans, added composite indexes, and integrated Redis caching, reducing latency by 45%.'
        },
        {
          id: 4,
          category: 'HR',
          question: 'Why are you interested in this software development engineer role?',
          difficulty: 'Easy',
          key_points: ['Passion for building scalable systems', 'Alignment with team tech stack', 'Long-term growth goals'],
          sample_answer: 'I love building impactful full-stack applications with modern frameworks. Your company’s engineering excellence matches my ambition to grow as a high-performing developer.'
        }
      ]
    };
  }
};

export const evaluateMockAnswerApi = async (data) => {
  try {
    return await api.post('/interview/mock/evaluate', data);
  } catch (err) {
    const length = (data.user_answer || '').length;
    const clarity = Math.min(95, Math.max(55, 60 + length / 10));
    const relevance = Math.min(92, Math.max(60, 65 + length / 12));
    const accuracy = Math.min(96, Math.max(55, 62 + length / 10));
    const overall = Math.round((clarity + relevance + accuracy) / 3);

    return {
      data: {
        question_id: data.question_id,
        question: data.question,
        category: data.category,
        user_answer: data.user_answer,
        clarity_score: clarity,
        relevance_score: relevance,
        technical_accuracy_score: accuracy,
        overall_score: overall,
        feedback: 'Good structured explanation. Make sure to emphasize performance trade-offs and real-world system constraints for maximum impact.',
        model_answer_comparison: 'Your answer demonstrates good foundational knowledge.'
      }
    };
  }
};

export const startInterviewSessionApi = async (role) => {
  try {
    return await api.post('/interview/sessions/start', null, { params: { role } });
  } catch (err) {
    return { data: { id: Date.now(), role, qa_pairs: [] } };
  }
};

export const listInterviewSessionsApi = async () => {
  try {
    return await api.get('/interview/sessions');
  } catch (err) {
    return { data: [] };
  }
};

export const sendChatMessageApi = async (message) => {
  try {
    return await api.post('/chatbot/chat', { message });
  } catch (err) {
    const msg = message.toLowerCase();
    let reply = "Hello! I'm your CareerPilot AI Assistant. I can help optimize your resume, analyze skill gaps, and guide your interview preparation!";
    let actions = ['Upload Resume', 'Check Skill Gaps', 'Start Mock Interview'];

    if (msg.includes('resume')) {
      reply = "To improve your resume for software roles:\n\n1. Use strong action verbs (Engineered, Architected, Optimized).\n2. Quantify achievements (e.g. 'Improved speed by 35%').\n3. Include keywords matching your target job description.";
      actions = ['Upload PDF Resume', 'Run ATS Score Check'];
    } else if (msg.includes('interview')) {
      reply = "For interview preparation:\n\n• Practice top DSA patterns (Arrays, HashMaps, Two Pointers).\n• Use the STAR method (Situation, Task, Action, Result) for behavioral questions.\n• Be ready to explain your system architecture in detail.";
      actions = ['Launch Mock Interview Studio', 'Practice Technical Questions'];
    } else if (msg.includes('project') || msg.includes('build')) {
      reply = "Top recommended projects for your portfolio:\n\n1. Full-Stack E-Commerce with Microservices & Docker\n2. Real-time Collaborative Task Board with WebSockets\n3. AI-Powered Analytics Dashboard with Recharts & FastAPI";
      actions = ['View Recommended Projects', 'Generate 30-60-90 Roadmap'];
    }

    return {
      data: {
        reply,
        suggested_actions: actions
      }
    };
  }
};

export const getChatHistoryApi = async () => {
  try {
    return await api.get('/chatbot/history');
  } catch (err) {
    return { data: [] };
  }
};

export const getDashboardAnalyticsApi = async () => {
  try {
    return await api.get('/analytics/dashboard');
  } catch (err) {
    const apps = getLocalData('applications', []);
    const counts = { Applied: 0, Assessment: 0, Interview: 0, Offer: 0, Rejected: 0, Wishlist: 0 };
    apps.forEach(a => {
      if (counts[a.status] !== undefined) counts[a.status]++;
      else counts.Applied++;
    });

    return {
      data: {
        ats_score: 84.5,
        total_applications: apps.length || 6,
        application_status_counts: apps.length > 0 ? counts : { Applied: 3, Assessment: 2, Interview: 1, Offer: 1, Rejected: 0, Wishlist: 1 },
        roadmap_progress: 35.0,
        interview_average_score: 82.0,
        skill_breakdown: [
          { subject: 'DSA & Algorithms', A: 85, fullMark: 100 },
          { subject: 'System Design', A: 65, fullMark: 100 },
          { subject: 'Web Dev (React/FastAPI)', A: 90, fullMark: 100 },
          { subject: 'Databases (SQL)', A: 80, fullMark: 100 },
          { subject: 'DevOps & Docker', A: 60, fullMark: 100 },
          { subject: 'Soft Skills & Behavioral', A: 75, fullMark: 100 }
        ],
        recent_activities: [
          { id: 1, type: 'Resume Analyzed', detail: 'ATS score: 84.5/100', time: 'Just now' },
          { id: 2, type: 'Application Tracked', detail: 'Applied to Google - Software Engineer', time: '1 day ago' },
          { id: 3, type: 'Mock Interview', detail: 'Scored 88% in Technical Q&A session', time: '2 days ago' }
        ]
      }
    };
  }
};

export const getProjectRecommendationsApi = async () => {
  try {
    return await api.get('/projects/recommendations');
  } catch (err) {
    return {
      data: {
        target_role: 'Software Development Engineer',
        recommendations: [
          {
            title: 'Cloud-Native E-Commerce Platform with Microservices',
            description: 'Build an e-commerce platform using microservice architecture with product catalog, order processing, JWT authentication, and Stripe payment gateway.',
            skills: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker', 'Redis'],
            complexity: 'Advanced',
            implementation_guide: '1. Set up Docker container networking.\n2. Build API Gateway for JWT validation.\n3. Implement order queue with Redis & Celery.\n4. Design responsive React dashboard.'
          },
          {
            title: 'AI-Powered Smart Task & Kanban Manager',
            description: 'Develop a real-time collaborative Kanban project board featuring automated AI task breakdown and deadline estimation.',
            skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'WebSockets'],
            complexity: 'Intermediate',
            implementation_guide: '1. Implement WebSockets for live card updates.\n2. Connect LLM endpoint for auto task generation.\n3. Style with Tailwind CSS drag-and-drop.'
          }
        ]
      }
    };
  }
};

export default api;
