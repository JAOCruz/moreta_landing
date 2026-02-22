import { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Mail, Phone, Target, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SectionHeader } from '../ui/SectionHeader';

export const ClientsView = ({ onSelectClient }) => {
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({});
  const [clientPayments, setClientPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [staggerReady, setStaggerReady] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setStaggerReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const fetchClients = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client');

    if (error) {
      console.error('❌ Error fetching clients:', error);
      alert('Error loading clients: ' + error.message);
    }

    if (!error && profiles) {
      // Fetch client_profiles and merge into profile objects
      const { data: clientProfiles } = await supabase
        .from('client_profiles')
        .select('*');

      const cpMap = {};
      if (clientProfiles) {
        clientProfiles.forEach(cp => { cpMap[cp.user_id] = cp; });
      }

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

      // Fetch payments to show status badges
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

      // Fetch stats for each client
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
    // Check by client_id first, then by name
    const payments = clientPayments[client.id] ||
      clientPayments[client.display_name] ||
      clientPayments[client.email?.split('@')[0]] || [];

    if (payments.length === 0) return null;
    const hasOverdue = payments.some(p => p.status === 'atrasado' || p.status === 'pendiente');
    const latestPaid = payments.some(p => p.status === 'pagado');

    if (hasOverdue) return 'overdue';
    if (latestPaid) return 'paid';
    return null;
  };

  const stagger = (i) => ({
    opacity: staggerReady ? 1 : 0,
    transform: staggerReady ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s`
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-mono-tech text-xs text-neutral-500">Loading clients...</p>
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {clients.map((client, i) => {
          const stats = clientStats[client.id] || { measurements: 0, workouts: 0, sessions: 0 };
          const paymentStatus = getPaymentStatus(client);
          const displayName = client.display_name || client.email?.split('@')[0];

          return (
            <div
              key={client.id}
              style={stagger(i)}
              className="glass-panel p-5 sm:p-6 border border-white/10 card-hover cursor-pointer group"
              onClick={() => onSelectClient(client)}
            >
              {/* Client Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors truncate">
                      {displayName}
                    </h3>
                    {/* Payment Status Badge */}
                    {paymentStatus === 'overdue' && (
                      <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] font-mono-tech uppercase">
                        <span className="status-dot danger" style={{width:4,height:4}}></span>
                        Debe
                      </span>
                    )}
                    {paymentStatus === 'paid' && (
                      <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-mono-tech uppercase">
                        <span className="status-dot live" style={{width:4,height:4}}></span>
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
                <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 ml-2">
                  <span className="font-bebas text-xl text-emerald-500">
                    {(displayName || 'U')[0].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2.5 bg-white/5 border border-white/5">
                  <div className="font-bebas text-xl text-white">{stats.sessions}</div>
                  <div className="font-mono-tech text-[7px] text-neutral-600 uppercase">Sessions</div>
                </div>
                <div className="text-center p-2.5 bg-white/5 border border-white/5">
                  <div className="font-bebas text-xl text-white">{stats.workouts}</div>
                  <div className="font-mono-tech text-[7px] text-neutral-600 uppercase">Workouts</div>
                </div>
                <div className="text-center p-2.5 bg-white/5 border border-white/5">
                  <div className="font-bebas text-xl text-white">{stats.measurements}</div>
                  <div className="font-mono-tech text-[7px] text-neutral-600 uppercase">Check-ins</div>
                </div>
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
