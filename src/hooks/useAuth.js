import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (uid) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', uid).single();
    if (data) setUserRole(data.role);
    else setUserRole('client'); // Default safety
    setLoading(false);
  };

  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error);
    setAuthLoading(false);
  };

  const handleSignup = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'client'
        }
      }
    });

    if (error) {
      setAuthError(error);
      setAuthLoading(false);
      return;
    }

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
      }

      alert('✅ Account created! Please check your email to verify your account, then log in.');
      setAuthError(null);
    }

    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleUpdatePassword = async (currentPassword, newPassword, userEmail) => {
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // Verify current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword
    });

    if (verifyError) {
      alert("SECURITY ALERT: Current password incorrect.");
      return;
    }

    // Update password
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert("Error: " + error.message);
    else {
      alert("Password updated successfully!");
    }
  };

  return {
    session,
    userRole,
    loading,
    authLoading,
    authError,
    handleLogin,
    handleSignup,
    handleLogout,
    handleUpdatePassword
  };
};
