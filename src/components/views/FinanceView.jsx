import { Edit3, X } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';

export const FinanceView = ({ payments, onAddPayment, onDeletePayment }) => {
  return (
    <div className="max-w-5xl">
      <SectionHeader number="03" title="Revenue Ledger" />
      <div className="glass-panel overflow-hidden border border-white/5">
        <div className="bg-white/5 p-6 flex justify-between items-center border-b border-white/5">
          <h4 className="font-mono-tech text-[10px] text-white uppercase tracking-[0.4em]">Transaction History</h4>
          <button onClick={() => onAddPayment()} className="bg-white text-black px-6 py-2 font-mono-tech text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">+ Register</button>
        </div>
        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
          {payments.map(p => (
            <div key={p.id} className="group flex items-center justify-between p-6 hover:bg-white/5 transition-all text-sm">
              <div className="flex flex-col">
                <span className="font-bold text-white uppercase tracking-widest">{p.name}</span>
                <span className="font-mono-tech text-[10px] text-neutral-500 mt-1">{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className={`font-mono-tech text-[10px] px-3 py-1 uppercase tracking-widest border ${p.status === 'pagado' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : p.status === 'atrasado' ? 'border-red-500/30 text-red-500 bg-red-500/5' : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'}`}>{p.status}</span>
                <span className="font-bebas text-2xl text-white w-24 text-right">${p.amount}</span>
                <div className="flex gap-2">
                  <button onClick={() => onAddPayment(p)} className="p-2 text-neutral-700 hover:text-white transition-colors"><Edit3 size={14} /></button>
                  <button onClick={() => onDeletePayment(p.id)} className="p-2 text-neutral-700 hover:text-red-500 transition-colors"><X size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
