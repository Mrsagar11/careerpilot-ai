import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfileApi, updateProfileApi } from '../services/api';
import { User, Save, Plus, X, Check, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState({
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    graduation_year: 2026,
    target_role: 'Software Development Engineer',
    skills: ['Python', 'JavaScript', 'React', 'SQL', 'Git'],
    experience_level: 'Entry Level / Graduate',
    location_preference: 'Remote / Flexible',
    bio: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfileApi();
      if (res.data) {
        setProfile(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove)
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfileApi(profile);
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm">Loading student profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <User className="w-6 h-6 text-brand-400" />
            <span>Student Career Profile</span>
          </h1>
          <p className="text-xs text-slate-400">Configure your target role, academic degree, and current skill set.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-semibold">
          <Check className="w-4 h-4" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic & Academic Info */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Academic Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Degree / Qualification</label>
              <input
                type="text"
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Branch / Specialization</label>
              <input
                type="text"
                value={profile.branch}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Graduation Year</label>
              <input
                type="number"
                value={profile.graduation_year}
                onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value) || 2026 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Role Preference</label>
              <select
                value={profile.target_role}
                onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="Software Development Engineer">Software Development Engineer (SDE)</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Scientist / ML Engineer">Data Scientist / ML Engineer</option>
                <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Technical Skills Inventory */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Technical Skills Inventory</h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Docker, TypeScript, FastAPI)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={handleAddSkill}
              type="button"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {(profile.skills || []).map((skill) => (
              <span key={skill} className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5">
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-400 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Bio & Preferences */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3">Career Summary & Bio</h3>
          <div className="space-y-1.5">
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Brief summary of your technical interests and career aspirations..."
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
