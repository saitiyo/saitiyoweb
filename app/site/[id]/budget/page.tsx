'use client';

import { useState } from 'react';
import {
  DollarSign, TrendingUp, Clock, CheckCircle2,
  XCircle, AlertCircle, ChevronRight, Plus,
  Filter, MoreHorizontal, Wrench, Users, Package,
  Check, X, Eye, Trash2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = 'LABOUR' | 'MATERIALS' | 'EQUIPMENT';
type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface CategoryAllocation {
  category: Category;
  allocated: number;
  spent: number;
  remaining: number;
}

interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationPct: number;
  pendingAmount: number;
  categoryBreakdown: CategoryAllocation[];
}

interface Expense {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  category: Category;
  status: ExpenseStatus;
  submittedBy: string;
  reviewNote?: string;
  createdAt: string;
  task?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SUMMARY: BudgetSummary = {
  totalAllocated: 12_000_000,
  totalSpent: 8_400_000,
  totalRemaining: 3_600_000,
  utilizationPct: 70,
  pendingAmount: 340_000,
  categoryBreakdown: [
    { category: 'LABOUR',    allocated: 4_560_000, spent: 3_192_000, remaining: 1_368_000 },
    { category: 'MATERIALS', allocated: 5_400_000, spent: 3_780_000, remaining: 1_620_000 },
    { category: 'EQUIPMENT', allocated: 2_040_000, spent: 1_428_000, remaining: 612_000 },
  ],
};

const MOCK_EXPENSES: Expense[] = [
  { _id: '1', title: 'Roofing crew – Block C', description: 'Week 12 labour payment', amount: 180_000, category: 'LABOUR',    status: 'PENDING',  submittedBy: 'J. Omondi',  createdAt: '2025-03-10' },
  { _id: '2', title: 'Structural steel delivery',                                    amount: 420_000, category: 'MATERIALS', status: 'PENDING',  submittedBy: 'A. Kamau',   createdAt: '2025-03-09' },
  { _id: '3', title: 'Excavator hire – Site D',   description: 'Monthly rental',    amount: 95_000,  category: 'EQUIPMENT', status: 'APPROVED', submittedBy: 'M. Wanjiru', createdAt: '2025-03-07', reviewNote: 'Verified against PO #1042' },
  { _id: '4', title: 'Concrete mix – Foundation', description: '200 bags',          amount: 52_000,  category: 'MATERIALS', status: 'APPROVED', submittedBy: 'P. Njeru',   createdAt: '2025-03-05' },
  { _id: '5', title: 'Electrical subcontractor',                                     amount: 210_000, category: 'LABOUR',    status: 'REJECTED', submittedBy: 'K. Muss',    createdAt: '2025-03-04', reviewNote: 'Missing invoice — resubmit' },
  { _id: '6', title: 'Safety equipment batch',                                       amount: 38_000,  category: 'EQUIPMENT', status: 'APPROVED', submittedBy: 'A. Kamau',   createdAt: '2025-03-02' },
];

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_META: Record<Category, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  LABOUR:    { label: 'Labour',    icon: <Users size={14} />,   color: '#FF6B35', bg: '#FFF0EB' },
  MATERIALS: { label: 'Materials', icon: <Package size={14} />, color: '#3B82F6', bg: '#EFF6FF' },
  EQUIPMENT: { label: 'Equipment', icon: <Wrench size={14} />,  color: '#F59E0B', bg: '#FFFBEB' },
};

const STATUS_META: Record<ExpenseStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  PENDING:  { label: 'Pending',  icon: <Clock size={12} />,        color: '#F59E0B', bg: '#FFFBEB' },
  APPROVED: { label: 'Approved', icon: <CheckCircle2 size={12} />, color: '#22C55E', bg: '#F0FDF4' },
  REJECTED: { label: 'Rejected', icon: <XCircle size={12} />,      color: '#EF4444', bg: '#FEF2F2' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">{title}</h2>
    {action}
  </div>
);

