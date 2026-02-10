import { supabase } from '../lib/supabase';
import { DAYS } from '../constants/schedule';

export const useSchedule = (sessions, setSessions) => {
  // Toggle session availability (admin creates/manages, client joins/leaves)
  const handleToggleAvailability = async (day, time, userRole, userId, userEmail, sessionMap, currentWeekStart, routines, onOpenAdminModal, onOpenClientModal) => {
    const key = `${day}-${time}`;
    const existing = sessionMap.get(key);
    const dayIndex = DAYS.indexOf(day);
    const specificDate = new Date(currentWeekStart);
    specificDate.setDate(specificDate.getDate() + dayIndex);
    const dateStr = specificDate.toISOString().split('T')[0];

    if (userRole === 'admin') {
      if (!existing) {
        // Create slot with optimistic update
        const tempId = 'temp-' + Date.now();
        const optimisticSlot = {
          id: tempId,
          day,
          time,
          date: dateStr,
          status: 'open',
          capacity: 4,
          participants: [],
          user_id: userId,
          client: 'OPEN',
          detail: '4 SLOTS'
        };

        setSessions(prev => [...prev, optimisticSlot]);

        const { data, error } = await supabase
          .from('sessions')
          .insert([{
            day,
            time,
            date: dateStr,
            status: 'open',
            capacity: 4,
            participants: [],
            user_id: userId,
            client: 'OPEN',
            detail: '4 SLOTS'
          }])
          .select();

        if (data) {
          setSessions(prev => prev.map(s => s.id === tempId ? data[0] : s));
        } else {
          setSessions(prev => prev.filter(s => s.id !== tempId));
          alert(error.message);
        }
      } else {
        // Open admin management modal
        onOpenAdminModal(existing, routines);
      }
    } else if (userRole === 'client') {
      if (!existing) return;

      const isJoined = existing.participants?.some(p => p.id === userId);

      if (isJoined) {
        const myData = existing.participants.find(p => p.id === userId);
        const myRoutine = myData?.assigned_routine_id ? routines.find(r => r.id === myData.assigned_routine_id) : null;
        onOpenClientModal(existing, myRoutine);
      } else {
        if ((existing.participants?.length || 0) >= existing.capacity) return alert("Full.");

        const newParticipants = [...(existing.participants || []), { id: userId, email: userEmail, assigned_routine_id: null }];
        const updatedSession = { ...existing, participants: newParticipants };
        setSessions(prev => prev.map(s => s.id === existing.id ? updatedSession : s));

        const { error } = await supabase
          .from('sessions')
          .update({ participants: newParticipants })
          .eq('id', existing.id);

        if (error) {
          setSessions(prev => prev.map(s => s.id === existing.id ? existing : s));
          alert(error.message);
        }
      }
    }
  };

  // Bulk operations
  const handleCopyWeekPattern = async (sourceWeek, targetWeek, userId) => {
    const sourceStart = sourceWeek.toISOString().split('T')[0];
    const sourceEnd = new Date(sourceWeek);
    sourceEnd.setDate(sourceEnd.getDate() + 6);
    const sourceEndStr = sourceEnd.toISOString().split('T')[0];

    const { data: sourceSessions, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .gte('date', sourceStart)
      .lte('date', sourceEndStr);

    if (fetchError || !sourceSessions || sourceSessions.length === 0) {
      alert(fetchError ? 'Error fetching source week: ' + fetchError.message : 'No sessions found in source week!');
      return;
    }

    const dayOffset = Math.floor((targetWeek - sourceWeek) / (1000 * 60 * 60 * 24));
    const newSessions = sourceSessions.map(s => {
      const newDate = new Date(s.date);
      newDate.setDate(newDate.getDate() + dayOffset);

      return {
        day: s.day,
        time: s.time,
        date: newDate.toISOString().split('T')[0],
        status: 'open',
        capacity: s.capacity,
        participants: [],
        user_id: userId,
        client: 'OPEN',
        detail: `${s.capacity} SLOTS`
      };
    });

    setSessions(prev => [...prev, ...newSessions.map((s, i) => ({ ...s, id: `temp-${Date.now()}-${i}` }))]);

    const { data, error } = await supabase.from('sessions').insert(newSessions).select();

    if (error) {
      setSessions(prev => prev.filter(s => !s.id.toString().startsWith('temp-')));
      alert('Error copying week: ' + error.message);
    } else {
      setSessions(prev => {
        const withoutTemp = prev.filter(s => !s.id.toString().startsWith('temp-'));
        return [...withoutTemp, ...data];
      });
      alert(`✅ Copied ${data.length} sessions successfully!`);
    }
  };

  const handleClearWeek = async (weekStart) => {
    const startStr = weekStart.toISOString().split('T')[0];
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const endStr = end.toISOString().split('T')[0];

    const sessionsToDelete = sessions.filter(s => s.date >= startStr && s.date <= endStr);

    if (sessionsToDelete.length === 0) {
      alert('No sessions to clear!');
      return;
    }

    if (!confirm(`⚠️ This will DELETE ${sessionsToDelete.length} sessions. Continue?`)) {
      return;
    }

    setSessions(prev => prev.filter(s => s.date < startStr || s.date > endStr));

    const { error } = await supabase.from('sessions').delete().gte('date', startStr).lte('date', endStr);

    if (error) {
      setSessions(prev => [...prev, ...sessionsToDelete]);
      alert('Error clearing week: ' + error.message);
    } else {
      alert(`✅ Cleared ${sessionsToDelete.length} sessions!`);
    }
  };

  const handleFillMonth = async (pattern, currentWeekStart, userId) => {
    const monthStart = new Date(currentWeekStart);
    monthStart.setDate(1);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    const newSessions = [];
    const currentDate = new Date(monthStart);

    while (currentDate <= monthEnd) {
      const dayName = DAYS[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];

      pattern.forEach(slot => {
        if (slot.day === dayName) {
          newSessions.push({
            day: dayName,
            time: slot.time,
            date: currentDate.toISOString().split('T')[0],
            status: 'open',
            capacity: slot.capacity || 4,
            participants: [],
            user_id: userId,
            client: 'OPEN',
            detail: `${slot.capacity || 4} SLOTS`
          });
        }
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (newSessions.length === 0) {
      alert('Pattern generated 0 sessions!');
      return;
    }

    if (!confirm(`This will create ${newSessions.length} sessions. Continue?`)) {
      return;
    }

    setSessions(prev => [...prev, ...newSessions.map((s, i) => ({ ...s, id: `temp-month-${i}` }))]);

    const { data, error } = await supabase.from('sessions').insert(newSessions).select();

    if (error) {
      setSessions(prev => prev.filter(s => !s.id.toString().startsWith('temp-month-')));
      alert('Error filling month: ' + error.message);
    } else {
      setSessions(prev => {
        const withoutTemp = prev.filter(s => !s.id.toString().startsWith('temp-month-'));
        return [...withoutTemp, ...data];
      });
      alert(`✅ Created ${data.length} sessions!`);
    }
  };

  return {
    handleToggleAvailability,
    handleCopyWeekPattern,
    handleClearWeek,
    handleFillMonth
  };
};
