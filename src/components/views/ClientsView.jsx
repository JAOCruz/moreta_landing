import { useState, useEffect, useRef } from 'react';
import { Users, TrendingUp, Calendar, Mail, Phone, Target, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../../lib/supabase';
import { SectionHeader } from '../ui/SectionHeader';
import { SkeletonGrid } from '../ui/Skeleton';

export const ClientsView = ({ onSelectClient }) => {
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({});
  const [clientPayments, setClientPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const gridRef = useRef(null);

  useEffect(() => {
    fetchClients();
  }, []);

  // GSAP stagger reveal when loaded
  useEffect(() => {
    if (!loading && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.client-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
      );
    }
  }, [loading, clients.length]);

  const fetchClients = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client');

    if (error) {
      console.error('❌ Error fetching clients:', error);
    }

    if (!error && profiles) {
      const { data: clientProfiles } = await supabase.from('client_profiles').select('*');
      const cpMap = {};
      if (clientProfiles) clientProfiles.forEach(cp => { cpMap[cp.user_id] = cp; });

      const mergedClients = profiles.map(p => {
        const cp = cpMap[p.id] || {};
        return {
          ...p,
          motivation_notes: cp.motivation_notes || '',
          injuries: cp.injuries || [],
          health_conditions: cp.health_conditions || [],
          primary_goal: cp.primary_goal || '',
          goal_type: cp.goal_type || '',
          experience_level: cp.experience_level || '',
          coach_notes: cp.coach_notes || '',
          phone: cp.phone || '',
          _client_profile_id: cp.id || null
        };
      });

      setClients(mergedClients);

      const { data: allPayments } = await supabase.from('payments').select('*');
      if (allPayments) {
        const paymentMap = {};
        allPayments.forEach(p => {
          const key = p.client_id || p.name;
          if (!paymentMap[key]) paymentMap[key] = [];
          paymentMap[key].push(p);
        });
        setClientPayments(paymentMap);
      }

      profiles.forEach(async (client) => {
        const [measRes, workoutRes, sessionRes] = await Promise.all([
          supabase.from('body_measurements').select('id').eq('user_id', client.id),
          supabase.from('workout_logs').select('id').eq('user_id', client.id),
          supabase.from('sessions').select('participants')
        ]);

        const sessionsAttended = sessionRes.data?.filter(s =>
          s.participants?.some(p => p.id === client.id)
        ).length || 0;

        setClientStats(prev => ({
          ...prev,
          [client.id]: {
            measurements: measRes.data?.length || 0,
            workouts: workoutRes.data?.length || 0,
            sessions: sessionsAttended
          }
        }));
      });
    }

    setLoading(false);
  };

  const getPaymentStatus = (client) => {
    const payments = clientPayments[client.id] ||
      clientPayments[client.display_name] ||
      clientPayments[client.email?.split('@')[0]] || [];
    if (payments.length === 0) return null;
    const hasOverdue = payments.some(p => p.status === 'atrasado' || p.status === 'pendiente');
    if (hasOverdue) return 'overdue';
    if (payments.some(p => p.status === 'pagado')) return 'paid';
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader number="CLNT" title="Client Management" />
        <SkeletonGrid count={6} cols={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <SectionHeader number="CLNT" title="Client Management" />
        <div className="flex items-center gap-3">
          <Users className="text-emerald-500" size={20} />
          <span className="font-bebas text-2xl text-white">{clients.length}</span>
          <span className="font-mono-tech text-xs text-neutral-500 uppercase">Active</span>
        </div>
      </div>

      {/* Client Grid */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {clients.map((client) => {
          const stats = clientStats[client.id] || { measurements: 0, workouts: 0, sessions: 0 };
          const paymentStatus = getPaymentStatus(client);
          const displayName = client.display_name || client.email?.split('@')[0];

          return (
            <div
              key={client.id}
              className="client-card glass-panel p-5 sm:p-6 border border-white/10 cursor-pointer group opacity-0 transition-all duration-300 hover:border-emerald-500/25"
              onClick={() => onSelectClient(client)}
              style={{ transformOrigin: 'center bottom' }}
            >
              {/* Hover depth effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top, rgba(52,211,153,0.03), transparent 70%)' }}
              />

              {/* Client Header */}
              <div className="flex items-start justify-between mb-4 relative">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors truncate">
                      {displayName}
                    </h3>
                    {paymentStatus === 'overdue' && (
                      <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] font-mono-tech uppercase">
                        <span className="status-dot danger" style={{width:4,height:4}} />
                        Debe
                      </span>
                    )}
                    {paymentStatus === 'paid' && (
                      <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-mono-tech uppercase">
                        <span className="status-dot live" style={{width:4,height:4}} />
                        Al día
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail size={11} className="text-neutral-600" />
                    <span className="font-mono-tech text-[9px] text-neutral-500 truncate">{client.email}</span>
                  </div>
                  {client.motivation_notes && (
                    <p className="font-mono-tech text-[9px] text-emerald-500/60 mt-1.5 line-clamp-1 italic">
                      "{client.motivation_notes}"
                    </p>
                  )}
                </div>
                <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 ml-2 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                  <span className="font-bebas text-xl text-emerald-500">
                    {(displayName || 'U')[0].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { val: stats.sessions, label: 'Sessions' },
                  { val: stats.workouts, label: 'Workouts' },
                  { val: stats.measurements, label: 'Check-ins' },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-2.5 bg-white/[0.03] border border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="font-bebas text-xl text-white">{stat.val}</div>
                    <div className="font-mono-tech text-[7px] text-neutral-600 uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-600 text-[9px] font-mono-tech">
                  <Calendar size={10} />
                  <span>{new Date(client.created_at).toLocaleDateString()}</span>
                </div>
                {client.experience_level && client.experience_level !== 'beginner' && (
                  <span className="font-mono-tech text-[8px] text-neutral-600 uppercase">{client.experience_level}</span>
                )}
              </div>

              <button className="w-full mt-3 py-2 border border-white/10 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 text-neutral-500 group-hover:text-emerald-400 font-mono-tech text-[9px] uppercase tracking-widest transition-all btn-press">
                View Profile →
              </button>
            </div>
          );
        })}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10">
          <Users className="mx-auto text-neutral-600 mb-4" size={48} />
          <p className="font-mono-tech text-xs text-neutral-500">NO CLIENTS YET</p>
          <p className="font-mono-tech text-[9px] text-neutral-600 mt-2">Clients will appear here once they register</p>
        </div>
      )}
    </div>
  );
};
