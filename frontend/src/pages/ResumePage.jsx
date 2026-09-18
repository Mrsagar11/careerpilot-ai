import React, { useState, useEffect } from 'react';
import { uploadResumeApi, getLatestResumeApi } from '../services/api';
import { FileText, Upload, Sparkles, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ResumePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const fetchLatestResume = async () => {
    try {
      const res = await getLatestResumeApi();
      if (res.data && res.data.parsed_data) {
        setAnalysis({
          filename: res.data.filename,
          scores: res.data.parsed_data.scores,
          extracted_skills: res.data.parsed_data.extracted_skills,
          detected_sections: res.data.parsed_data.detected_sections,
          strengths: res.data.parsed_data.strengths,
          improvements: res.data.parsed_data.improvements,
          action_verbs_found: res.data.parsed_data.action_verbs_found,
          missing_critical_keywords: res.data.parsed_data.missing_critical_keywords
        });
      }
    } catch (e) {
      // No resume uploaded yet
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setAnalyzing(true);
    setError('');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await uploadResumeApi(formData);
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to parse resume PDF.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-400" />
            <span>AI Resume Analyzer</span>
          </h1>
          <p className="text-xs text-slate-400">Upload your PDF resume for instant ATS section parsing, impact scoring, and keyword extraction.</p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <form onSubmit={handleUpload} className="space-y-4 max-w-xl mx-auto">
          <div className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-8 transition cursor-pointer bg-slate-950/50">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="resume-file-input"
            />
            <label htmlFor="resume-file-input" className="cursor-pointer space-y-3 block">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Click to upload or drag & drop PDF resume'}
              </div>
              <p className="text-xs text-slate-500">Supports standard single or multi-page PDF resumes up to 10MB</p>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || analyzing}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Parsing PDF & Evaluating ATS Rules...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Analyze Resume Now</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6">
          {/* Score Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-900/40 to-slate-900 border border-brand-500/30 text-center space-y-2">
              <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Overall ATS Score</span>
              <div className="text-4xl font-extrabold text-white">{analysis.scores?.overall}<span className="text-sm text-slate-400">/100</span></div>
              <p className="text-[11px] text-slate-400">Calculated across formatting, skills & action verb density</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <span className="text-xs font-semibold text-slate-400">Format & Structure</span>
              <div className="text-3xl font-extrabold text-emerald-400">{analysis.scores?.format_score}<span className="text-xs text-slate-500">/25</span></div>
              <p className="text-[11px] text-slate-500">Detected core section headers</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <span className="text-xs font-semibold text-slate-400">Skills Density</span>
              <div className="text-3xl font-extrabold text-cyan-400">{analysis.scores?.skills_score}<span className="text-xs text-slate-500">/35</span></div>
              <p className="text-[11px] text-slate-500">Tech keywords identified</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <span className="text-xs font-semibold text-slate-400">Action & Impact</span>
              <div className="text-3xl font-extrabold text-amber-400">{analysis.scores?.impact_score}<span className="text-xs text-slate-500">/40</span></div>
              <p className="text-[11px] text-slate-500">Verbs & metrics density</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Skills */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base">Extracted Technical Skills ({analysis.extracted_skills?.length || 0})</h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.extracted_skills || []).map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-brand-300 text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Detected Sections */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base">Parsed Resume Sections</h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.detected_sections || []).map((sec) => (
                  <span key={sec} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{sec}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Resume Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysis.strengths || []).map((str, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Actionable Improvement Suggestions</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(analysis.improvements || []).map((imp, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{imp}</span>
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
