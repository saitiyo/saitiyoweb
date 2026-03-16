import { fmtDate, fmtSize } from '@/utils/helpers';
import {Trash2,Eye} from 'lucide-react';


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


// ─── PDF Thumbnail placeholder ────────────────────────────────────────────────
// In production, use pdf.js or Cloudinary's auto-generated thumbnail.
// Here we render a clean placeholder that matches the UI mockup style.
const PdfThumbnail = ({ plan, onClick }: { plan: SitePlan; onClick: () => void }) => {

  const meta = PLAN_TYPE_META[plan.planType];

  return (
    <button
      onClick={onClick}
      className="group relative w-full aspect-4/3 bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:border-[#FF6B35]/40 hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-3"
    >
      {/* Grid paper background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(#000 1px, transparent 1px),
            linear-gradient(90deg, #000 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />
      {/* Simulated plan lines */}
      <div className="absolute inset-6 border border-gray-200 rounded" />
      <div className="absolute inset-10 border border-gray-100 rounded" />
      <div className="absolute left-6 right-6 top-1/2 border-t border-gray-200" />
      <div className="absolute top-6 bottom-6 left-1/2 border-l border-gray-200" />
      <div className="absolute top-6 bottom-6 left-[30%] border-l border-gray-100" />
      <div className="absolute top-6 bottom-6 left-[70%] border-l border-gray-100" />
      <div className="absolute left-6 right-6 top-[35%] border-t border-gray-100" />
      <div className="absolute left-6 right-6 top-[65%] border-t border-gray-100" />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
          <Eye size={14} className="text-gray-700" />
          <span className="text-xs font-bold text-gray-700">Preview</span>
        </div>
      </div>
    </button>
  );
};

const PlanCard = ({
  plan,
  onPreview,
  onDelete,
}: {
  plan: SitePlan;
  onPreview: () => void;
  onDelete: () => void;
}) => {
  const meta = PLAN_TYPE_META[plan.planType];
  return (
    <div className="flex flex-col gap-2 animate-fadeInUp group">
      <PdfThumbnail plan={plan} onClick={onPreview} />
      <div className="px-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-800 truncate">{plan.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="text-[10px] text-gray-400">{fmtSize(plan.fileSize)}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {plan.uploadedBy} · {fmtDate(plan.createdAt)}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"
          title="Delete"
        >
          <Trash2 size={12} className="text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default PlanCard