import React, { useEffect, useState } from 'react';
import { getSkillGapApi } from '../services/api';
import { Link } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertCircle, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export default function SkillGapPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillGaps();
  }, []);

  const fetchSkillGaps = async () => {
    try {
      setLoading(true);
      const res = await getSkillGapApi();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Analyzing skill gap matrix...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-brand-400" />
            <span>Skill Gap Analyzer</span>
          </h1>
          <p className="text-xs text-slate-400">Identify exact missing technical skills required for <strong className="text-white">{data?.target_role}</strong> roles.</p>
        </div>

        <Link
          to="/roadmap"
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-lg shadow-brand-600/20 flex items-center gap-2"
        >
          <span>Generate 30/60/90 Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Overall Readiness Header Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Role: {data?.target_role}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Placement Skill Readiness</h2>
          <p className="text-xs text-slate-400">Mastered {data?.mastered_skills_count} of {data?.total_required_skills} core technical competencies.</p>
        </div>

        <div className="shrink-0 text-center">
          <div className="text-4xl font-black text-white">{data?.overall_readiness}%</div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Readiness</span>
        </div>
      </div>

      {/* Categorized Skills Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(data?.categories || []).map((cat) => (
          <div key={cat.category_name} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">{cat.category_name}</h3>
              <span className="text-xs font-bold text-brand-400">{cat.completion_rate}%</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-brand-500 h-2 rounded-full transition-all duration-500" style={{ width: `${cat.completion_rate}%` }}></div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Mastered Skills:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {cat.mastered.length > 0 ? (
                    cat.mastered.map((sk) => (
                      <span key={sk} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                        ✓ {sk}
                      </span>
                    ))
                  ) : <span className="text-xs text-slate-500">None yet</span>}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Missing Skill Gaps:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {cat.missing.length > 0 ? (
                    cat.missing.map((sk) => (
                      <span key={sk} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                        ✗ {sk}
                      </span>
                    ))
                  ) : <span className="text-xs text-emerald-400 font-semibold">Fully Mastered!</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Learning List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>Priority Actionable Skill Learning List</span>
        </h3>
        <p className="text-xs text-slate-400">Focus on acquiring these high-impact skills first to improve resume shortlist rates:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {(data?.priority_learning_list || []).map((skill, idx) => (
            <div key={skill} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-white">{idx + 1}. {skill}</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Priority</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