const CategoryBar = ({ item }: { item: CategoryAllocation }) => {
  const meta = CATEGORY_META[item.category];
  const pct = item.allocated > 0 ? (item.spent / item.allocated) * 100 : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: meta.bg }}>
            <span style={{ color: meta.color }}>{meta.icon}</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">{meta.label}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-gray-900">{fmt(item.spent)}</span>
          <span className="text-xs text-gray-400"> / {fmt(item.allocated)}</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, pct)}%`, backgroundColor: meta.color }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[11px] text-gray-400">{pct.toFixed(0)}% used</span>
        <span className="text-[11px] font-medium" style={{ color: meta.color }}>{fmt(item.remaining)} left</span>
      </div>
    </div>
  );
};

const ExpenseRow = ({
  expense,
  onApprove,
  onReject,
}: {
  expense: Expense;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) => {
  const cat = CATEGORY_META[expense.category];
  const sts = STATUS_META[expense.status];
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 rounded-lg px-2 -mx-2 transition-colors group">
      {/* Category icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.bg }}>
        <span style={{ color: cat.color }}>{cat.icon}</span>
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{expense.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {expense.submittedBy} · {expense.createdAt}
          {expense.task && <span className="ml-1 text-[#FF6B35]">· Linked to task</span>}
        </p>
        {expense.reviewNote && (
          <p className="text-xs text-gray-400 italic mt-0.5">"{expense.reviewNote}"</p>
        )}
      </div>

      {/* Amount */}
      <span className="text-sm font-bold text-gray-900 shrink-0">{fmt(expense.amount)}</span>

      {/* Status badge */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0"
        style={{ backgroundColor: sts.bg, color: sts.color }}
      >
        {sts.icon}
        <span>{sts.label}</span>
      </div>

      {/* Actions — only for PENDING */}
      {expense.status === 'PENDING' && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onApprove(expense._id)}
            className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors"
            title="Approve"
          >
            <Check size={13} className="text-green-600" />
          </button>
          <button
            onClick={() => onReject(expense._id)}
            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
            title="Reject"
          >
            <X size={13} className="text-red-500" />
          </button>
        </div>
      )}
      {expense.status !== 'PENDING' && (
        <div className="w-16 shrink-0" /> /* spacer to keep alignment */
      )}
    </div>
  );
};

// ─── Submit Expense Modal ─────────────────────────────────────────────────────
const SubmitExpenseModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ title: '', amount: '', category: 'LABOUR' as Category, description: '' });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeInUp">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Submit Expense</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Title</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
              placeholder="e.g. Roofing crew – Block C"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Amount ($)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Category</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all bg-white"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
              >
                <option value="LABOUR">Labour</option>
                <option value="MATERIALS">Materials</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Description <span className="text-gray-300">(optional)</span></label>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all resize-none"
              placeholder="Any notes..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-bold hover:bg-[#e85e2a] transition-colors"
          >
            Submit Expense
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Budget Page ──────────────────────────────────────────────────────────
export default function BudgetPage() {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const summary = MOCK_SUMMARY;

  const filtered = expenses.filter(e => {
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
    return true;
  });

  const pendingCount = expenses.filter(e => e.status === 'PENDING').length;

  const handleApprove = (id: string) =>
    setExpenses(prev => prev.map(e => e._id === id ? { ...e, status: 'APPROVED' } : e));

  const handleReject = (id: string) =>
    setExpenses(prev => prev.map(e => e._id === id ? { ...e, status: 'REJECTED' } : e));

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease both; }
      `}</style>

      {showModal && <SubmitExpenseModal onClose={() => setShowModal(false)} />}

      <div className="max-w-7xl mx-auto p-6 pb-12">

        {/* ── Page Header ──────────────────────────────── */}
        <div className="flex items-center justify-between mb-7 animate-fadeInUp">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Homeland Heights · Site Budget</p>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Budget Overview</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] text-white rounded-xl text-sm font-bold hover:bg-[#e85e2a] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Submit Expense
          </button>
        </div>

        {/* ── Top Stat Cards ───────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Budget',   value: fmt(summary.totalAllocated), icon: <DollarSign size={18} />, accent: '#FF6B35', soft: '#FFF0EB', sub: 'Allocated this project' },
            { label: 'Total Spent',    value: fmt(summary.totalSpent),     icon: <TrendingUp size={18} />, accent: '#3B82F6', soft: '#EFF6FF', sub: `${summary.utilizationPct}% utilised` },
            { label: 'Remaining',      value: fmt(summary.totalRemaining), icon: <CheckCircle2 size={18} />, accent: '#22C55E', soft: '#F0FDF4', sub: `${(100 - summary.utilizationPct).toFixed(0)}% of budget` },
            { label: 'Pending Review', value: fmt(summary.pendingAmount),  icon: <AlertCircle size={18} />, accent: '#F59E0B', soft: '#FFFBEB', sub: `${pendingCount} expense${pendingCount !== 1 ? 's' : ''} awaiting` },
          ].map((card, i) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fadeInUp hover:shadow-md transition-shadow"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: card.soft }}>
                <span style={{ color: card.accent }}>{card.icon}</span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{card.value}</p>
              <p className="text-sm text-gray-500 font-medium mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Row: Dark Budget Bar + Category Breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Dark utilization card */}
          <div
            className="bg-[#1A1D23] rounded-2xl p-6 animate-fadeInUp"
            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Utilization</p>
            <p className="text-4xl font-extrabold text-white tracking-tight mb-1">
              {summary.utilizationPct}%
            </p>
            <p className="text-sm text-gray-500 mb-5">{fmt(summary.totalSpent)} of {fmt(summary.totalAllocated)}</p>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#FF6B35] rounded-full transition-all duration-700"
                style={{ width: `${summary.utilizationPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Spent</span>
              <span>{fmt(summary.totalRemaining)} remaining</span>
            </div>
            {summary.pendingAmount > 0 && (
              <div className="mt-4 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                <AlertCircle size={13} className="text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300 font-medium">{fmt(summary.pendingAmount)} pending approval</p>
              </div>
            )}
          </div>

          {/* Category breakdown */}
          <div
            className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fadeInUp"
            style={{ animationDelay: '180ms', animationFillMode: 'both' }}
          >
            <SectionHeader title="Budget by Category" />
            {summary.categoryBreakdown.map(item => (
              <CategoryBar key={item.category} item={item} />
            ))}
          </div>
        </div>

        {/* ── Expenses Table ───────────────────────────── */}
        <div
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fadeInUp"
          style={{ animationDelay: '260ms', animationFillMode: 'both' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
              Expenses
              {pendingCount > 0 && (
                <span className="ml-2 text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </h2>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status filter */}
              <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 transition-colors ${statusFilter === s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {s === 'ALL' ? 'All' : STATUS_META[s].label}
                  </button>
                ))}
              </div>

              {/* Category filter */}
              <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold">
                {(['ALL', 'LABOUR', 'MATERIALS', 'EQUIPMENT'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1.5 transition-colors ${categoryFilter === c ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {c === 'ALL' ? 'All' : CATEGORY_META[c].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expense rows */}
          <div>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No expenses match your filters</p>
              </div>
            ) : (
              filtered.map(expense => (
                <ExpenseRow
                  key={expense._id}
                  expense={expense}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}