import { useState } from 'react';
import { Settings, Calendar, DollarSign, Bot, Shield, CheckCircle, XCircle } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { SessionTypesManager } from '../admin/SessionTypesManager';
import { PricingManager } from '../admin/PricingManager';

export const AdminSettingsView = () => {
  const [activeTab, setActiveTab] = useState('session_types');

  const tabs = [
    { id: 'session_types', label: 'Session Types', icon: Calendar },
    { id: 'pricing', label: 'Pricing Rules', icon: DollarSign },
    { id: 'ai_bot', label: 'AI Bot Rules', icon: Bot }
  ];

  const botCanDo = [
    'Respond to client questions about schedule and availability',
    'Send payment reminders (automated, via WhatsApp)',
    'Share general fitness tips and motivation',
    'Confirm upcoming session times',
    'Collect basic client info (name, goals, availability)',
    'Forward urgent messages to Jose',
  ];

  const botCannotDo = [
    'Give specific exercise prescriptions or modify routines',
    'Provide medical or nutrition advice',
    'Change session schedules without Jose\'s approval',
    'Process payments or handle billing disputes',
    'Share other clients\' information (HIPAA-style privacy)',
    'Override Jose\'s decisions or training methodology',
    'Diagnose injuries or recommend treatments',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeader number="ADM" title="Business Configuration" />
        <div className="flex items-center gap-3">
          <Settings className="text-emerald-500" size={20} />
          <span className="font-mono-tech text-xs text-neutral-500 uppercase">Admin Only</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-mono-tech text-xs uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-neutral-500 hover:text-white'
              }`}
            >
              <Icon size={14} />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'session_types' && <SessionTypesManager />}
        {activeTab === 'pricing' && <PricingManager />}

        {activeTab === 'ai_bot' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="glass-panel p-6 sm:p-8 border-l-2 border-emerald-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Bot size={24} className="text-emerald-400" />
                <div>
                  <h3 className="font-bebas text-2xl text-white">WhatsApp AI Assistant</h3>
                  <p className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-[0.2em]">Boundaries & Rules Configuration</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 p-3 bg-amber-500/5 border border-amber-500/20">
                <span className="status-dot warning"></span>
                <span className="font-mono-tech text-[10px] text-amber-400">STATUS: PENDING INTEGRATION — Rules defined, bot not yet active</span>
              </div>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CAN DO */}
              <div className="glass-panel p-6 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-5">
                  <Shield size={16} className="text-emerald-400" />
                  <span className="font-mono-tech text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-bold">El Bot PUEDE</span>
                </div>
                <div className="space-y-3">
                  {botCanDo.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="font-mono-tech text-xs text-neutral-300">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CANNOT DO */}
              <div className="glass-panel p-6 border border-red-500/20">
                <div className="flex items-center gap-2 mb-5">
                  <Shield size={16} className="text-red-400" />
                  <span className="font-mono-tech text-[10px] text-red-400 uppercase tracking-[0.2em] font-bold">El Bot NO PUEDE</span>
                </div>
                <div className="space-y-3">
                  {botCannotDo.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/10">
                      <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="font-mono-tech text-xs text-neutral-300">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Personality */}
            <div className="glass-panel p-6 border border-white/10">
              <h4 className="font-bebas text-xl text-white mb-3">Bot Personality</h4>
              <div className="space-y-2 text-sm text-neutral-400 font-mono-tech">
                <p>• <strong className="text-white">Tone:</strong> Professional but friendly. Spanish-first, can switch to English.</p>
                <p>• <strong className="text-white">Name:</strong> "Asistente Moreta Fitness" (never pretends to be Jose)</p>
                <p>• <strong className="text-white">Escalation:</strong> Always forwards to Jose when unsure or when client requests it</p>
                <p>• <strong className="text-white">Hours:</strong> Responds 24/7 but notes Jose's actual availability hours</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {activeTab !== 'ai_bot' && (
        <div className="glass-panel p-6 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-start gap-3">
            <Settings className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-white mb-2">Configuration Guide</h4>
              <div className="space-y-2 text-sm text-neutral-400">
                <p><strong className="text-white">Session Types:</strong> Define the different types of sessions you offer.</p>
                <p><strong className="text-white">Pricing Rules:</strong> Set up pricing tiers and packages.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
