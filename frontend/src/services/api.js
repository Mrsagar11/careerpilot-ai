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
// COMPREHENSIVE SKILLS TAXONOMY & ATS RULES
// -------------------------------------------------------------
const SKILL_TAXONOMY = [
  // Programming Languages
  "python", "java", "c++", "c#", "javascript", "typescript", "go", "golang", "rust", "php", "ruby", "kotlin", "swift", "sql", "r", "html", "css", "dart", "scala", "bash", "shell",
  // Frameworks & Libraries
  "react", "react.js", "next.js", "vue", "vue.js", "angular", "node.js", "node", "express", "express.js", "fastapi", "flask", "django", "spring boot", "spring", ".net", "dotnet", "tailwind", "tailwind css", "bootstrap", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "redux", "zustand",
  // Databases
  "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "dynamodb", "oracle", "cassandra", "firebase", "supabase",
  // DevOps & Cloud
  "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "gitlab", "ci/cd", "jenkins", "linux", "jira", "postman", "nginx", "rest api", "graphql", "microservices", "terraform", "kafka"
];

const ACTION_VERBS = [
  "built", "developed", "created", "designed", "implemented", "engineered", "optimized", "spearheaded", "architected", "automated", "reduced", "increased", "boosted", "deployed", "scaled", "lead", "integrated", "transformed", "managed", "refactored"
];

// Helper to extract text from PDF File in Browser
const extractTextFromPdfBlob = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buffer = reader.result;
        const bytes = new Uint8Array(buffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawString = decoder.decode(bytes);

        // Extract text inside PDF parentheses (text operators)
        const textTokens = [];
        const matches = rawString.match(/\(([^()]{2,})\)/g);
        if (matches) {
          matches.forEach(m => {
            const clean = m.slice(1, -1).trim();
            if (clean.length > 1) textTokens.push(clean);
          });
        }

        // Also clean raw string streams
        const cleanStream = rawString
          .replace(/stream[\s\S]*?endstream/g, (s) => {
            const inner = s.match(/\(([^()]+)\)/g);
            return inner ? inner.map(x => x.slice(1, -1)).join(' ') : ' ';
          })
          .replace(/[^a-zA-Z0-9+#.\s\-_/@%]/g, ' ');

        const finalExtracted = (textTokens.join(' ') + ' ' + cleanStream).trim();
        resolve(finalExtracted.length > 30 ? finalExtracted : rawString);
      } catch (err) {
        console.warn('PDF stream decoding fallback:', err);
        resolve('');
      }
    };
    reader.onerror = () => resolve('');
    reader.readAsArrayBuffer(file);
  });
};

