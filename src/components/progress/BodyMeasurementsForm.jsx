import { useState } from 'react';
import { Ruler, Save, X } from 'lucide-react';

export const BodyMeasurementsForm = ({ onSave, onCancel, initialData = null }) => {
  const [measurements, setMeasurements] = useState({
    weight: initialData?.weight || '',
    height: initialData?.height || '',
    body_fat_percentage: initialData?.body_fat_percentage || '',
    chest: initialData?.chest || '',
    waist: initialData?.waist || '',
    hips: initialData?.hips || '',
    bicep_left: initialData?.bicep_left || '',
    bicep_right: initialData?.bicep_right || '',
    thigh_left: initialData?.thigh_left || '',
    thigh_right: initialData?.thigh_right || '',
    calf_left: initialData?.calf_left || '',
    calf_right: initialData?.calf_right || '',
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate BMI
    const bmi = measurements.weight && measurements.height
      ? (measurements.weight / ((measurements.height / 100) ** 2)).toFixed(2)
      : null;

    onSave({
      ...measurements,
      bmi,
      measured_at: new Date().toISOString()
    });
  };

  const updateField = (field, value) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Ruler className="text-emerald-500" size={24} />
        <h2 className="font-bebas text-3xl text-white">BODY MEASUREMENTS</h2>
      </div>

      {/* Core Measurements */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="font-mono-tech text-[10px] text-neutral-500 uppercase block mb-2">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={measurements.weight}
            onChange={(e) => updateField('weight', e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-white text-center text-lg focus:border-emerald-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="font-mono-tech text-[10px] text-neutral-500 uppercase block mb-2">Height (cm)</label>
          <input
            type="number"
            step="0.1"
            value={measurements.height}
            onChange={(e) => updateField('height', e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-white text-center text-lg focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="font-mono-tech text-[10px] text-neutral-500 uppercase block mb-2">Body Fat %</label>
          <input
            type="number"
            step="0.1"
            value={measurements.body_fat_percentage}
            onChange={(e) => updateField('body_fat_percentage', e.target.value)}
            className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-white text-center text-lg focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Circumferences */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="font-mono-tech text-xs text-neutral-400 uppercase tracking-widest mb-4">Circumferences (cm)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-600 uppercase block mb-2">Chest</label>
            <input type="number" step="0.1" value={measurements.chest} onChange={(e) => updateField('chest', e.target.value)} className="w-full bg-black border border-white/10 p-2 font-mono-tech text-white text-sm text-center focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-600 uppercase block mb-2">Waist</label>
            <input type="number" step="0.1" value={measurements.waist} onChange={(e) => updateField('waist', e.target.value)} className="w-full bg-black border border-white/10 p-2 font-mono-tech text-white text-sm text-center focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-600 uppercase block mb-2">Hips</label>
            <input type="number" step="0.1" value={measurements.hips} onChange={(e) => updateField('hips', e.target.value)} className="w-full bg-black border border-white/10 p-2 font-mono-tech text-white text-sm text-center focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-600 uppercase block mb-2">Bicep L</label>
            <input type="number" step="0.1" value={measurements.bicep_left} onChange={(e) => updateField('bicep_left', e.target.value)} className="w-full bg-black border border-white/10 p-2 font-mono-tech text-white text-sm text-center focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-600 uppercase block mb-2">Bicep R</label>
            <input type="number" step="0.1" value={measurements.bicep_right} onChange={(e) => updateField('bicep_right', e.target.value)} className="w-full bg-black border border-white/10 p-2 font-mono-tech text-white text-sm text-center focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-600 uppercase block mb-2">Thigh L</label>
            <input type="number" step="0.1" value={measurements.thigh_left} onChange={(e) => updateField('thigh_left', e.target.value)} className="w-full bg-black border border-white/10 p-2 font-mono-tech text-white text-sm text-center focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-600 uppercase block mb-2">Thigh R</label>
            <input type="number" step="0.1" value={measurements.thigh_right} onChange={(e) => updateField('thigh_right', e.target.value)} className="w-full bg-black border border-white/10 p-2 font-mono-tech text-white text-sm text-center focus:border-emerald-500 outline-none" />
          </div>
          <div>
            <label className="font-mono-tech text-[9px] text-neutral-600 uppercase block mb-2">Calf L</label>
            <input type="number" step="0.1" value={measurements.calf_left} onChange={(e) => updateField('calf_left', e.target.value)} className="w-full bg-black border border-white/10 p-2 font-mono-tech text-white text-sm text-center focus:border-emerald-500 outline-none" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="font-mono-tech text-[10px] text-neutral-500 uppercase block mb-2">Notes</label>
        <textarea
          value={measurements.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Any observations or context..."
          rows={3}
          className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-xs text-white focus:border-emerald-500 outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-white/10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-white/10 text-neutral-500 font-mono-tech text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            <X size={14} className="inline mr-2" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-[2] py-3 bg-emerald-500 text-black font-mono-tech text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
        >
          <Save size={14} />
          Save Measurements
        </button>
      </div>
    </form>
  );
};
