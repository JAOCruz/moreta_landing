import React, { useState, useEffect, useRef } from 'react';
import { Calendar, DollarSign, Dumbbell, Activity, Plus, X, ChevronRight, Lock, User, LogOut, Edit3, Settings, Menu, Loader2, AlertTriangle, Home, Clock, Layout, CreditCard } from 'lucide-react';
import { supabase } from './lib/supabase';
import gsap from 'gsap';
import { EXERCISE_DB } from './data/exercises';

// --- STYLES & FONTS ---
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
    
    input:focus, select:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.2) !important;
    }

    /* Custom Scrollbar for lists */
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
  `}</style>
);

// --- HELPERS ---

// Helper to get the Monday of the current week
const getMonday = (d) => {
  d = new Date(d);
  const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

const SectionHeader = ({ number, title }) => (
  <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-2">
    <h2 className="font-bebas text-3xl tracking-wide text-white">{title}</h2>
    <span className="font-mono-tech text-xs text-neutral-600 tracking-widest">[ {number} ]</span>
  </div>
);

const LoginScreen = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-inter">
      <Styles />
      <div className="absolute inset-0 tactical-grid opacity-20"></div>
      
      <form onSubmit={handleSubmit} className="z-10 w-full max-w-md p-10 glass-panel rounded-none border border-neutral-800 animate-in fade-in zoom-in duration-500">
        <div className="mb-10 text-center">
          <h1 className="font-bebas text-7xl mb-2 tracking-tighter">MORETA FITNESS</h1>
          <p className="font-mono-tech text-[10px] text-neutral-500 tracking-[0.3em] uppercase">Tactical Dashboard // Unauthorized Access Prohibited</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono-tech flex items-center gap-3">
            <AlertTriangle size={14} />
            {error.message || 'AUTHENTICATION ERROR'}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Client Identifier (Email)</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-white/20">
              <User size={16} className="text-neutral-500 mr-3" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ADMIN@MORETA.FIT" 
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800" 
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-widest">Access Key (Password)</label>
            <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-4 transition-all focus-within:border-white/20">
              <Lock size={16} className="text-neutral-500 mr-3" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="bg-transparent border-none outline-none text-sm w-full font-mono-tech placeholder-neutral-800" 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold font-mono-tech py-5 text-xs uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3 group"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Access System <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </div>
      </form>
      
      <div className="absolute bottom-8 flex gap-8 text-[9px] text-neutral-600 font-mono-tech uppercase tracking-widest">
        <span>System Status: Online</span>
        <span>Version: 3.1.0-BETA</span>
        <span>Secure Connection: Active</span>
      </div>
    </div>
  );
};

// --- TACTICAL COMMAND MODAL ---
const CommandModal = ({ isOpen, title, fields, onSubmit, onCancel }) => {
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
      
      <div className="glass-panel w-full max-w-md p-10 relative overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
        {/* Decorative corner accents */}
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
              <label className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.3em] block ml-1">
                {field.label}
              </label>
              <input
                autoFocus={field.name === fields[0].name}
                type={field.type || 'text'}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                placeholder={field.placeholder}
                className="w-full bg-neutral-900/50 border border-white/10 px-5 py-4 font-mono-tech text-xs text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/40 focus:bg-neutral-800/60 transition-all rounded-none"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 border border-neutral-800 text-neutral-500 font-mono-tech text-[10px] uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all"
          >
            // ABORT SESSION
          </button>
          <button 
            onClick={() => onSubmit(formData)}
            className="flex-1 py-4 bg-white text-black font-mono-tech text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            EXECUTE COMMAND
          </button>
        </div>
      </div>
    </div>
  );
};

const DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const HOURS = [
  // Morning Block
  '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  // Spacer (Optional visual break)
  '---',
  // Afternoon Block
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
];

// --- SIDEBAR COMPONENT ---
const Sidebar = ({ activeView, onViewChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'schedule', icon: Clock, label: 'Horario' },
    { id: 'builder', icon: Dumbbell, label: 'Builder' },
    { id: 'finance', icon: DollarSign, label: 'Pagos' }
  ];

  return (
    <div className="w-20 lg:w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col items-center lg:items-stretch py-8 relative z-[60]">
      <div className="px-6 mb-12 text-center lg:text-left">
        <h1 className="font-bebas text-4xl tracking-tighter text-white">M<span className="text-neutral-500">.</span>FIT</h1>
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
  // --- CORE STATE ---
  const [activeView, setActiveView] = useState('dashboard');
  const viewRef = useRef(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // --- DASHBOARD DATA STATE ---
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [wellness, setWellness] = useState({
    sleep_hours: 0,
    stress_level: '...',
    water_liters: 0,
    diet_score: 0
  });

  // --- ROUTINE BUILDER STATE ---
  const firstBodyPart = Object.keys(EXERCISE_DB)[0] || 'legs'; 
  const [builderBodyPart, setBuilderBodyPart] = useState(firstBodyPart);
  const [builderExercise, setBuilderExercise] = useState('');
  const [builderSets, setBuilderSets] = useState(3);
  const [builderReps, setBuilderReps] = useState(12);

  // Update exercise when body part changes
  useEffect(() => {
    if (EXERCISE_DB[builderBodyPart] && EXERCISE_DB[builderBodyPart].length > 0) {
      setBuilderExercise(EXERCISE_DB[builderBodyPart][0].name);
    } else {
      setBuilderExercise('');
    }
  }, [builderBodyPart]);

  // --- MODAL STATE ---
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', fields: [] });

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchDashboardData(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchDashboardData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [currentWeekStart]); // Re-run when week changes

  const fetchDashboardData = async (userId) => {
    // Calculate Week Date Range
    const startStr = currentWeekStart.toISOString().split('T')[0];
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const endStr = end.toISOString().split('T')[0];

    const [sessRes, payRes, routRes] = await Promise.all([
      supabase.from('sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startStr) // Filter by Date
        .lte('date', endStr)
        .order('time', { ascending: true }),
      supabase.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('routines').select('*').eq('user_id', userId).order('order', { ascending: true }),
      // supabase.from('wellness').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single()
    ]);

    if (!sessRes.error) setSessions(sessRes.data);
    if (!payRes.error) setPayments(payRes.data);
    if (!routRes.error) setRoutines(routRes.data);
    // if (!wellRes.error && wellRes.data) setWellness(wellRes.data);

    // Setup Realtime
    const channels = [
      supabase.channel('public:sessions').on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `user_id=eq.${userId}` }, () => fetchDashboardData(userId)).subscribe(),
      supabase.channel('public:payments').on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `user_id=eq.${userId}` }, () => fetchDashboardData(userId)).subscribe(),
      supabase.channel('public:routines').on('postgres_changes', { event: '*', schema: 'public', table: 'routines', filter: `user_id=eq.${userId}` }, () => fetchDashboardData(userId)).subscribe(),
      supabase.channel('public:wellness').on('postgres_changes', { event: '*', schema: 'public', table: 'wellness', filter: `user_id=eq.${userId}` }, () => fetchDashboardData(userId)).subscribe()
    ];

    return () => channels.forEach(c => c.unsubscribe());
  };

  const handleViewChange = (newView) => {
    if (newView === activeView) return;
    
    // Animate out
    if(viewRef.current) {
      gsap.to(viewRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.3,
        onComplete: () => {
          setActiveView(newView);
          // Animate in
          gsap.to(viewRef.current, {
            opacity: 1,
            x: 0,
            duration: 0.4,
            delay: 0.1,
            ease: "power2.out"
          });
        }
      });
    } else {
      setActiveView(newView);
    }
  };

  // --- ACTIONS ---
  const handleAddSession = (item = null) => {
    setModalConfig({
      isOpen: true,
      title: item ? "Modify Operational Slot" : "Log New Operational Slot",
      fields: [
        { name: 'client', label: 'Client Identifier', placeholder: 'NAME', defaultValue: item?.client || '' },
        { name: 'time', label: 'Time Index', placeholder: '00:00', defaultValue: item?.time || '10:00' },
        { name: 'detail', label: 'Mission Metadata', placeholder: 'e.g. UPPER BODY', defaultValue: item?.detail || 'TRAINING' }
      ],
      onSubmit: async (data) => {
        // Fallback date if manual add (defaults to Monday of current week)
        const dateStr = currentWeekStart.toISOString().split('T')[0];
        
        const query = item 
          ? supabase.from('sessions').update(data).eq('id', item.id)
          : supabase.from('sessions').insert([{ 
              ...data, 
              day: 'LUN', // Default
              date: dateStr,
              user_id: session.user.id, 
              status: 'filled', 
              capacity: 1, 
              participants: [] 
            }]);
        
        const { error } = await query;
        if (error) alert("UPLINK ERROR: " + error.message);
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  const handleAddPayment = (item = null) => {
    setModalConfig({
      isOpen: true,
      title: item ? "Adjust Revenue Entry" : "Register Revenue Stream",
      fields: [
        { name: 'name', label: 'Client Name', placeholder: 'FULL NAME', defaultValue: item?.name || '' },
        { name: 'amount', label: 'Credit Amount ($)', placeholder: '0.00', type: 'number', defaultValue: item?.amount || '100' },
        { name: 'status', label: 'Payment Status', placeholder: 'pagado / atrasado / pendiente', defaultValue: item?.status || 'pendiente' }
      ],
      onSubmit: async (data) => {
        const query = item
          ? supabase.from('payments').update({ ...data, amount: parseFloat(data.amount), status: data.status.toLowerCase() }).eq('id', item.id)
          : supabase.from('payments').insert([{ ...data, amount: parseFloat(data.amount), status: data.status.toLowerCase(), user_id: session.user.id }]);

        const { error } = await query;
        if (error) alert("UPLINK ERROR: " + error.message);
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
        { name: 'stress_level', label: 'Stress Index', placeholder: 'LOW / HI / MID', defaultValue: wellness.stress_level || "LOW" },
        { name: 'water_liters', label: 'Hydration (L)', type: 'number', defaultValue: wellness.water_liters || "3.0" },
        { name: 'diet_score', label: 'Nutritional Compliance (1-10)', type: 'number', defaultValue: wellness.diet_score || "9" }
      ],
      onSubmit: async (data) => {
        const { error } = await supabase.from('wellness').upsert([
          { 
            ...wellness, // keep existing id if present
            sleep_hours: parseFloat(data.sleep_hours), 
            stress_level: data.stress_level.toUpperCase(), 
            water_liters: parseFloat(data.water_liters), 
            diet_score: parseInt(data.diet_score),
            user_id: session.user.id 
          }
        ]);
        if (error) alert("UPLINK ERROR: " + error.message);
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

// NEW: Optimistic "Instant" Logic
  const handleToggleAvailability = async (day, time) => {
    // 1. Check local state immediately
    const existing = sessions.find(s => s.day === day && s.time === time);
    
    // 2. Prepare Date Data
    const dayIndex = DAYS.indexOf(day);
    const specificDate = new Date(currentWeekStart);
    specificDate.setDate(specificDate.getDate() + dayIndex);
    const dateStr = specificDate.toISOString().split('T')[0];

    if (!existing) {
      // --- CREATE PATH ---
      
      // A. Create a temporary "Fake" Slot for immediate display
      const tempSlot = { 
        id: 'temp-' + Date.now(), // Temporary ID
        day, 
        time, 
        date: dateStr,
        status: 'open', 
        capacity: 4, 
        participants: [],
        user_id: session.user.id
      };

      // B. Update Screen IMMEDIATELY (Don't wait for DB)
      setSessions(prev => [...prev, tempSlot]);

      // C. Send to Database in background
      const { data, error } = await supabase.from('sessions').insert([{ 
        day, 
        time, 
        date: dateStr,
        status: 'open', 
        capacity: 4, 
        participants: [], 
        user_id: session.user.id,
        client: 'OPEN',
        detail: '4 SLOTS'
      }]).select(); // <--- Important: .select() returns the real ID

      // D. Sync Real ID (Swap temp ID for real DB ID)
      if (data) {
        setSessions(prev => prev.map(s => s.id === tempSlot.id ? data[0] : s));
      } else if (error) {
        // If DB fails, remove the slot and warn user
        setSessions(prev => prev.filter(s => s.id !== tempSlot.id));
        alert("Sync Error: " + error.message);
      }

    } else {
      // --- DELETE / UNDO PATH ---
      
      // Validation
      if ((existing.participants?.length || 0) > 0) {
        alert("Cannot delete: Clients are registered.");
        return;
      }

      // A. Update Screen IMMEDIATELY
      setSessions(prev => prev.filter(s => s.id !== existing.id));

      // B. Send to Database
      // If it's a temp slot (clicked too fast), we don't need to call DB
      if (!existing.id.toString().startsWith('temp-')) {
        const { error } = await supabase.from('sessions').delete().eq('id', existing.id);
        
        if (error) {
          // If DB fails, put it back
          setSessions(prev => [...prev, existing]);
          alert("Delete Error: " + error.message);
        }
      }
    }
  };
  
  const handleAssignClient = (existing) => {
    // Legacy support for manual session edit
    handleAddSession(existing);
  };

  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessions([]);
    setPayments([]);
    setRoutines([]);
    setSession(null);
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="text-white animate-spin" size={32} />
      </div>
    );
  }

  if (!session) return <LoginScreen onLogin={handleLogin} loading={authLoading} error={authError} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-inter selection:bg-white selection:text-black">
      <Styles />
      <div className="fixed inset-0 tactical-grid opacity-10 pointer-events-none"></div>

      <Sidebar 
        activeView={activeView} 
        onViewChange={handleViewChange} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 h-screen overflow-y-auto relative">
        <div ref={viewRef} className="p-8 lg:p-12 pb-24 opacity-100">
          <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
            <div>
              <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-[0.4em] mb-2">SYSTEM STATUS: <span className="text-emerald-500 animate-pulse">ACTIVE // LIVE_LINK</span></p>
              <h1 className="font-bebas text-5xl tracking-widest text-shadow-glow">OPERATIONAL HUD</h1>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono-tech text-xs text-neutral-300">USER: {session.user.email}</span>
              <span className="font-mono-tech text-[10px] text-neutral-600 mt-1 uppercase tracking-widest">{new Date().toLocaleDateString()} // INDEX_00{activeView.toUpperCase()}</span>
            </div>
          </header>

          {/* --- DASHBOARD VIEW --- */}
          {activeView === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* SESSIONS - MINI */}
              <section className="glass-panel p-8 relative group overflow-hidden border-l-2 border-white/20">
                <SectionHeader number="01" title="Mission Schedule" />
                <button onClick={() => handleViewChange('schedule')} className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-all flex items-center gap-2 group/btn">
                  <span className="font-mono-tech text-[9px] uppercase tracking-widest">Full View</span>
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <div className="space-y-4">
                  {sessions.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                      <span className="font-mono-tech text-xs text-white">{s.day} {s.time} // {s.date}</span>
                      <span className="font-mono-tech text-[10px] text-neutral-500 uppercase">
                         {s.participants?.length || 0} / {s.capacity || 4} Clients
                      </span>
                    </div>
                  ))}
                  <button onClick={() => handleViewChange('schedule')} className="w-full py-4 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">
                    View Full Schedule
                  </button>
                </div>
              </section>

              {/* ROUTINE - MINI */}
              <section className="glass-panel p-8 relative overflow-hidden">
                <SectionHeader number="02" title="Routine Engine" />
                <div className="space-y-4">
                  {routines.slice(0, 3).map((r, i) => (
                    <div key={r.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                      <span className="font-mono-tech text-xs text-white">{String(i+1).padStart(2,'0')} // {r.name}</span>
                      <span className="font-mono-tech text-[10px] text-neutral-500 uppercase">{r.sets}</span>
                    </div>
                  ))}
                  <button onClick={() => handleViewChange('builder')} className="w-full py-4 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">
                    Engineer Program
                  </button>
                </div>
              </section>

              {/* PAYMENTS - MINI */}
              <section className="glass-panel p-8">
                <SectionHeader number="03" title="Finance Telemetery" />
                <div className="space-y-4">
                  {payments.slice(0, 3).map(p => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                      <span className="font-mono-tech text-xs text-white">{p.name}</span>
                      <span className={`font-mono-tech text-[10px] uppercase ${p.status === 'pagado' ? 'text-emerald-500' : 'text-red-500'}`}>
                        ${p.amount} // {p.status}
                      </span>
                    </div>
                  ))}
                  <button onClick={() => handleViewChange('finance')} className="w-full py-4 border border-white/5 text-neutral-500 font-mono-tech text-[9px] uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">
                    Open Finance Ledger
                  </button>
                </div>
              </section>

              {/* WELLNESS - FULL */}
              <section className="glass-panel p-10 relative overflow-hidden border-r-2 border-white/20">
                <SectionHeader number="04" title="Biometric Flow" />
                <button onClick={handleUpdateWellness} className="absolute top-10 right-10 p-2 text-neutral-500 hover:text-white border border-transparent hover:border-white/10 transition-all">
                  <Activity size={18} />
                </button>
                
                <div className="grid grid-cols-2 gap-8 mt-10">
                  <div className="space-y-1">
                    <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Hydration</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bebas text-5xl text-white">{wellness.water_liters}</span>
                      <span className="font-bebas text-2xl text-neutral-600">LITERS</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-900 mt-2">
                      <div className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, (wellness.water_liters / 4) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Recovery</p>
                    <div className="flex items-baseline justify-end gap-2">
                      <span className="font-bebas text-5xl text-white">{wellness.sleep_hours}</span>
                      <span className="font-bebas text-2xl text-neutral-600">HRS</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-900 mt-2">
                      <div className="h-full ml-auto bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, (wellness.sleep_hours / 10) * 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-4 border-t border-white/5 col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">System Stress Index</p>
                      <span className={`font-mono-tech text-xs font-bold px-3 py-1 ${wellness.stress_level === 'HI' ? 'bg-red-500 text-white' : 'bg-white text-black'}`}>
                        {wellness.stress_level}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 h-3 transition-all duration-700 ${i < wellness.diet_score ? 'bg-white' : 'bg-neutral-900'}`}
                          style={{ boxShadow: i < wellness.diet_score ? '0 -5px 15px -3px rgba(255,255,255,0.1) inset' : 'none' }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* --- SCHEDULE VIEW --- */}
          {activeView === 'schedule' && (
            <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-2 min-w-[800px] mb-20">
                {/* Header Row */}
                <div className="h-12"></div>
                {DAYS.map(day => (
                  <div key={day} className="h-12 flex items-center justify-center bg-neutral-900/50 border border-white/5 font-mono-tech text-[10px] text-neutral-400 uppercase tracking-widest">
                    {day}
                  </div>
                ))}

                {/* Grid Rows */}
                {HOURS.map((hour, index) => {
                  // 1. Render the Spacer Row (Visual Break)
                  if (hour === '---') {
                    return (
                      <React.Fragment key={`spacer-${index}`}>
                        <div className="h-8 col-span-8 flex items-center justify-center bg-neutral-900/30 border-y border-white/5">
                           <span className="font-mono-tech text-[9px] text-neutral-600 tracking-[0.5em]">SIESTA // BREAK</span>
                        </div>
                      </React.Fragment>
                    );
                  }

                  // 2. Render Normal Time Slots
                  return (
                    <React.Fragment key={hour}>
                      <div className="h-16 flex items-center justify-center font-mono-tech text-[10px] text-neutral-600 border-r border-white/5">
                        {hour}
                      </div>
                      {DAYS.map(day => {
                        const session = sessions.find(s => s.day === day && s.time === hour);
                        const count = session?.participants?.length || 0;
                        const cap = session?.capacity || 4;
                        
                        let style = "bg-neutral-900/10 border border-white/5 opacity-50 hover:opacity-100"; // Empty
                        
                        if (session) {
                          if (count === 0) style = "bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 opacity-100";
                          else if (count < cap) style = "bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 opacity-100";
                          else style = "bg-red-500/10 border border-red-500/50 text-red-500 opacity-100";
                        }

                        return (
                          <div 
                            key={`${day}-${hour}`}
                            onClick={() => handleToggleAvailability(day, hour)}
                            className={`h-16 cursor-pointer transition-all active:scale-95 group relative flex flex-col items-center justify-center p-1 text-center overflow-hidden ${style}`}
                          >
                            {session ? (
                              <>
                                <span className="font-bebas text-lg tracking-widest">
                                  {count} <span className="text-[10px] opacity-50">/ {cap}</span>
                                </span>
                                <span className="font-mono-tech text-[7px] uppercase tracking-widest opacity-70">
                                  {count === 0 ? "OPEN" : "ACTIVE"}
                                </span>
                              </>
                            ) : (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={12} className="text-white/30" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
          )}

          {/* --- BUILDER VIEW --- */}
          {activeView === 'builder' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl">
              <SectionHeader number="02" title="Routine Engineering" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
                {/* Left: Input Cockpit */}
                <div className="space-y-8 glass-panel p-10 border-l-2 border-white/20">
                  <div className="space-y-2">
                    <label className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest block ml-1">Zone Selector</label>
                    <select 
                      value={builderBodyPart}
                      onChange={(e) => setBuilderBodyPart(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 p-5 font-bebas text-2xl tracking-widest text-white focus:border-white/40 transition-all outline-none rounded-none"
                    >
                      {Object.keys(EXERCISE_DB).map(part => (
                        <option key={part} value={part}>{part.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest block ml-1">Deployment Module</label>
                    <select 
                      value={builderExercise}
                      onChange={(e) => setBuilderExercise(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 p-5 font-bebas text-2xl tracking-widest text-white focus:border-white/40 transition-all outline-none rounded-none"
                    >
                      {EXERCISE_DB[builderBodyPart]?.map(ex => (
                        <option key={ex.id} value={ex.name}>{ex.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest block ml-1">Precision Sets</label>
                      <div className="flex bg-neutral-900 border border-white/10 h-16">
                        <button onClick={() => setBuilderSets(Math.max(1, builderSets - 1))} className="flex-1 hover:bg-white/5 transition-all text-neutral-500 hover:text-white">-</button>
                        <div className="flex-[2] flex items-center justify-center font-bebas text-3xl">{String(builderSets).padStart(2, '0')}</div>
                        <button onClick={() => setBuilderSets(builderSets + 1)} className="flex-1 hover:bg-white/5 transition-all text-neutral-500 hover:text-white">+</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest block ml-1">Precision Reps</label>
                      <div className="flex bg-neutral-900 border border-white/10 h-16">
                        <button onClick={() => setBuilderReps(Math.max(1, builderReps - 1))} className="flex-1 hover:bg-white/5 transition-all text-neutral-500 hover:text-white">-</button>
                        <div className="flex-[2] flex items-center justify-center font-bebas text-3xl">{String(builderReps).padStart(2, '0')}</div>
                        <button onClick={() => setBuilderReps(builderReps + 1)} className="flex-1 hover:bg-white/5 transition-all text-neutral-500 hover:text-white">+</button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={async () => {
                      if (!builderExercise) return;
                      const { error } = await supabase.from('routines').insert([
                        { name: builderExercise, sets: `${builderSets} SETS X ${builderReps} REPS`, user_id: session.user.id, order: routines.length + 1 }
                      ]);
                      if (error) alert(error.message);
                    }}
                    className="w-full py-6 bg-white text-black font-mono-tech text-xs font-bold uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                  >
                    DEPLOY BLOCK TO PROGRAM
                  </button>
                </div>

                {/* Right: Active Program Monitor */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-[0.4em]">Active Manifest</h3>
                    <span className="font-mono-tech text-[10px] text-neutral-700 uppercase">{routines.length} BLOCKS LOADED</span>
                  </div>
                  <div className="space-y-2 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {routines.map((item, idx) => (
                      <div key={item.id} className="group flex items-center justify-between p-5 bg-neutral-900/40 border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex items-center gap-5">
                          <span className="font-mono-tech text-xs font-bold text-neutral-700">{String(idx+1).padStart(2, '0')} //</span>
                          <span className="font-bold text-sm uppercase tracking-widest text-neutral-300">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">{item.sets}</span>
                          <button onClick={async () => await supabase.from('routines').delete().eq('id', item.id)} className="p-2 text-neutral-700 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- FINANCE VIEW --- */}
          {activeView === 'finance' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-5xl">
              <SectionHeader number="03" title="Revenue Ledger" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-panel p-8 border-l-2 border-white/20">
                  <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Total Yield</p>
                  <h3 className="font-bebas text-5xl text-white tracking-tighter">${payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}</h3>
                </div>
                <div className="glass-panel p-8 border-l-2 border-emerald-500/20">
                  <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Confirmed Credits</p>
                  <h3 className="font-bebas text-5xl text-emerald-500 tracking-tighter">
                    ${payments.filter(p => p.status === 'pagado').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                  </h3>
                </div>
                <div className="glass-panel p-8 border-l-2 border-red-500/20">
                  <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mb-2">Outstanding Risk</p>
                  <h3 className="font-bebas text-5xl text-red-500 tracking-tighter">
                    ${payments.filter(p => p.status !== 'pagado').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                  </h3>
                </div>
              </div>

              <div className="glass-panel overflow-hidden border border-white/5">
                <div className="bg-white/5 p-6 flex justify-between items-center border-b border-white/5">
                  <h4 className="font-mono-tech text-[10px] text-white uppercase tracking-[0.4em]">Transaction History</h4>
                  <button onClick={() => handleAddPayment()} className="bg-white text-black px-6 py-2 font-mono-tech text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                    + Register Entry
                  </button>
                </div>
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {payments.map(p => (
                    <div key={p.id} className="group flex items-center justify-between p-6 hover:bg-white/5 transition-all text-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-white uppercase tracking-widest">{p.name}</span>
                        <span className="font-mono-tech text-[10px] text-neutral-500 mt-1">{new Date(p.created_at).toLocaleDateString()} // TXN_REF_{p.id.toString().slice(0,4)}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className={`font-mono-tech text-[10px] px-3 py-1 uppercase tracking-widest border ${
                          p.status === 'pagado' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 
                          p.status === 'atrasado' ? 'border-red-500/30 text-red-500 bg-red-500/5' : 
                          'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                        }`}>
                          {p.status}
                        </span>
                        <span className="font-bebas text-2xl text-white w-24 text-right">${p.amount}</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleAddPayment(p)} className="p-2 text-neutral-700 hover:text-white transition-colors">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={async () => await supabase.from('payments').delete().eq('id', p.id)} className="p-2 text-neutral-700 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
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

      <CommandModal 
        {...modalConfig} 
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })} 
      />
    </div>
  );
}