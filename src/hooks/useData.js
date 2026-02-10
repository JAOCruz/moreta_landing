import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export const useData = (userId, currentWeekStart) => {
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [wellness, setWellness] = useState({
    sleep_hours: 0,
    stress_level: '...',
    water_liters: 0,
    diet_score: 0
  });

  // Performance optimization: Hash map for session lookup
  const sessionMap = useMemo(() => {
    const map = new Map();
    sessions.forEach(session => {
      const key = `${session.day}-${session.time}`;
      map.set(key, session);
    });
    return map;
  }, [sessions]);

  useEffect(() => {
    if (userId) {
      fetchDashboardData(userId);
    }
  }, [userId, currentWeekStart]);

  const fetchDashboardData = async (userId) => {
    const startStr = currentWeekStart.toISOString().split('T')[0];
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const endStr = end.toISOString().split('T')[0];

    const [sessRes, payRes, routRes] = await Promise.all([
      supabase.from('sessions').select('*').gte('date', startStr).lte('date', endStr).order('time', { ascending: true }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('routines').select('*').order('created_at', { ascending: false }),
    ]);

    if (!sessRes.error) setSessions(sessRes.data);
    if (!payRes.error) setPayments(payRes.data);
    if (!routRes.error) setRoutines(routRes.data);

    // Set up real-time subscriptions
    const channels = [
      supabase.channel('public:sessions').on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => fetchDashboardData(userId)).subscribe(),
      supabase.channel('public:payments').on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchDashboardData(userId)).subscribe(),
      supabase.channel('public:routines').on('postgres_changes', { event: '*', schema: 'public', table: 'routines' }, () => fetchDashboardData(userId)).subscribe(),
    ];

    return () => channels.forEach(c => c.unsubscribe());
  };

  return {
    sessions,
    setSessions,
    payments,
    setPayments,
    routines,
    setRoutines,
    wellness,
    setWellness,
    sessionMap
  };
};
