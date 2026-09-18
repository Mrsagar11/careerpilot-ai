import React, { useState, useEffect } from 'react';
import { getProjectRecommendationsApi } from '../services/api';
import { FolderGit2, Sparkles, Code, CheckCircle, ArrowRight } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await getProjectRecommendationsApi();
      setProjects(res.data.recommendations || []);
      setTargetRole(res.data.target_role || 'Software Development Engineer');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Generating tailored portfolio project recommendations...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-brand-400" />
            <span>Recommended Portfolio Projects</span>
          </h1>
          <p className="text-xs text-slate-400">Curated hands-on projects designed to demonstrate mastery in missing skills for <strong className="text-white">{targetRole}</strong>.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj, idx) => (
          <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-extrabold text-white leading-snug">{proj.title}</h2>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/30 uppercase tracking-wider shrink-0">
                  {proj.complexity}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Tech Stack Skills Covered:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(proj.skills || []).map((sk) => (
                    <span key={sk} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-brand-300 text-xs font-semibold">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-amber-400 text-[11px]">Step-by-Step Implementation Guide:</span>
                <pre className="whitespace-pre-wrap font-sans text-slate-300 text-xs leading-relaxed">{proj.implementation_guide}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
