import React, { useState, useEffect } from 'react';
import { analyzeJobApi, getSavedJobsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Sparkles, ArrowRight, CheckCircle2, List, FileText } from 'lucide-react';

export default function JobAnalyzerPage() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [rawText, setRawText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedJob, setAnalyzedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await getSavedJobsApi();
      setSavedJobs(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setAnalyzing(true);
    setError('');
    try {
      const res = await analyzeJobApi({
        title: title || 'Software Engineer',
        company: company || 'Tech Corporation',
        location,
        raw_text: rawText
      });
      setAnalyzedJob(res.data);
      fetchSavedJobs();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze job description.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-brand-400" />
            <span>Job Description Analyzer</span>
          </h1>
          <p className="text-xs text-slate-400">Extract required skills, key qualifications, responsibilities, and ATS keywords from any target job posting.</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Software Engineer / SDE I"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google / Microsoft / Amazon"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote / Bengaluru / Hybrid"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Paste Full Job Description</label>
            <textarea
              rows={6}
              required
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste job posting text here including responsibilities and required qualifications..."
              className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={analyzing || !rawText.trim()}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Extract Skills & Analyze Job</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Extracted Analysis Details */}
      {analyzedJob && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md">Extracted Job Analysis</span>
              <h2 className="text-xl font-extrabold text-white mt-1">{analyzedJob.title} at {analyzedJob.company}</h2>
            </div>
            <button
              onClick={() => navigate('/matcher')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <span>Match With My Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Extracted Skills Tags */}
          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">Required Technical Skills ({analyzedJob.extracted_skills?.length || 0})</h3>
            <div className="flex flex-wrap gap-2">
              {(analyzedJob.extracted_skills || []).map((sk) => (
                <span key={sk} className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-brand-300 text-xs font-semibold">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Responsibilities */}
            <div className="space-y-2">
              <h3 className="font-bold text-white text-sm">Key Responsibilities</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analyzedJob.responsibilities || []).map((resp, i) => (
                  <li key={i} className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start gap-2">
                    <span className="text-brand-400 font-bold">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div className="space-y-2">
              <h3 className="font-bold text-white text-sm">Required Qualifications</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analyzedJob.qualifications || []).map((qual, i) => (
                  <li key={i} className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
