import React, { useState, useEffect } from 'react';
import { getApplicationsApi, createApplicationApi, updateApplicationApi, deleteApplicationApi } from '../services/api';
import { Kanban, Plus, Trash2, Edit3, ExternalLink, Calendar, Search, Filter } from 'lucide-react';

const STATUS_OPTIONS = ['Wishlist', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

const STATUS_BADGES = {
  Wishlist: 'bg-slate-800 text-slate-300 border-slate-700',
  Applied: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Assessment: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Interview: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Offer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    job_url: '',
    salary_range: '',
    notes: '',
    interview_date: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getApplicationsApi();
      setApps(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      company: '',
      role: '',
      status: 'Applied',
      applied_date: new Date().toISOString().split('T')[0],
      job_url: '',
      salary_range: '',
      notes: '',
      interview_date: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (app) => {
    setEditingId(app.id);
    setFormData({
      company: app.company,
      role: app.role,
      status: app.status,
      applied_date: app.applied_date || '',
      job_url: app.job_url || '',
      salary_range: app.salary_range || '',
      notes: app.notes || '',
      interview_date: app.interview_date || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateApplicationApi(editingId, formData);
      } else {
        await createApplicationApi(formData);
      }
      setShowModal(false);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job application record?')) {
      try {
        await deleteApplicationApi(id);
        fetchApplications();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredApps = filterStatus === 'All' ? apps : apps.filter((a) => a.status === filterStatus);

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading application pipeline...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Kanban className="w-6 h-6 text-brand-400" />
            <span>Job Application Tracker</span>
          </h1>
          <p className="text-xs text-slate-400">Track placement applications across company, status, assessment deadlines, and interview dates.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-lg shadow-brand-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {['All', ...STATUS_OPTIONS].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition ${
              filterStatus === status
                ? 'bg-brand-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {status} ({status === 'All' ? apps.length : apps.filter((a) => a.status === status).length})
          </button>
        ))}
      </div>

      {/* Application Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app) => (
          <div key={app.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">{app.role}</h3>
                  <p className="text-xs font-medium text-slate-400">{app.company}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider shrink-0 ${STATUS_BADGES[app.status] || STATUS_BADGES.Applied}`}>
                  {app.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                {app.applied_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Applied: {app.applied_date}</span>
                  </div>
                )}
                {app.interview_date && (
                  <div className="flex items-center gap-2 text-amber-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Interview: {app.interview_date}</span>
                  </div>
                )}
                {app.job_url && (
                  <a href={app.job_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-brand-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="truncate">View Job Posting</span>
                  </a>
                )}
              </div>

              {app.notes && (
                <p className="text-xs text-slate-400 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 italic line-clamp-2">
                  "{app.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/60">
              <button
                onClick={() => handleOpenEdit(app)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(app.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            No job applications found under this status filter.
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg">{editingId ? 'Edit Application' : 'Add New Application'}</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Company</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Google"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Role Title</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Applied Date</label>
                  <input
                    type="date"
                    value={formData.applied_date}
                    onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Job URL</label>
                  <input
                    type="url"
                    value={formData.job_url}
                    onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Interview Date (if any)</label>
                  <input
                    type="date"
                    value={formData.interview_date}
                    onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Notes / Referral details</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-md shadow-brand-600/30"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
