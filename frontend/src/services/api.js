import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Auth APIs
export const registerApi = (data) => api.post('/auth/register', data);
export const loginApi = (data) => api.post('/auth/login', data);
export const getMeApi = () => api.get('/auth/me');

// Profile APIs
export const getProfileApi = () => api.get('/profile/me');
export const updateProfileApi = (data) => api.put('/profile/me', data);

// Resume APIs
export const uploadResumeApi = (formData) => api.post('/resume/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getLatestResumeApi = () => api.get('/resume/latest');
export const getResumeHistoryApi = () => api.get('/resume/history');

// Jobs APIs
export const analyzeJobApi = (data) => api.post('/jobs/analyze', data);
export const getSavedJobsApi = () => api.get('/jobs/saved');

// Matcher APIs
export const matchResumeJobApi = (data) => api.post('/matcher/match', data);

// Skills APIs
export const getSkillGapApi = () => api.get('/skills/gap-analysis');

// Roadmap APIs
export const generateRoadmapApi = (data) => api.post('/roadmap/generate', data);
export const getMyRoadmapApi = () => api.get('/roadmap/my-roadmap');
export const toggleRoadmapTaskApi = (taskId) => api.post('/roadmap/toggle-task', { task_id: taskId });

// Application Tracker APIs
export const getApplicationsApi = () => api.get('/applications/');
export const createApplicationApi = (data) => api.post('/applications/', data);
export const updateApplicationApi = (id, data) => api.put(`/applications/${id}`, data);
export const deleteApplicationApi = (id) => api.delete(`/applications/${id}`);

// Interview APIs
export const getInterviewQuestionsApi = (data) => api.post('/interview/questions', data);
export const evaluateMockAnswerApi = (data) => api.post('/interview/mock/evaluate', data);
export const startInterviewSessionApi = (role) => api.post('/interview/sessions/start', null, { params: { role } });
export const listInterviewSessionsApi = () => api.get('/interview/sessions');

// Chatbot APIs
export const sendChatMessageApi = (message) => api.post('/chatbot/chat', { message });
export const getChatHistoryApi = () => api.get('/chatbot/history');

// Analytics & Projects APIs
export const getDashboardAnalyticsApi = () => api.get('/analytics/dashboard');
export const getProjectRecommendationsApi = () => api.get('/projects/recommendations');

export default api;
