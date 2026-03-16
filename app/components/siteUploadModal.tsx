import { fmtSize } from "@/utils/helpers";
import { useCallback, useRef, useState } from "react";
import CustomButton from "./Button";
import { X, Upload, FileText, ChevronDown } from 'lucide-react';
import { gql} from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useParams } from "next/navigation";

// ─── Mutation ─────────────────────────────────────────────────────────────────
const ADD_SITE_PLAN = gql`
  mutation AddSitePlan(
    $siteId: ID!
    $uploadedBy: ID!
    $title: String!
    $planType: PlanType!
    $fileUrl: String!
    $publicId: String!
    $fileSize: Int
    $description: String
  ) {
    addSitePlan(
      siteId: $siteId
      uploadedBy: $uploadedBy
      title: $title
      planType: $planType
      fileUrl: $fileUrl
      publicId: $publicId
      fileSize: $fileSize
      description: $description
    ) {
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
`;


interface AddSitePlanType {
    addSitePlan:SitePlan
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

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

// ─── Component ────────────────────────────────────────────────────────────────
const SiteUploadModal = ({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (plan: SitePlan) => void;
}) => {
  const params = useParams();
  const siteId = params.id as string;

  const { user } = useAppSelector((state: RootState) => state.authSlice);


  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    planType: 'FLOOR_PLAN' as PlanType,
    description: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [addSitePlan,{data,error,loading}] = useMutation<AddSitePlanType>(ADD_SITE_PLAN);

  // ─── File selection ──────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') {
      setFile(dropped);
      setUploadError(null);
    } else {
      setUploadError('Only PDF files are accepted.');
    }
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked?.type === 'application/pdf') {
      setFile(picked);
      setUploadError(null);
    } else {
      setUploadError('Only PDF files are accepted.');
    }
  };

  // ─── Submit: Cloudinary → GraphQL ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!file || !form.title) return;

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Upload PDF to Cloudinary using /raw/upload (not /image/upload)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      // Optional: organise uploads into a folder per site
      formData.append('folder', `site-plans/${siteId}`);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
        { method: 'POST', body: formData }
      );

      if (!cloudRes.ok) {
        const err = await cloudRes.json();
        throw new Error(err?.error?.message ?? 'Cloudinary upload failed');
      }

      const cloudData = await cloudRes.json();
      // cloudData.secure_url  → permanent HTTPS link to the PDF
      // cloudData.public_id   → used for future deletion via Cloudinary API
      // cloudData.bytes       → actual file size in bytes

      // 2. Save metadata to MongoDB via GraphQL mutation
      const { data } = await addSitePlan({
        variables: {
          siteId,
          uploadedBy: user?._id,
          title: form.title.trim(),
          planType: form.planType,
          fileUrl: cloudData.secure_url,
          publicId: cloudData.public_id,
          fileSize: cloudData.bytes,
          description: form.description.trim() || undefined,
        },
      });

      // 3. Optimistically update the parent list
      if (data?.addSitePlan) {
        onAdd(data.addSitePlan);
      }

      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = !!file && !!form.title.trim() && !uploading;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeInUp">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Upload New Site Plan</h3>
          <button
            onClick={onClose}
            disabled={uploading}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200
              ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              ${dragging     ? 'border-[#FF6B35] bg-[#FFF0EB]'
              : file        ? 'border-green-400 bg-green-50'
              : uploadError ? 'border-red-300 bg-red-50'
              :               'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFile}
            />

            {file ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <FileText size={22} className="text-green-600" />
                </div>
                <p className="text-sm font-semibold text-gray-800 text-center truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">{fmtSize(file.size)}</p>
                {!uploading && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setUploadError(null); }}
                    className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                  >
                    Remove
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Upload size={22} className="text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500 text-center">
                  Upload PDF files here
                </p>
                <p className="text-xs text-gray-400">or click to browse</p>
              </>
            )}
          </div>

          {/* Error message */}
          {uploadError && (
            <p className="text-xs text-red-500 font-medium -mt-1 px-1">{uploadError}</p>
          )}

          {/* Progress indicator */}
          {uploading && (
            <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 border border-orange-100 rounded-xl">
              <svg className="animate-spin w-4 h-4 text-[#FF6B35] flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-700">Uploading to Cloudinary…</p>
                <p className="text-[11px] text-gray-400 mt-0.5">This may take a moment for large files</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Document name <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="e.g. Ground Floor Plan"
              value={form.title}
              disabled={uploading}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Plan type */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Plan type <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all bg-white appearance-none disabled:bg-gray-50 disabled:text-gray-400"
                value={form.planType}
                disabled={uploading}
                onChange={(e) => setForm((f) => ({ ...f, planType: e.target.value as PlanType }))}
              >
                {ALL_TYPES.map((t) => (
                  <option key={t} value={t}>{PLAN_TYPE_META[t].label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Description <span className="text-gray-300">(optional)</span>
            </label>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all resize-none disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="Any notes about this plan..."
              value={form.description}
              disabled={uploading}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <CustomButton
            text="Add New"
            onClick={handleSubmit}
            loading={uploading}
            disabled={!canSubmit}
          />
        </div>

      </div>
    </div>
  );
};

export default SiteUploadModal;