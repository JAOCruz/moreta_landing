import { useState, useEffect, useRef } from 'react';
import { Edit3, X, DollarSign, TrendingUp, TrendingDown, Users, Calendar, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { SectionHeader } from '../ui/SectionHeader';
import { ExpenseTracker } from '../admin/ExpenseTracker';
import { RevenueExpenseChart } from '../analytics/RevenueExpenseChart';
import { FinancialSummaryCard } from '../analytics/FinancialSummaryCard';
import { SkeletonGrid, SkeletonChart, SkeletonTable } from '../ui/Skeleton';
import { supabase } from '../../lib/supabase';

// Animated counter for finance stats
const useFinanceCounter = (target, duration = 1000) => {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const num = parseFloat(target) || 0;
    if (num === 0) { setCount(0); return; }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * num);
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(num);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
};

export const EnhancedFinanceView = ({ payments, onAddPayment, onDeletePayment, userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const tabIndicatorRef = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const sections = containerRef.current.querySelectorAll('.fin-section');
      gsap.fromTo(sections,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'analytics') fetchAnalyticsData();
  }, [activeTab, payments]);

  useEffect(() => {
    updateTabIndicator();
  }, [activeTab]);

  const updateTabIndicator = () => {
    if (!tabsRef.current || !tabIndicatorRef.current) return;
    const activeBtn = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`);
    if (activeBtn) {
      const containerRect = tabsRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      gsap.to(tabIndicatorRef.current, {
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const { data: revenueData } = await supabase.from('monthly_revenue_summary').select('*').order('month', { ascending: true }).limit(6);
      const { data: expenseData } = await supabase.from('monthly_expense_summary').select('*').order('month', { ascending: true }).limit(6);

      const monthMap = {};
      revenueData?.forEach(r => {
        const mk = new Date(r.month).toLocaleDateString('en-US', { month: 'short' });
        monthMap[mk] = { month: mk, revenue: parseFloat(r.total_revenue || 0), expenses: 0 };
      });
      expenseData?.forEach(e => {
        const mk = new Date(e.month).toLocaleDateString('en-US', { month: 'short' });
        if (monthMap[mk]) monthMap[mk].expenses += parseFloat(e.total_amount || 0);
        else monthMap[mk] = { month: mk, revenue: 0, expenses: parseFloat(e.total_amount || 0) };
      });

      setAnalyticsData({ chartData: Object.values(monthMap), revenueData, expenseData });
    } catch (error) { console.error('Error:', error); }
    setLoading(false);
  };

  const thisMonth = new Date().getMonth();
  const thisMonthPayments = payments.filter(p => new Date(p.created_at).getMonth() === thisMonth);
  const thisMonthRevenue = thisMonthPayments.filter(p => p.status === 'pagado').reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalRevenue = payments.filter(p => p.status === 'pagado').reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const averageTransaction = payments.length > 0 ? (totalRevenue / payments.length).toFixed(2) : 0;
  const uniqueClients = new Set(payments.map(p => p.client_id || p.name).filter(Boolean)).size || payments.length;
  const overduePayments = payments.filter(p => p.status === 'atrasado' || p.status === 'pendiente');
  const overdueTotal = overduePayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'analytics', label: 'Analytics' }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader number="FIN" title="Financial Management" />

      {/* Overdue Alert */}
      {overduePayments.length > 0 && (
        <div className="alert-overdue p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="status-dot danger" />
            <AlertTriangle size={18} className="text-red-400" />
            <span className="font-mono-tech text-xs text-red-400 uppercase tracking-[0.2em] font-bold">
              Pagos Vencidos — {overduePayments.length} cliente{overduePayments.length > 1 ? 's' : ''}
            </span>
            <span className="ml-auto font-bebas text-2xl text-red-400">${overdueTotal.toFixed(0)}</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {overduePayments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 hover:bg-red-500/8 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="status-dot danger" style={{width:4,height:4}} />
                  <span className="font-mono-tech text-xs text-white">{p.name || p.client?.email || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono-tech text-[9px] text-red-400 uppercase">{p.status}</span>
                  <span className="font-bebas text-lg text-red-400">${p.amount}</span>
                  <button onClick={() => onAddPayment(p)} className="text-red-400/50 hover:text-white transition-colors btn-press">
                    <Edit3 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs with sliding indicator */}
      <div ref={tabsRef} className="flex gap-2 border-b border-white/10 overflow-x-auto relative">
        <div ref={tabIndicatorRef} className="absolute bottom-0 h-[2px] bg-emerald-500 tab-indicator" style={{ left: 0, width: 0, boxShadow: '0 0 8px rgba(52,211,153,0.4)' }} />
        {tabs.map((tab) => (
          <button key={tab.id} data-tab={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 sm:px-6 py-3 font-mono-tech text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'text-emerald-500' : 'text-neutral-500 hover:text-white'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={containerRef}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="fin-section grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-0">
              <FinancialSummaryCard title="This Month Revenue" value={`$${thisMonthRevenue.toFixed(2)}`} icon={TrendingUp} color="emerald" />
              <FinancialSummaryCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} subtitle="All time" icon={DollarSign} color="blue" />
              <FinancialSummaryCard title="Avg Transaction" value={`$${averageTransaction}`} icon={Calendar} color="neutral" />
              <FinancialSummaryCard title="Paying Clients" value={uniqueClients} icon={Users} color="emerald" />
            </div>

            {loading ? (
              <div className="fin-section opacity-0"><SkeletonChart /></div>
            ) : analyticsData && (
              <div className="fin-section opacity-0"><RevenueExpenseChart data={analyticsData.chartData} /></div>
            )}

            <div className="fin-section glass-panel overflow-hidden border border-white/10 opacity-0">
              <div className="bg-white/5 p-5 border-b border-white/5">
                <h4 className="font-mono-tech text-[10px] text-white uppercase tracking-[0.4em]">Recent Transactions</h4>
              </div>
              <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                {payments.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 hover:bg-white/[0.03] transition-all">
                    <div>
                      <span className="font-bold text-white text-sm">{p.client?.email || p.name || 'Unknown'}</span>
                      <div className="font-mono-tech text-[9px] text-neutral-500 mt-1">{new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-mono-tech text-[9px] px-2 py-1 uppercase border ${
                        p.status === 'pagado' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                        : p.status === 'atrasado' ? 'border-red-500/30 text-red-500 bg-red-500/5'
                        : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                      }`}>{p.status}</span>
                      <span className="font-bebas text-xl text-white">${p.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="fin-section glass-panel overflow-hidden border border-white/10 opacity-0">
            <div className="bg-white/5 p-5 flex flex-wrap justify-between items-center gap-3 border-b border-white/5">
              <h4 className="font-mono-tech text-[10px] text-white uppercase tracking-[0.4em]">Transaction History</h4>
              <button onClick={() => onAddPayment()} className="bg-white text-black px-5 py-2 font-mono-tech text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all btn-press">+ Register Payment</button>
            </div>
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {payments.map(p => (
                <div key={p.id} className="group flex flex-wrap items-center justify-between p-4 sm:p-6 hover:bg-white/[0.03] transition-all gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white uppercase tracking-widest truncate">{p.client?.email || p.name || 'Unknown'}</span>
                    <span className="font-mono-tech text-[10px] text-neutral-500 mt-1">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8">
                    <span className={`font-mono-tech text-[10px] px-3 py-1 uppercase tracking-widest border ${
                      p.status === 'pagado' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                      : p.status === 'atrasado' ? 'border-red-500/30 text-red-500 bg-red-500/5'
                      : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                    }`}>{p.status}</span>
                    <span className="font-bebas text-2xl text-white w-20 text-right">${p.amount}</span>
                    <div className="flex gap-2">
                      <button onClick={() => onAddPayment(p)} className="p-2 text-neutral-700 hover:text-white transition-colors"><Edit3 size={14} /></button>
                      <button onClick={() => onDeletePayment(p.id)} className="p-2 text-neutral-700 hover:text-red-500 transition-colors"><X size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && <ExpenseTracker userId={userId} />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {loading ? (
              <>
                <div className="fin-section opacity-0"><SkeletonChart /></div>
                <div className="fin-section opacity-0"><SkeletonGrid count={2} cols={2} /></div>
              </>
            ) : (
              <>
                {analyticsData && <div className="fin-section opacity-0"><RevenueExpenseChart data={analyticsData.chartData} /></div>}
                <div className="fin-section grid grid-cols-1 md:grid-cols-2 gap-6 opacity-0">
                  <div className="glass-panel p-6 border border-white/10">
                    <h4 className="font-bebas text-xl text-white mb-4">Revenue by Month</h4>
                    <div className="space-y-3">
                      {analyticsData?.revenueData?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 hover:border-emerald-500/20 transition-colors">
                          <span className="font-mono-tech text-xs text-neutral-400">{new Date(item.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                          <span className="font-bebas text-lg text-emerald-500">${parseFloat(item.total_revenue).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-panel p-6 border border-white/10">
                    <h4 className="font-bebas text-xl text-white mb-4">Expenses by Category</h4>
                    <div className="space-y-3">
                      {analyticsData?.expenseData?.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 hover:border-red-500/20 transition-colors">
                          <span className="font-mono-tech text-xs text-neutral-400">{item.category || 'Uncategorized'}</span>
                          <span className="font-bebas text-lg text-red-500">${parseFloat(item.total_amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
