import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  GitCompare,
  TrendingUp,
  MapPin,
  Kanban,
  HelpCircle,
  Video,
  MessageSquare,
  FolderGit2,
  User,
  Sparkles
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Resume Analyzer', path: '/resume', icon: FileText, badge: 'ATS' },
  { name: 'Job Description Analyzer', path: '/jobs', icon: Briefcase },
  { name: 'Resume–Job Matcher', path: '/matcher', icon: GitCompare, badge: 'AI' },
  { name: 'Skill Gap Analyzer', path: '/skills', icon: TrendingUp },
  { name: '30-60-90 Roadmap', path: '/roadmap', icon: MapPin },
  { name: 'Application Tracker', path: '/applications', icon: Kanban },
  { name: 'AI Interview Prep', path: '/interview', icon: HelpCircle },
  { name: 'AI Mock Interview', path: '/mock-interview', icon: Video, badge: 'Live' },
  { name: 'AI Career Chatbot', path: '/chatbot', icon: MessageSquare },
  { name: 'Project Recommendations', path: '/projects', icon: FolderGit2 },
  { name: 'Student Profile', path: '/profile', icon: User },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 hidden lg:block overflow-y-auto p-4 space-y-6">
      <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Main Menu
      </div>
      
      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition group ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800/80 px-3">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/60 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Placement Status</span>
          </div>
          <p className="text-[11px] text-slate-400">Keep your resume ATS score above 80% to maximize shortlist chances.</p>
        </div>
      </div>
    </aside>
  );
}
