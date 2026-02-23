import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, DollarSign, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

export const PricingManager = () => {
  const toast = useToast();
  const [pricingRules, setPricingRules] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    session_type_id: '',
    price: '',
    sessions_included: null,
    validity_days: null,
    description: '',
    is_active: true
  });

  useEffect(() => {
    Promise.all([fetchPricingRules(), fetchSessionTypes()]).then(() => {
      setLoading(false);
    });
  }, []);

  const fetchPricingRules = async () => {
    const { data, error } = await supabase
      .from('pricing_rules')
      .select(`
        *,
        session_types (name, color)
      `)
      .order('price');

    if (!error && data) {
      setPricingRules(data);
    }
  };

  const fetchSessionTypes = async () => {
    const { data, error } = await supabase
      .from('session_types')
      .select('id, name, color')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setSessionTypes(data);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price) {
      toast.warning('Please enter name and price');
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      sessions_included: formData.sessions_included ? parseInt(formData.sessions_included) : null,
      validity_days: formData.validity_days ? parseInt(formData.validity_days) : null,
      session_type_id: formData.session_type_id || null
    };

    if (editingId) {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingId);

      if (error) {
        toast.error('Error updating pricing rule: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('pricing_rules')
        .insert([payload]);

      if (error) {
        toast.error('Error creating pricing rule: ' + error.message);
        return;
      }
    }

    resetForm();
    fetchPricingRules();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      session_type_id: '',
      price: '',
      sessions_included: null,
      validity_days: null,
      description: '',
      is_active: true
    });
    setEditingId(null);
  };

  const handleEdit = (rule) => {
    setFormData({
      name: rule.name,
      session_type_id: rule.session_type_id || '',
      price: rule.price.toString(),
      sessions_included: rule.sessions_included,
      validity_days: rule.validity_days,
      description: rule.description || '',
      is_active: rule.is_active
    });
    setEditingId(rule.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this pricing rule?')) return;

    const { error } = await supabase
      .from('pricing_rules')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting: ' + error.message);
    } else {
      fetchPricingRules();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-mono-tech text-xs text-neutral-500">Loading pricing rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="glass-panel p-6 border border-white/10">
        <h3 className="font-bebas text-xl text-white mb-4">
          {editingId ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Package Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="e.g., 10-Pack Special"
            />
          </div>

          {/* Session Type */}
          <div>
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Session Type
            </label>
            <select
              value={formData.session_type_id}
              onChange={(e) => setFormData({ ...formData, session_type_id: e.target.value })}
              className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Types</option>
              {sessionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="25.00"
            />
          </div>

          {/* Sessions Included */}
          <div>
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Sessions Included
            </label>
            <input
              type="number"
              value={formData.sessions_included || ''}
              onChange={(e) => setFormData({ ...formData, sessions_included: e.target.value })}
              className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="Leave empty for unlimited"
            />
          </div>

          {/* Validity Days */}
          <div>
            <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
              Valid For (days)
            </label>
            <input
              type="number"
              value={formData.validity_days || ''}
              onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
              className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="e.g., 30, 90"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pricing_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="pricing_active" className="font-mono-tech text-xs text-neutral-400">
              Active (available for purchase)
            </label>
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
              placeholder="Optional description or terms"
            />
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
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-2 border border-white/20 hover:border-white/40 text-neutral-400 hover:text-white font-mono-tech text-xs uppercase tracking-widest transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List of Pricing Rules */}
      <div className="space-y-3">
        <h3 className="font-bebas text-xl text-white">Existing Pricing Rules</h3>

        {pricingRules.length === 0 ? (
          <div className="glass-panel p-8 border border-dashed border-white/10 text-center">
            <p className="font-mono-tech text-xs text-neutral-500">
              No pricing rules yet. Create one above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingRules.map((rule) => (
              <div
                key={rule.id}
                className="glass-panel p-4 border border-white/10 hover:border-white/20 transition-colors relative"
              >
                {/* Badge */}
                {!rule.is_active && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 font-mono-tech text-[8px] text-neutral-500 uppercase">
                      Inactive
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-3">
                  <h4 className="font-bold text-white text-lg">{rule.name}</h4>
                  {rule.session_types && (
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: rule.session_types.color }}
                      />
                      <span className="text-neutral-400 text-xs">{rule.session_types.name}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bebas text-3xl text-emerald-500">${rule.price}</span>
                    {rule.sessions_included && (
                      <span className="text-neutral-500 text-sm">
                        / {rule.sessions_included} {rule.sessions_included === 1 ? 'session' : 'sessions'}
                      </span>
                    )}
                  </div>
                  {rule.validity_days && (
                    <p className="text-neutral-600 text-xs font-mono-tech mt-1">
                      Valid for {rule.validity_days} days
                    </p>
                  )}
                </div>

                {/* Description */}
                {rule.description && (
                  <p className="text-neutral-400 text-xs mb-3">{rule.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-white/10 hover:border-emerald-500 text-neutral-400 hover:text-emerald-500 font-mono-tech text-[9px] uppercase tracking-widest transition-colors"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-white/10 hover:border-red-500 text-neutral-400 hover:text-red-500 font-mono-tech text-[9px] uppercase tracking-widest transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
