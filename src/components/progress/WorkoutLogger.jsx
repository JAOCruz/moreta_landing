import { useState } from 'react';
import { Dumbbell, Plus, Minus, Save, Star } from 'lucide-react';

export const WorkoutLogger = ({ routine, onSave, onCancel }) => {
  const [workoutData, setWorkoutData] = useState({
    started_at: new Date().toISOString(),
    difficulty_rating: 5,
    energy_level: 5,
    notes: '',
    exercises: (routine?.exercises || []).map(ex => ({
      exercise_name: ex.name,
      sets_completed: ex.sets,
      reps: Array(ex.sets).fill(ex.reps),
      weight: Array(ex.sets).fill(0),
      form_rating: 3,
      completed: true,
      notes: ''
    }))
  });

  const updateExercise = (index, field, value) => {
    const updated = [...workoutData.exercises];
    updated[index][field] = value;
    setWorkoutData({ ...workoutData, exercises: updated });
  };

  const updateSet = (exerciseIdx, setIdx, field, value) => {
    const updated = [...workoutData.exercises];
    updated[exerciseIdx][field][setIdx] = parseFloat(value) || 0;
    setWorkoutData({ ...workoutData, exercises: updated });
  };

  const addSet = (exerciseIdx) => {
    const updated = [...workoutData.exercises];
    const lastReps = updated[exerciseIdx].reps[updated[exerciseIdx].reps.length - 1] || 0;
    const lastWeight = updated[exerciseIdx].weight[updated[exerciseIdx].weight.length - 1] || 0;

    updated[exerciseIdx].reps.push(lastReps);
    updated[exerciseIdx].weight.push(lastWeight);
    updated[exerciseIdx].sets_completed += 1;
    setWorkoutData({ ...workoutData, exercises: updated });
  };

  const removeSet = (exerciseIdx) => {
    const updated = [...workoutData.exercises];
    if (updated[exerciseIdx].sets_completed > 1) {
      updated[exerciseIdx].reps.pop();
      updated[exerciseIdx].weight.pop();
      updated[exerciseIdx].sets_completed -= 1;
      setWorkoutData({ ...workoutData, exercises: updated });
    }
  };

  const handleSubmit = () => {
    onSave({
      ...workoutData,
      completed_at: new Date().toISOString(),
      duration_minutes: Math.round((new Date() - new Date(workoutData.started_at)) / 60000),
      total_volume: workoutData.exercises.reduce((total, ex) => {
        return total + ex.reps.reduce((sum, reps, idx) => sum + (reps * ex.weight[idx]), 0);
      }, 0)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dumbbell className="text-emerald-500" size={24} />
          <h2 className="font-bebas text-3xl text-white">LOG WORKOUT</h2>
        </div>
        <span className="font-mono-tech text-xs text-neutral-500">
          {new Date(workoutData.started_at).toLocaleTimeString()}
        </span>
      </div>

      {routine && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4">
          <span className="font-mono-tech text-[9px] text-emerald-500 uppercase">Routine</span>
          <h3 className="font-bebas text-2xl text-white">{routine.name}</h3>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-6">
        {workoutData.exercises.map((exercise, exIdx) => (
          <div key={exIdx} className="glass-panel p-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-white">{exercise.exercise_name}</h4>
                <span className="font-mono-tech text-xs text-neutral-500">
                  {exercise.sets_completed} sets
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => removeSet(exIdx)}
                  className="p-2 border border-white/10 hover:bg-red-500/20 hover:border-red-500 transition-all"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => addSet(exIdx)}
                  className="p-2 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Sets Grid */}
            <div className="grid grid-cols-[auto_1fr_1fr] gap-2 mb-4">
              <div className="font-mono-tech text-[9px] text-neutral-600 uppercase px-2 py-1">Set</div>
              <div className="font-mono-tech text-[9px] text-neutral-600 uppercase px-2 py-1">Reps</div>
              <div className="font-mono-tech text-[9px] text-neutral-600 uppercase px-2 py-1">Weight (kg)</div>

              {exercise.reps.map((_, setIdx) => (
                <div key={setIdx} className="contents">
                  <div className="flex items-center justify-center font-mono-tech text-sm text-neutral-500 bg-white/5 px-2 py-2">
                    {setIdx + 1}
                  </div>
                  <input
                    type="number"
                    value={exercise.reps[setIdx]}
                    onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                    className="bg-neutral-900 border border-white/10 p-2 text-center font-mono-tech text-white focus:border-emerald-500 outline-none"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={exercise.weight[setIdx]}
                    onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                    className="bg-neutral-900 border border-white/10 p-2 text-center font-mono-tech text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Form Rating */}
            <div>
              <label className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">
                Form Quality
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => updateExercise(exIdx, 'form_rating', rating)}
                    className={`p-2 transition-all ${
                      exercise.form_rating >= rating
                        ? 'text-emerald-500'
                        : 'text-neutral-700 hover:text-neutral-500'
                    }`}
                  >
                    <Star size={16} fill={exercise.form_rating >= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Ratings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">
            Difficulty (1-10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={workoutData.difficulty_rating}
            onChange={(e) => setWorkoutData({ ...workoutData, difficulty_rating: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-center font-bebas text-2xl text-white mt-2">
            {workoutData.difficulty_rating}
          </div>
        </div>
        <div>
          <label className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">
            Energy Level (1-10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={workoutData.energy_level}
            onChange={(e) => setWorkoutData({ ...workoutData, energy_level: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-center font-bebas text-2xl text-white mt-2">
            {workoutData.energy_level}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">Workout Notes</label>
        <textarea
          value={workoutData.notes}
          onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
          placeholder="How did it feel? Any observations?"
          rows={3}
          className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-xs text-white focus:border-emerald-500 outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-white/10 text-neutral-500 font-mono-tech text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="flex-[2] py-3 bg-emerald-500 text-black font-mono-tech text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
        >
          <Save size={14} />
          Save Workout
        </button>
      </div>
    </div>
  );
};