// Client-side Resume Parser Engine
const parseResumeClientSide = (text, fileName) => {
  const textLower = text.toLowerCase();
  
  // 1. Extract Real Skills
  const foundSkillsSet = new Set();
  SKILL_TAXONOMY.forEach(skill => {
    // Exact word boundary regex
    let pattern;
    if (skill === 'c++') {
      pattern = /(?:^|\s|\b)c\+\+(?:$|\s|\b|[,;])/i;
    } else if (skill === 'c#') {
      pattern = /(?:^|\s|\b)c#(?:$|\s|\b|[,;])/i;
    } else if (skill === '.net') {
      pattern = /(?:^|\s)\.net(?:$|\s|[,;])/i;
    } else {
      pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    }

    if (pattern.test(textLower)) {
      let displayName = skill.length > 3 ? skill.charAt(0).toUpperCase() + skill.slice(1) : skill.toUpperCase();
      if (skill === 'react.js' || skill === 'react') displayName = 'React';
      if (skill === 'node.js' || skill === 'node') displayName = 'Node.js';
      if (skill === 'express.js' || skill === 'express') displayName = 'Express';
      if (skill === 'fastapi') displayName = 'FastAPI';
      if (skill === 'postgresql' || skill === 'postgres') displayName = 'PostgreSQL';
      if (skill === 'mongodb') displayName = 'MongoDB';
      if (skill === 'javascript') displayName = 'JavaScript';
      if (skill === 'typescript') displayName = 'TypeScript';
      if (skill === 'tailwind' || skill === 'tailwind css') displayName = 'Tailwind CSS';
      if (skill === 'rest api') displayName = 'REST API';
      foundSkillsSet.add(displayName);
    }
  });

  const extractedSkills = Array.from(foundSkillsSet).sort();

  // 2. Detect Resume Sections
  const detectedSections = [];
  const sectionKeywords = {
    "Education": ["education", "academic", "degree", "b.tech", "bachelor", "university", "college", "gpa", "cgpa"],
    "Experience": ["experience", "employment", "work history", "internship", "developer", "engineer"],
    "Projects": ["projects", "personal projects", "key projects", "academic projects", "github.com"],
    "Skills": ["skills", "technical skills", "technologies", "competencies", "programming", "tools"],
    "Certifications": ["certifications", "certificates", "courses", "achievements", "licenses"]
  };

  Object.entries(sectionKeywords).forEach(([secName, keywords]) => {
    if (keywords.some(kw => textLower.includes(kw))) {
      detectedSections.push(secName);
    }
  });

  // 3. Action Verbs
  const foundVerbs = ACTION_VERBS.filter(v => {
    const reg = new RegExp(`\\b${v}\\b`, 'i');
    return reg.test(textLower);
  });

  // 4. Quantified Metrics Check (% / numbers / metrics)
  const metricsMatches = textLower.match(/\b\d+%\b|\$\d+|\b\d+\s*(?:users|clients|requests|ms|seconds|hours|percent|increase|reduction|growth|scaled|improved)\b/g) || [];

  // 5. Compute Dynamic Scores based on Actual Content
  const formatScore = Math.min(25.0, Math.round((Math.max(1, detectedSections.length) / 4.0) * 25.0 * 10) / 10);
  const skillsScore = Math.min(35.0, Math.round((Math.max(1, extractedSkills.length) / 10.0) * 35.0 * 10) / 10);
  const impactScore = Math.min(40.0, Math.round(((Math.min(5, foundVerbs.length) / 5.0) * 20.0 + (Math.min(2, metricsMatches.length) / 2.0) * 20.0) * 10) / 10);
  
  let overall = Math.round((formatScore + skillsScore + impactScore) * 10) / 10;
  overall = Math.min(100.0, Math.max(25.0, overall));

  // 6. Strengths and Improvements
  const strengths = [];
  const improvements = [];

  if (extractedSkills.length >= 6) {
    strengths.push(`Identified ${extractedSkills.length} relevant technical skills in your resume.`);
  } else if (extractedSkills.length > 0) {
    improvements.push(`Only ${extractedSkills.length} technical skills detected. Consider adding more framework and database keywords.`);
  } else {
    improvements.push('No technical skills detected. Ensure your technical skills section uses standard keywords.');
  }

  if (detectedSections.includes('Projects') || detectedSections.includes('Experience')) {
    strengths.push('Detected clear Project & Experience sections for ATS parsing.');
  } else {
    improvements.push('Add clear "Projects" or "Experience" section headers.');
  }

  if (foundVerbs.length >= 3) {
    strengths.push(`Good action verb usage (${foundVerbs.slice(0, 3).join(', ')}).`);
  } else {
    improvements.push('Start bullet points with strong action verbs (Developed, Architected, Engineered, Optimized).');
  }

  if (metricsMatches.length >= 1) {
    strengths.push('Contains quantifiable impact metrics and measurable results.');
  } else {
    improvements.push('Quantify project bullet points with metrics (e.g., "Reduced response latency by 30%").');
  }

  const criticalCheck = ["Git", "SQL", "Docker", "REST API"];
  const missingCritical = criticalCheck.filter(k => !foundSkillsSet.has(k));

  return {
    filename: fileName || 'Resume.pdf',
    raw_text_length: text.length,
    raw_text: text,
    extracted_skills: extractedSkills,
    detected_sections: detectedSections,
    scores: {
      overall,
      format_score: formatScore,
      skills_score: skillsScore,
      impact_score: impactScore
    },
    strengths,
    improvements,
    action_verbs_found: foundVerbs,
    missing_critical_keywords: missingCritical
  };
};

