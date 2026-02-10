import { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Mail, Phone, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SectionHeader } from '../ui/SectionHeader';

export const ClientsView = ({ onSelectClient }) => {
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    // Get all profiles with role='client'
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client');

    // Debug logging
    console.log('📊 Fetching clients:', { profiles, error });

    if (error) {
      console.error('❌ Error fetching clients:', error);
      alert('Error loading clients: ' + error.message + '\n\nMake sure to run supabase_fix_clients_view.sql in your Supabase SQL Editor!');
    }

    if (!error && profiles) {
      setClients(profiles);

      // Fetch stats for each client
      profiles.forEach(async (client) => {
        const [measRes, workoutRes, sessionRes] = await Promise.all([
          supabase
            .from('body_measurements')
            .select('id')
            .eq('user_id', client.id),
          supabase
            .from('workout_logs')
            .select('id')
            .eq('user_id', client.id),
          supabase
            .from('sessions')
            .select('participants')
        ]);

        // Count sessions this client is in
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono-tech text-xs text-neutral-500">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SectionHeader number="CLNT" title="Client Management" />
        <div className="flex items-center gap-3">
          <Users className="text-emerald-500" size={20} />
          <span className="font-bebas text-2xl text-white">{clients.length}</span>
          <span className="font-mono-tech text-xs text-neutral-500 uppercase">Active Clients</span>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => {
          const stats = clientStats[client.id] || { measurements: 0, workouts: 0, sessions: 0 };

          return (
            <div
              key={client.id}
              className="glass-panel p-6 border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer group"
              onClick={() => onSelectClient(client)}
            >
              {/* Client Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white group-hover:text-emerald-500 transition-colors">
                    {client.email.split('@')[0]}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail size={12} className="text-neutral-600" />
                    <span className="font-mono-tech text-[9px] text-neutral-500 truncate">{client.email}</span>
                  </div>
                </div>
                <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <span className="font-bebas text-xl text-emerald-500">
                    {client.email[0].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-white/5 border border-white/5">
                  <div className="font-bebas text-2xl text-white">{stats.sessions}</div>
                  <div className="font-mono-tech text-[8px] text-neutral-600 uppercase">Sessions</div>
                </div>
                <div className="text-center p-3 bg-white/5 border border-white/5">
                  <div className="font-bebas text-2xl text-white">{stats.workouts}</div>
                  <div className="font-mono-tech text-[8px] text-neutral-600 uppercase">Workouts</div>
                </div>
                <div className="text-center p-3 bg-white/5 border border-white/5">
                  <div className="font-bebas text-2xl text-white">{stats.measurements}</div>
                  <div className="font-mono-tech text-[8px] text-neutral-600 uppercase">Check-ins</div>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-2 text-neutral-600 text-[9px] font-mono-tech">
                <Calendar size={10} />
                <span>Joined {new Date(client.created_at).toLocaleDateString()}</span>
              </div>

              {/* View Progress Button */}
              <button className="w-full mt-4 py-2 border border-white/10 group-hover:border-emerald-500 group-hover:bg-emerald-500/10 text-neutral-500 group-hover:text-emerald-500 font-mono-tech text-[9px] uppercase tracking-widest transition-all">
                View Progress →
              </button>
            </div>
          );
        })}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10">
          <Users className="mx-auto text-neutral-600 mb-4" size={48} />
          <p className="font-mono-tech text-xs text-neutral-500">NO CLIENTS YET</p>
          <p className="font-mono-tech text-[9px] text-neutral-600 mt-2">
            Clients will appear here once they register
          </p>
        </div>
      )}
    </div>
  );
};
