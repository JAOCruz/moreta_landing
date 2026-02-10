import { useState } from 'react';
import { Settings, Calendar, DollarSign } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { SessionTypesManager } from '../admin/SessionTypesManager';
import { PricingManager } from '../admin/PricingManager';

export const AdminSettingsView = () => {
  const [activeTab, setActiveTab] = useState('session_types');

  const tabs = [
    { id: 'session_types', label: 'Session Types', icon: Calendar },
    { id: 'pricing', label: 'Pricing Rules', icon: DollarSign }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader number="ADM" title="Business Configuration" />
        <div className="flex items-center gap-3">
          <Settings className="text-emerald-500" size={20} />
          <span className="font-mono-tech text-xs text-neutral-500 uppercase">Admin Only</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-mono-tech text-xs uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-neutral-500 hover:text-white'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'session_types' && <SessionTypesManager />}
        {activeTab === 'pricing' && <PricingManager />}
      </div>

      {/* Info Panel */}
      <div className="glass-panel p-6 border border-blue-500/30 bg-blue-500/5">
        <div className="flex items-start gap-3">
          <Settings className="text-blue-500 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-white mb-2">Configuration Guide</h4>
            <div className="space-y-2 text-sm text-neutral-400">
              <p>
                <strong className="text-white">Session Types:</strong> Define the different types of sessions you offer (Group Class, Personal Training, etc.). These will be available when creating new session slots.
              </p>
              <p>
                <strong className="text-white">Pricing Rules:</strong> Set up pricing tiers and packages. Clients can purchase these packages and use credits to book sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
