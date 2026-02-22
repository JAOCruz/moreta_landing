import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Calendar, TrendingUp, MessageSquare, Heart, Target, AlertTriangle, Shield, Save } from 'lucide-react';
import { ProgressView } from './ProgressView';
import { supabase } from '../../lib/supabase';

export const ClientDetailView = ({ client, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  // These fields come from client_profiles (may be pre-merged by ClientsView)
  const [porQue, setPorQue] = useState(client.motivation_notes || '');
  const [goalType, setGoalType] = useState(client.goal_type || 'general');
  const [injuryHistory, setInjuryHistory] = useState(
    Array.isArray(client.injuries) ? client.injuries.join(', ') : (client.injuries || '')
  );
  const [experienceLevel, setExperienceLevel] = useState(client.experience_level || 'beginner');
  const [coachNotes, setCoachNotes] = useState(client.coach_notes || '');
  const [clientProfileId, setClientProfileId] = useState(client._client_profile_id || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch client_profile data on mount if not pre-merged
  useEffect(() => {
    if (!client._client_profile_id) {
      (async () => {
        const { data } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('user_id', client.id)
          .single();
        if (data) {
          setClientProfileId(data.id);
          setPorQue(data.motivation_notes || '');
          setGoalType(data.goal_type || 'general');
          setInjuryHistory(Array.isArray(data.injuries) ? data.injuries.join(', ') : (data.injuries || ''));
          setExperienceLevel(data.experience_level || 'beginner');
          setCoachNotes(data.coach_notes || '');
        }
      })();
    }
  }, [client.id]);

  const handleSaveProfile = async () => {
    setSaving(true);
    // Parse injuries back into array
    const injuriesArray = injuryHistory
      ? injuryHistory.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const updateData = {
      motivation_notes: porQue,
      goal_type: goalType,
      injuries: injuriesArray,
      experience_level: experienceLevel,
      coach_notes: coachNotes,
      updated_at: new Date().toISOString()
    };

    let error;
    if (clientProfileId) {
      // Update existing client_profile
      ({ error } = await supabase
        .from('client_profiles')
        .update(updateData)
        .eq('id', clientProfileId));
    } else {
      // Upsert: create client_profile if it doesn't exist
      ({ error } = await supabase
        .from('client_profiles')
        .upsert({ user_id: client.id, ...updateData }, { onConflict: 'user_id' }));
    }

    setSaving(false);
    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'notes', label: 'Notes', icon: MessageSquare },
  ];

  const displayName = client.display_name || client.email?.split('@')[0] || 'Unknown';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 border border-white/10 hover:bg-white/5 transition-all btn-press">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bebas text-3xl sm:text-4xl text-white truncate">{displayName}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-neutral-500 text-xs font-mono-tech">
            <span className="flex items-center gap-1.5"><Mail size={12} />{client.email}</span>
            <span className="flex items-center gap-1.5"><Calendar size={12} />Joined {new Date(client.created_at).toLocaleDateString()}</span>
            <span className={`px-2 py-0.5 text-[9px] uppercase border ${
              experienceLevel === 'advanced' ? 'border-emerald-500/30 text-emerald-500' :
              experienceLevel === 'intermediate' ? 'border-yellow-500/30 text-yellow-500' :
              'border-neutral-500/30 text-neutral-500'
            }`}>{experienceLevel}</span>
          </div>
        </div>
      </div>

      {/* Por Qué — THE KEY INSIGHT */}
      <div className="glass-panel p-4 sm:p-5 md:p-6 border-l-2 border-emerald-500/50">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={14} className="text-emerald-400" />
          <span className="font-mono-tech text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-bold">¿Por Qué Entrena?</span>
        </div>
        <textarea
          value={porQue}
          onChange={(e) => setPorQue(e.target.value)}
          placeholder="Why is this client training? Their deeper motivation..."
          rows={2}
          className="w-full bg-transparent border border-white/10 p-3 font-mono-tech text-sm text-white placeholder-neutral-700 resize-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-mono-tech text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-emerald-500 border-b-2 border-emerald-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Icon size={14} />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goal Type */}
            <div className="glass-panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-neutral-400" />
                <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">Goal Type</span>
              </div>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-3 font-mono-tech text-sm text-white"
              >
                <option value="general">General Fitness</option>
                <option value="aesthetic">Aesthetic / Body Composition</option>
                <option value="health">Health / Medical</option>
                <option value="performance">Athletic Performance</option>
                <option value="rehabilitation">Rehabilitation</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="glass-panel p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-neutral-400" />
                <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">Experience Level</span>
              </div>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-3 font-mono-tech text-sm text-white"
              >
                <option value="beginner">Beginner (0-6 months)</option>
                <option value="intermediate">Intermediate (6-24 months)</option>
                <option value="advanced">Advanced (2+ years)</option>
              </select>
            </div>
          </div>

          {/* Injury History */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-400" />
              <span className="font-mono-tech text-[9px] text-amber-400 uppercase tracking-[0.2em]">Injury History / Limitations</span>
            </div>
            <textarea
              value={injuryHistory}
              onChange={(e) => setInjuryHistory(e.target.value)}
              placeholder="Any injuries, limitations, or medical conditions to be aware of..."
              rows={3}
              className="w-full bg-transparent border border-white/10 p-3 font-mono-tech text-sm text-white placeholder-neutral-700 resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 font-mono-tech text-[10px] uppercase tracking-widest font-bold transition-all btn-press ${
              saved ? 'bg-emerald-500 text-black' : 'bg-white text-black hover:bg-emerald-400'
            }`}
          >
            <Save size={14} />
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* Progress */}
      {activeTab === 'progress' && <ProgressView userId={client.id} />}

      {/* Notes */}
      {activeTab === 'notes' && (
        <div className="glass-panel p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={14} className="text-neutral-400" />
            <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">Coach Notes</span>
          </div>
          <textarea
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            placeholder="Private notes about this client..."
            rows={8}
            className="w-full bg-transparent border border-white/10 p-4 font-mono-tech text-sm text-white placeholder-neutral-700 resize-none"
          />
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className={`mt-4 flex items-center gap-2 px-6 py-2 font-mono-tech text-[10px] uppercase tracking-widest font-bold transition-all btn-press ${
              saved ? 'bg-emerald-500 text-black' : 'bg-white text-black hover:bg-emerald-400'
            }`}
          >
            <Save size={14} />
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Notes'}
          </button>
        </div>
      )}
    </div>
  );
};