// -------------------------------------------------------------
// LOCALSTORAGE HELPER FUNCTIONS
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

// -------------------------------------------------------------
// API METHODS (TRY REAL BACKEND -> DYNAMIC CLIENT-SIDE FALLBACK)
// -------------------------------------------------------------

export const registerApi = async (data) => {
  try {
    return await api.post('/auth/register', data);
  } catch (err) {
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
    const profile = getLocalData('profile', {
      id: 1,
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduation_year: 2026,
      target_role: 'Software Development Engineer',
      skills: ['Python', 'JavaScript', 'React', 'SQL', 'Git'],
      experience_level: 'Entry Level / Graduate',
      location_preference: 'Remote / Flexible',
      bio: 'Aspiring software developer passionate about building modern web applications.'
    });
    return { data: profile };
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
    console.info('Backend unreachable, parsing uploaded PDF dynamically in browser.');
    const file = formData.get('file');
    const rawText = file ? await extractTextFromPdfBlob(file) : '';
    const analysis = parseResumeContentClientSide(rawText || (file ? file.name : ''), file?.name || 'Resume.pdf');
    
    // Save to local storage for use across the entire application
    setLocalData('latest_resume', {
      id: Date.now(),
      filename: analysis.filename,
      raw_text: analysis.raw_text,
      score: analysis.scores.overall,
      parsed_data: analysis
    });

    // Also update user profile skills with extracted skills if available
    if (analysis.extracted_skills.length > 0) {
      const currentProfile = getLocalData('profile', {});
      const mergedSkills = Array.from(new Set([...(currentProfile.skills || []), ...analysis.extracted_skills]));
      currentProfile.skills = mergedSkills;
      setLocalData('profile', currentProfile);
    }

    return { data: analysis };
  }
};

function parseResumeContentClientSide(rawText, fileName) {
  return parseResumeClientSide(rawText, fileName);
}

export const getLatestResumeApi = async () => {
  try {
    return await api.get('/resume/latest');
  } catch (err) {
    const resume = getLocalData('latest_resume', null);
    if (resume) {
      return { data: resume };
    }
    // Return initial default if none uploaded yet
    const initial = parseResumeClientSide("Education B.Tech CSE 2026 Skills Python JavaScript React SQL Git Projects Built full-stack web application with React and SQL", "Sample_Resume.pdf");
    return {
      data: {
        id: 1,
        filename: initial.filename,
        raw_text: initial.raw_text,
        score: initial.scores.overall,
        parsed_data: initial
      }
    };
  }
};

export const getResumeHistoryApi = async () => {
  try {
    return await api.get('/resume/history');
  } catch (err) {
    const latest = getLocalData('latest_resume', null);
    return { data: latest ? [latest] : [] };
  }
};

