import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Camera, Dumbbell, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { SectionHeader } from '../ui/SectionHeader';
import { MeasurementCard } from '../progress/MeasurementCard';
import { BodyMeasurementsForm } from '../progress/BodyMeasurementsForm';
import { ProgressPhotos } from '../progress/ProgressPhotos';
import { WorkoutLogger } from '../progress/WorkoutLogger';
import { ProgressChart } from '../progress/ProgressChart';

export const ProgressView = ({ userId, routine }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [measurements, setMeasurements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [showWorkoutLogger, setShowWorkoutLogger] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_value: '', current_value: 0, unit: 'kg', target_date: '' });

  useEffect(() => {
    if (userId) {
      fetchProgressData();
    }
  }, [userId]);

  const fetchProgressData = async () => {
    const [measRes, photoRes, workoutRes, goalsRes] = await Promise.all([
      supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(10),
      supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false }),
      supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false })
        .limit(30),
      supabase
        .from('client_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
    ]);

    if (!measRes.error) setMeasurements(measRes.data);
    if (!photoRes.error) setPhotos(photoRes.data);
    if (!workoutRes.error) setWorkoutLogs(workoutRes.data);
    if (!goalsRes.error) setGoals(goalsRes.data);
  };

  const handleSaveMeasurement = async (data) => {
    const { error } = await supabase
      .from('body_measurements')
      .insert([{ ...data, user_id: userId }]);

    if (!error) {
      setShowMeasurementForm(false);
      fetchProgressData();
      toast.success('Measurements saved!');
    } else {
      toast.error('Error: ' + error.message);
    }
  };

  const handleUploadPhoto = async (photoData) => {
    // In production, upload to Supabase Storage first
    const { error } = await supabase
      .from('progress_photos')
      .insert([{ ...photoData, user_id: userId }]);

    if (!error) {
      fetchProgressData();
    } else {
      toast.error('Error: ' + error.message);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const { error } = await supabase
      .from('progress_photos')
      .delete()
      .eq('id', photoId);

    if (!error) {
      fetchProgressData();
    }
  };

  const handleSaveWorkout = async (workoutData) => {
    // Save workout log
    const { data: workoutLog, error: workoutError } = await supabase
      .from('workout_logs')
      .insert([{
        user_id: userId,
        routine_id: routine?.id,
        workout_date: new Date().toISOString().split('T')[0],
        started_at: workoutData.started_at,
        completed_at: workoutData.completed_at,
        duration_minutes: workoutData.duration_minutes,
        total_volume: workoutData.total_volume,
        difficulty_rating: workoutData.difficulty_rating,
        energy_level: workoutData.energy_level,
        notes: workoutData.notes
      }])
      .select()
      .single();

    if (workoutError) {
      toast.error('Error saving workout: ' + workoutError.message);
      return;
    }

    // Save exercise logs
    const exerciseLogs = workoutData.exercises.map((ex, idx) => ({
      workout_log_id: workoutLog.id,
      user_id: userId,
      exercise_name: ex.exercise_name,
      exercise_order: idx + 1,
      sets_completed: ex.sets_completed,
      reps: ex.reps,
      weight: ex.weight,
      form_rating: ex.form_rating,
      completed: ex.completed,
      notes: ex.notes
    }));

    const { error: exerciseError } = await supabase
      .from('exercise_logs')
      .insert(exerciseLogs);

    if (!exerciseError) {
      setShowWorkoutLogger(false);
      fetchProgressData();
      toast.success('Workout logged successfully!');
    } else {
      toast.error('Error saving exercises: ' + exerciseError.message);
    }
  };

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'measurements', label: 'Measurements', icon: TrendingUp },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'goals', label: 'Goals', icon: Target }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader number="PROG" title="Progress Tracking" />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-mono-tech text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'text-emerald-500 border-b-2 border-emerald-500'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowMeasurementForm(true)}
              className="p-6 glass-panel border border-emerald-500/30 hover:border-emerald-500 transition-all group"
            >
              <TrendingUp className="text-emerald-500 mb-3 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="font-bebas text-xl text-white">Log Measurements</h3>
              <p className="font-mono-tech text-xs text-neutral-500 mt-1">Track body metrics</p>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className="p-6 glass-panel border border-white/10 hover:border-emerald-500 transition-all group"
            >
              <Camera className="text-neutral-500 group-hover:text-emerald-500 mb-3 group-hover:scale-110 transition-all" size={24} />
              <h3 className="font-bebas text-xl text-white">Add Photo</h3>
              <p className="font-mono-tech text-xs text-neutral-500 mt-1">Visual progress</p>
            </button>

            <button
              onClick={() => setShowWorkoutLogger(true)}
              className="p-6 glass-panel border border-white/10 hover:border-emerald-500 transition-all group"
            >
              <Dumbbell className="text-neutral-500 group-hover:text-emerald-500 mb-3 group-hover:scale-110 transition-all" size={24} />
              <h3 className="font-bebas text-xl text-white">Log Workout</h3>
              <p className="font-mono-tech text-xs text-neutral-500 mt-1">Record performance</p>
            </button>
          </div>

          {/* Latest Measurements */}
          {latestMeasurement && (
            <div>
              <h3 className="font-mono-tech text-xs text-neutral-400 uppercase tracking-widest mb-4">
                Latest Measurements
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MeasurementCard
                  label="Weight"
                  current={latestMeasurement.weight}
                  previous={previousMeasurement?.weight}
                  unit="kg"
                  format="1"
                />
                <MeasurementCard
                  label="Body Fat"
                  current={latestMeasurement.body_fat_percentage}
                  previous={previousMeasurement?.body_fat_percentage}
                  unit="%"
                  format="1"
                />
                <MeasurementCard
                  label="Chest"
                  current={latestMeasurement.chest}
                  previous={previousMeasurement?.chest}
                  unit="cm"
                  format="1"
                />
                <MeasurementCard
                  label="Waist"
                  current={latestMeasurement.waist}
                  previous={previousMeasurement?.waist}
                  unit="cm"
                  format="1"
                />
              </div>
            </div>
          )}

          {/* Recent Photos */}
          {photos.length > 0 && (
            <div>
              <h3 className="font-mono-tech text-xs text-neutral-400 uppercase tracking-widest mb-4">
                Recent Photos ({photos.length})
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {photos.slice(0, 6).map((photo, idx) => (
                  <img
                    key={photo.id || idx}
                    src={photo.photo_url}
                    alt={photo.photo_type}
                    className="aspect-square object-cover border border-white/10 hover:border-emerald-500 transition-all cursor-pointer"
                    onClick={() => setActiveTab('photos')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Workout Stats */}
          {workoutLogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-6 border border-white/10">
                <span className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">Total Workouts</span>
                <span className="font-bebas text-5xl text-white">{workoutLogs.length}</span>
              </div>
              <div className="glass-panel p-6 border border-white/10">
                <span className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">Avg Duration</span>
                <span className="font-bebas text-5xl text-white">
                  {Math.round(workoutLogs.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workoutLogs.length)}
                  <span className="text-2xl text-neutral-600"> min</span>
                </span>
              </div>
              <div className="glass-panel p-6 border border-white/10">
                <span className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">Total Volume</span>
                <span className="font-bebas text-5xl text-white">
                  {Math.round(workoutLogs.reduce((sum, w) => sum + (w.total_volume || 0), 0) / 1000)}
                  <span className="text-2xl text-neutral-600"> tons</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Measurements Tab */}
      {activeTab === 'measurements' && (
        <div className="space-y-8">
          {!showMeasurementForm ? (
            <>
              <button
                onClick={() => setShowMeasurementForm(true)}
                className="w-full py-4 border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 text-emerald-500 font-mono-tech text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add New Measurement
              </button>

              {measurements.length > 0 && (
                <>
                  <ProgressChart
                    data={measurements.slice().reverse()}
                    dataKey="weight"
                    label="Weight Progress"
                    unit="kg"
                    color="#10b981"
                  />

                  {measurements[0].body_fat_percentage && (
                    <ProgressChart
                      data={measurements.filter(m => m.body_fat_percentage).slice().reverse()}
                      dataKey="body_fat_percentage"
                      label="Body Fat Percentage"
                      unit="%"
                      color="#f59e0b"
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <BodyMeasurementsForm
              onSave={handleSaveMeasurement}
              onCancel={() => setShowMeasurementForm(false)}
            />
          )}
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <ProgressPhotos
          photos={photos}
          onUpload={handleUploadPhoto}
          onDelete={handleDeletePhoto}
        />
      )}

      {/* Workouts Tab */}
      {activeTab === 'workouts' && (
        <div className="space-y-6">
          {!showWorkoutLogger ? (
            <>
              <button
                onClick={() => setShowWorkoutLogger(true)}
                className="w-full py-4 border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 text-emerald-500 font-mono-tech text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Log New Workout
              </button>

              {/* Workout History */}
              <div className="space-y-4">
                {workoutLogs.map(log => (
                  <div key={log.id} className="glass-panel p-6 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono-tech text-[9px] text-emerald-500 uppercase">
                          {new Date(log.workout_date).toLocaleDateString()}
                        </span>
                        <h4 className="font-bebas text-2xl text-white mt-1">Workout Session</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-bebas text-3xl text-white">{log.duration_minutes}</span>
                        <span className="font-mono-tech text-xs text-neutral-600"> min</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <span className="font-mono-tech text-[9px] text-neutral-600 uppercase block">Volume</span>
                        <span className="font-mono-tech text-sm text-white">{log.total_volume || 0} kg</span>
                      </div>
                      <div>
                        <span className="font-mono-tech text-[9px] text-neutral-600 uppercase block">Difficulty</span>
                        <span className="font-mono-tech text-sm text-white">{log.difficulty_rating}/10</span>
                      </div>
                      <div>
                        <span className="font-mono-tech text-[9px] text-neutral-600 uppercase block">Energy</span>
                        <span className="font-mono-tech text-sm text-white">{log.energy_level}/10</span>
                      </div>
                    </div>
                    {log.notes && (
                      <p className="mt-4 font-mono-tech text-xs text-neutral-400">{log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <WorkoutLogger
              routine={routine}
              onSave={handleSaveWorkout}
              onCancel={() => setShowWorkoutLogger(false)}
            />
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="w-full py-4 border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 text-emerald-500 font-mono-tech text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {showGoalForm ? 'Cancelar' : 'Create New Goal'}
          </button>

          {showGoalForm && (
            <div className="glass-panel p-6 border border-emerald-500/20 space-y-4">
              <input type="text" placeholder="Goal title (e.g. Lose 10kg)" value={newGoal.title}
                onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                className="w-full bg-neutral-900/50 border border-neutral-800 p-3 text-sm font-mono-tech placeholder-neutral-600 focus:border-emerald-500/40 outline-none" />
              <input type="text" placeholder="Description (optional)" value={newGoal.description}
                onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                className="w-full bg-neutral-900/50 border border-neutral-800 p-3 text-sm font-mono-tech placeholder-neutral-600 focus:border-emerald-500/40 outline-none" />
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Target" value={newGoal.target_value}
                  onChange={e => setNewGoal({...newGoal, target_value: parseFloat(e.target.value) || ''})}
                  className="bg-neutral-900/50 border border-neutral-800 p-3 text-sm font-mono-tech placeholder-neutral-600 focus:border-emerald-500/40 outline-none" />
                <select value={newGoal.unit} onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                  className="bg-neutral-900/50 border border-neutral-800 p-3 text-sm font-mono-tech text-white focus:border-emerald-500/40 outline-none">
                  <option value="kg">kg</option><option value="lbs">lbs</option><option value="reps">reps</option>
                  <option value="min">min</option><option value="sessions">sessions</option><option value="%">%</option>
                </select>
                <input type="date" value={newGoal.target_date}
                  onChange={e => setNewGoal({...newGoal, target_date: e.target.value})}
                  className="bg-neutral-900/50 border border-neutral-800 p-3 text-sm font-mono-tech text-white focus:border-emerald-500/40 outline-none" />
              </div>
              <button onClick={async () => {
                if (!newGoal.title) return;
                const { error } = await supabase.from('client_goals').insert([{
                  user_id: userId, title: newGoal.title, description: newGoal.description,
                  target_value: newGoal.target_value || null, current_value: 0,
                  unit: newGoal.unit, target_date: newGoal.target_date || null
                }]);
                if (error) { console.error(error); return; }
                const { data } = await supabase.from('client_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
                if (data) setGoals(data);
                setNewGoal({ title: '', description: '', target_value: '', current_value: 0, unit: 'kg', target_date: '' });
                setShowGoalForm(false);
              }}
                className="w-full py-3 bg-emerald-500 text-black font-mono-tech text-xs uppercase tracking-widest font-bold hover:bg-emerald-400 transition-all">
                Save Goal
              </button>
            </div>
          )}

          {goals.map(goal => (
            <div key={goal.id} className="glass-panel p-6 border border-white/10">
              <h4 className="font-bebas text-2xl text-white">{goal.title}</h4>
              <p className="font-mono-tech text-xs text-neutral-400 mt-2">{goal.description}</p>

              {/* Progress Bar */}
              {goal.target_value && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono-tech text-xs text-neutral-500">{goal.current_value} / {goal.target_value} {goal.unit}</span>
                    <span className="font-mono-tech text-xs text-emerald-500">
                      {Math.round((goal.current_value / goal.target_value) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-900 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {goal.target_date && (
                <p className="font-mono-tech text-xs text-neutral-600 mt-3">
                  Target: {new Date(goal.target_date).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
