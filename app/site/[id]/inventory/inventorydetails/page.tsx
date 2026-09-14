"use client";

import { useQuery } from "@apollo/client/react";
import {
  ArrowLeft,
  ChevronRight,
  Edit3,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import LoadingComponent from "@/app/components/LoadingComponent";
import { GET_INVENTORY_ITEMS, getInventoryItemId } from "../page";

type UnitOfMeasure = {
  id: string;
  label?: string | null;
  conversionFactor?: number | null;
  sellingPrice?: number | null;
  costPrice?: number | null;
  isBaseUnit?: boolean | null;
  isDefault?: boolean | null;
};

type InventoryDetail = {
  id: unknown;
  name: string;
  imageUri?: string | null;
  images?: string[] | null;
  price?: number | null;
  costPrice?: number | null;
  stock?: number | null;
  description?: string | null;
  itemType?: string | null;
  primaryCategory?: string | null;
  subcategory?: string | null;
  uoms?: UnitOfMeasure[] | null;
};

type InventoryResponse = {
  getInventorySiteItems: InventoryDetail[];
};

const formatPrice = (value: number) => `Ush ${value.toLocaleString("en-US")}`;

export default function InventoryDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = typeof params.id === "string" ? params.id : params.id?.[0];
  const itemId = searchParams.get("itemId");
  const { data, loading, error } = useQuery<InventoryResponse>(GET_INVENTORY_ITEMS, {
    variables: { siteId },
    skip: !siteId || !itemId,
    fetchPolicy: "no-cache",
  });

  const item = data?.getInventorySiteItems.find((inventoryItem) => getInventoryItemId(inventoryItem.id) === itemId);
  const baseUnit = item?.uoms?.find((unit) => unit.isBaseUnit || unit.isDefault) ?? item?.uoms?.[0];
  const stock = item?.stock ?? 0;
  const price = item?.price ?? 0;
  const costPrice = item?.costPrice ?? 0;
  const margin = price > 0 ? Math.round(((price - costPrice) / price) * 100) : 0;
  const image = item?.imageUri ?? item?.images?.[0];

  if (loading) return <LoadingComponent />;
  if (error || !item) {
    return (
      <main className="inventory-details-page">
        <Link className="details-back-link" href={`/site/${siteId}/inventory`}><ArrowLeft size={20} /> Back to inventory</Link>
        <div className="details-empty"><Package size={28} /><strong>Inventory item not found</strong><span>Return to the inventory catalogue and choose an item.</span></div>
      </main>
    );
  }

  return (
    <main className="inventory-details-page">
      <header className="details-header">
        <Link className="icon-link" href={`/site/${siteId}/inventory`} aria-label="Back to inventory"><ArrowLeft size={23} /></Link>
        <h1>Product details</h1>
        <button className="icon-link" type="button" aria-label={`Edit ${item.name}`}><Edit3 size={20} /></button>
      </header>

      <section className="product-identity">
        <div className="product-image" style={image ? { backgroundImage: `url(${image})` } : undefined}>{!image && <Package size={42} />}</div>
        <div><h2>{item.name}</h2><div className="product-badges"><span className="type-badge">{item.itemType ?? "PRODUCT"}</span><span className={`stock-badge ${stock > 0 ? "available" : "empty"}`}>{stock > 0 ? `${stock} in stock` : "Out of stock"}</span></div></div>
      </section>

      <section className="detail-section">
        <p className="section-label">Stock overview</p>
        <div className="overview-card">
          <div><span>In stock (base units)</span><strong className="green-value">{stock}</strong></div>
          <div><span>Selling price</span><strong>{formatPrice(price)}</strong></div>
          <div><span>Cost price</span><strong>{formatPrice(costPrice)}</strong></div>
          <div><span>Margin</span><strong className="green-value">{margin}%</strong></div>
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading"><p className="section-label">Units of measure</p><button type="button" className="add-uom"><Plus size={17} /> Add UoM</button></div>
        <div className="units-card">
          <div className="unit-row"><span className="unit-chip">{baseUnit?.label ?? "unit"}</span><div className="unit-copy"><strong>{baseUnit?.isBaseUnit ? "Base unit" : "Unit"}</strong><span>{baseUnit?.label ?? "base"} · {baseUnit?.isDefault ? "default" : "available"}</span></div><strong className="unit-price">{formatPrice(baseUnit?.sellingPrice ?? price)}</strong><ChevronRight size={20} className="unit-arrow" /></div>
          <button type="button" className="add-unit"><Plus size={19} /> Add unit of measure</button>
        </div>
      </section>

      <section className="detail-section management-section">
        <p className="section-label">Management</p>
        <div className="management-card"><button type="button" className="management-action archive-action"><Package size={19} /><span>Adjust stock</span><ChevronRight size={19} /></button><button type="button" className="management-action delete-action"><Trash2 size={19} /><span>Delete item</span><ChevronRight size={19} /></button></div>
      </section>

      <style jsx>{`
        .inventory-details-page { --ink: #17232d; --muted: #99a3ad; --line: #e6ebee; min-height: calc(100vh - 84px); background: #f6fafc; color: var(--ink); padding: 24px clamp(18px, 4vw, 64px) 48px; }
        .details-header { align-items: center; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: 40px 1fr 40px; min-height: 64px; }
        .details-header h1 { color: #929ca7; font-size: clamp(22px, 3vw, 30px); font-weight: 500; text-align: center; }
        .icon-link { align-items: center; background: transparent; border: 0; color: #5d6973; display: flex; height: 40px; justify-content: center; padding: 0; transition: color .2s ease; }
        .icon-link:hover { color: #8b1718; }
        .product-identity { align-items: center; display: flex; gap: 22px; margin: 26px auto 34px; max-width: 880px; }
        .product-image { align-items: center; background-color: #eadde4; background-position: center; background-repeat: no-repeat; background-size: cover; border-radius: 17px; color: #8f6a7c; display: flex; flex: 0 0 112px; height: 112px; justify-content: center; overflow: hidden; }
        .product-identity h2 { font-size: clamp(24px, 4vw, 34px); letter-spacing: -.03em; margin: 0 0 12px; }
        .product-badges { align-items: center; display: flex; flex-wrap: wrap; gap: 10px; }
        .type-badge, .stock-badge { border-radius: 999px; font-size: 12px; font-weight: 800; letter-spacing: .04em; padding: 8px 13px; text-transform: uppercase; }
        .type-badge { background: #e6f1fb; color: #23577d; } .stock-badge.available { background: #e6f2d8; color: #4f7331; text-transform: none; } .stock-badge.empty { background: #fae3e3; color: #9b3e43; text-transform: none; }
        .detail-section { margin: 0 auto 28px; max-width: 880px; } .section-label { color: #9ba5ae; font-size: 13px; font-weight: 800; letter-spacing: .1em; margin: 0 0 12px; text-transform: uppercase; }
        .overview-card, .units-card, .management-card { background: #fff; border: 1px solid var(--line); border-radius: 20px; box-shadow: 0 5px 16px rgba(31,52,64,.04); }
        .overview-card { display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; } .overview-card > div { min-height: 104px; padding: 22px; } .overview-card > div:nth-child(odd) { border-right: 1px solid var(--line); } .overview-card > div:nth-child(-n+2) { border-bottom: 1px solid var(--line); } .overview-card span { color: #9ba5ae; display: block; font-size: 15px; font-weight: 600; margin-bottom: 10px; } .overview-card strong { font-size: 27px; letter-spacing: -.035em; } .green-value { color: #3f7a27; }
        .section-heading { align-items: center; display: flex; justify-content: space-between; } .add-uom, .add-unit { align-items: center; background: transparent; border: 0; color: #8e1d1d; display: flex; font-size: 14px; font-weight: 700; gap: 5px; } .add-uom { margin-bottom: 12px; } .units-card { overflow: hidden; } .unit-row { align-items: center; display: flex; gap: 16px; min-height: 114px; padding: 20px 24px; } .unit-chip { align-items: center; background: #fff1eb; border: 1px solid #c8907d; border-radius: 10px; color: #834a3a; display: flex; flex: 0 0 84px; font-weight: 700; justify-content: center; min-height: 42px; padding: 8px; } .unit-copy { display: flex; flex: 1; flex-direction: column; gap: 5px; min-width: 0; } .unit-copy strong { font-size: 17px; } .unit-copy span { color: #a0a9b1; font-size: 14px; } .unit-price { font-size: 17px; white-space: nowrap; } .unit-arrow { color: #a0a8af; } .add-unit { border-top: 1px solid var(--line); justify-content: center; min-height: 70px; width: 100%; }
        .management-card { overflow: hidden; } .management-action { align-items: center; background: #fff; border: 0; color: #7b1718; display: flex; font-size: 15px; font-weight: 700; gap: 12px; min-height: 68px; padding: 0 20px; text-align: left; width: 100%; } .management-action + .management-action { border-top: 1px solid var(--line); } .management-action span { flex: 1; } .management-action:hover { background: #fff8f8; } .delete-action { color: #9e4343; }
        .details-empty { align-items: center; color: #7b8790; display: flex; flex-direction: column; gap: 10px; margin: 100px auto; text-align: center; } .details-empty strong { color: var(--ink); font-size: 20px; } .details-empty span { font-size: 14px; }
        @media (max-width: 640px) { .inventory-details-page { padding: 10px 10px 32px; } .product-identity { gap: 16px; margin: 24px 8px 30px; } .product-image { flex-basis: 92px; height: 92px; } .overview-card > div { min-height: 98px; padding: 17px 15px; } .overview-card span { font-size: 12px; } .overview-card strong { font-size: 22px; } .unit-row { gap: 10px; padding: 16px; } .unit-chip { flex-basis: 70px; font-size: 13px; } .unit-copy strong, .unit-price { font-size: 15px; } .unit-copy span { font-size: 12px; } }
      `}</style>
    </main>
  );
}
