'use client';

import { useEffect, useState} from 'react';
import {FileText, Eye, Trash2,Search, LayoutGrid, List } from 'lucide-react';
import CustomButton from '@/app/components/Button';
import { fmtDate, fmtSize } from '@/utils/helpers';
import PlanCard from '@/app/components/PlanCard';
import SiteUploadModal from '@/app/components/siteUploadModal';
import PlanPreviewModal from '@/app/components/PlanPreviewModel';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import LoadingComponent from '@/app/components/LoadingComponent';


const GET_SITE_PLANS = gql`
  query GetSitePlans($siteId: ID!, $planType: PlanType) {
  getSitePlans(siteId: $siteId, planType: $planType) {
    _id
    site
    title
    planType
    fileUrl
    publicId
    fileSize
    description
    uploadedBy
    createdAt
    updatedAt
  }
}
`

interface GetSitePlanType {
  getSitePlans:SitePlan[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PLAN_TYPE_META: Record<PlanType, { label: string; color: string; bg: string }> = {
  FLOOR_PLAN:  { label: 'Floor Plan',  color: '#3B82F6', bg: '#EFF6FF' },
  ELEVATION:   { label: 'Elevation',   color: '#FF6B35', bg: '#FFF0EB' },
  SECTION:     { label: 'Section',     color: '#8B5CF6', bg: '#F5F3FF' },
  SITE_LAYOUT: { label: 'Site Layout', color: '#22C55E', bg: '#F0FDF4' },
  ELECTRICAL:  { label: 'Electrical',  color: '#F59E0B', bg: '#FFFBEB' },
  PLUMBING:    { label: 'Plumbing',    color: '#06B6D4', bg: '#ECFEFF' },
  STRUCTURAL:  { label: 'Structural',  color: '#EF4444', bg: '#FEF2F2' },
  OTHER:       { label: 'Other',       color: '#6B7280', bg: '#F9FAFB' },
};

const ALL_TYPES = Object.keys(PLAN_TYPE_META) as PlanType[];

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with real Apollo query results
const MOCK_PLANS: SitePlan[] = [
  { _id: '1', title: 'Elevation plan',    planType: 'ELEVATION',   fileUrl: '', fileSize: 2_400_000, uploadedBy: 'J. Omondi',  createdAt: '2025-03-01', description: 'North and south elevation drawings' },
  { _id: '2', title: 'Ground floor plan', planType: 'FLOOR_PLAN',  fileUrl: '', fileSize: 3_100_000, uploadedBy: 'A. Kamau',   createdAt: '2025-03-03' },
  { _id: '3', title: 'Roofing plan',      planType: 'STRUCTURAL',  fileUrl: '', fileSize: 1_800_000, uploadedBy: 'M. Wanjiru', createdAt: '2025-03-05' },
  { _id: '4', title: 'Electrical layout', planType: 'ELECTRICAL',  fileUrl: '', fileSize: 980_000,   uploadedBy: 'P. Njeru',   createdAt: '2025-03-07', description: 'All floors' },
  { _id: '5', title: 'Plumbing plan',     planType: 'PLUMBING',    fileUrl: '', fileSize: 1_200_000, uploadedBy: 'K. Muss',    createdAt: '2025-03-09' },
  { _id: '6', title: 'Site layout',       planType: 'SITE_LAYOUT', fileUrl: '', fileSize: 4_500_000, uploadedBy: 'J. Omondi',  createdAt: '2025-03-10', description: 'Full site boundary and access roads' },
];





// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SitePlansPage() {
  
  const params = useParams()
  const siteId = params.id as string


  const [plans, setPlans] = useState<SitePlan[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [previewing, setPreviewing] = useState<SitePlan | null>(null);
  const [typeFilter, setTypeFilter] = useState<PlanType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');


   const {loading,data,error} = useQuery<GetSitePlanType>(GET_SITE_PLANS,{
    variables:{
      siteId:siteId,
      planType:typeFilter === "ALL" ? undefined : typeFilter
    }
  })

  useEffect(()=>{
    if(data && data.getSitePlans){
        setPlans(data.getSitePlans)
    }

    if(error){
       console.log(error,"-------------> something has gone wrong")
    }

  },[data,error])

  const filtered = plans.filter((p) => {
    if (typeFilter !== 'ALL' && p.planType !== typeFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = (plan: SitePlan) => setPlans((prev) => [plan, ...prev]);
  const handleDelete = (id: string) => setPlans((prev) => prev.filter((p) => p._id !== id));


  if(loading){
    return (
      <LoadingComponent/>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans">

      {showUpload && (
        <SiteUploadModal onClose={() => setShowUpload(false)} onAdd={handleAdd} />
      )}
      {previewing && (
        <PlanPreviewModal plan={previewing} onClose={() => setPreviewing(null)} />
      )}

      <div className="max-w-7xl mx-auto p-6 pb-12">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 animate-fadeInUp">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Homeland Heights
            </p>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Site Plans</h1>
          </div>
          
          <CustomButton
            text='Add New'
            onClick={() => setShowUpload(true)}
           />
        </div>

        {/* ── Filters + Search ─────────────────────────── */}
        <div
          className="flex flex-wrap items-center gap-3 mb-6 animate-fadeInUp"
          style={{ animationDelay: '60ms', animationFillMode: 'both' }}
        >
          {/* Search */}
          <div className="relative flex-1 min-w-50 max-w-xs">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${typeFilter === 'ALL' ? 'bg-pink-300 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
            >
              All ({plans.length})
            </button>
            {ALL_TYPES.map((t) => {
              const count = plans.filter((p) => p.planType === t).length;
              if (count === 0) return null;
              const meta = PLAN_TYPE_META[t];
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                    typeFilter === t
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                  style={typeFilter === t ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div className="ml-auto flex rounded-xl border border-gray-200 overflow-hidden bg-white">
            <button
              onClick={() => setView('grid')}
              className={`w-9 h-9 flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`w-9 h-9 flex items-center justify-center transition-colors ${view === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* ── Grid / List ──────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeInUp">
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-4">
              <FileText size={28} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No site plans found</p>
            <p className="text-xs text-gray-400 mt-1">Upload your first plan using the button above</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map((plan, i) => (
              <div key={plan._id} style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                <PlanCard
                  plan={plan}
                  onPreview={() => setPreviewing(plan)}
                  onDelete={() => handleDelete(plan._id)}
                />
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filtered.map((plan, i) => {
              const meta = PLAN_TYPE_META[plan.planType];
              return (
                <div
                  key={plan._id}
                  className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group animate-fadeInUp"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{plan.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {plan.uploadedBy} · {fmtDate(plan.createdAt)}
                      {plan.description && ` · ${plan.description}`}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 w-16 text-right">
                    {fmtSize(plan.fileSize)}
                  </span>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => setPreviewing(plan)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      title="Preview"
                    >
                      <Eye size={13} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}