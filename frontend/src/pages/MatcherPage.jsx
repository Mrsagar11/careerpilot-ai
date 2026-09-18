import React, { useState, useEffect } from 'react';
import { matchResumeJobApi, getSavedJobsApi, getLatestResumeApi } from '../services/api';
import { GitCompare, Sparkles, CheckCircle2, XCircle, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';

export default function MatcherPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [jobRes, resumeRes] = await Promise.all([
        getSavedJobsApi(),
        getLatestResumeApi()
      ]);
      setSavedJobs(jobRes.data || []);
      if (resumeRes.data) {
        setResumeText(resumeRes.data.raw_text);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJobSelect = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    const found = savedJobs.find((j) => j.id === parseInt(jobId));
    if (found) {
      setJobText(found.raw_text);
    }
  };

  const handleRunMatch = async (e) => {
    e.preventDefault();
    setMatching(true);
    try {
      const res = await matchResumeJobApi({
        job_id: selectedJobId ? parseInt(selectedJobId) : null,
        job_text: jobText
      });
      setMatchResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <GitCompare className="w-6 h-6 text-brand-400" />
            <span>AI Resume–Job Matcher</span>
          </h1>
          <p className="text-xs text-slate-400">Compare your uploaded resume against target job postings to get explainable match scores and missing ATS keywords.</p>
        </div>
      </div>

      {/* Input Selection Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <form onSubmit={handleRunMatch} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Analyzed Job or Paste Job Requirements</label>
            <select
              value={selectedJobId}
              onChange={handleJobSelect}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose from your saved job descriptions --</option>
              {savedJobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title} at {j.company}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Job Posting Text</label>
            <textarea
              rows={4}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste job posting text if not selected from dropdown above..."
              className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={matching || !jobText.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
          >
            {matching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Calculate Resume Match Percentage</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Match Results Display */}
      {matchResult && (
        <div className="space-y-6">
          {/* Match Score Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Match Accuracy Evaluation</span>
              <h2 className="text-2xl font-extrabold text-white">Explainable Job Match Score</h2>
              <p className="text-xs text-slate-400 max-w-xl">{matchResult.explanation}</p>
            </div>

            <div className="shrink-0 w-32 h-32 rounded-full border-4 border-brand-500/30 bg-slate-950 flex flex-col items-center justify-center shadow-lg shadow-brand-500/20">
              <div className="text-3xl font-black text-white">{matchResult.match_percentage}%</div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Match Score</span>
            </div>
          </div>

          {/* Skills Comparison Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Matching Skills ({matchResult.matching_skills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(matchResult.matching_skills || []).map((sk) => (
                  <span key={sk} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>Missing Skills ({matchResult.missing_skills?.length || 0})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(matchResult.missing_skills || []).map((sk) => (
                  <span key={sk} className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tailored Recommendations */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <span>ATS Optimization Recommendations</span>
            </h3>
            <div className="space-y-2.5">
              {(matchResult.recommendations || []).map((rec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
