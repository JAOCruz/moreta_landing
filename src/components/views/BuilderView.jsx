import { useState, useEffect } from 'react';
import { X, Edit3, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { EXERCISE_DB } from '../../data/exercises';

export const BuilderView = ({
  routines,
  onSaveRoutine,
  onEditRoutine,
  onDeleteRoutine
}) => {
  const firstBodyPart = Object.keys(EXERCISE_DB)[0] || 'legs';
  const [selectedFolder, setSelectedFolder] = useState(firstBodyPart);
  const [builderRoutineName, setBuilderRoutineName] = useState('');
  const [builderExercises, setBuilderExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState({ name: '', sets: 3, reps: 12 });
  const [editingRoutineId, setEditingRoutineId] = useState(null);

  // Update initial exercise when folder changes
  useEffect(() => {
    if (EXERCISE_DB[selectedFolder]?.length > 0) {
      setCurrentExercise(prev => ({ ...prev, name: EXERCISE_DB[selectedFolder][0].name }));
    }
  }, [selectedFolder]);

  const handleAddExerciseToBundle = () => {
    setBuilderExercises([...builderExercises, { ...currentExercise }]);
  };

  const handleRemoveExerciseFromBundle = (index) => {
    setBuilderExercises(builderExercises.filter((_, i) => i !== index));
  };

  const moveExercise = (index, direction) => {
    const newExercises = [...builderExercises];
    if (direction === 'up' && index > 0) {
      [newExercises[index], newExercises[index - 1]] = [newExercises[index - 1], newExercises[index]];
    } else if (direction === 'down' && index < newExercises.length - 1) {
      [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    }
    setBuilderExercises(newExercises);
  };

  const handleSave = () => {
    onSaveRoutine({
      id: editingRoutineId,
      name: builderRoutineName,
      category: selectedFolder.toUpperCase(),
      exercises: builderExercises
    });
    setBuilderRoutineName('');
    setBuilderExercises([]);
    setEditingRoutineId(null);
  };

  const handleEditRoutineLoad = (r) => {
    setEditingRoutineId(r.id);
    setBuilderRoutineName(r.name);
    setBuilderExercises(Array.isArray(r.exercises) ? r.exercises : []);
    setSelectedFolder(r.category ? r.category.toLowerCase() : 'legs');
  };

  const handleCancelEdit = () => {
    setEditingRoutineId(null);
    setBuilderRoutineName('');
    setBuilderExercises([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 lg:h-[80vh]">
      <div className="lg:col-span-7 glass-panel p-4 sm:p-6 lg:p-8 flex flex-col">
        <SectionHeader number="A" title="Bundle Creator" />
        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {editingRoutineId && <div className="bg-yellow-500/10 text-yellow-500 p-2 font-mono-tech text-xs text-center border border-yellow-500/30">EDITING MODE</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-[10px] font-mono-tech text-neutral-500 block mb-2">CATEGORY (FOLDER)</label><input value={selectedFolder.toUpperCase()} disabled className="w-full bg-white/5 border border-white/10 p-3 text-base sm:text-xs font-mono-tech text-neutral-500 cursor-not-allowed" /></div>
            <div><label className="text-[10px] font-mono-tech text-neutral-500 block mb-2">ROUTINE NAME</label><input placeholder="e.g. Legs Hypertrophy A" value={builderRoutineName} onChange={e => setBuilderRoutineName(e.target.value)} className="w-full bg-black border border-white/20 p-3 text-base sm:text-xs font-mono-tech text-white focus:border-emerald-500" /></div>
          </div>

          <div className="bg-white/5 p-4 border border-white/10">
            <span className="text-[9px] font-mono-tech text-emerald-500 uppercase mb-3 block">Add Exercise to Bundle</span>
            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2">
              <div className="col-span-2 sm:col-span-6"><select value={currentExercise.name} onChange={e => setCurrentExercise({ ...currentExercise, name: e.target.value })} className="w-full bg-black border border-white/10 p-2 text-[10px] font-mono-tech h-full">{EXERCISE_DB[selectedFolder]?.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}</select></div>
              <div className="col-span-1 sm:col-span-2"><input type="number" value={currentExercise.sets} onChange={e => setCurrentExercise({ ...currentExercise, sets: parseInt(e.target.value) })} className="w-full bg-black border border-white/10 p-2 text-center text-base sm:text-xs min-h-[44px]" placeholder="Sets" /></div>
              <div className="col-span-1 sm:col-span-2"><input type="number" value={currentExercise.reps} onChange={e => setCurrentExercise({ ...currentExercise, reps: parseInt(e.target.value) })} className="w-full bg-black border border-white/10 p-2 text-center text-base sm:text-xs min-h-[44px]" placeholder="Reps" /></div>
              <button onClick={handleAddExerciseToBundle} className="col-span-2 sm:col-span-2 bg-white text-black font-bold text-xs hover:bg-emerald-500 min-h-[44px]">+</button>
            </div>
          </div>

          <div className="space-y-2">
            {builderExercises.map((ex, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-neutral-900 border-l-2 border-emerald-500">
                <span className="font-mono-tech text-xs">{i + 1}. {ex.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => moveExercise(i, 'up')} className="text-neutral-600 hover:text-white"><ArrowUp size={10} /></button>
                  <button onClick={() => moveExercise(i, 'down')} className="text-neutral-600 hover:text-white"><ArrowDown size={10} /></button>
                  <span className="font-mono-tech text-[10px] text-neutral-500 mx-2">{ex.sets} x {ex.reps}</span>
                  <button onClick={() => handleRemoveExerciseFromBundle(i)} className="text-neutral-600 hover:text-red-500"><X size={12} /></button>
                </div>
              </div>
            ))}
            {builderExercises.length === 0 && <div className="text-center py-8 text-neutral-600 font-mono-tech text-xs border border-dashed border-white/10">BUNDLE EMPTY</div>}
          </div>
        </div>
        <div className="pt-4 mt-4 border-t border-white/10 flex gap-2">
          {editingRoutineId && <button onClick={handleCancelEdit} className="flex-1 py-3 border border-white/10 text-xs font-mono-tech hover:bg-white/5">CANCEL</button>}
          <button onClick={handleSave} className="flex-[2] py-3 bg-emerald-500 text-black font-bold font-mono-tech text-xs hover:bg-white transition-all">{editingRoutineId ? 'UPDATE BUNDLE' : 'SAVE TO LIBRARY'}</button>
        </div>
      </div>
      <div className="lg:col-span-5 glass-panel p-0 flex flex-col max-h-[60vh] lg:max-h-none">
        <div className="flex overflow-x-auto border-b border-white/10 p-2 gap-2">{Object.keys(EXERCISE_DB).map(cat => (<button key={cat} onClick={() => setSelectedFolder(cat)} className={`px-4 py-2 text-[10px] font-mono-tech uppercase tracking-widest transition-all ${selectedFolder === cat ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}>{cat}</button>))}</div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {routines.filter(r => r.category === selectedFolder.toUpperCase()).map(r => (
            <div key={r.id} className="group p-4 border border-white/5 hover:border-emerald-500/30 bg-white/5 transition-all">
              <div className="flex justify-between items-start mb-2"><h4 className="font-bebas text-xl">{r.name}</h4><div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleEditRoutineLoad(r)} className="text-neutral-400 hover:text-white"><Edit3 size={14} /></button><button onClick={() => onDeleteRoutine(r.id)} className="text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button></div></div>
              <div className="space-y-1">{(Array.isArray(r.exercises) ? r.exercises : []).slice(0, 3).map((ex, i) => (<div key={i} className="flex justify-between text-[9px] font-mono-tech text-neutral-500"><span>{ex.name}</span><span>{ex.sets}x{ex.reps}</span></div>))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
