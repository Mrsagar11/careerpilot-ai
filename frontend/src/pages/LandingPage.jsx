import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, FileText, GitCompare, MapPin, Video, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-20 border-b border-slate-800/80 px-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Career<span className="text-brand-500">Pilot</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg transition">Sign In</Link>
          <Link to="/register" className="text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl transition shadow-lg shadow-brand-600/30 flex items-center gap-2">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-16 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Placement & Career Copilot for College Graduates</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          Land Your Dream Tech Job With <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-400 to-cyan-400">AI-Powered Placement Intelligence</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Analyze PDF resumes against real job postings, identify critical skill gaps, follow personalized 30/60/90-day learning roadmaps, practice AI mock interviews, and track application pipelines.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/register" className="text-base font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl transition shadow-xl shadow-brand-600/30 flex items-center gap-2">
            <span>Analyze Your Resume Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="text-base font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-7 py-4 rounded-xl transition">
            Explore Dashboard Demo
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-brand-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Resume ATS Analyzer</h3>
            <p className="text-sm text-slate-400">Extracts skills, sections, action verb density, and computes explainable ATS compatibility scores.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-brand-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Resume–JD Matcher</h3>
            <p className="text-sm text-slate-400">Compares your resume with job requirements, highlighting matching vs missing skills with ATS fixes.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-brand-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">30/60/90-Day Roadmap</h3>
            <p className="text-sm text-slate-400">Structured week-by-week learning goals tailored to your target role and missing tech stack skills.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 CareerPilot – AI Job & Placement Assistant. Built for college students & fresh graduates.</p>
      </footer>
    </div>
  );
}
