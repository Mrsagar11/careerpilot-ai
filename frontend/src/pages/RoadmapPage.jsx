import React, { useEffect, useState } from 'react';
import { getMyRoadmapApi, toggleRoadmapTaskApi } from '../services/api';
import { MapPin, CheckSquare, Square, Calendar, Clock, ExternalLink, Sparkles } from 'lucide-react';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(1);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await getMyRoadmapApi();
      setRoadmap(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await toggleRoadmapTaskApi(taskId);
      setRoadmap(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Generating 30/60/90-day learning roadmap...</div>;
  }

  const currentPhaseData = roadmap?.phases?.find((p) => p.phase_number === activePhase) || roadmap?.phases?.[0];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-brand-400" />
            <span>AI 30/60/90-Day Placement Roadmap</span>
          </h1>
          <p className="text-xs text-slate-400">Structured week-by-week learning goals for <strong className="text-white">{roadmap?.target_role}</strong>.</p>
        </div>
      </div>

      {/* Progress Header Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{roadmap?.title}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Overall Roadmap Execution</h2>
          <p className="text-xs text-slate-400">Check off completed milestones to update your readiness score in real-time.</p>
        </div>

        <div className="shrink-0 text-center">
          <div className="text-4xl font-black text-brand-400">{roadmap?.progress_percentage}%</div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
        </div>
      </div>

      {/* Phase Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        {roadmap?.phases?.map((p) => (
          <button
            key={p.phase_number}
            onClick={() => setActivePhase(p.phase_number)}
            className={`px-5 py-3 rounded-t-2xl font-bold text-xs transition border-t border-x ${
              activePhase === p.phase_number
                ? 'bg-slate-900 text-brand-400 border-slate-800 border-b-slate-900 -mb-px'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            Phase {p.phase_number}: Days {p.phase_number === 1 ? '1-30' : p.phase_number === 2 ? '31-60' : '61-90'}
          </button>
        ))}
      </div>

      {/* Active Phase Tasks View */}
      {currentPhaseData && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-white text-lg">{currentPhaseData.phase_title}</h3>
                <p className="text-xs text-slate-400">Focus Skills: {currentPhaseData.focus_skills?.join(', ')}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {currentPhaseData.tasks?.map((task) => {
                const isCompleted = roadmap?.completed_task_ids?.includes(task.id) || task.completed;
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                      isCompleted
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-slate-400">
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>~{task.estimated_hours}h</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
