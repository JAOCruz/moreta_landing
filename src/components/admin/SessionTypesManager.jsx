import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Users, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const SessionTypesManager = () => {
  const [sessionTypes, setSessionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    max_capacity: 4,
    color: '#10b981',
    icon: 'Users',
    is_active: true
  });

  useEffect(() => {
    fetchSessionTypes();
  }, []);

  const fetchSessionTypes = async () => {
    const { data, error } = await supabase
      .from('session_types')
      .select('*')
      .order('name');

    if (!error && data) {
      setSessionTypes(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a session type name');
      return;
    }

    if (editingId) {
      // Update existing
      const { error } = await supabase
        .from('session_types')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) {
        alert('Error updating session type: ' + error.message);
        return;
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('session_types')
        .insert([formData]);

      if (error) {
        alert('Error creating session type: ' + error.message);
        return;
      }
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      duration_minutes: 60,
      max_capacity: 4,
      color: '#10b981',
      icon: 'Users',
      is_active: true
    });
    setEditingId(null);
    fetchSessionTypes();
  };

  const handleEdit = (type) => {
    setFormData({
      name: type.name,
      description: type.description || '',
      duration_minutes: type.duration_minutes,
      max_capacity: type.max_capacity,
      color: type.color,
      icon: type.icon || 'Users',
      is_active: type.is_active
    });
    setEditingId(type.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this session type? This cannot be undone.')) return;

    const { error } = await supabase
      .from('session_types')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting: ' + error.message);
    } else {
      fetchSessionTypes();
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 60,
      max_capacity: 4,
      color: '#10b981',
      icon: 'Users',
      is_active: true
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-mono-tech text-xs text-neutral-500">Loading session types...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="glass-panel p-6 border border-white/10">
        <h3 className="font-bebas text-xl text-white mb-4">
          {editingId ? 'Edit Session Type' : 'Add New Session Type'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="e.g., Group Class"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Max Capacity */}
          <div>
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Max Capacity
            </label>
            <input
              type="number"
              value={formData.max_capacity}
              onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
              className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-16 bg-black/30 border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="#10b981"
              />
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none resize-none"
              rows="2"
              placeholder="Brief description of this session type"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="font-mono-tech text-xs text-neutral-400">
              Active (visible to clients)
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-mono-tech text-xs uppercase tracking-widest transition-colors"
          >
            <Save size={14} />
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2 border border-white/20 hover:border-white/40 text-neutral-400 hover:text-white font-mono-tech text-xs uppercase tracking-widest transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List of Session Types */}
      <div className="space-y-3">
        <h3 className="font-bebas text-xl text-white">Existing Session Types</h3>

        {sessionTypes.length === 0 ? (
          <div className="glass-panel p-8 border border-dashed border-white/10 text-center">
            <p className="font-mono-tech text-xs text-neutral-500">
              No session types yet. Create one above.
            </p>
          </div>
        ) : (
          sessionTypes.map((type) => (
            <div
              key={type.id}
              className="glass-panel p-4 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Color Indicator */}
                  <div
                    className="w-4 h-4 rounded mt-1 border border-white/20"
                    style={{ backgroundColor: type.color }}
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-white">{type.name}</h4>
                      {!type.is_active && (
                        <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 font-mono-tech text-[8px] text-neutral-500 uppercase">
                          Inactive
                        </span>
                      )}
                    </div>

                    {type.description && (
                      <p className="text-neutral-400 text-sm mb-2">{type.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-neutral-500 text-xs font-mono-tech">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{type.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>Max {type.max_capacity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(type)}
                    className="p-2 hover:bg-white/5 border border-white/10 hover:border-emerald-500 text-neutral-400 hover:text-emerald-500 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="p-2 hover:bg-white/5 border border-white/10 hover:border-red-500 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