export const analyzeJobApi = async (data) => {
  try {
    return await api.post('/jobs/analyze', data);
  } catch (err) {
    const textLower = (data.raw_text || '').toLowerCase();
    
    // Dynamically extract skills from JD
    const foundSkills = new Set();
    SKILL_TAXONOMY.forEach(skill => {
      const reg = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (reg.test(textLower)) {
        foundSkills.add(skill.length > 3 ? skill.charAt(0).toUpperCase() + skill.slice(1) : skill.toUpperCase());
      }
    });

    const lines = (data.raw_text || '').split('\n').map(l => l.trim()).filter(l => l.length > 15);
    const responsibilities = lines.filter(l => /develop|build|design|collaborate|manage|maintain|work/i.test(l)).slice(0, 4);
    const qualifications = lines.filter(l => /degree|experience|proficient|knowledge|ability|skills|b\.tech/i.test(l)).slice(0, 4);

    const analyzed = {
      id: Date.now(),
      title: data.title || 'Software Engineer',
      company: data.company || 'Tech Corp',
      location: data.location || 'Remote',
      raw_text: data.raw_text,
      extracted_skills: Array.from(foundSkills).length > 0 ? Array.from(foundSkills).sort() : ['React', 'JavaScript', 'Python', 'SQL', 'Git'],
      responsibilities: responsibilities.length > 0 ? responsibilities : [
        'Design and develop high-performance software modules.',
        'Collaborate with cross-functional teams to deliver clean code.',
        'Write automated unit and integration tests.'
      ],
      qualifications: qualifications.length > 0 ? qualifications : [
        'Degree in Computer Science, Engineering, or related discipline.',
        'Hands-on experience with modern software development frameworks.',
        'Strong problem-solving and analytical thinking.'
      ],
      keywords: Array.from(foundSkills).concat(['Teamwork', 'Agile', 'Problem Solving'])
    };

    const jobs = getLocalData('jobs', []);
    jobs.unshift(analyzed);
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
    // 1. Get Resume Skills
    let resumeSkills = [];
    let resumeText = '';
    const latestResume = getLocalData('latest_resume', null);
    if (latestResume && latestResume.parsed_data) {
      resumeSkills = latestResume.parsed_data.extracted_skills || [];
      resumeText = latestResume.raw_text || '';
    } else {
      const profile = getLocalData('profile', {});
      resumeSkills = profile.skills || ['Python', 'JavaScript', 'SQL'];
    }

    // 2. Get Job Skills
    let jobSkills = [];
    let jobText = data.job_text || '';
    if (data.job_id) {
      const jobs = getLocalData('jobs', []);
      const matchedJob = jobs.find(j => j.id === data.job_id);
      if (matchedJob) {
        jobSkills = matchedJob.extracted_skills || [];
        jobText = matchedJob.raw_text || '';
      }
    }
    if (jobSkills.length === 0 && jobText) {
      const textLower = jobText.toLowerCase();
      SKILL_TAXONOMY.forEach(s => {
        const reg = new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (reg.test(textLower)) {
          jobSkills.push(s.length > 3 ? s.charAt(0).toUpperCase() + s.slice(1) : s.toUpperCase());
        }
      });
      jobSkills = Array.from(new Set(jobSkills));
    }
    if (jobSkills.length === 0) {
      jobSkills = ['Python', 'React', 'SQL', 'Docker', 'Git'];
    }

    // 3. Compare
    const resumeSkillsLower = new Set(resumeSkills.map(s => s.toLowerCase()));
    const matching = jobSkills.filter(s => resumeSkillsLower.has(s.toLowerCase()));
    const missing = jobSkills.filter(s => !resumeSkillsLower.has(s.toLowerCase()));

    const matchRatio = jobSkills.length > 0 ? (matching.length / jobSkills.length) : 0.5;
    let matchPct = Math.round(matchRatio * 100 * 10) / 10;
    matchPct = Math.min(98.0, Math.max(20.0, matchPct));

    const recommendations = [];
    if (missing.length > 0) {
      recommendations.push(`Add key missing technical skills to your resume: ${missing.slice(0, 4).join(', ')}.`);
    }
    if (matchPct < 70) {
      recommendations.push('Tailor your project descriptions to mirror the terminology found in the job requirements.');
    }
    recommendations.push('Quantify the business impact of your engineering projects with metrics.');

    return {
      data: {
        match_percentage: matchPct,
        explanation: `Your resume matches ${matching.length} out of ${jobSkills.length} core technical requirements for this position.`,
        matching_skills: matching,
        missing_skills: missing,
        ats_keyword_gaps: missing.slice(0, 5),
        recommendations
      }
    };
  }
};

