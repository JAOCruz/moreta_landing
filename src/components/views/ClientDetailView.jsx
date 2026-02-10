import { useState } from 'react';
import { ArrowLeft, Mail, Calendar, TrendingUp, MessageSquare } from 'lucide-react';
import { ProgressView } from './ProgressView';

export const ClientDetailView = ({ client, onBack }) => {
  const [activeTab, setActiveTab] = useState('progress');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 border border-white/10 hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-bebas text-4xl text-white">{client.email.split('@')[0]}</h1>
          <div className="flex items-center gap-4 mt-2 text-neutral-500 text-xs font-mono-tech">
            <span className="flex items-center gap-2">
              <Mail size={12} />
              {client.email}
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={12} />
              Joined {new Date(client.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex items-center gap-2 px-4 py-3 font-mono-tech text-xs uppercase tracking-widest transition-all ${
            activeTab === 'progress'
              ? 'text-emerald-500 border-b-2 border-emerald-500'
              : 'text-neutral-500 hover:text-white'
          }`}
        >
          <TrendingUp size={14} />
          Progress
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-3 font-mono-tech text-xs uppercase tracking-widest transition-all ${
            activeTab === 'notes'
              ? 'text-emerald-500 border-b-2 border-emerald-500'
              : 'text-neutral-500 hover:text-white'
          }`}
        >
          <MessageSquare size={14} />
          Notes
        </button>
      </div>

      {/* Content */}
      {activeTab === 'progress' && (
        <ProgressView userId={client.id} />
      )}

      {activeTab === 'notes' && (
        <div className="glass-panel p-8 border border-white/10 text-center">
          <MessageSquare className="mx-auto text-neutral-600 mb-4" size={48} />
          <p className="font-mono-tech text-xs text-neutral-500">COACH NOTES COMING SOON</p>
          <p className="font-mono-tech text-[9px] text-neutral-600 mt-2">
            Add private notes and feedback for this client
          </p>
        </div>
      )}
    </div>
  );
};
