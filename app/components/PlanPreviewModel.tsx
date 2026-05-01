// app/components/PlanPreviewModal.tsx
"use client";

import dynamic from "next/dynamic";
import { fmtSize } from "@/utils/helpers";
import { X, FileText, Download } from "lucide-react";

// ✅ This prevents the component from ever running on the server
const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

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

      {/* Viewer */}
      <div className="flex-1 overflow-auto bg-gray-900 flex flex-col items-center py-6 px-4">
        {plan.fileUrl ? (
          <PdfViewer fileUrl={plan.fileUrl} />
        ) : (
          <div className="flex flex-col items-center gap-4 text-center my-auto">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
              <FileText size={36} className="text-white/40" />
            </div>
            <p className="text-white font-semibold">{plan.title}</p>
            <p className="text-gray-400 text-sm">No file uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanPreviewModal;