import React, { useState, useEffect } from 'react';
import { getInterviewQuestionsApi } from '../services/api';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Video, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InterviewPrepPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await getInterviewQuestionsApi({ role: 'Software Engineer', count: 6 });
      setQuestions(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Generating AI interview prep question bank...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-brand-400" />
            <span>AI Interview Preparation</span>
          </h1>
          <p className="text-xs text-slate-400">Master HR, Technical, and Behavioral questions tailored to your target software role with STAR method answers.</p>
        </div>

        <Link
          to="/mock-interview"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Video className="w-4 h-4" />
          <span>Launch AI Mock Interview Studio</span>
        </Link>
      </div>

      <div className="space-y-4">
        {questions.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div key={q.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 transition">
              <div
                onClick={() => toggleAccordion(q.id)}
                className="flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      q.category === 'Technical' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    }`}>
                      {q.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                      {q.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{q.question}</h3>
                </div>

                <button className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="pt-4 border-t border-slate-800/80 space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-300 uppercase text-[10px]">Key Technical & Behavioral Points:</span>
                    <ul className="space-y-1 text-slate-400">
                      {(q.key_points || []).map((kp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-brand-400 font-bold">•</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-400 text-[11px]">Model STAR Method Answer:</span>
                    <p className="text-slate-300 leading-relaxed italic">{q.sample_answer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
