import { fmtSize } from "@/utils/helpers";
import {
  X,FileText,Download,
} from 'lucide-react';

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


const PlanPreviewModal = ({ plan, onClose }: { plan: SitePlan; onClose: () => void }) => {
  const meta = PLAN_TYPE_META[plan.planType];
  console.log(plan,"===========plaaaaan===========")
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#1A1D23] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
          <div>
            <p className="text-sm font-bold text-white">{plan.title}</p>
            <p className="text-xs text-gray-400">{meta.label} · {fmtSize(plan.fileSize)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plan.fileUrl && (
            <a
              href={plan.fileUrl}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white transition-colors"
            >
              <Download size={13} />
              Download
            </a>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 overflow-hidden bg-gray-900 flex items-center justify-center p-4">
        {plan.fileUrl ? (
          <iframe
            src={`${plan.fileUrl}#toolbar=0&view=FitH`}
            className="w-full h-screen rounded-lg border border-white/10"
            title={plan.title}
          />
        ) : (
          // Placeholder when no real URL (mock data)
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
              <FileText size={36} className="text-white/40" />
            </div>
            <div>
              <p className="text-white font-semibold">{plan.title}</p>
              <p className="text-gray-400 text-sm mt-1">PDF preview will appear here once a real file is uploaded via Cloudinary.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default PlanPreviewModal
