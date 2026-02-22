import { useState } from 'react';
import { Key } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';

export const SettingsView = ({ onUpdatePassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdate = () => {
    onUpdatePassword(currentPassword, newPassword);
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="max-w-2xl mx-auto glass-panel p-4 sm:p-6 lg:p-10 border-t-4 border-white/20 animate-in slide-in-from-bottom-4 duration-500">
      <SectionHeader number="00" title="System Configuration" />
      <div className="space-y-8 mt-8">
        <div>
          <h3 className="font-bebas text-2xl text-white mb-2 flex items-center gap-2"><Key size={20} /> Update Access Key</h3>
          <p className="font-mono-tech text-xs text-neutral-500 mb-4">Verification required to update credentials.</p>
          <div className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="CURRENT PASSWORD"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-neutral-900 border border-white/10 p-4 font-mono-tech text-white focus:border-white/40 outline-none"
            />
            <input
              type="password"
              placeholder="NEW PASSWORD"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-neutral-900 border border-white/10 p-4 font-mono-tech text-white focus:border-white/40 outline-none"
            />
            <button
              onClick={handleUpdate}
              className="px-8 py-3 bg-white text-black font-mono-tech font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all self-start"
            >
              Update Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
