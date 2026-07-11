"use client";

import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { gql} from "@apollo/client";
import { useMutation,useQuery } from "@apollo/client/react";
import { useParams, useRouter } from "next/navigation";
import { Search, Package, ChevronDown, X, AlertCircle } from "lucide-react";
import CustomButton from "@/app/components/Button";

// ─── GraphQL ──────────────────────────────────────────────────────────────────
const GET_UNITS = gql`
  query GetUnitsOfMeasure {
    getUnitsOfMeasure {
      _id
      name
      label
      description
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetProductCategories {
    getProductCategories {
      _id
      name
    }
  }
`;

const ADD_PRODUCT = gql`
  mutation AddProduct(
    $siteId: ID!
    $name: String!
    $description: String
    $sku: String
    $vatRate: Float
    $reorderLevel: Float
    $reorderQuantity: Float
    $categoryId: ID
  ) {
    addProduct(
      siteId: $siteId
      name: $name
      description: $description
      sku: $sku
      vatRate: $vatRate
      reorderLevel: $reorderLevel
      reorderQuantity: $reorderQuantity
      categoryId: $categoryId
    ) {
      _id
      name
      category
    }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Unit {
  _id: string;
  name: string;
  label: string;
  description?: string;
}

interface Category {
  _id: string;
  name: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────
const validationSchema = Yup.object({
  name: Yup.string().trim().min(2).max(100).required("Product name is required"),
  categoryId: Yup.string().required("Category is required"),
  unitId: Yup.string().required("Unit of measure is required"),
  quantity: Yup.number().typeError("Must be a number").min(0).required("Quantity is required"),
  unitPrice: Yup.number().typeError("Must be a number").min(0).required("Unit price is required"),
  sku: Yup.string().trim().max(50),
  vatRate: Yup.number().min(0).max(100),
  reorderLevel: Yup.number().min(0),
  reorderQuantity: Yup.number().min(0),
  description: Yup.string().max(300),
});

// ─── Unit Search Component ────────────────────────────────────────────────────
const UnitSearchField = ({
  units, value, onChange, onBlur, error, touched,
}: {
  units: Unit[];
  value: string;
  onChange: (id: string, name: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
}) => {
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const [display, setDisplay] = useState("");
  const wrapRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!value) { setDisplay(""); return; }
    const found = units.find((u) => u._id === value);
    if (found) setDisplay(`${found.name}${found.label ? ` (${found.label})` : ""}`);
  }, [value, units]);

  const filtered = query.trim()
    ? units.filter((u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.label?.toLowerCase().includes(query.toLowerCase()) ||
        u.description?.toLowerCase().includes(query.toLowerCase())
      )
    : units;

  const hasError = touched && error;

  const handleSelect = (unit: Unit) => {
    onChange(unit._id, unit.name);
    setDisplay(`${unit.name}${unit.label ? ` (${unit.label})` : ""}`);
    setOpen(false); setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", ""); setDisplay(""); setQuery("");
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); onBlur(); }}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 border rounded-xl text-sm transition-all bg-white
          ${hasError ? "border-red-400 ring-2 ring-red-100"
          : open ? "border-[#FF6B35] ring-2 ring-[#FF6B35]/20"
          : "border-gray-200 hover:border-gray-300"}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <span className={`truncate ${display ? "text-gray-800 font-medium" : "text-gray-400"}`}>
            {display || "Search and select a unit…"}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {display && (
            <span onClick={handleClear}
              className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
              <X size={10} className="text-gray-500" />
            </span>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus type="text" placeholder="Type to filter units…"
                value={query} onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]"
              />
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">No units match "{query}"</li>
            ) : filtered.map((unit) => (
              <li key={unit._id} onClick={() => handleSelect(unit)}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50
                  ${value === unit._id ? "bg-[#FFF0EB]" : ""}`}>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold capitalize truncate
                    ${value === unit._id ? "text-[#FF6B35]" : "text-gray-800"}`}>
                    {unit.name}
                  </p>
                  {unit.description && (
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{unit.description}</p>
                  )}
                </div>
                {unit.label && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                    ${value === unit._id ? "bg-[#FF6B35] text-white" : "bg-gray-100 text-gray-500"}`}>
                    {unit.label}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400">
              {filtered.length} unit{filtered.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
      )}

      {hasError && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500 font-medium">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
};

