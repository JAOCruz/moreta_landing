import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, DollarSign, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ExpenseTracker = ({ userId }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    vendor: '',
    payment_method: 'cash',
    is_recurring: false,
    recurring_frequency: ''
  });

  useEffect(() => {
    Promise.all([fetchExpenses(), fetchCategories()]).then(() => {
      setLoading(false);
    });
  }, []);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_categories (name, color, icon)
      `)
      .order('expense_date', { ascending: false })
      .limit(50);

    if (!error && data) {
      setExpenses(data);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const handleSave = async () => {
    if (!formData.amount || !formData.description.trim() || !formData.category_id) {
      alert('Please fill in amount, description, and category');
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      recorded_by: userId,
      recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null
    };

    const { error } = await supabase
      .from('expenses')
      .insert([payload]);

    if (error) {
      alert('Error saving expense: ' + error.message);
    } else {
      resetForm();
      fetchExpenses();
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      amount: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0],
      vendor: '',
      payment_method: 'cash',
      is_recurring: false,
      recurring_frequency: ''
    });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting: ' + error.message);
    } else {
      fetchExpenses();
    }
  };

  // Calculate totals
  const thisMonthTotal = expenses
    .filter(e => {
      const expenseMonth = new Date(e.expense_date).getMonth();
      const currentMonth = new Date().getMonth();
      return expenseMonth === currentMonth;
    })
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="font-mono-tech text-xs text-neutral-500">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-red-500" size={20} />
            <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest">
              This Month
            </span>
          </div>
          <div className="font-bebas text-3xl text-white">${thisMonthTotal.toFixed(2)}</div>
        </div>

        <div className="glass-panel p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-neutral-500" size={20} />
            <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest">
              Total Tracked
            </span>
          </div>
          <div className="font-bebas text-3xl text-white">${totalExpenses.toFixed(2)}</div>
        </div>

        <div className="glass-panel p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-neutral-500" size={20} />
            <span className="font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest">
              Transactions
            </span>
          </div>
          <div className="font-bebas text-3xl text-white">{expenses.length}</div>
        </div>
      </div>

      {/* Add Expense Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 hover:border-emerald-500 text-neutral-500 hover:text-emerald-500 font-mono-tech text-xs uppercase tracking-widest transition-colors"
        >
          <Plus size={16} />
          Add New Expense
        </button>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="glass-panel p-6 border border-emerald-500/30">
          <h3 className="font-bebas text-xl text-white mb-4">Log New Expense</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
                Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="100.00"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>

            {/* Vendor */}
            <div>
              <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
                Vendor / Payee
              </label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., Rogue Fitness"
              />
            </div>

            {/* Recurring */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_recurring" className="font-mono-tech text-xs text-neutral-400">
                  Recurring Expense
                </label>
              </div>
              {formData.is_recurring && (
                <select
                  value={formData.recurring_frequency}
                  onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Frequency</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block font-mono-tech text-[9px] text-neutral-500 uppercase tracking-widest mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-black/30 border border-white/10 px-4 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none resize-none"
                rows="2"
                placeholder="What was this expense for?"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-mono-tech text-xs uppercase tracking-widest transition-colors"
            >
              <Plus size={14} />
              Save Expense
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-2 border border-white/20 hover:border-white/40 text-neutral-400 hover:text-white font-mono-tech text-xs uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="space-y-3">
        <h3 className="font-bebas text-xl text-white">Recent Expenses</h3>

        {expenses.length === 0 ? (
          <div className="glass-panel p-8 border border-dashed border-white/10 text-center">
            <p className="font-mono-tech text-xs text-neutral-500">
              No expenses tracked yet. Add one above.
            </p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="glass-panel p-4 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Color Indicator */}
                  {expense.expense_categories && (
                    <div
                      className="w-1 h-full rounded"
                      style={{ backgroundColor: expense.expense_categories.color }}
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bebas text-2xl text-white">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </span>
                      {expense.expense_categories && (
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 font-mono-tech text-[8px] text-neutral-400 uppercase">
                          {expense.expense_categories.name}
                        </span>
                      )}
                      {expense.is_recurring && (
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 font-mono-tech text-[8px] text-blue-400 uppercase">
                          {expense.recurring_frequency}
                        </span>
                      )}
                    </div>

                    <p className="text-white text-sm mb-2">{expense.description}</p>

                    <div className="flex items-center gap-4 text-neutral-500 text-xs font-mono-tech">
                      <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                      {expense.vendor && <span>• {expense.vendor}</span>}
                      <span>• {expense.payment_method.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 hover:bg-white/5 border border-white/10 hover:border-red-500 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
