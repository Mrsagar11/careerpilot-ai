import React, { useEffect, useState } from 'react';
import { getDashboardAnalyticsApi } from '../services/api';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { FileText, Briefcase, MapPin, Video, Sparkles, TrendingUp, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const STATUS_COLORS = {
  Applied: '#3b82f6',
  Assessment: '#8b5cf6',
  Interview: '#eab308',
  Offer: '#22c55e',
  Rejected: '#ef4444',
  Wishlist: '#64748b'
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getDashboardAnalyticsApi();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Aggregating placement analytics...</p>
      </div>
    );
  }

  const pieData = Object.entries(data?.application_status_counts || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Placement Intelligence Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Student Placement Overview</h1>
          <p className="text-xs text-slate-400">Track your resume ATS score, active applications, roadmap milestones, and interview performance.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/resume" className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-brand-600/20">
            <FileText className="w-4 h-4" />
            <span>Upload Resume</span>
          </Link>
          <Link to="/mock-interview" className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-400" />
            <span>Start Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Resume ATS Score</span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400"><FileText className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white">{data?.ats_score || 0}<span className="text-sm font-normal text-slate-400">/100</span></div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-brand-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${data?.ats_score || 0}%` }}></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tracked Applications</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Briefcase className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white">{data?.total_applications || 0}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{data?.application_status_counts?.Interview || 0}</span> interviews active
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Roadmap Progress</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400"><MapPin className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white">{data?.roadmap_progress || 0}<span className="text-sm font-normal text-slate-400">%</span></div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-cyan-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${data?.roadmap_progress || 0}%` }}></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Mock Interview Score</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Video className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-extrabold text-white">{data?.interview_average_score || 0}<span className="text-sm font-normal text-slate-400">%</span></div>
          <div className="text-[11px] text-emerald-400 font-medium">Verified technical accuracy</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Application Tracker Pipeline</h3>
              <p className="text-xs text-slate-400">Status breakdown of your job applications</p>
            </div>
            <Link to="/applications" className="text-xs font-medium text-brand-400 hover:underline flex items-center gap-1">
              <span>View Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] }}></span>
                <span className="text-slate-300 font-medium">{d.name}: <strong className="text-white">{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Breakdown Radar Chart */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Target Role Skill Radar</h3>
              <p className="text-xs text-slate-400">Technical competency across core CS domains</p>
            </div>
            <Link to="/skills" className="text-xs font-medium text-brand-400 hover:underline flex items-center gap-1">
              <span>Analyze Gaps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data?.skill_breakdown || []}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Student Proficiency" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            <span>Recent Placement Activities</span>
          </h3>

          <div className="space-y-3">
            {(data?.recent_activities || []).map((act) => (
              <div key={act.id} className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-400"></div>
                  <div>
                    <div className="font-bold text-white">{act.type}</div>
                    <div className="text-slate-400">{act.detail}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-850 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Quick Shortcuts</h3>
          <div className="space-y-2.5">
            <Link to="/matcher" className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/70 text-slate-200 text-xs font-semibold transition flex items-center justify-between group">
              <span>Run Resume–JD Match</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </Link>
            <Link to="/roadmap" className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/70 text-slate-200 text-xs font-semibold transition flex items-center justify-between group">
              <span>View 30/60/90 Roadmap</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </Link>
            <Link to="/chatbot" className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/70 text-slate-200 text-xs font-semibold transition flex items-center justify-between group">
              <span>Ask AI Career Chatbot</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
