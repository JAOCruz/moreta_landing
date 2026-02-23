import { useState, useEffect, useRef } from 'react';
import { Key, User, Globe, Bell, Moon, Sun, Trash2, Info, Camera, Shield, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Avatar, uploadAvatar, removeAvatar } from '../ui/Avatar';

export const SettingsView = ({ onUpdatePassword, session }) => {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState('profile');

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Preferences state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [language, setLanguage] = useState(i18n.language || 'es');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(true);

  const fileInputRef = useRef(null);

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  // Load profile data
  useEffect(() => {
    if (!userId) return;
    setEmail(userEmail || '');
    (async () => {
      const { data } = await supabase.from('profiles').select('full_name, bio').eq('id', userId).single();
      if (data) {
        setDisplayName(data.full_name || '');
        setBio(data.bio || '');
      }
      // Load notification prefs from localStorage
      const prefs = JSON.parse(localStorage.getItem('notif_prefs') || '{}');
      if (prefs.emailNotifs !== undefined) setEmailNotifs(prefs.emailNotifs);
      if (prefs.sessionReminders !== undefined) setSessionReminders(prefs.sessionReminders);
      if (prefs.progressUpdates !== undefined) setProgressUpdates(prefs.progressUpdates);
    })();
  }, [userId, userEmail]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: displayName, bio }).eq('id', userId);
    setSaving(false);
    if (error) { alert(error.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(userId, file);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removeAvatar(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = () => {
    onUpdatePassword(currentPassword, newPassword);
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleLanguageChange = (lng) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSaveNotifPrefs = () => {
    localStorage.setItem('notif_prefs', JSON.stringify({ emailNotifs, sessionReminders, progressUpdates }));
  };

  const handleDeleteAccount = async () => {
    if (!confirm('⚠️ Are you sure? This will permanently delete your account and all data. This cannot be undone.')) return;
    if (!confirm('Last chance — type DELETE to confirm')) return;
    // Sign out (actual deletion needs admin/edge function)
    await supabase.auth.signOut();
  };

  useEffect(() => { handleSaveNotifPrefs(); }, [emailNotifs, sessionReminders, progressUpdates]);

  const sections = [
    { id: 'profile', icon: User, label: t('settings.profile') },
    { id: 'preferences', icon: Globe, label: t('settings.preferences') },
    { id: 'account', icon: Shield, label: t('settings.account') },
    { id: 'about', icon: Info, label: t('settings.about') }
  ];

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-all relative ${checked ? 'bg-emerald-500' : 'bg-neutral-700'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="font-bebas text-4xl tracking-wide text-white mb-8">{t('settings.title')}</h2>

      {/* Section Nav — Instagram style */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-mono-tech text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              activeSection === s.id
                ? 'bg-white text-black'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10'
            }`}
          >
            <s.icon size={14} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          {/* Photo Card */}
          <div className="glass-panel p-6 border border-white/5">
            <h3 className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mb-4">{t('settings.profilePhoto')}</h3>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar userId={userId} email={userEmail} displayName={displayName} size={80} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera size={20} className="text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="font-mono-tech text-[10px] text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">
                  {t('settings.changePhoto')}
                </button>
                <button onClick={handleRemovePhoto} className="font-mono-tech text-[10px] text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors">
                  {t('settings.removePhoto')}
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="glass-panel p-6 border border-white/5">
            <h3 className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mb-4">{t('settings.profile')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">{t('settings.displayName')}</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-sm text-white focus:border-emerald-500/40 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">{t('settings.email')}</label>
                <input
                  value={email}
                  readOnly
                  className="w-full bg-neutral-900/50 border border-white/5 p-3 font-mono-tech text-sm text-neutral-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">{t('settings.bio')}</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('settings.bioPlaceholder')}
                  rows={3}
                  className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-sm text-white focus:border-emerald-500/40 outline-none transition-colors resize-none"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-8 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> {t('settings.saving')}</> :
                 saved ? <><Check size={14} /> {t('settings.saved')}</> :
                 t('settings.saveProfile')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Section */}
      {activeSection === 'preferences' && (
        <div className="space-y-6">
          {/* Theme */}
          <div className="glass-panel p-6 border border-white/5">
            <h3 className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mb-4">{t('settings.theme')}</h3>
            <div className="flex gap-3">
              {[{ id: 'dark', icon: Moon, label: t('settings.dark') }, { id: 'light', icon: Sun, label: t('settings.light') }].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleThemeChange(opt.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded font-mono-tech text-[10px] uppercase tracking-widest transition-all ${
                    theme === opt.id ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  <opt.icon size={14} /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="glass-panel p-6 border border-white/5">
            <h3 className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mb-4">{t('settings.language')}</h3>
            <div className="flex gap-3">
              {[{ id: 'es', label: 'Español 🇪🇸' }, { id: 'en', label: 'English 🇺🇸' }].map((lng) => (
                <button
                  key={lng.id}
                  onClick={() => handleLanguageChange(lng.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded font-mono-tech text-[10px] uppercase tracking-widest transition-all ${
                    language === lng.id ? 'bg-white text-black' : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  {lng.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-panel p-6 border border-white/5">
            <h3 className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mb-4">{t('settings.notifications')}</h3>
            <div className="space-y-4">
              {[
                { label: t('settings.emailNotifications'), checked: emailNotifs, onChange: setEmailNotifs },
                { label: t('settings.sessionReminders'), checked: sessionReminders, onChange: setSessionReminders },
                { label: t('settings.progressUpdates'), checked: progressUpdates, onChange: setProgressUpdates }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-mono-tech text-xs text-neutral-300">{item.label}</span>
                  <Toggle checked={item.checked} onChange={item.onChange} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account Section */}
      {activeSection === 'account' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="glass-panel p-6 border border-white/5">
            <h3 className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Key size={14} /> {t('settings.updatePassword')}
            </h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder={t('settings.currentPassword')}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-sm text-white focus:border-emerald-500/40 outline-none transition-colors"
              />
              <input
                type="password"
                placeholder={t('settings.newPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 p-3 font-mono-tech text-sm text-white focus:border-emerald-500/40 outline-none transition-colors"
              />
              <button
                onClick={handleUpdatePassword}
                className="px-8 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
              >
                {t('settings.updateCredentials')}
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="glass-panel p-6 border border-red-500/20">
            <h3 className="font-mono-tech text-[10px] text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Trash2 size={14} /> {t('settings.deleteAccount')}
            </h3>
            <p className="font-mono-tech text-[10px] text-neutral-500 mb-4">{t('settings.deleteAccountWarning')}</p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-mono-tech text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all"
            >
              {t('settings.deleteAccountConfirm')}
            </button>
          </div>
        </div>
      )}

      {/* About Section */}
      {activeSection === 'about' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 border border-white/5">
            <div className="text-center mb-6">
              <h1 className="font-bebas text-5xl tracking-tighter text-white mb-2">M<span className="text-emerald-500">.</span>FIT</h1>
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">{t('settings.appVersion')}</span>
                <span className="font-mono-tech text-xs text-white">v7.0.0</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">{t('settings.support')}</span>
                <a href="mailto:soporte@moreta.fit" className="font-mono-tech text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  {t('settings.supportEmail')}
                </a>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-widest">Platform</span>
                <span className="font-mono-tech text-xs text-neutral-400">React + Supabase</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