export const getSkillGapApi = async () => {
  try {
    return await api.get('/skills/gap-analysis');
  } catch (err) {
    const profile = getLocalData('profile', {});
    const targetRole = profile.target_role || 'Software Development Engineer';

    // Get user skills from profile + uploaded resume
    const userSkillsSet = new Set((profile.skills || []).map(s => s.toLowerCase()));
    const latestResume = getLocalData('latest_resume', null);
    if (latestResume && latestResume.parsed_data && latestResume.parsed_data.extracted_skills) {
      latestResume.parsed_data.extracted_skills.forEach(s => userSkillsSet.add(s.toLowerCase()));
    }

    const roleTemplates = {
      'Software Development Engineer': {
        'Programming & Languages': ['Python', 'Java', 'C++', 'JavaScript'],
        'Backend & APIs': ['REST API', 'FastAPI', 'Node.js', 'Django'],
        'Databases': ['SQL', 'PostgreSQL', 'MongoDB'],
        'DevOps & Tools': ['Git', 'Docker', 'Linux', 'CI/CD']
      },
      'Frontend Engineer': {
        'Core Web': ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
        'Frameworks & Libraries': ['React', 'Next.js', 'Tailwind CSS', 'Redux'],
        'Testing & Tools': ['Git', 'Vite', 'Jest', 'Postman']
      }
    };

    const categoriesConfig = roleTemplates[targetRole] || roleTemplates['Software Development Engineer'];
    let totalReq = 0;
    let totalMastered = 0;
    const categories = [];
    const priorityLearning = [];

    Object.entries(categoriesConfig).forEach(([catName, skillsList]) => {
      const mastered = [];
      const missing = [];
      skillsList.forEach(sk => {
        totalReq++;
        if (userSkillsSet.has(sk.toLowerCase())) {
          mastered.push(sk);
          totalMastered++;
        } else {
          missing.push(sk);
          priorityLearning.push(sk);
        }
      });
      const compRate = skillsList.length > 0 ? Math.round((mastered.length / skillsList.length) * 100) : 0;
      categories.push({
        category_name: catName,
        mastered,
        missing,
        completion_rate: compRate
      });
    });

    const overallReadiness = totalReq > 0 ? Math.round((totalMastered / totalReq) * 100) : 50;

    return {
      data: {
        target_role: targetRole,
        overall_readiness: overallReadiness,
        total_required_skills: totalReq,
        mastered_skills_count: totalMastered,
        missing_skills_count: priorityLearning.length,
        categories,
        priority_learning_list: priorityLearning.slice(0, 6)
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
    return { data: getLocalData('applications', [
      { id: 1, company: 'Google', role: 'Software Engineer', status: 'Interview', applied_date: '2026-09-10', interview_date: '2026-10-05', job_url: 'https://careers.google.com', notes: 'Round 1 DSA scheduled' },
      { id: 2, company: 'Microsoft', role: 'Frontend Engineer', status: 'Assessment', applied_date: '2026-09-12', job_url: 'https://careers.microsoft.com', notes: 'Completed online assessment' },
      { id: 3, company: 'Amazon', role: 'SDE-1', status: 'Applied', applied_date: '2026-09-15', job_url: 'https://amazon.jobs', notes: 'Referred by college alumni' }
    ]) };
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

    const latestResume = getLocalData('latest_resume', null);
    const atsScore = latestResume?.parsed_data?.scores?.overall || latestResume?.score || 78.5;

    return {
      data: {
        ats_score: atsScore,
        total_applications: apps.length || 3,
        application_status_counts: apps.length > 0 ? counts : { Applied: 1, Assessment: 1, Interview: 1, Offer: 0, Rejected: 0, Wishlist: 0 },
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
          { id: 1, type: 'Resume Analyzed', detail: `ATS score: ${atsScore}/100`, time: 'Just now' },
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
    const profile = getLocalData('profile', {});
    const targetRole = profile.target_role || 'Software Development Engineer';

    return {
      data: {
        target_role: targetRole,
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
