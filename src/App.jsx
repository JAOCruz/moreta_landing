import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from './lib/supabase';
import { getMonday } from './constants/schedule';
import { ToastProvider, useToast } from './components/ui/Toast';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import { useSchedule } from './hooks/useSchedule';

// Components
import { Styles } from './components/ui/Styles';
import { LoginScreen } from './components/auth/LoginScreen';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandModal } from './components/modals/CommandModal';
import { ClientSessionModal } from './components/modals/ClientSessionModal';
import { BulkOpsModal } from './components/modals/BulkOpsModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { EnhancedScheduleView } from './components/views/EnhancedScheduleView';
import { BuilderView } from './components/views/BuilderView';
import { EnhancedFinanceView } from './components/views/EnhancedFinanceView';
import { MyRoutineView } from './components/views/MyRoutineView';
import { SettingsView } from './components/views/SettingsView';
import { ProgressView } from './components/views/ProgressView';
import { ClientsView } from './components/views/ClientsView';
import { ClientDetailView } from './components/views/ClientDetailView';
import { AdminSettingsView } from './components/views/AdminSettingsView';

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

function AppContent() {
  const toast = useToast();
  const [activeView, setActiveView] = useState('dashboard');
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [selectedClient, setSelectedClient] = useState(null); // For admin viewing client details
  const viewRef = useRef(null);

  // Authentication
  const { session, userRole, loading, authLoading, authError, handleLogin, handleSignup, handleLogout, handleUpdatePassword } = useAuth();

  // Data management
  const { sessions, setSessions, payments, setPayments, routines, setRoutines, wellness, sessionMap } = useData(session?.user?.id, currentWeekStart);

  // Schedule operations
  const { handleToggleAvailability, handleCopyWeekPattern, handleClearWeek, handleFillMonth } = useSchedule(sessions, setSessions);

  // Modal states
  const [adminModal, setAdminModal] = useState({ isOpen: false });
  const [clientModal, setClientModal] = useState({ isOpen: false, session: null, routine: null });
  const [bulkOpsModal, setBulkOpsModal] = useState({ isOpen: false });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', fields: [] });

  // View transitions with staggered reveal
  const handleViewChange = (newView) => {
    if (newView === activeView) return;
    if (viewRef.current) {
      gsap.to(viewRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setActiveView(newView);
          gsap.fromTo(viewRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.4, delay: 0.05, ease: "power2.out" }
          );
          // Stagger children
          const children = viewRef.current?.querySelectorAll('.glass-panel, section, .card-hover, .alert-overdue');
          if (children?.length) {
            gsap.fromTo(children,
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out", delay: 0.1 }
            );
          }
        }
      });
    } else {
      setActiveView(newView);
    }
  };

  // Week navigation
  const handleWeekChange = (days) => {
    if (days === 0) {
      setCurrentWeekStart(getMonday(new Date()));
    } else {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + days);
      setCurrentWeekStart(newDate);
    }
  };

  // Admin modal handlers
  const handleOpenAdminModal = (existing, routines) => {
    setAdminModal({
      isOpen: true,
      title: "Session Command Center",
      participants: existing.participants || [],
      routines: routines,
      fields: [
        { name: 'capacity', label: 'Capacity Limit', type: 'number', defaultValue: existing.capacity || 4 }
      ],
      onDelete: async () => {
        if (!confirm(`CONFIRM DELETION: This will remove the slot and kick all ${existing.participants?.length || 0} users.`)) return;

        setSessions(prev => prev.filter(s => s.id !== existing.id));
        const { error } = await supabase.from('sessions').delete().eq('id', existing.id);

        if (error) {
          setSessions(prev => [...prev, existing]);
          toast.error(error.message);
        }

        setAdminModal({ isOpen: false });
      },
      onSubmit: async (data, updatedSquad) => {
        const updatedSession = {
          ...existing,
          capacity: parseInt(data.capacity),
          participants: updatedSquad
        };

        setSessions(prev => prev.map(s => s.id === existing.id ? updatedSession : s));

        const { error } = await supabase
          .from('sessions')
          .update({
            capacity: parseInt(data.capacity),
            participants: updatedSquad
          })
          .eq('id', existing.id);

        if (error) {
          setSessions(prev => prev.map(s => s.id === existing.id ? existing : s));
          toast.error(error.message);
        }

        setAdminModal({ isOpen: false });
      }
    });
  };

  // Client modal handlers
  const handleOpenClientModal = (session, routine) => {
    setClientModal({ isOpen: true, session, routine });
  };

  const handleClientLeave = async () => {
    if (!clientModal.session) return;

    const newParticipants = clientModal.session.participants.filter(p => p.id !== session.user.id);
    const updatedSession = { ...clientModal.session, participants: newParticipants };
    setSessions(prev => prev.map(s => s.id === clientModal.session.id ? updatedSession : s));

    const { error } = await supabase
      .from('sessions')
      .update({ participants: newParticipants })
      .eq('id', clientModal.session.id);

    if (error) {
      setSessions(prev => prev.map(s => s.id === clientModal.session.id ? clientModal.session : s));
      toast.error(error.message);
    }

    setClientModal({ isOpen: false, session: null, routine: null });
  };

  // Payment handlers
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
        if (error) toast.error(error.message);
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  const handleDeletePayment = async (paymentId) => {
    await supabase.from('payments').delete().eq('id', paymentId);
  };

  // Wellness update
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
        const { error } = await supabase.from('wellness').upsert([{
          ...wellness,
          sleep_hours: parseFloat(data.sleep_hours),
          stress_level: data.stress_level.toUpperCase(),
          water_liters: parseFloat(data.water_liters),
          diet_score: parseInt(data.diet_score),
          user_id: session.user.id
        }]);
        if (error) toast.error(error.message);
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  // Routine handlers
  const handleSaveRoutine = async (routineData) => {
    if (!routineData.name || routineData.exercises.length === 0) {
      toast.warning("Name routine and add at least 1 exercise."); return;
    }

    const payload = {
      name: routineData.name,
      category: routineData.category,
      exercises: routineData.exercises,
      user_id: session.user.id
    };

    if (routineData.id) {
      const { error } = await supabase.from('routines').update(payload).eq('id', routineData.id);
      if (error) {
        toast.error('Update failed: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('routines').insert([payload]);
      if (error) {
        toast.error('Insert failed: ' + error.message);
        return;
      }
    }

    toast.success('Routine saved successfully!');
  };

  const handleDeleteRoutine = async (routineId) => {
    if (confirm('Delete this routine?')) {
      await supabase.from('routines').delete().eq('id', routineId);
    }
  };

  // Preloader state
  const [preloaderDone, setPreloaderDone] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setPreloaderDone(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Loading states — show preloader
  if (loading || !preloaderDone) {
    return (
      <div className={`preloader ${!loading && preloaderDone ? 'loaded' : ''}`}>
        <div className="preloader-logo">M<span style={{color:'#34d399'}}>.</span>FIT</div>
        <div className="preloader-bar"><div className="preloader-bar-fill"></div></div>
        <div className="preloader-status">Initializing System</div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} loading={authLoading} error={authError} />;
  }

  // Find client's assigned routine
  const myUpcomingSession = sessions.find(s => s.participants?.some(p => p.id === session.user.id));
  const myParticipantRecord = myUpcomingSession?.participants?.find(p => p.id === session.user.id);
  const myAssignedRoutine = myParticipantRecord?.assigned_routine_id
    ? routines.find(r => r.id === myParticipantRecord.assigned_routine_id)
    : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-inter selection:bg-white selection:text-black">
      <Styles />
      <div className="fixed inset-0 tactical-grid opacity-10 pointer-events-none"></div>
      <Sidebar activeView={activeView} onViewChange={handleViewChange} onLogout={handleLogout} userRole={userRole} overdueCount={payments.filter(p => p.status === 'atrasado' || p.status === 'pendiente').length} session={session} />

      <main className="flex-1 h-screen overflow-y-auto relative">
        <div ref={viewRef} className="p-4 sm:p-6 lg:p-12 pb-28 md:pb-12 opacity-100">
          <Header user={session.user} userRole={userRole} />

          {activeView === 'dashboard' && (
            <DashboardView
              sessions={sessions}
              routines={routines}
              payments={payments}
              wellness={wellness}
              myAssignedRoutine={myAssignedRoutine}
              userRole={userRole}
              onViewChange={handleViewChange}
              onUpdateWellness={handleUpdateWellness}
            />
          )}

          {activeView === 'schedule' && (
            <EnhancedScheduleView
              currentWeekStart={currentWeekStart}
              sessionMap={sessionMap}
              userRole={userRole}
              userId={session.user.id}
              onToggleAvailability={(day, hour) => handleToggleAvailability(day, hour, userRole, session.user.id, session.user.email, sessionMap, currentWeekStart, routines, handleOpenAdminModal, handleOpenClientModal)}
              onWeekChange={handleWeekChange}
              onBulkOps={() => setBulkOpsModal({ isOpen: true })}
            />
          )}

          {activeView === 'builder' && userRole === 'admin' && (
            <BuilderView
              routines={routines}
              onSaveRoutine={handleSaveRoutine}
              onEditRoutine={(routine) => console.log('Edit', routine)}
              onDeleteRoutine={handleDeleteRoutine}
            />
          )}

          {activeView === 'finance' && userRole === 'admin' && (
            <EnhancedFinanceView
              payments={payments}
              onAddPayment={handleAddPayment}
              onDeletePayment={handleDeletePayment}
              userId={session.user.id}
            />
          )}

          {activeView === 'admin_settings' && userRole === 'admin' && (
            <AdminSettingsView />
          )}

          {activeView === 'my_routine' && userRole === 'client' && (
            <MyRoutineView routine={myAssignedRoutine} />
          )}

          {activeView === 'progress' && userRole === 'client' && (
            <ProgressView userId={session.user.id} routine={myAssignedRoutine} />
          )}

          {activeView === 'clients' && userRole === 'admin' && !selectedClient && (
            <ClientsView onSelectClient={(client) => {
              setSelectedClient(client);
              setActiveView('client_detail');
            }} />
          )}

          {activeView === 'client_detail' && userRole === 'admin' && selectedClient && (
            <ClientDetailView
              client={selectedClient}
              onBack={() => {
                setSelectedClient(null);
                setActiveView('clients');
              }}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              onUpdatePassword={(current, newPass) => handleUpdatePassword(current, newPass, session.user.email)}
              session={session}
            />
          )}
        </div>
      </main>

      {/* Modals */}
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
      <BulkOpsModal
        isOpen={bulkOpsModal.isOpen}
        onClose={() => setBulkOpsModal({ isOpen: false })}
        currentWeek={currentWeekStart}
        onCopyWeek={(source, target) => handleCopyWeekPattern(source, target, session.user.id)}
        onClearWeek={handleClearWeek}
        onFillMonth={(pattern) => handleFillMonth(pattern, currentWeekStart, session.user.id)}
      />
    </div>
  );
}
