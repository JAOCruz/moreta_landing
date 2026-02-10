import { useState, useEffect } from 'react';
import { Edit3, X, DollarSign, TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { ExpenseTracker } from '../admin/ExpenseTracker';
import { RevenueExpenseChart } from '../analytics/RevenueExpenseChart';
import { FinancialSummaryCard } from '../analytics/FinancialSummaryCard';
import { supabase } from '../../lib/supabase';

export const EnhancedFinanceView = ({ payments, onAddPayment, onDeletePayment, userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTab, payments]);

  const fetchAnalyticsData = async () => {
    setLoading(true);

    try {
      // Get last 6 months of revenue
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: revenueData } = await supabase
        .from('monthly_revenue_summary')
        .select('*')
        .order('month', { ascending: true })
        .limit(6);

      const { data: expenseData } = await supabase
        .from('monthly_expense_summary')
        .select('*')
        .order('month', { ascending: true })
        .limit(6);

      // Format data for chart
      const monthMap = {};

      // Add revenue
      revenueData?.forEach(r => {
        const monthKey = new Date(r.month).toLocaleDateString('en-US', { month: 'short' });
        monthMap[monthKey] = {
          month: monthKey,
          revenue: parseFloat(r.total_revenue || 0),
          expenses: 0
        };
      });

      // Add expenses (aggregate by month)
      expenseData?.forEach(e => {
        const monthKey = new Date(e.month).toLocaleDateString('en-US', { month: 'short' });
        if (monthMap[monthKey]) {
          monthMap[monthKey].expenses += parseFloat(e.total_amount || 0);
        } else {
          monthMap[monthKey] = {
            month: monthKey,
            revenue: 0,
            expenses: parseFloat(e.total_amount || 0)
          };
        }
      });

      const chartData = Object.values(monthMap);

      setAnalyticsData({
        chartData,
        revenueData,
        expenseData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }

    setLoading(false);
  };

  // Calculate current month metrics
  const thisMonth = new Date().getMonth();
  const thisMonthPayments = payments.filter(p => {
    const paymentMonth = new Date(p.created_at).getMonth();
    return paymentMonth === thisMonth;
  });

  const thisMonthRevenue = thisMonthPayments
    .filter(p => p.status === 'pagado')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const totalRevenue = payments
    .filter(p => p.status === 'pagado')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const averageTransaction = payments.length > 0
    ? (totalRevenue / payments.length).toFixed(2)
    : 0;

  // Count unique clients (safely handles missing client_id)
  const uniqueClients = new Set(
    payments
      .map(p => p.client_id || p.name)
      .filter(Boolean)
  ).size || payments.length; // Fallback to total payments if no client info

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'analytics', label: 'Analytics' }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader number="FIN" title="Financial Management" />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-mono-tech text-xs uppercase tracking-widest transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-neutral-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialSummaryCard
              title="This Month Revenue"
              value={`$${thisMonthRevenue.toFixed(2)}`}
              icon={TrendingUp}
              color="emerald"
            />
            <FinancialSummaryCard
              title="Total Revenue"
              value={`$${totalRevenue.toFixed(2)}`}
              subtitle="All time"
              icon={DollarSign}
              color="blue"
            />
            <FinancialSummaryCard
              title="Avg Transaction"
              value={`$${averageTransaction}`}
              icon={Calendar}
              color="neutral"
            />
            <FinancialSummaryCard
              title="Paying Clients"
              value={uniqueClients}
              icon={Users}
              color="emerald"
            />
          </div>

          {/* Chart */}
          {analyticsData && (
            <RevenueExpenseChart data={analyticsData.chartData} />
          )}

          {/* Recent Transactions */}
          <div className="glass-panel overflow-hidden border border-white/10">
            <div className="bg-white/5 p-6 border-b border-white/5">
              <h4 className="font-mono-tech text-[10px] text-white uppercase tracking-[0.4em]">
                Recent Transactions
              </h4>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {payments.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-all">
                  <div>
                    <span className="font-bold text-white text-sm">{p.client?.email || 'Unknown'}</span>
                    <div className="font-mono-tech text-[9px] text-neutral-500 mt-1">
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono-tech text-[9px] px-2 py-1 uppercase border ${
                      p.status === 'pagado'
                        ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                        : p.status === 'atrasado'
                        ? 'border-red-500/30 text-red-500 bg-red-500/5'
                        : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                    }`}>
                      {p.status}
                    </span>
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
        <div className="glass-panel overflow-hidden border border-white/10">
          <div className="bg-white/5 p-6 flex justify-between items-center border-b border-white/5">
            <h4 className="font-mono-tech text-[10px] text-white uppercase tracking-[0.4em]">
              Transaction History
            </h4>
            <button
              onClick={() => onAddPayment()}
              className="bg-white text-black px-6 py-2 font-mono-tech text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
            >
              + Register Payment
            </button>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
            {payments.map(p => (
              <div key={p.id} className="group flex items-center justify-between p-6 hover:bg-white/5 transition-all">
                <div className="flex flex-col">
                  <span className="font-bold text-white uppercase tracking-widest">
                    {p.client?.email || p.name || 'Unknown'}
                  </span>
                  <span className="font-mono-tech text-[10px] text-neutral-500 mt-1">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                  {p.notes && (
                    <span className="font-mono-tech text-[9px] text-neutral-600 mt-1">{p.notes}</span>
                  )}
                </div>
                <div className="flex items-center gap-8">
                  <span className={`font-mono-tech text-[10px] px-3 py-1 uppercase tracking-widest border ${
                    p.status === 'pagado'
                      ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5'
                      : p.status === 'atrasado'
                      ? 'border-red-500/30 text-red-500 bg-red-500/5'
                      : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                  }`}>
                    {p.status}
                  </span>
                  <span className="font-bebas text-2xl text-white w-24 text-right">${p.amount}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAddPayment(p)}
                      className="p-2 text-neutral-700 hover:text-white transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDeletePayment(p.id)}
                      className="p-2 text-neutral-700 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <ExpenseTracker userId={userId} />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loading ? (
            <div className="glass-panel p-12 border border-white/10 text-center">
              <p className="font-mono-tech text-xs text-neutral-500">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Chart */}
              {analyticsData && (
                <RevenueExpenseChart data={analyticsData.chartData} />
              )}

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue by Month */}
                <div className="glass-panel p-6 border border-white/10">
                  <h4 className="font-bebas text-xl text-white mb-4">Revenue by Month</h4>
                  <div className="space-y-3">
                    {analyticsData?.revenueData?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5">
                        <span className="font-mono-tech text-xs text-neutral-400">
                          {new Date(item.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <span className="font-bebas text-lg text-emerald-500">
                          ${parseFloat(item.total_revenue).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense by Category */}
                <div className="glass-panel p-6 border border-white/10">
                  <h4 className="font-bebas text-xl text-white mb-4">Expenses by Category</h4>
                  <div className="space-y-3">
                    {analyticsData?.expenseData?.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5">
                        <span className="font-mono-tech text-xs text-neutral-400">
                          {item.category || 'Uncategorized'}
                        </span>
                        <span className="font-bebas text-lg text-red-500">
                          ${parseFloat(item.total_amount).toFixed(2)}
                        </span>
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
  );
};
