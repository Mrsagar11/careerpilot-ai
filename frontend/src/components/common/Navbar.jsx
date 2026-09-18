import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, LogOut, Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, profile, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-xl text-white tracking-tight group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span>Career<span className="text-brand-500">Pilot</span></span>
          <span className="text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">AI Assistant</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Target: <strong className="text-white">{profile?.target_role || 'Software Engineer'}</strong></span>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-brand-400">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight">{user.full_name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{user.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition">Login</Link>
            <Link to="/register" className="text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition shadow-md shadow-brand-600/20">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
}
