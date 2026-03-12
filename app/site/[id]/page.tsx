'use client';

import { useState } from 'react';
import {
  FileText, Calendar, DollarSign, BarChart2,
  TrendingUp, TrendingDown, ClipboardList, Users,
  FolderOpen, Wrench, Bell, ChevronRight,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

// ─── Design Tokens (mirrors mobile) ─────────────────────────────────────────
// Primary: #FF6B35 (construction orange)
// Dark card: #1A1D23
// Bg: #F4F6F9

// ─── Types ───────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  accentSoft: string;
  trend: string;
  trendUp: boolean;
  delay?: number;
}

interface TaskItemProps {
  title: string;
  assignee: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  progress: number;
}

interface TeamMemberProps {
  name: string;
  role: string;
  status: 'on-site' | 'off-site';
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, accentSoft, trend, trendUp, delay = 0 }: StatCardProps) => (
  <div
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 animate-fadeInUp hover:shadow-md transition-shadow duration-200"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentSoft }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
        {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        <span>{trend}</span>
      </div>
    </div>
    <div>
      <p className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">{value}</p>
      <p className="text-sm text-gray-500 font-medium mt-1">{label}</p>
    </div>
  </div>
);

// ─── Donut Ring (SVG) ─────────────────────────────────────────────────────────
const DonutRing = ({ percent, color, size = 72 }: { percent: number; color: string; size?: number }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={7} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
};

const PhaseDonut = ({ label, pct, color }: { label: string; pct: number; color: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative">
      <DonutRing percent={pct} color={color} size={72} />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
        {pct}%
      </span>
    </div>
    <span className="text-xs font-semibold text-gray-500 text-center">{label}</span>
  </div>
);

// ─── Task Item ────────────────────────────────────────────────────────────────
const priorityConfig = {
  high: { color: '#FF6B35', bg: '#FFF0EB', label: 'High', icon: <AlertCircle size={12} /> },
  medium: { color: '#F59E0B', bg: '#FFFBEB', label: 'Med', icon: <Clock size={12} /> },
  low: { color: '#22C55E', bg: '#F0FDF4', label: 'Low', icon: <CheckCircle2 size={12} /> },
};

const TaskItem = ({ title, assignee, due, priority, progress }: TaskItemProps) => {
  const cfg = priorityConfig[priority];
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 group">
      <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: cfg.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#FF6B35] transition-colors">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 mb-2">{assignee} · Due {due}</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: cfg.color }}
          />
        </div>
      </div>
      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
        {cfg.icon}
        <span className="ml-1">{cfg.label}</span>
      </div>
    </div>
  );
};

// ─── Team Member Row ──────────────────────────────────────────────────────────
const TeamMemberRow = ({ name, role, status }: TeamMemberProps) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
      <span className="text-white text-sm font-bold">{name[0]}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800">{name}</p>
      <p className="text-xs text-gray-400">{role}</p>
    </div>
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status === 'on-site' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'on-site' ? 'bg-green-500' : 'bg-gray-400'}`} />
      {status === 'on-site' ? 'On Site' : 'Off Site'}
    </div>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">{title}</h2>
    {onSeeAll && (
      <button onClick={onSeeAll} className="text-[13px] font-semibold text-[#FF6B35] hover:opacity-75 transition-opacity flex items-center gap-0.5">
        See all <ChevronRight size={14} />
      </button>
    )}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {

  const {user} = useAppSelector((state:RootState)=>state.authSlice)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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

      <div className="max-w-7xl mx-auto p-6 pb-12">

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between mb-7 animate-fadeInUp">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{today}</p>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Good morning, <span className="text-[#FF6B35]">{user ? user.firstName : ""}</span>
            </h1>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:shadow-md transition-shadow">
            <Bell size={18} className="text-gray-700" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6B35] border-2 border-white" />
          </button>
        </div>

        {/* ── Stat Cards ─────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Active Contracts" value={24} icon={<FileText size={18} />} accent="#FF6B35" accentSoft="#FFF0EB" trend="12% vs last month" trendUp delay={0} />
          <StatCard label="Upcoming Deadlines" value={10} icon={<Calendar size={18} />} accent="#3B82F6" accentSoft="#EFF6FF" trend="4 new" trendUp={false} delay={80} />
          <StatCard label="Budget Summary" value="$12M" icon={<DollarSign size={18} />} accent="#22C55E" accentSoft="#F0FDF4" trend="On track" trendUp delay={160} />
          <StatCard label="Progress Status" value="10/24" icon={<BarChart2 size={18} />} accent="#8B5CF6" accentSoft="#F5F3FF" trend="42% complete" trendUp delay={240} />
        </div>

        {/* ── Row: Project Overview + Quick Actions ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Project Overview */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fadeInUp" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <SectionHeader title="Project Overview" />
            <div className="flex items-center justify-around py-2">
              <PhaseDonut label="Foundation" pct={95} color="#22C55E" />
              <PhaseDonut label="Structure" pct={72} color="#FF6B35" />
              <PhaseDonut label="Electrical" pct={48} color="#3B82F6" />
              <PhaseDonut label="Finishing" pct={20} color="#F59E0B" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fadeInUp" style={{ animationDelay: '180ms', animationFillMode: 'both' }}>
            <SectionHeader title="Quick Actions" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <ClipboardList size={18} />, label: 'New Task', color: '#FF6B35' },
                { icon: <Users size={18} />, label: 'Team', color: '#3B82F6' },
                { icon: <FolderOpen size={18} />, label: 'Documents', color: '#22C55E' },
                { icon: <Wrench size={18} />, label: 'Equipment', color: '#F59E0B' },
              ].map(a => (
                <button
                  key={a.label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: a.color }}
                  >
                    <span className="text-white">{a.icon}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row: Tasks + Team ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Recent Tasks */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <SectionHeader title="Recent Tasks" onSeeAll={() => {}} />
            <TaskItem title="Install roof insulation – Block C" assignee="J. Omondi" due="Mar 15" priority="high" progress={35} />
            <TaskItem title="Electrical wiring – 2nd Floor" assignee="A. Kamau" due="Mar 18" priority="medium" progress={60} />
            <TaskItem title="Paint interior walls – Block A" assignee="M. Wanjiru" due="Mar 22" priority="low" progress={80} />
            <TaskItem title="Foundation inspection – Site D" assignee="P. Njeru" due="Mar 25" priority="medium" progress={15} />
          </div>

          {/* Team On Site */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fadeInUp" style={{ animationDelay: '280ms', animationFillMode: 'both' }}>
            <SectionHeader title="Team On Site" onSeeAll={() => {}} />

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-100">
              {[
                { val: '24', lbl: 'Active', color: 'text-gray-900' },
                { val: '52', lbl: 'Support', color: 'text-gray-900' },
                { val: '50', lbl: 'On Site', color: 'text-green-600' },
              ].map(s => (
                <div key={s.lbl} className="flex flex-col items-center">
                  <span className={`text-xl font-extrabold ${s.color}`}>{s.val}</span>
                  <span className="text-[10px] font-medium text-gray-400 text-center">{s.lbl}</span>
                </div>
              ))}
            </div>

            <TeamMemberRow name="Kirttu Muss" role="Project Manager" status="on-site" />
            <TeamMemberRow name="Alex Njoroge" role="Site Engineer" status="on-site" />
            <TeamMemberRow name="Mary Achieng" role="Safety Officer" status="off-site" />

            <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl text-sm font-bold text-gray-800">
              Go to Team Members
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── Budget Card (dark) ───────────────────────── */}
        <div className="bg-[#1A1D23] rounded-2xl p-6 shadow-sm animate-fadeInUp" style={{ animationDelay: '320ms', animationFillMode: 'both' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: bar */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Budget Utilization</p>
              <p className="text-4xl font-extrabold text-white tracking-tight mb-1">
                $8.4M <span className="text-xl font-medium text-gray-500">of $12M</span>
              </p>
              <div className="h-2.5 bg-gray-700 rounded-full mt-4 mb-2 overflow-hidden">
                <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: '70%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>70% utilized</span>
                <span>30% remaining</span>
              </div>
            </div>
            {/* Right: breakdown */}
            <div className="flex flex-col gap-3">
              {[
                { label: 'Labour', pct: 38, color: '#FF6B35' },
                { label: 'Materials', pct: 45, color: '#3B82F6' },
                { label: 'Other', pct: 17, color: '#F59E0B' },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-sm font-medium text-gray-300">{b.label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: b.color }}>{b.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}