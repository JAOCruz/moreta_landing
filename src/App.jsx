import React, { useState, useEffect, useRef } from 'react';
import { Calendar, DollarSign, Dumbbell, Activity, Plus, X, ChevronRight, Lock, User, LogOut, Edit3, Settings, Menu, Loader2, AlertTriangle, Home, Clock, Layout, CreditCard, Trash2, Users } from 'lucide-react';
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
    
    .tactical-grid {
      background-image: linear-gradient(#1a1a1a 1px, transparent 1px),
      linear-gradient(90deg, #1a1a1a 1px, transparent 1px);
      background-size: 40px 40px;
    }
    
    .glass-panel {
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
    }
    
    input:focus, select:focus { outline: none; border-color: rgba(255, 255, 255, 0.2) !important; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
  `}</style>
);

// --- HELPERS ---
const getMonday = (d) => {
  d = new Date(d);
  const day = d.getDay(), diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
}

// --- COMPONENTS ---
const SectionHeader = ({ number, title }) => (
  <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-2">
    <h2 className="font-bebas text-3xl tracking-wide text-white">{title}</h2>
    <span className="font-mono-tech text-xs text-neutral-600 tracking-widest">[ {number} ]</span>
  </div>
);

const LoginScreen = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onLogin(email, password); };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-inter">
      <Styles />
      <div className="absolute inset-0 tactical-grid opacity-20"></div>
      <form onSubmit={handleSubmit} className="z-10 w-full max-w-md p-10 glass-panel border border-neutral-800 animate-in fade-in zoom-in duration-500">
        <div className="mb-10 text-center">
          <h1 className="font-bebas text-7xl mb-2 tracking-tighter">MORETA FITNESS</h1>
          <p className="font-mono-tech text-[10px] text-neutral-500 tracking-[0.3em] uppercase">Tactical Dashboard // Authorized Access</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono-tech flex items-center gap-3"><AlertTriangle size={14} />{error.message}</div>}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Client Identifier</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-white/20">
              <User size={16} className="text-neutral-500 mr-3" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@moreta.fit" className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Access Key</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-white/20">
              <Lock size={16} className="text-neutral-500 mr-3" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold font-mono-tech py-5 text-xs uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50 transition-all flex justify-center items-center gap-3 group">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Access System <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </div>
      </form>
      <div className="absolute bottom-8 flex gap-8 text-[9px] text-neutral-600 font-mono-tech uppercase tracking-widest">
        <span>System Status: Online</span>
        <span>Version: 3.5.0-PRO</span>
      </div>
    </div>
  );
};

// --- UPDATED COMMAND MODAL (Supports User List & Delete) ---
const CommandModal = ({ isOpen, title, fields, onSubmit, onCancel, onDelete, participants = [] }) => {
  const [formData, setFormData] = useState({});
  useEffect(() => {
    if (isOpen) {
      const initial = {};
      fields.forEach(f => initial[f.name] = f.defaultValue || '');
      setFormData(initial);
    }
  }, [isOpen, fields]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="fixed inset-0 tactical-grid opacity-20 pointer-events-none"></div>
      <div className="glass-panel w-full max-w-lg p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
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
                <select value={formData[field.name] || ''} onChange={(e) => setFormData({...formData, [field.name]: e.target.value})} className="w-full bg-neutral-900/50 border border-white/10 px-5 py-4 font-mono-tech text-xs text-white focus:outline-none focus:border-white/40 transition-all rounded-none">
                    <option value="">-- SELECT --</option>
                    {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <input autoFocus={field.name === fields[0].name} type={field.type || 'text'} value={formData[field.name] || ''} onChange={(e) => setFormData({...formData, [field.name]: e.target.value})} placeholder={field.placeholder} className="w-full bg-neutral-900/50 border border-white/10 px-5 py-4 font-mono-tech text-xs text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/40 transition-all rounded-none" />
              )}
            </div>
          ))}

          {/* PARTICIPANT LIST (Admin Only) */}
          {participants.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 mb-3 text-neutral-500">
                <Users size={12} />
                <span className="font-mono-tech text-[9px] uppercase tracking-widest">Active Squad ({participants.length})</span>
              </div>
              <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                {participants.map((p, i) => (
                  <div key={i} className="bg-white/5 px-3 py-2 flex items-center justify-between">
                    <span className="font-mono-tech text-[10px] text-white">{p.email}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
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
          <button onClick={() => onSubmit(formData)} className="flex-1 py-4 bg-white text-black font-mono-tech text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">EXECUTE</button>
        </div>
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
    // Only Admin sees Builder/Finance
    ...(userRole === 'admin' ? [
        { id: 'builder', icon: Dumbbell, label: 'Builder' },
        { id: 'finance', icon: DollarSign, label: 'Pagos' }
    ] : [])
  ];

  return (
    <div className="w-20 lg:w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col items-center lg:items-stretch py-8 relative z-[60]">
      <div className="px-6 mb-12 text-center lg:text-left">
        <h1 className="font-bebas text-4xl tracking-tighter text-white">M<span className="text-neutral-500">.</span>FIT</h1>
        {userRole === 'admin' && <span className="hidden lg:block font-mono-tech text-[9px] text-emerald-500 uppercase tracking-widest mt-2">COMMANDER ACCESS</span>}
      </div>
      <nav className="flex-1 space-y-2 px-3">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => onViewChange(item.id)} className={`w-full flex items-center gap-4 px-4 py-4 transition-all group relative ${activeView === item.id ? 'bg-white/5 text-white border-r-2 border-white' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}>
            <item.icon size={20} className={activeView === item.id ? 'animate-pulse' : ''} />
            <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-3 mt-auto">
        <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-4 text-neutral-600 hover:text-red-500 transition-all group">
          <LogOut size={20} />
          <span className="hidden lg:block font-mono-tech text-[10px] uppercase tracking-[0.2em]">Log Out</span>
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
  const [userRole, setUserRole] = useState(null); // 'admin' or 'client'
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // DATA
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [wellness, setWellness] = useState({ sleep_hours: 0, stress_level: '...', water_liters: 0, diet_score: 0 });

  // BUILDER STATE
  const firstBodyPart = Object.keys(EXERCISE_DB)[0] || 'legs'; 
  const [builderBodyPart, setBuilderBodyPart] = useState(firstBodyPart);
  const [builderExercise, setBuilderExercise] = useState('');
  const [builderSets, setBuilderSets] = useState(3);
  const [builderReps, setBuilderReps] = useState(12);
  const [editingRoutineId, setEditingRoutineId] = useState(null); // NEW: Track editing

  useEffect(() => {
    if (EXERCISE_DB[builderBodyPart]?.length > 0 && !editingRoutineId) {
       setBuilderExercise(EXERCISE_DB[builderBodyPart][0].name);
    }
  }, [builderBodyPart, editingRoutineId]);

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
    else setUserRole('client');
    setLoading(false);
  };

  const fetchDashboardData = async (userId) => {
    const startStr = currentWeekStart.toISOString().split('T')[0];
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const endStr = end.toISOString().split('T')[0];

    const [sessRes, payRes, routRes] = await Promise.all([
      supabase.from('sessions').select('*').gte('date', startStr).lte('date', endStr).order('time', { ascending: true }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('routines').select('*').order('order', { ascending: true }),
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

  // --- ROUTINE ACTIONS (EDIT / DELETE) ---
  const handleEditRoutine = (routine) => {
    setEditingRoutineId(routine.id);
    setBuilderExercise(routine.name);
    // Try to parse sets/reps: "3 SETS X 12 REPS"
    const match = routine.sets.match(/(\d+)\s*SETS\s*X\s*(\d+)\s*REPS/);
    if (match) {
        setBuilderSets(parseInt(match[1]));
        setBuilderReps(parseInt(match[2]));
    }
  };

  const handleCancelEdit = () => {
    setEditingRoutineId(null);
    setBuilderSets(3);
    setBuilderReps(12);
    setBuilderExercise(EXERCISE_DB[builderBodyPart][0].name);
  };

  // --- SCHEDULE LOGIC ---
  const handleToggleAvailability = async (day, time) => {
    const existing = sessions.find(s => s.day === day && s.time === time);
    
    // --- ADMIN LOGIC ---
    if (userRole === 'admin') {
        const dayIndex = DAYS.indexOf(day);
        const specificDate = new Date(currentWeekStart);
        specificDate.setDate(specificDate.getDate() + dayIndex);
        const dateStr = specificDate.toISOString().split('T')[0];

        if (!existing) {
            // Create Slot
            const tempSlot = { id: 'temp-' + Date.now(), day, time, date: dateStr, status: 'open', capacity: 4, participants: [], user_id: session.user.id };
            setSessions(prev => [...prev, tempSlot]);
            const { data, error } = await supabase.from('sessions').insert([{ day, time, date: dateStr, status: 'open', capacity: 4, participants: [], user_id: session.user.id, client: 'OPEN', detail: '4 SLOTS' }]).select();
            if (data) setSessions(prev => prev.map(s => s.id === tempSlot.id ? data[0] : s));
            else { setSessions(prev => prev.filter(s => s.id !== tempSlot.id)); alert(error.message); }
        } else {
            // MANAGE SLOT (DELETE & ASSIGN)
            setModalConfig({
                isOpen: true,
                title: "Session Command Center",
                participants: existing.participants || [], // Pass users to modal
                fields: [
                    { name: 'routine_id', label: 'Assign Routine', type: 'select', options: routines.map(r => ({ value: r.id, label: r.name })), defaultValue: existing.routine_id || '' },
                    { name: 'capacity', label: 'Capacity', type: 'number', defaultValue: existing.capacity || 4 }
                ],
                // DELETE HANDLER (The Red Button)
                onDelete: async () => {
                    if (!confirm("CONFIRM DELETION: This will remove the slot and kick all " + (existing.participants?.length || 0) + " users.")) return;
                    setSessions(prev => prev.filter(s => s.id !== existing.id));
                    await supabase.from('sessions').delete().eq('id', existing.id);
                    setModalConfig({ ...modalConfig, isOpen: false });
                },
                onSubmit: async (data) => {
                    const { error } = await supabase.from('sessions').update({ routine_id: data.routine_id || null, capacity: parseInt(data.capacity) }).eq('id', existing.id);
                    if(error) alert(error.message);
                    setModalConfig({ ...modalConfig, isOpen: false });
                }
            });
        }
    } 
    
    // --- CLIENT LOGIC ---
    else if (userRole === 'client') {
        if (!existing) return;

        const myID = session.user.id;
        const myEmail = session.user.email;
        const isJoined = existing.participants?.some(p => p.id === myID);
        
        let newParticipants;
        if (isJoined) {
            if(!confirm("Leave this session?")) return;
            newParticipants = existing.participants.filter(p => p.id !== myID);
        } else {
            if ((existing.participants?.length || 0) >= (existing.capacity || 4)) {
                alert("Session is Full.");
                return;
            }
            newParticipants = [...(existing.participants || []), { id: myID, email: myEmail }];
        }

        const updatedSession = { ...existing, participants: newParticipants };
        setSessions(prev => prev.map(s => s.id === existing.id ? updatedSession : s));

        const { error } = await supabase.from('sessions').update({ participants: newParticipants }).eq('id', existing.id);
        if (error) {
            alert(error.message);
            setSessions(prev => prev.map(s => s.id === existing.id ? existing : s));
        }
    }
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
    if (error) setAuthError(error); setAuthLoading(false);
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setSessions([]); setPayments([]); setRoutines([]); setSession(null); };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="text-white animate-spin" size={32} /></div>;
  if (!session) return <LoginScreen onLogin={handleLogin} loading={authLoading} error={authError} />;

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
              
              {userRole === 'admin' && (
                <>
                  <section className="glass-panel p-8 relative">
                    <SectionHeader number="02" title="Routine Engine" />
                    <div className="space-y-4">
                      {routines.slice(0, 3).map((r, i) => (
                        <div key={r.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                          <span className="font-mono-tech text-xs text-white">{String(i+1).padStart(2,'0')} // {r.name}</span>
                          <span className="font-mono-tech text-[10px] text-neutral-500 uppercase">{r.sets}</span>
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
                             if (isJoined) style = "bg-emerald-500/20 border border-emerald-500 text-emerald-500 opacity-100 ring-1 ring-emerald-500/50";
                             else if (count >= cap) style = "bg-red-500/10 border border-red-500/20 text-red-500/50 opacity-100 cursor-not-allowed";
                             else style = "bg-white/5 border border-white/20 text-white hover:bg-emerald-500/20 hover:text-emerald-500 opacity-100";
                          }
                        } else {
                            if (userRole === 'client') style = "opacity-0 cursor-default";
                        }
                        
                        const assignedRoutine = session?.routine_id ? routines.find(r => r.id === session.routine_id)?.name : null;

                        return (
                          <div key={`${day}-${hour}`} onClick={() => handleToggleAvailability(day, hour)} className={`h-16 transition-all active:scale-95 group relative flex flex-col items-center justify-center p-1 text-center overflow-hidden ${style} ${session ? 'cursor-pointer' : ''}`}>
                            {session ? (
                              <>
                                <span className="font-bebas text-lg tracking-widest">{count} <span className="text-[10px] opacity-50">/ {cap}</span></span>
                                <span className="font-mono-tech text-[7px] uppercase tracking-widest opacity-70">
                                    {userRole === 'client' && isJoined ? "JOINED" : userRole === 'client' && count >= cap ? "FULL" : "OPEN"}
                                </span>
                                {assignedRoutine && <span className="absolute bottom-1 w-full text-[6px] bg-white/10 py-0.5 text-white font-mono-tech truncate px-1">{assignedRoutine}</span>}
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

          {activeView === 'builder' && userRole === 'admin' && (
            <div className="max-w-4xl">
              <SectionHeader number="02" title="Routine Engineering" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
                {/* BUILDER INPUTS */}
                <div className="space-y-8 glass-panel p-10 border-l-2 border-white/20">
                  {editingRoutineId && <div className="text-yellow-500 font-mono-tech text-xs uppercase tracking-widest mb-[-10px]">⚠️ EDITING MODE</div>}
                  <div className="space-y-2">
                    <label className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest block ml-1">Zone</label>
                    <select value={builderBodyPart} onChange={(e) => setBuilderBodyPart(e.target.value)} className="w-full bg-neutral-900 border border-white/10 p-5 font-bebas text-2xl tracking-widest text-white focus:border-white/40 transition-all outline-none rounded-none">
                      {Object.keys(EXERCISE_DB).map(part => <option key={part} value={part}>{part.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest block ml-1">Exercise</label>
                    {/* Allow free text editing when in edit mode, or select otherwise */}
                    {editingRoutineId ? (
                        <input value={builderExercise} onChange={(e) => setBuilderExercise(e.target.value)} className="w-full bg-neutral-900 border border-white/10 p-5 font-bebas text-2xl tracking-widest text-white focus:border-white/40 transition-all outline-none rounded-none"/>
                    ) : (
                        <select value={builderExercise} onChange={(e) => setBuilderExercise(e.target.value)} className="w-full bg-neutral-900 border border-white/10 p-5 font-bebas text-2xl tracking-widest text-white focus:border-white/40 transition-all outline-none rounded-none">
                        {EXERCISE_DB[builderBodyPart]?.map(ex => <option key={ex.id} value={ex.name}>{ex.name.toUpperCase()}</option>)}
                        </select>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest block ml-1">Sets</label>
                      <div className="flex bg-neutral-900 border border-white/10 h-16">
                        <button onClick={() => setBuilderSets(Math.max(1, builderSets - 1))} className="flex-1 hover:bg-white/5">-</button>
                        <div className="flex-[2] flex items-center justify-center font-bebas text-3xl">{String(builderSets).padStart(2, '0')}</div>
                        <button onClick={() => setBuilderSets(builderSets + 1)} className="flex-1 hover:bg-white/5">+</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest block ml-1">Reps</label>
                      <div className="flex bg-neutral-900 border border-white/10 h-16">
                        <button onClick={() => setBuilderReps(Math.max(1, builderReps - 1))} className="flex-1 hover:bg-white/5">-</button>
                        <div className="flex-[2] flex items-center justify-center font-bebas text-3xl">{String(builderReps).padStart(2, '0')}</div>
                        <button onClick={() => setBuilderReps(builderReps + 1)} className="flex-1 hover:bg-white/5">+</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {editingRoutineId && <button onClick={handleCancelEdit} className="flex-1 py-6 border border-neutral-700 text-neutral-500 font-mono-tech text-xs font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all">CANCEL</button>}
                    <button onClick={async () => { 
                        if (!builderExercise) return; 
                        const payload = { name: builderExercise, sets: `${builderSets} SETS X ${builderReps} REPS`, user_id: session.user.id };
                        
                        if (editingRoutineId) {
                            const { error } = await supabase.from('routines').update(payload).eq('id', editingRoutineId);
                            if (error) alert(error.message);
                            setEditingRoutineId(null);
                        } else {
                            const { error } = await supabase.from('routines').insert([{ ...payload, order: routines.length + 1 }]);
                            if (error) alert(error.message);
                        }
                    }} className="flex-[2] py-6 bg-white text-black font-mono-tech text-xs font-bold uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
                        {editingRoutineId ? "UPDATE BLOCK" : "DEPLOY BLOCK"}
                    </button>
                  </div>
                </div>

                {/* ROUTINE LIST */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                   {routines.map((item, idx) => (
                      <div key={item.id} className={`group flex items-center justify-between p-5 border transition-all ${editingRoutineId === item.id ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-neutral-900/40 border-white/5 hover:border-white/20'}`}>
                        <div className="flex items-center gap-5">
                          <span className="font-mono-tech text-xs font-bold text-neutral-700">{String(idx+1).padStart(2, '0')} //</span>
                          <span className="font-bold text-sm uppercase tracking-widest text-neutral-300">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mr-2">{item.sets}</span>
                          <button onClick={() => handleEditRoutine(item)} className="p-2 text-neutral-700 hover:text-white transition-colors"><Edit3 size={14} /></button>
                          <button onClick={async () => await supabase.from('routines').delete().eq('id', item.id)} className="p-2 text-neutral-700 hover:text-red-500 transition-colors"><X size={14} /></button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

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
      <CommandModal {...modalConfig} onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })} routines={routines} />
    </div>
  );
}