import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, DollarSign, Dumbbell, Activity, Plus, X, ChevronRight, 
  Lock, User, LogOut, Edit3, Settings, Menu, Loader2, AlertTriangle, 
  Home, Clock, Layout, CreditCard, Trash2, Users, ClipboardList, 
  Folder, CheckSquare, Key, ArrowUp, ArrowDown
} from 'lucide-react';
import { supabase } from './lib/supabase';
import gsap from 'gsap';
import { EXERCISE_DB } from './data/exercises';

// --- STYLES ---
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
    
    .font-bebas { font-family: 'Bebas Neue', sans-serif; }
    .font-inter { font-family: 'Inter', sans-serif; }
    .font-mono-tech { font-family: 'JetBrains Mono', monospace; }
    
    .glass-panel {
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
    }
    
    input:focus, select:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.2) !important;
    }

    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
  `}</style>
);

// --- HELPERS ---
const getMonday = (d) => {
  d = new Date(d);
  const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
}

// --- COMPONENTS ---
const SectionHeader = ({ number, title }) => (
  <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-2">
    <h2 className="font-bebas text-3xl tracking-wide text-white">{title}</h2>
    <span className="font-mono-tech text-xs text-neutral-600 tracking-widest">[ {number} ]</span>
  </div>
);

const LoginScreen = ({ onLogin, onSignup, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignupMode) {
      onSignup(email, password);
    } else {
      onLogin(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-inter">
      <Styles />
      <div className="absolute inset-0 tactical-grid opacity-20"></div>
      
      <form onSubmit={handleSubmit} className="z-10 w-full max-w-md p-10 glass-panel border border-neutral-800 animate-in fade-in zoom-in duration-500">
        <div className="mb-10 text-center">
          <h1 className="font-bebas text-7xl mb-2 tracking-tighter">MORETA FITNESS</h1>
          <p className="font-mono-tech text-[10px] text-neutral-500 tracking-[0.3em] uppercase">
            {isSignupMode ? 'Client Registration' : 'Tactical Dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono-tech flex items-center gap-3">
            <AlertTriangle size={14} />
            {error.message}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Client Identifier</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-white/20">
              <User size={16} className="text-neutral-500 mr-3" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@moreta.fit" 
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800" 
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Access Key</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-white/20">
              <Lock size={16} className="text-neutral-500 mr-3" />
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800" 
              />
            </div>
            {isSignupMode && (
              <p className="text-[9px] text-neutral-600 font-mono-tech mt-2 ml-1">
                * Minimum 6 characters required
              </p>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold font-mono-tech py-5 text-xs uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50 transition-all flex justify-center items-center gap-3 group"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {isSignupMode ? 'Create Account' : 'Access System'}
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Toggle between Login/Signup */}
          <div className="text-center pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setIsSignupMode(!isSignupMode);
                setEmail('');
                setPassword('');
              }}
              className="text-neutral-500 hover:text-white text-xs font-mono-tech uppercase tracking-widest transition-colors"
            >
              {isSignupMode ? '← Back to Login' : 'New Client? Register Here →'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="absolute bottom-8 flex gap-8 text-[9px] text-neutral-600 font-mono-tech uppercase tracking-widest">
        <span>System Status: Online</span>
        <span>Version: 5.3.0-FINAL-STABLE</span>
      </div>
    </div>
  );
};

// --- MISSION CONTROL MODAL ---
const CommandModal = ({ isOpen, title, fields, onSubmit, onCancel, onDelete, participants = [], routines = [] }) => {
  const [formData, setFormData] = useState({});
  const [squadData, setSquadData] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      fields.forEach(f => initial[f.name] = f.defaultValue || '');
      setFormData(initial);
      setSquadData(participants);
    }
  }, [isOpen, fields, participants]);

  const handleAssignRoutineToUser = (userId, routineId) => {
    const updatedSquad = squadData.map(p => 
      p.id === userId ? { ...p, assigned_routine_id: routineId } : p
    );
    setSquadData(updatedSquad);
  };

  const handleSubmit = () => {
    onSubmit(formData, squadData);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="fixed inset-0 tactical-grid opacity-20 pointer-events-none"></div>
      
      <div className="glass-panel w-full max-w-2xl p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        {/* Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/40"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/40"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/40"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <ChevronRight size={18} className="text-white animate-pulse" />
          <h2 className="font-bebas text-3xl tracking-wider text-white uppercase">{title}</h2>
        </div>

        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.3em] block ml-1">{field.label}</label>
              
              {field.type === 'select' ? (
                <select
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                    className="w-full bg-neutral-900/50 border border-white/10 px-5 py-4 font-mono-tech text-xs text-white focus:outline-none focus:border-white/40 transition-all rounded-none"
                >
                    <option value="">-- SELECT --</option>
                    {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
              ) : (
                <input
                    autoFocus={field.name === fields[0].name}
                    type={field.type || 'text'}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                    placeholder={field.placeholder}
                    className="w-full bg-neutral-900/50 border border-white/10 px-5 py-4 font-mono-tech text-xs text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/40 transition-all rounded-none"
                />
              )}
            </div>
          ))}

          {/* SQUAD MANAGEMENT (Admin Only) */}
          {squadData.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-4 text-neutral-500">
                <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span className="font-mono-tech text-[10px] uppercase tracking-widest">Active Squad ({squadData.length})</span>
                </div>
                <span className="font-mono-tech text-[8px] uppercase tracking-widest">ASSIGN SPECIFIC ORDERS</span>
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                {squadData.map((p, i) => (
                  <div key={i} className="bg-white/5 p-3 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="font-mono-tech text-[10px] text-white truncate max-w-[150px]">{p.email}</span>
                    </div>
                    {/* PER-USER ROUTINE SELECTOR */}
                    <select 
                        value={p.assigned_routine_id || ''}
                        onChange={(e) => handleAssignRoutineToUser(p.id, e.target.value)}
                        className="bg-black/50 border border-white/10 text-[9px] text-white py-1 px-2 font-mono-tech focus:border-emerald-500 outline-none w-40"
                    >
                        <option value="">-- NO ROUTINE --</option>
                        {routines.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-10">
          {onDelete && (
            <button onClick={onDelete} className="px-4 py-4 border border-red-900/50 bg-red-900/10 text-red-500 font-mono-tech text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={onCancel} className="flex-1 py-4 border border-neutral-800 text-neutral-500 font-mono-tech text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">// CANCEL</button>
          <button onClick={handleSubmit} className="flex-1 py-4 bg-white text-black font-mono-tech text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">EXECUTE ORDERS</button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL: CLIENT SESSION DETAIL ---
const ClientSessionModal = ({ isOpen, session, routine, onLeave, onClose }) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="fixed inset-0 tactical-grid opacity-20 pointer-events-none"></div>
      <div className="glass-panel w-full max-w-lg p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="flex justify-between items-start mb-8">
            <div>
                <span className="font-mono-tech text-[10px] text-emerald-500 uppercase tracking-widest">ACTIVE SESSION</span>
                <h2 className="font-bebas text-4xl text-white mt-1">{session.day} @ {session.time}</h2>
                <p className="font-mono-tech text-xs text-neutral-400 mt-1">{session.date}</p>
            </div>
            <button onClick={onClose} className="text-neutral-500 hover:text-white"><X size={20} /></button>
        </div>

        {routine ? (
            <div className="space-y-4 mb-8">
                <div className="p-4 bg-white/5 border border-white/10">
                    <span className="font-mono-tech text-[9px] text-neutral-500 uppercase block mb-2">ASSIGNED PROTOCOL</span>
                    <h3 className="font-bold text-xl text-white">{routine.name}</h3>
                    <span className="text-[10px] font-mono-tech text-emerald-500 bg-emerald-500/10 px-2 py-1 mt-2 inline-block">{routine.category}</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {Array.isArray(routine.exercises) && routine.exercises.map((ex, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-neutral-900 border border-white/5">
                            <span className="font-mono-tech text-xs text-white">{i+1}. {ex.name}</span>
                            <span className="font-mono-tech text-[10px] text-neutral-400">{ex.sets} x {ex.reps}</span>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="p-8 border border-dashed border-white/10 text-center mb-8">
                <p className="font-mono-tech text-xs text-neutral-500">NO ORDERS ASSIGNED YET</p>
            </div>
        )}

        <button onClick={onLeave} className="w-full py-4 bg-red-500/10 border border-red-500/50 text-red-500 font-mono-tech text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
            LEAVE SESSION SLOT
        </button>
      </div>
    </div>
  );
};

const DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const HOURS = [ '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '---', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00' ];

const Sidebar = ({ activeView, onViewChange, onLogout, userRole }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'schedule', icon: Clock, label: 'Horario' },
    // Admin Only
    ...(userRole === 'admin' ? [
        { id: 'builder', icon: Dumbbell, label: 'Builder' },
        { id: 'finance', icon: DollarSign, label: 'Pagos' }
    ] : []),
    // Client Only
    ...(userRole === 'client' ? [
        { id: 'my_routine', icon: ClipboardList, label: 'My Orders' }
    ] : []),
    // Everyone
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="w-20 lg:w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col items-center lg:items-stretch py-8 relative z-[60]">
      <div className="px-6 mb-12 text-center lg:text-left">
        <h1 className="font-bebas text-4xl tracking-tighter text-white">M<span className="text-neutral-500">.</span>FIT</h1>
        {userRole === 'admin' && <span className="hidden lg:block font-mono-tech text-[9px] text-emerald-500 uppercase tracking-widest mt-2">COMMANDER ACCESS</span>}
        {userRole === 'client' && <span className="hidden lg:block font-mono-tech text-[9px] text-blue-500 uppercase tracking-widest mt-2">OPERATIVE ACCESS</span>}
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 transition-all group relative ${
              activeView === item.id 
                ? 'bg-white/5 text-white border-r-2 border-white' 
                : 'text-neutral-500 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} className={activeView === item.id ? 'animate-pulse' : ''} />
            <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.2em]">
              {item.label}
            </span>
            {activeView === item.id && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-4 text-neutral-600 hover:text-red-500 transition-all group"
        >
          <LogOut size={20} />
          <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.2em]">
            Log Out
          </span>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const viewRef = useRef(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // MODALS
  const [adminModal, setAdminModal] = useState({ isOpen: false });
  const [clientModal, setClientModal] = useState({ isOpen: false, session: null, routine: null });

  // DATA STATE
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [wellness, setWellness] = useState({
    sleep_hours: 0,
    stress_level: '...',
    water_liters: 0,
    diet_score: 0
  });

  // SETTINGS STATE
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // BUILDER STATE
  const firstBodyPart = Object.keys(EXERCISE_DB)[0] || 'legs'; 
  const [selectedFolder, setSelectedFolder] = useState(firstBodyPart); 
  const [builderRoutineName, setBuilderRoutineName] = useState('');
  const [builderExercises, setBuilderExercises] = useState([]); 
  const [currentExercise, setCurrentExercise] = useState({ name: '', sets: 3, reps: 12 });
  const [editingRoutineId, setEditingRoutineId] = useState(null);

  // Update initial exercise
  useEffect(() => {
    if (EXERCISE_DB[selectedFolder]?.length > 0) {
        setCurrentExercise(prev => ({ ...prev, name: EXERCISE_DB[selectedFolder][0].name }));
    }
  }, [selectedFolder]);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', fields: [] });

  // --- INITIALIZATION ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkUserRole(session.user.id);
        fetchDashboardData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkUserRole(session.user.id);
        fetchDashboardData(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [currentWeekStart]);

  const checkUserRole = async (uid) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', uid).single();
    if (data) setUserRole(data.role);
    else setUserRole('client'); // Default safety
    setLoading(false);
  };

  const fetchDashboardData = async (userId) => {
    const startStr = currentWeekStart.toISOString().split('T')[0];
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const endStr = end.toISOString().split('T')[0];

    // Clients see ALL sessions (RLS allows view), Admin sees created sessions
    const [sessRes, payRes, routRes] = await Promise.all([
      supabase.from('sessions').select('*').gte('date', startStr).lte('date', endStr).order('time', { ascending: true }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('routines').select('*').order('created_at', { ascending: false }),
    ]);

    if (!sessRes.error) setSessions(sessRes.data);
    if (!payRes.error) setPayments(payRes.data);
    if (!routRes.error) setRoutines(routRes.data);

    const channels = [
      supabase.channel('public:sessions').on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => fetchDashboardData(userId)).subscribe(),
      supabase.channel('public:payments').on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchDashboardData(userId)).subscribe(),
      supabase.channel('public:routines').on('postgres_changes', { event: '*', schema: 'public', table: 'routines' }, () => fetchDashboardData(userId)).subscribe(),
    ];
    return () => channels.forEach(c => c.unsubscribe());
  };

  // --- ACTIONS ---
  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return alert("Password must be at least 6 characters.");
    
    // 1. Verify Current Password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword
    });

    if (verifyError) {
        alert("SECURITY ALERT: Current password incorrect.");
        return;
    }

    // 2. Update Password
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert("Error: " + error.message);
    else {
        alert("Password updated successfully!");
        setNewPassword('');
        setCurrentPassword('');
    }
  };

  // --- BUILDER ACTIONS ---
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

  const handleSaveRoutineBundle = async () => {
    if (!builderRoutineName || builderExercises.length === 0) {
        return alert("Name routine and add at least 1 exercise.");
    }
    
    const payload = {
        name: builderRoutineName,
        category: selectedFolder.toUpperCase(),
        exercises: builderExercises,
        user_id: session.user.id
    };

    // 🔍 DEBUG: Log what we're sending
    console.log('🔍 Payload being sent to Supabase:', JSON.stringify(payload, null, 2));

    if (editingRoutineId) {
        const { data, error } = await supabase
            .from('routines')
            .update(payload)
            .eq('id', editingRoutineId);
        
        if (error) {
            console.error('❌ Update error:', error);
            alert('Update failed: ' + error.message + '\nDetails: ' + (error.details || 'Check console'));
            return;
        }
        console.log('✅ Routine updated:', data);
        setEditingRoutineId(null);
    } else {
        const { data, error } = await supabase
            .from('routines')
            .insert([payload]);
        
        if (error) {
            console.error('❌ Insert error:', error);
            alert('Insert failed: ' + error.message + '\nDetails: ' + (error.details || 'Check console for full error'));
            return;
        }
        console.log('✅ Routine created:', data);
    }
    
    setBuilderRoutineName('');
    setBuilderExercises([]);
    alert('✅ Routine saved successfully!');
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

  // --- SCHEDULE LOGIC ---
  const handleToggleAvailability = async (day, time) => {
    const existing = sessions.find(s => s.day === day && s.time === time);
    const dayIndex = DAYS.indexOf(day);
    const specificDate = new Date(currentWeekStart);
    specificDate.setDate(specificDate.getDate() + dayIndex);
    const dateStr = specificDate.toISOString().split('T')[0];

    if (userRole === 'admin') {
        if (!existing) {
            // Create Slot
            const tempSlot = { id: 'temp-' + Date.now(), day, time, date: dateStr, status: 'open', capacity: 4, participants: [], user_id: session.user.id };
            setSessions(prev => [...prev, tempSlot]);
            const { data, error } = await supabase.from('sessions').insert([{ day, time, date: dateStr, status: 'open', capacity: 4, participants: [], user_id: session.user.id, client: 'OPEN', detail: '4 SLOTS' }]).select();
            if (data) setSessions(prev => prev.map(s => s.id === tempSlot.id ? data[0] : s));
            else { setSessions(prev => prev.filter(s => s.id !== tempSlot.id)); alert(error.message); }
        } else {
            // Manage Slot
            setAdminModal({
                isOpen: true,
                title: "Session Command Center",
                participants: existing.participants || [], 
                routines: routines,
                fields: [
                    { name: 'capacity', label: 'Capacity Limit', type: 'number', defaultValue: existing.capacity || 4 }
                ],
                onDelete: async () => {
                    if (!confirm("CONFIRM DELETION: This will remove the slot and kick all " + (existing.participants?.length || 0) + " users.")) return;
                    setSessions(prev => prev.filter(s => s.id !== existing.id));
                    await supabase.from('sessions').delete().eq('id', existing.id);
                    setAdminModal({ isOpen: false });
                },
                onSubmit: async (data, updatedSquad) => {
                    const { error } = await supabase.from('sessions').update({ 
                        capacity: parseInt(data.capacity),
                        participants: updatedSquad 
                    }).eq('id', existing.id);

                    if(error) alert(error.message);
                    setAdminModal({ isOpen: false });
                }
            });
        }
    } else if (userRole === 'client') {
        if (!existing) return;

        const myID = session.user.id;
        const myEmail = session.user.email;
        const isJoined = existing.participants?.some(p => p.id === myID);
        
        if (isJoined) {
            const myData = existing.participants.find(p => p.id === myID);
            const myRoutine = myData?.assigned_routine_id ? routines.find(r => r.id === myData.assigned_routine_id) : null;
            setClientModal({ isOpen: true, session: existing, routine: myRoutine });
        } else {
            if ((existing.participants?.length || 0) >= existing.capacity) return alert("Full.");
            const newParticipants = [...(existing.participants || []), { id: myID, email: session.user.email, assigned_routine_id: null }];
            await supabase.from('sessions').update({ participants: newParticipants }).eq('id', existing.id);
        }
    }
  };

  const handleClientLeave = async () => {
    if (!clientModal.session) return;
    const newParticipants = clientModal.session.participants.filter(p => p.id !== session.user.id);
    await supabase.from('sessions').update({ participants: newParticipants }).eq('id', clientModal.session.id);
    setClientModal({ isOpen: false, session: null, routine: null });
  };

  const handleViewChange = (newView) => {
    if (newView === activeView) return;
    if(viewRef.current) {
      gsap.to(viewRef.current, { opacity: 0, x: -20, duration: 0.3, onComplete: () => {
          setActiveView(newView);
          gsap.to(viewRef.current, { opacity: 1, x: 0, duration: 0.4, delay: 0.1, ease: "power2.out" });
      }});
    } else {
      setActiveView(newView);
    }
  };

  const handleAddPayment = (item = null) => {
    setModalConfig({
      isOpen: true,
      title: item ? "Adjust Revenue" : "Register Revenue",
      fields: [
        { name: 'name', label: 'Client Name', placeholder: 'FULL NAME', defaultValue: item?.name || '' },
        { name: 'amount', label: 'Credit ($)', placeholder: '0.00', type: 'number', defaultValue: item?.amount || '100' },
        { name: 'status', label: 'Status', placeholder: 'pagado / atrasado', defaultValue: item?.status || 'pendiente' }
      ],
      onSubmit: async (data) => {
        const query = item
          ? supabase.from('payments').update({ ...data, amount: parseFloat(data.amount), status: data.status.toLowerCase() }).eq('id', item.id)
          : supabase.from('payments').insert([{ ...data, amount: parseFloat(data.amount), status: data.status.toLowerCase(), user_id: session.user.id }]);
        const { error } = await query;
        if (error) alert(error.message);
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  const handleUpdateWellness = () => {
    setModalConfig({
      isOpen: true,
      title: "Telemetery Update",
      fields: [
        { name: 'sleep_hours', label: 'Recovery (HRS)', type: 'number', defaultValue: wellness.sleep_hours || "7.5" },
        { name: 'stress_level', label: 'Stress Index', placeholder: 'LOW / HI', defaultValue: wellness.stress_level || "LOW" },
        { name: 'water_liters', label: 'Hydration (L)', type: 'number', defaultValue: wellness.water_liters || "3.0" },
        { name: 'diet_score', label: 'Diet (1-10)', type: 'number', defaultValue: wellness.diet_score || "9" }
      ],
      onSubmit: async (data) => {
        const { error } = await supabase.from('wellness').upsert([{ ...wellness, sleep_hours: parseFloat(data.sleep_hours), stress_level: data.stress_level.toUpperCase(), water_liters: parseFloat(data.water_liters), diet_score: parseInt(data.diet_score), user_id: session.user.id }]);
        if (error) alert(error.message);
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  const handleLogin = async (email, password) => {
    setAuthLoading(true); setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error); 
    setAuthLoading(false);
  };

  const handleSignup = async (email, password) => {
    setAuthLoading(true); setAuthError(null);
    
    // 1. Create the user account
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: 'client' // Default role for new signups
        }
      }
    });
    
    if (error) {
      setAuthError(error);
      setAuthLoading(false);
      return;
    }

    // 2. Create profile entry with 'client' role
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user.id, 
            email: data.user.email,
            role: 'client' 
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't show this error to user - they can still log in
      }

      // Success message
      alert('✅ Account created! Please check your email to verify your account, then log in.');
      setAuthError(null);
    }
    
    setAuthLoading(false);
  };

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setSessions([]); 
    setPayments([]); 
    setRoutines([]); 
    setSession(null); 
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="text-white animate-spin" size={32} /></div>;
  if (!session) return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} loading={authLoading} error={authError} />;

  // FIND MY ROUTINE (Client)
  const myUpcomingSession = sessions.find(s => s.participants?.some(p => p.id === session.user.id));
  const myParticipantRecord = myUpcomingSession?.participants?.find(p => p.id === session.user.id);
  const myAssignedRoutine = myParticipantRecord?.assigned_routine_id 
    ? routines.find(r => r.id === myParticipantRecord.assigned_routine_id)
    : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-inter selection:bg-white selection:text-black">
      <Styles />
      <div className="fixed inset-0 tactical-grid opacity-10 pointer-events-none"></div>
      <Sidebar activeView={activeView} onViewChange={handleViewChange} onLogout={handleLogout} userRole={userRole} />

      <main className="flex-1 h-screen overflow-y-auto relative">
        <div ref={viewRef} className="p-8 lg:p-12 pb-24 opacity-100">
          <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
            <div>
              <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-[0.4em] mb-2">SYSTEM STATUS: <span className="text-emerald-500 animate-pulse">ACTIVE</span></p>
              <h1 className="font-bebas text-5xl tracking-widest text-shadow-glow">OPERATIONAL HUD</h1>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono-tech text-xs text-neutral-300">USER: {session.user.email}</span>
              <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mt-1">ROLE: {userRole?.toUpperCase()}</span>
            </div>
          </header>

          {/* --- DASHBOARD --- */}
          {activeView === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="glass-panel p-8 relative border-l-2 border-white/20">
                <SectionHeader number="01" title="Mission Schedule" />
                <div className="space-y-4">
                  {sessions.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                      <span className="font-mono-tech text-xs text-white">{s.day} {s.time}</span>
                      <span className="font-mono-tech text-[10px] text-neutral-500 uppercase">{s.participants?.length || 0}/{s.capacity || 4} Clients</span>
                    </div>
                  ))}
                  <button onClick={() => handleViewChange('schedule')} className="w-full py-4 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">Full Schedule</button>
                </div>
              </section>
              
              {userRole === 'admin' ? (
                <>
                  <section className="glass-panel p-8 relative">
                    <SectionHeader number="02" title="Routine Engine" />
                    <div className="space-y-4">
                      {routines.slice(0, 3).map((r, i) => (
                        <div key={r.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                          <span className="font-mono-tech text-xs text-white">{String(i+1).padStart(2,'0')} // {r.name}</span>
                          <span className="font-mono-tech text-[10px] text-neutral-500 uppercase">{Array.isArray(r.exercises) ? r.exercises.length + ' EXERCISES' : r.sets}</span>
                        </div>
                      ))}
                      <button onClick={() => handleViewChange('builder')} className="w-full py-4 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">Engineer Program</button>
                    </div>
                  </section>
                  <section className="glass-panel p-8">
                    <SectionHeader number="03" title="Finance" />
                    <div className="space-y-4">
                      {payments.slice(0, 3).map(p => (
                        <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                          <span className="font-mono-tech text-xs text-white">{p.name}</span>
                          <span className={`font-mono-tech text-[10px] uppercase ${p.status === 'pagado' ? 'text-emerald-500' : 'text-red-500'}`}>${p.amount} // {p.status}</span>
                        </div>
                      ))}
                      <button onClick={() => handleViewChange('finance')} className="w-full py-4 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">Open Ledger</button>
                    </div>
                  </section>
                </>
              ) : (
                <section className="glass-panel p-8 relative border-l-2 border-emerald-500/20">
                    <SectionHeader number="02" title="Active Mission" />
                    {myAssignedRoutine ? (
                        <div className="space-y-4">
                            <div className="p-6 bg-emerald-900/10 border border-emerald-500/30">
                                <h3 className="font-bebas text-2xl text-emerald-500">{myAssignedRoutine.name}</h3>
                                <p className="font-mono-tech text-xs text-emerald-200 mt-2">{Array.isArray(myAssignedRoutine.exercises) ? myAssignedRoutine.exercises.length : 1} EXERCISES LOGGED</p>
                            </div>
                            <button onClick={() => handleViewChange('my_routine')} className="w-full py-4 bg-white text-black font-mono-tech text-[9px] font-bold uppercase tracking-widest">VIEW FULL DETAILS</button>
                        </div>
                    ) : (
                        <div className="h-32 flex items-center justify-center border border-dashed border-white/10">
                            <span className="font-mono-tech text-xs text-neutral-500">NO ORDERS ASSIGNED</span>
                        </div>
                    )}
                </section>
              )}

              {/* CLIENT WELLNESS VIEW */}
              <section className="glass-panel p-10 relative overflow-hidden border-r-2 border-white/20">
                <SectionHeader number="04" title="Biometric Flow" />
                <button onClick={handleUpdateWellness} className="absolute top-10 right-10 p-2 text-neutral-500 hover:text-white border border-transparent hover:border-white/10 transition-all"><Activity size={18} /></button>
                <div className="grid grid-cols-2 gap-8 mt-10">
                  <div className="space-y-1"><p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Hydration</p><div className="flex items-baseline gap-2"><span className="font-bebas text-5xl text-white">{wellness.water_liters}</span><span className="font-bebas text-2xl text-neutral-600">L</span></div></div>
                  <div className="space-y-1 text-right"><p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Recovery</p><div className="flex items-baseline justify-end gap-2"><span className="font-bebas text-5xl text-white">{wellness.sleep_hours}</span><span className="font-bebas text-2xl text-neutral-600">HRS</span></div></div>
                </div>
              </section>
            </div>
          )}

          {/* --- SCHEDULE --- */}
          {activeView === 'schedule' && (
            <div className="mb-20">
               <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex gap-4">
                  <button onClick={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7)))} className="px-4 py-2 border border-white/10 hover:bg-white/5 font-mono-tech text-xs text-neutral-400 hover:text-white transition-colors">{'< PREV WEEK'}</button>
                  <button onClick={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7)))} className="px-4 py-2 border border-white/10 hover:bg-white/5 font-mono-tech text-xs text-neutral-400 hover:text-white transition-colors">{'NEXT WEEK >'}</button>
                </div>
                <span className="font-bebas text-xl tracking-widest text-emerald-500 text-right">WEEK OF: {currentWeekStart.toLocaleDateString()}</span>
              </div>

              <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-2 min-w-[800px]">
                <div className="h-12"></div>
                {DAYS.map(day => <div key={day} className="h-12 flex items-center justify-center bg-neutral-900/50 border border-white/5 font-mono-tech text-[10px] text-neutral-400 uppercase tracking-widest">{day}</div>)}
                {HOURS.map((hour, index) => {
                  if (hour === '---') return <div key={`spacer-${index}`} className="col-span-8 h-8 flex items-center justify-center bg-neutral-900/30 border-y border-white/5"><span className="font-mono-tech text-[9px] text-neutral-600 tracking-[0.5em]">SIESTA // BREAK</span></div>;
                  return (
                    <React.Fragment key={hour}>
                      <div className="h-16 flex items-center justify-center font-mono-tech text-[10px] text-neutral-600 border-r border-white/5">{hour}</div>
                      {DAYS.map(day => {
                        const session = sessions.find(s => s.day === day && s.time === hour);
                        const count = session?.participants?.length || 0;
                        const cap = session?.capacity || 4;
                        const myID = session?.user?.id; 
                        const isJoined = session?.participants?.some(p => p.id === myID);

                        let style = "bg-neutral-900/10 border border-white/5 opacity-50 hover:opacity-100";
                        if (session) {
                          if (userRole === 'admin') {
                             if (count === 0) style = "bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 opacity-100";
                             else if (count < cap) style = "bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 opacity-100";
                             else style = "bg-red-500/10 border border-red-500/50 text-red-500 opacity-100";
                          } else {
                             // CLIENT VISUALS (FIXED):
                             if (isJoined) style = "bg-emerald-500/20 border border-emerald-500 text-emerald-500 opacity-100 ring-1 ring-emerald-500/50";
                             else if (count >= cap) style = "bg-red-500/10 border border-red-500/20 text-red-500/50 opacity-100 cursor-not-allowed";
                             else style = "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500/70 hover:bg-emerald-500/20 hover:text-emerald-500 opacity-100 cursor-pointer";
                          }
                        } else {
                            if (userRole === 'client') style = "opacity-0 cursor-default";
                        }
                        
                        return (
                          <div key={`${day}-${hour}`} onClick={() => handleToggleAvailability(day, hour)} className={`h-16 transition-all active:scale-95 group relative flex flex-col items-center justify-center p-1 text-center overflow-hidden ${style} ${session ? 'cursor-pointer' : ''}`}>
                            {session ? (
                              <>
                                <span className="font-bebas text-lg tracking-widest">{count} <span className="text-[10px] opacity-50">/ {cap}</span></span>
                                <span className="font-mono-tech text-[7px] uppercase tracking-widest opacity-70">
                                    {userRole === 'client' && isJoined ? "JOINED" : userRole === 'client' && count >= cap ? "FULL" : "OPEN"}
                                </span>
                              </>
                            ) : (
                              userRole === 'admin' && <div className="opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={12} className="text-white/30" /></div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- SETTINGS --- */}
          {activeView === 'settings' && (
            <div className="max-w-2xl mx-auto glass-panel p-10 border-t-4 border-white/20 animate-in slide-in-from-bottom-4 duration-500">
                <SectionHeader number="00" title="System Configuration" />
                <div className="space-y-8 mt-8">
                    <div>
                        <h3 className="font-bebas text-2xl text-white mb-2 flex items-center gap-2"><Key size={20} /> Update Access Key</h3>
                        <p className="font-mono-tech text-xs text-neutral-500 mb-4">Verification required to update credentials.</p>
                        <div className="flex flex-col gap-4">
                            <input 
                                type="password" 
                                placeholder="CURRENT PASSWORD" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="bg-neutral-900 border border-white/10 p-4 font-mono-tech text-white focus:border-white/40 outline-none"
                            />
                            <input 
                                type="password" 
                                placeholder="NEW PASSWORD" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-neutral-900 border border-white/10 p-4 font-mono-tech text-white focus:border-white/40 outline-none"
                            />
                            <button 
                                onClick={handleUpdatePassword}
                                className="px-8 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all self-start"
                            >
                                Update Credentials
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* --- MY ROUTINE (CLIENT) --- */}
          {activeView === 'my_routine' && userRole === 'client' && (
             <div className="max-w-3xl mx-auto glass-panel p-10 border-t-4 border-emerald-500">
                <SectionHeader number="01" title="Daily Orders" />
                {myAssignedRoutine ? (
                    <div>
                        <div className="mb-8">
                            <h1 className="font-bebas text-6xl text-white mb-2">{myAssignedRoutine.name}</h1>
                            <span className="font-mono-tech text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1">{myAssignedRoutine.category} DIVISION</span>
                        </div>
                        <div className="space-y-4">
                            {(Array.isArray(myAssignedRoutine.exercises) ? myAssignedRoutine.exercises : []).map((ex, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all group">
                                    <div className="h-12 w-12 flex items-center justify-center bg-black border border-white/10 font-bebas text-xl text-neutral-500 group-hover:text-emerald-500">{i+1}</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{ex.name}</h3>
                                        <p className="font-mono-tech text-xs text-neutral-400">TARGET: {ex.sets} SETS // {ex.reps} REPS</p>
                                    </div>
                                    <div className="h-6 w-6 border border-white/20 rounded-sm cursor-pointer hover:bg-emerald-500/50"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={32} />
                        <h2 className="font-bebas text-3xl">NO MISSION DATA</h2>
                        <p className="font-mono-tech text-xs text-neutral-500 mt-2">CONTACT COMMANDER FOR ASSIGNMENT</p>
                    </div>
                )}
            </div>
        )}

        {/* --- BUILDER (ADMIN) --- */}
        {activeView === 'builder' && userRole === 'admin' && (
            <div className="grid grid-cols-12 gap-8 h-[80vh]">
                <div className="col-span-12 lg:col-span-7 glass-panel p-8 flex flex-col">
                    <SectionHeader number="A" title="Bundle Creator" />
                    <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {editingRoutineId && <div className="bg-yellow-500/10 text-yellow-500 p-2 font-mono-tech text-xs text-center border border-yellow-500/30">EDITING MODE</div>}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] font-mono-tech text-neutral-500 block mb-2">CATEGORY (FOLDER)</label><input value={selectedFolder.toUpperCase()} disabled className="w-full bg-white/5 border border-white/10 p-3 text-xs font-mono-tech text-neutral-500 cursor-not-allowed" /></div>
                            <div><label className="text-[10px] font-mono-tech text-neutral-500 block mb-2">ROUTINE NAME</label><input placeholder="e.g. Legs Hypertrophy A" value={builderRoutineName} onChange={e => setBuilderRoutineName(e.target.value)} className="w-full bg-black border border-white/20 p-3 text-xs font-mono-tech text-white focus:border-emerald-500" /></div>
                        </div>

                        <div className="bg-white/5 p-4 border border-white/10">
                            <span className="text-[9px] font-mono-tech text-emerald-500 uppercase mb-3 block">Add Exercise to Bundle</span>
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-6"><select value={currentExercise.name} onChange={e => setCurrentExercise({...currentExercise, name: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-[10px] font-mono-tech h-full">{EXERCISE_DB[selectedFolder]?.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}</select></div>
                                <div className="col-span-2"><input type="number" value={currentExercise.sets} onChange={e => setCurrentExercise({...currentExercise, sets: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 p-2 text-center text-xs" /></div>
                                <div className="col-span-2"><input type="number" value={currentExercise.reps} onChange={e => setCurrentExercise({...currentExercise, reps: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 p-2 text-center text-xs" /></div>
                                <button onClick={handleAddExerciseToBundle} className="col-span-2 bg-white text-black font-bold text-xs hover:bg-emerald-500">+</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {builderExercises.map((ex, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-neutral-900 border-l-2 border-emerald-500">
                                    <span className="font-mono-tech text-xs">{i+1}. {ex.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => moveExercise(i, 'up')} className="text-neutral-600 hover:text-white"><ArrowUp size={10}/></button>
                                        <button onClick={() => moveExercise(i, 'down')} className="text-neutral-600 hover:text-white"><ArrowDown size={10}/></button>
                                        <span className="font-mono-tech text-[10px] text-neutral-500 mx-2">{ex.sets} x {ex.reps}</span>
                                        <button onClick={() => handleRemoveExerciseFromBundle(i)} className="text-neutral-600 hover:text-red-500"><X size={12}/></button>
                                    </div>
                                </div>
                            ))}
                            {builderExercises.length === 0 && <div className="text-center py-8 text-neutral-600 font-mono-tech text-xs border border-dashed border-white/10">BUNDLE EMPTY</div>}
                        </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-white/10 flex gap-2">
                        {editingRoutineId && <button onClick={handleCancelEdit} className="flex-1 py-3 border border-white/10 text-xs font-mono-tech hover:bg-white/5">CANCEL</button>}
                        <button onClick={handleSaveRoutineBundle} className="flex-[2] py-3 bg-emerald-500 text-black font-bold font-mono-tech text-xs hover:bg-white transition-all">{editingRoutineId ? 'UPDATE BUNDLE' : 'SAVE TO LIBRARY'}</button>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-5 glass-panel p-0 flex flex-col">
                    <div className="flex overflow-x-auto border-b border-white/10 p-2 gap-2">{Object.keys(EXERCISE_DB).map(cat => (<button key={cat} onClick={() => setSelectedFolder(cat)} className={`px-4 py-2 text-[10px] font-mono-tech uppercase tracking-widest transition-all ${selectedFolder === cat ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}>{cat}</button>))}</div>
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3">
                        {routines.filter(r => r.category === selectedFolder.toUpperCase()).map(r => (
                            <div key={r.id} className="group p-4 border border-white/5 hover:border-emerald-500/30 bg-white/5 transition-all">
                                <div className="flex justify-between items-start mb-2"><h4 className="font-bebas text-xl">{r.name}</h4><div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleEditRoutineLoad(r)} className="text-neutral-400 hover:text-white"><Edit3 size={14} /></button><button onClick={async () => {if(confirm('Delete?')) await supabase.from('routines').delete().eq('id', r.id)}} className="text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button></div></div>
                                <div className="space-y-1">{(Array.isArray(r.exercises) ? r.exercises : []).slice(0, 3).map((ex, i) => (<div key={i} className="flex justify-between text-[9px] font-mono-tech text-neutral-500"><span>{ex.name}</span><span>{ex.sets}x{ex.reps}</span></div>))}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- FINANCE (ADMIN) --- */}
        {activeView === 'finance' && userRole === 'admin' && (
             <div className="max-w-5xl">
              <SectionHeader number="03" title="Revenue Ledger" />
              <div className="glass-panel overflow-hidden border border-white/5">
                <div className="bg-white/5 p-6 flex justify-between items-center border-b border-white/5">
                  <h4 className="font-mono-tech text-[10px] text-white uppercase tracking-[0.4em]">Transaction History</h4>
                  <button onClick={() => handleAddPayment()} className="bg-white text-black px-6 py-2 font-mono-tech text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">+ Register</button>
                </div>
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {payments.map(p => (
                    <div key={p.id} className="group flex items-center justify-between p-6 hover:bg-white/5 transition-all text-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-white uppercase tracking-widest">{p.name}</span>
                        <span className="font-mono-tech text-[10px] text-neutral-500 mt-1">{new Date(p.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className={`font-mono-tech text-[10px] px-3 py-1 uppercase tracking-widest border ${p.status === 'pagado' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : p.status === 'atrasado' ? 'border-red-500/30 text-red-500 bg-red-500/5' : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'}`}>{p.status}</span>
                        <span className="font-bebas text-2xl text-white w-24 text-right">${p.amount}</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleAddPayment(p)} className="p-2 text-neutral-700 hover:text-white transition-colors"><Edit3 size={14} /></button>
                          <button onClick={async () => await supabase.from('payments').delete().eq('id', p.id)} className="p-2 text-neutral-700 hover:text-red-500 transition-colors"><X size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <CommandModal {...adminModal} onCancel={() => setAdminModal({ isOpen: false })} />
      <ClientSessionModal 
        isOpen={clientModal.isOpen} 
        session={clientModal.session} 
        routine={clientModal.routine} 
        onLeave={handleClientLeave}
        onClose={() => setClientModal({ isOpen: false, session: null, routine: null })}
      />
      <CommandModal 
        {...modalConfig} 
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
    </div>
  );
}