// ─── Field Wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, required, error, touched, hint, children }: {
  label: string; required?: boolean; error?: string;
  touched?: boolean; hint?: string; children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !(touched && error) && <p className="text-[11px] text-gray-400">{hint}</p>}
    {touched && error && (
      <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const inputCls = (error?: string, touched?: boolean) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm text-gray-800 placeholder-gray-400
   focus:outline-none focus:ring-2 transition-all bg-white
   ${touched && error
     ? "border-red-400 ring-2 ring-red-100 bg-red-50"
     : "border-gray-200 hover:border-gray-300 focus:border-[#FF6B35] focus:ring-[#FF6B35]/20"}`;

// ─── Page ─────────────────────────────────────────────────────────────────────
const AddInventoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const { data: unitsData, loading: unitsLoading } = useQuery(GET_UNITS);
  const { data: categoriesData }  = useQuery(GET_CATEGORIES);

  const units: Unit[]          = unitsData?.getUnitsOfMeasure       ?? [];
  const categories: Category[] = categoriesData?.getProductCategories ?? [];

  const [addProduct, { loading: saving }] = useMutation(ADD_PRODUCT, {
    onCompleted: () => router.back(),
    onError: (err) => formik.setStatus(err.message),
  });

  const formik = useFormik({
    initialValues: {
      name: "", categoryId: "", unitId: "", unitName: "",
      quantity: "", unitPrice: "", sku: "",
      vatRate: "0", reorderLevel: "0", reorderQuantity: "0", description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await addProduct({
        variables: {
          siteId,
          name:            values.name.trim(),
          description:     values.description.trim() || undefined,
          sku:             values.sku.trim()          || undefined,
          vatRate:         parseFloat(values.vatRate),
          reorderLevel:    parseFloat(values.reorderLevel),
          reorderQuantity: parseFloat(values.reorderQuantity),
          categoryId:      values.categoryId,
        },
      });
    },
  });

  const totalValue =
    parseFloat(formik.values.quantity  || "0") *
    parseFloat(formik.values.unitPrice || "0");

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
     

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Inventory</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Add Inventory Item</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below to add a new product to this site's inventory.</p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate>

          {/* Product Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wide mb-5">Product Details</h2>
            <div className="flex flex-col gap-5">

              <Field label="Material Name" required error={formik.errors.name} touched={formik.touched.name}>
                <input {...formik.getFieldProps("name")} placeholder="e.g. Portland Cement"
                  className={inputCls(formik.errors.name, formik.touched.name)} />
              </Field>

              <Field label="Category" required error={formik.errors.categoryId} touched={formik.touched.categoryId}>
                <div className="relative">
                  <select {...formik.getFieldProps("categoryId")}
                    className={`${inputCls(formik.errors.categoryId, formik.touched.categoryId)} appearance-none pr-10`}>
                    <option value="">Select a category…</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              <Field label="Description" error={formik.errors.description} touched={formik.touched.description}
                hint="Optional — briefly describe the material or specification.">
                <textarea {...formik.getFieldProps("description")} rows={2}
                  placeholder="e.g. OPC 42.5N, 50kg bags"
                  className={`${inputCls(formik.errors.description, formik.touched.description)} resize-none`} />
              </Field>

              <Field label="SKU" error={formik.errors.sku} touched={formik.touched.sku}
                hint="Optional stock-keeping unit code.">
                <input {...formik.getFieldProps("sku")} placeholder="e.g. CEM-OPC-50"
                  className={inputCls(formik.errors.sku, formik.touched.sku)} />
              </Field>
            </div>
          </div>

          {/* Quantity & Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wide mb-5">Quantity & Pricing</h2>
            <div className="flex flex-col gap-5">

              <Field label="Unit of Measure" required error={formik.errors.unitId} touched={formik.touched.unitId}>
                {unitsLoading ? (
                  <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">Loading units…</div>
                ) : (
                  <UnitSearchField
                    units={units}
                    value={formik.values.unitId}
                    onChange={(id, name) => {
                      formik.setFieldValue("unitId", id);
                      formik.setFieldValue("unitName", name);
                    }}
                    onBlur={() => formik.setFieldTouched("unitId", true)}
                    error={formik.errors.unitId}
                    touched={formik.touched.unitId}
                  />
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Quantity" required error={formik.errors.quantity} touched={formik.touched.quantity}>
                  <div className="relative">
                    <input {...formik.getFieldProps("quantity")} type="number" min="0" placeholder="0"
                      className={`${inputCls(formik.errors.quantity, formik.touched.quantity)} pr-14`} />
                    {formik.values.unitName && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {formik.values.unitName.toUpperCase().slice(0, 6)}
                      </span>
                    )}
                  </div>
                </Field>

                <Field label="Unit Price" required error={formik.errors.unitPrice} touched={formik.touched.unitPrice}>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">$</span>
                    <input {...formik.getFieldProps("unitPrice")} type="number" min="0" step="0.01" placeholder="0.00"
                      className={`${inputCls(formik.errors.unitPrice, formik.touched.unitPrice)} pl-7`} />
                  </div>
                </Field>
              </div>

              <Field label="VAT Rate" error={formik.errors.vatRate} touched={formik.touched.vatRate}
                hint="Enter 0 if this item is VAT-exempt.">
                <div className="relative">
                  <input {...formik.getFieldProps("vatRate")} type="number" min="0" max="100" step="0.5" placeholder="0"
                    className={`${inputCls(formik.errors.vatRate, formik.touched.vatRate)} pr-8`} />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">%</span>
                </div>
              </Field>

              {totalValue > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-[#F4F6F9] rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500">Estimated Total Value</span>
                  </div>
                  <span className="text-sm font-extrabold text-gray-900">
                    ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reorder Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wide mb-1">Reorder Settings</h2>
            <p className="text-xs text-gray-400 mb-5">Optional — set thresholds to get alerts when stock runs low.</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Reorder Level" error={formik.errors.reorderLevel} touched={formik.touched.reorderLevel}
                hint="Alert when stock drops below this.">
                <input {...formik.getFieldProps("reorderLevel")} type="number" min="0" placeholder="0"
                  className={inputCls(formik.errors.reorderLevel, formik.touched.reorderLevel)} />
              </Field>
              <Field label="Reorder Quantity" error={formik.errors.reorderQuantity} touched={formik.touched.reorderQuantity}
                hint="How much to order when restocking.">
                <input {...formik.getFieldProps("reorderQuantity")} type="number" min="0" placeholder="0"
                  className={inputCls(formik.errors.reorderQuantity, formik.touched.reorderQuantity)} />
              </Field>
            </div>
          </div>

          {formik.status && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 font-medium">{formik.status}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} disabled={saving}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <div className="flex-[2]">
              <CustomButton text="Add Inventory Item" loading={saving}
                disabled={saving || !formik.isValid} htmlType="submit" />
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddInventoryPage;