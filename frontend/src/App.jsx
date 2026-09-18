import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ResumePage from './pages/ResumePage';
import JobAnalyzerPage from './pages/JobAnalyzerPage';
import MatcherPage from './pages/MatcherPage';
import SkillGapPage from './pages/SkillGapPage';
import RoadmapPage from './pages/RoadmapPage';
import ApplicationsPage from './pages/ApplicationsPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import MockInterviewPage from './pages/MockInterviewPage';
import ChatbotPage from './pages/ChatbotPage';
import ProjectsPage from './pages/ProjectsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected SaaS App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/jobs" element={<JobAnalyzerPage />} />
            <Route path="/matcher" element={<MatcherPage />} />
            <Route path="/skills" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/interview" element={<InterviewPrepPage />} />
            <Route path="/mock-interview" element={<MockInterviewPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
