"use client";

import { FormEvent, useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ArrowLeft,
  ChevronRight,
  Check,
  Edit3,
  Package,
  Plus,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import LoadingComponent from "@/app/components/LoadingComponent";
import { RootState } from "@/redux/store";

const GET_INVENTORY_ITEM = gql`
  query GetInventoryItem($id: ID!) {
    getInventoryItem(id: $id) {
      id
      name
      imageUri
      images
      price
      costPrice
      stock
      description
      itemType
      primaryCategory
      subcategory
      uoms {
        id
        label
        conversionFactor
        costPrice
        isBaseUnit
        isDefault
      }
    }
  }
`;

const UPDATE_ITEM_UOM = gql`
  mutation UpdateItemUoM($id: ID!, $input: UpdateItemUoMInput!) {
    updateItemUoM(id: $id, input: $input) { id }
  }
`;

const SET_DEFAULT_UOM = gql`
  mutation SetDefaultUoM($uomId: ID!, $itemId: ID!) {
    setDefaultUoM(uomId: $uomId, itemId: $itemId) { id }
  }
`;

const ADJUST_ITEM_STOCK = gql`
  mutation AdjustItemStock($input: AdjustStockInput!) {
    adjustItemStock(input: $input) { id stock }
  }
`;

type UnitOfMeasure = {
  id: string;
  label?: string | null;
  conversionFactor?: number | null;
  costPrice?: number | null;
  isBaseUnit?: boolean | null;
  isDefault?: boolean | null;
};

type InventoryDetail = {
  id: string;
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
  getInventoryItem: InventoryDetail;
};

const formatPrice = (value: number) => `Ush ${value.toLocaleString("en-US")}`;

export default function InventoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = typeof params.id === "string" ? params.id : params.id?.[0];
  const itemId = searchParams.get("itemId");
  const operatorId = useSelector((state: RootState) => state.authSlice.user?.id ?? state.authSlice.user?._id);
  const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasure | null>(null);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [unitLabel, setUnitLabel] = useState("");
  const [unitConversion, setUnitConversion] = useState("");
  const [unitCostPrice, setUnitCostPrice] = useState("");
  const [unitActionError, setUnitActionError] = useState("");
  const [unitOverride, setUnitOverride] = useState<{ itemId: string; unitId: string; changes: Partial<UnitOfMeasure> } | null>(null);
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState("");
  const [stockUnitId, setStockUnitId] = useState("");
  const [stockActionError, setStockActionError] = useState("");
  const [stockOverride, setStockOverride] = useState<{ itemId: string; value: number } | null>(null);
  const [defaultUnitOverride, setDefaultUnitOverride] = useState<{ itemId: string; unitId: string } | null>(null);
  const { data, loading, error } = useQuery<InventoryResponse>(GET_INVENTORY_ITEM, {
    variables: { id: itemId },
    skip: !siteId || !itemId,
    fetchPolicy: "no-cache",
  });
  const mutationOptions = { awaitRefetchQueries: true, refetchQueries: itemId ? [{ query: GET_INVENTORY_ITEM, variables: { id: itemId } }] : [] };
  const [updateItemUom, { loading: isUpdatingUnit }] = useMutation(UPDATE_ITEM_UOM, mutationOptions);
  const [setDefaultUom, { loading: isSettingDefault }] = useMutation(SET_DEFAULT_UOM, mutationOptions);
  const [adjustItemStock, { loading: isUpdatingStock }] = useMutation(ADJUST_ITEM_STOCK, mutationOptions);

  const item = data?.getInventoryItem;
  const baseUnit = item?.uoms?.find((unit) => unit.isBaseUnit || unit.isDefault) ?? item?.uoms?.[0];
  const itemUnits = (item?.uoms?.length ? item.uoms : baseUnit ? [baseUnit] : []).map((unit) => ({
    ...unit,
    ...(unitOverride?.itemId === itemId && unitOverride.unitId === unit.id ? unitOverride.changes : {}),
    isDefault: defaultUnitOverride?.itemId === itemId ? unit.id === defaultUnitOverride.unitId : unit.isDefault,
  }));
  const stock = stockOverride?.itemId === itemId ? stockOverride.value : item?.stock ?? 0;
  const costPrice = item?.costPrice ?? 0;
  const image = item?.imageUri ?? item?.images?.[0];
  const openUnitDetails = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit);
    setIsEditingUnit(false);
    setUnitActionError("");
  };
  const startEditingUnit = () => {
    if (!selectedUnit) return;
    setUnitLabel(selectedUnit.label ?? "");
    setUnitConversion(String(selectedUnit.conversionFactor ?? ""));
    setUnitCostPrice(String(selectedUnit.costPrice ?? ""));
    setUnitActionError("");
    setIsEditingUnit(true);
  };
  const saveUnitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUnit) return;
    const conversion = Number(unitConversion);
    const costPrice = Number(unitCostPrice);
    if (!unitLabel.trim() || !Number.isFinite(conversion) || conversion <= 0 || !Number.isFinite(costPrice) || costPrice < 0) {
      setUnitActionError("Enter a label, a conversion greater than 0, and a valid non-negative cost price.");
      return;
    }
    try {
      await updateItemUom({ variables: { id: selectedUnit.id, input: { label: unitLabel.trim(), conversionFactor: conversion, costPrice } } });
      if (itemId) {
        setUnitOverride({
          itemId,
          unitId: selectedUnit.id,
          changes: { label: unitLabel.trim(), conversionFactor: conversion, costPrice },
        });
      }
      setSelectedUnit(null);
      setIsEditingUnit(false);
    } catch (actionError) { setUnitActionError(actionError instanceof Error ? actionError.message : "Unable to update this unit."); }
  };
  const makeDefaultUnit = async () => {
    if (!selectedUnit || !itemId) return;
    try {
      await setDefaultUom({ variables: { uomId: selectedUnit.id, itemId } });
      setDefaultUnitOverride({ itemId, unitId: selectedUnit.id });
      setSelectedUnit(null);
    } catch (actionError) { setUnitActionError(actionError instanceof Error ? actionError.message : "Unable to set the default unit."); }
  };
  const openStockAdjustment = () => {
    setStockAdjustment("");
    setStockUnitId((itemUnits.find((unit) => unit.isDefault || unit.isBaseUnit) ?? itemUnits[0])?.id ?? "");
    setStockActionError("");
    setIsAdjustingStock(true);
  };
  const saveStockAdjustment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const adjustment = Number(stockAdjustment);
    const stockUnit = itemUnits.find((unit) => unit.id === stockUnitId);
    const nextStock = stock + adjustment * (stockUnit?.conversionFactor ?? 1);
    if (!stockAdjustment.trim() || !Number.isInteger(adjustment) || adjustment === 0) {
      setStockActionError("Enter a whole number adjustment, such as 10 or -3.");
      return;
    }
    if (nextStock < 0) {
      setStockActionError("Stock cannot be reduced below zero.");
      return;
    }
    try {
      if (!itemId || !siteId || !stockUnit?.id || !operatorId) {
        setStockActionError("Select a stock unit and ensure an authenticated operator is available.");
        return;
      }
      await adjustItemStock({ variables: { input: { itemId, uomId: stockUnit.id, qty: adjustment, movementType: "ADJUSTMENT", operatorId, siteId } } });
      if (itemId) setStockOverride({ itemId, value: nextStock });
      setIsAdjustingStock(false);
    } catch (actionError) {
      setStockActionError(actionError instanceof Error ? actionError.message : "Unable to adjust stock.");
    }
  };
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
          <div><span>Cost price</span><strong>{formatPrice(costPrice)}</strong></div>
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading"><p className="section-label">Units of measure</p><button type="button" onClick={() => router.push(`/site/${siteId}/inventory/unitsofmeasure?itemId=${encodeURIComponent(String(item.id))}`)} className="add-uom"><Plus size={17} /> Add UoM</button></div>
        <div className="units-card">
          {itemUnits.length > 0 ? itemUnits.map((unit) => <button type="button" className="unit-row" key={unit.id} onClick={() => openUnitDetails(unit)}><span className="unit-chip">{unit.label ?? "unit"}</span><div className="unit-copy"><strong>{unit.isBaseUnit ? "Base unit" : "Unit"}</strong><span>{unit.label ?? "unit"} · {unit.isDefault ? "default" : "available"}</span></div><strong className="unit-price">{formatPrice(unit.costPrice ?? costPrice)}</strong><ChevronRight size={20} className="unit-arrow" /></button>) : <div className="unit-empty">No units of measure added yet.</div>}
          <button type="button" onClick={() => router.push(`/site/${siteId}/inventory/unitsofmeasure?itemId=${encodeURIComponent(String(item.id))}`)} className="add-unit"><Plus size={19} /> Add unit of measure</button>
        </div>
      </section>

      {selectedUnit && <div className="unit-modal-backdrop" role="presentation" onMouseDown={() => { setSelectedUnit(null); setIsEditingUnit(false); }}><section className="unit-details-modal" role="dialog" aria-modal="true" aria-labelledby="unit-details-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => { setSelectedUnit(null); setIsEditingUnit(false); }} aria-label="Close unit details">×</button>{isEditingUnit ? <form onSubmit={saveUnitEdit}><p className="section-label">Edit unit</p><h2 id="unit-details-title">{selectedUnit.label ?? "Unit"}</h2><label>Unit label<input value={unitLabel} onChange={(event) => setUnitLabel(event.target.value)} /></label><label>Conversion factor<input type="number" min="0.01" step="0.01" value={unitConversion} onChange={(event) => setUnitConversion(event.target.value)} /></label><label>Cost price<input type="number" min="0" step="0.01" value={unitCostPrice} onChange={(event) => setUnitCostPrice(event.target.value)} /></label>{unitActionError && <p className="unit-action-error" role="alert">{unitActionError}</p>}<div className="modal-actions"><button type="button" className="secondary-action" onClick={() => setIsEditingUnit(false)}>Cancel</button><button type="submit" className="primary-action" disabled={isUpdatingUnit}><Check size={17} /> Save changes</button></div></form> : <><p className="section-label">Unit of measure</p><h2 id="unit-details-title">{selectedUnit.label ?? "Unit"}</h2><div className="unit-detail-grid"><span>Conversion factor</span><strong>{selectedUnit.conversionFactor ?? 1} base units</strong><span>Cost price</span><strong>{formatPrice(selectedUnit.costPrice ?? 0)}</strong></div>{unitActionError && <p className="unit-action-error" role="alert">{unitActionError}</p>}<div className="modal-actions"><button type="button" className="secondary-action" onClick={startEditingUnit}><Edit3 size={17} /> Edit unit</button>{!selectedUnit.isDefault && <button type="button" className="secondary-action" onClick={makeDefaultUnit} disabled={isSettingDefault}><Star size={17} /> {isSettingDefault ? "Setting..." : "Set as default"}</button>}</div></>}</section></div>}

      <section className="detail-section management-section">
        <p className="section-label">Management</p>
        <div className="management-card"><button type="button" className="management-action archive-action" onClick={openStockAdjustment}><Package size={19} /><span>Adjust stock</span><ChevronRight size={19} /></button></div>
        {stockActionError && !isAdjustingStock && <p className="unit-action-error management-error" role="alert">{stockActionError}</p>}
      </section>

      {isAdjustingStock && <div className="stock-modal-backdrop" role="presentation" onMouseDown={() => setIsAdjustingStock(false)}><section className="stock-modal" role="dialog" aria-modal="true" aria-labelledby="stock-modal-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setIsAdjustingStock(false)} aria-label="Close stock adjustment"><X size={19} /></button><p className="section-label">Inventory action</p><h2 id="stock-modal-title">Adjust stock</h2><p className="stock-current">Current stock: <strong>{stock} base units</strong></p><form onSubmit={saveStockAdjustment}><label>Unit of measure<select value={stockUnitId} onChange={(event) => setStockUnitId(event.target.value)} required><option value="">Select a unit</option>{itemUnits.map((unit) => <option value={unit.id} key={unit.id}>{unit.label ?? "Unit"}{unit.isDefault ? " (default)" : unit.isBaseUnit ? " (base)" : ""}</option>)}</select></label><label>Adjustment<input autoFocus type="number" step="1" value={stockAdjustment} onChange={(event) => setStockAdjustment(event.target.value)} placeholder="e.g. 10 or -3" /></label><p className="stock-help">Use a positive number to add stock or a negative number to remove it.</p>{stockActionError && <p className="unit-action-error" role="alert">{stockActionError}</p>}<div className="modal-actions"><button type="button" className="secondary-action" onClick={() => setIsAdjustingStock(false)}>Cancel</button><button type="submit" className="primary-action" disabled={isUpdatingStock}>{isUpdatingStock ? "Saving..." : "Save stock"}</button></div></form></section></div>}

      <style jsx>{`
        .inventory-details-page { --ink: #111; --muted: #777; --line: #dedede; min-height: calc(100vh - 84px); background: #fff; color: var(--ink); padding: 24px clamp(18px, 4vw, 64px) 48px; }
        .details-header { align-items: center; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: 40px 1fr 40px; min-height: 64px; }
        .details-header h1 { color: #111; font-size: clamp(22px, 3vw, 30px); font-weight: 500; text-align: center; }
        .icon-link { align-items: center; background: transparent; border: 0; color: #111; display: flex; height: 40px; justify-content: center; padding: 0; transition: color .2s ease; }
        .icon-link:hover { color: #8b1718; }
        .product-identity { align-items: center; display: flex; gap: 22px; margin: 26px auto 34px; max-width: 880px; }
        .product-image { align-items: center; background-color: #f0f0f0; background-position: center; background-repeat: no-repeat; background-size: cover; border-radius: 17px; color: #111; display: flex; flex: 0 0 112px; height: 112px; justify-content: center; overflow: hidden; }
        .product-identity h2 { font-size: clamp(24px, 4vw, 34px); letter-spacing: -.03em; margin: 0 0 12px; }
        .product-badges { align-items: center; display: flex; flex-wrap: wrap; gap: 10px; }
        .type-badge, .stock-badge { border-radius: 999px; font-size: 12px; font-weight: 800; letter-spacing: .04em; padding: 8px 13px; text-transform: uppercase; }
        .type-badge { background: #e6f1fb; color: #23577d; } .stock-badge.available { background: #e6f2d8; color: #4f7331; text-transform: none; } .stock-badge.empty { background: #fae3e3; color: #9b3e43; text-transform: none; }
        .detail-section { margin: 0 auto 28px; max-width: 880px; } .section-label { color: #666; font-size: 13px; font-weight: 800; letter-spacing: .1em; margin: 0 0 12px; text-transform: uppercase; }
        .overview-card, .units-card, .management-card { background: #fff; border: 1px solid var(--line); border-radius: 20px; box-shadow: 0 5px 16px rgba(0,0,0,.06); }
        .overview-card { display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; } .overview-card > div { min-height: 104px; padding: 22px; } .overview-card > div:nth-child(odd) { border-right: 1px solid var(--line); } .overview-card > div:nth-child(-n+2) { border-bottom: 1px solid var(--line); } .overview-card span { color: #666; display: block; font-size: 15px; font-weight: 600; margin-bottom: 10px; } .overview-card strong { font-size: 27px; letter-spacing: -.035em; } .green-value { color: #3f7a27; }
        .section-heading { align-items: center; display: flex; justify-content: space-between; } .add-uom, .add-unit { align-items: center; background: transparent; border: 0; color: #000; display: flex; font-size: 14px; font-weight: 700; gap: 5px; } .add-uom { margin-bottom: 12px; } .units-card { overflow: hidden; } .unit-row { align-items: center; background: #fff; border: 0; border-bottom: 1px solid var(--line); color: #111; cursor: pointer; display: flex; gap: 16px; min-height: 114px; padding: 20px 24px; text-align: left; width: 100%; } .unit-row:hover { background: #f5f5f5; } .unit-row:last-of-type { border-bottom: 0; } .unit-chip { align-items: center; background: #fff1eb; border: 1px solid #c8907d; border-radius: 10px; color: #834a3a; display: flex; flex: 0 0 84px; font-weight: 700; justify-content: center; min-height: 42px; padding: 8px; } .unit-copy { display: flex; flex: 1; flex-direction: column; gap: 5px; min-width: 0; } .unit-copy strong { font-size: 17px; } .unit-copy span { color: #666; font-size: 14px; } .unit-price { font-size: 17px; white-space: nowrap; } .unit-arrow { color: #111; } .unit-empty { color: #666; padding: 24px; text-align: center; } .add-unit { border-top: 1px solid var(--line); justify-content: center; min-height: 70px; width: 100%; }
        .management-card { overflow: hidden; } .management-action { align-items: center; background: #fff; border: 0; color: #111; display: flex; font-size: 15px; font-weight: 700; gap: 12px; min-height: 68px; padding: 0 20px; text-align: left; width: 100%; } .management-action + .management-action { border-top: 1px solid var(--line); } .management-action span { flex: 1; } .management-action:hover { background: #f5f5f5; } .management-action:disabled { cursor: wait; opacity: .55; } .management-error { margin: 12px 0 0; }
        .details-empty { align-items: center; color: #666; display: flex; flex-direction: column; gap: 10px; margin: 100px auto; text-align: center; } .details-empty strong { color: var(--ink); font-size: 20px; } .details-empty span { font-size: 14px; }
        .stock-modal-backdrop { align-items: center; background: rgba(0,0,0,.65); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 30; } .stock-modal { background: #fff; border: 1px solid #000; border-radius: 18px; box-shadow: 0 18px 50px rgba(0,0,0,.25); max-width: 440px; padding: 28px; position: relative; width: 100%; } .stock-modal .modal-close { align-items: center; background: #f5f5f5; border: 1px solid #d8d8d8; color: #111; cursor: pointer; display: flex; height: 36px; justify-content: center; padding: 0; right: 16px; top: 16px; transition: background .2s ease, border-color .2s ease, transform .2s ease; width: 36px; } .stock-modal .modal-close:hover { background: #111; border-color: #111; color: #fff; transform: rotate(90deg); } .stock-modal .modal-close:focus-visible { outline: 3px solid #b9cfe2; outline-offset: 2px; } .stock-modal h2 { font-size: 28px; margin: 0 0 8px; } .stock-current { color: #666; font-size: 14px; margin-bottom: 22px; } .stock-current strong { color: var(--ink); } .stock-modal form { display: grid; gap: 10px; } .stock-modal label { display: grid; font-size: 12px; font-weight: 700; gap: 6px; } .stock-modal input, .stock-modal select { background: #fff; border: 1px solid #000; border-radius: 0; color: #000; font: inherit; padding: 11px; } .stock-help { color: #666; font-size: 13px; line-height: 1.4; }
        .unit-modal-backdrop { align-items: center; background: rgba(0,0,0,.55); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 30; } .unit-details-modal { background: #fff; border: 1px solid #000; border-radius: 18px; box-shadow: 0 18px 50px rgba(0,0,0,.25); max-width: 460px; padding: 28px; position: relative; width: 100%; } .unit-details-modal h2 { font-size: 28px; margin: 0 0 22px; } .modal-close { background: #fff; border: 1px solid #000; border-radius: 50%; color: #000; font-size: 22px; height: 34px; line-height: 1; position: absolute; right: 18px; top: 18px; width: 34px; } .unit-detail-grid { border: 1px solid var(--line); display: grid; gap: 0; grid-template-columns: 1fr 1fr; margin-bottom: 22px; } .unit-detail-grid span, .unit-detail-grid strong { border-bottom: 1px solid var(--line); padding: 14px; } .unit-detail-grid span:nth-last-child(-n+2), .unit-detail-grid strong:nth-last-child(-n+2) { border-bottom: 0; } .unit-detail-grid span { color: #6b757d; font-size: 13px; } .unit-details-modal form { display: grid; gap: 13px; } .unit-details-modal label { display: grid; font-size: 12px; font-weight: 700; gap: 6px; } .unit-details-modal input { border: 1px solid #000; color: #000; font: inherit; padding: 11px; } .unit-action-error { color: #000; font-size: 13px; font-weight: 700; } .modal-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; } .modal-actions button { align-items: center; border: 1px solid #000; display: inline-flex; font: inherit; font-size: 13px; font-weight: 700; gap: 7px; justify-content: center; min-height: 42px; padding: 0 13px; } .primary-action { background: #000; color: #fff; } .secondary-action { background: #fff; color: #000; }
        @media (max-width: 640px) { .inventory-details-page { padding: 10px 10px 32px; } .product-identity { gap: 16px; margin: 24px 8px 30px; } .product-image { flex-basis: 92px; height: 92px; } .overview-card > div { min-height: 98px; padding: 17px 15px; } .overview-card span { font-size: 12px; } .overview-card strong { font-size: 22px; } .unit-row { gap: 10px; padding: 16px; } .unit-chip { flex-basis: 70px; font-size: 13px; } .unit-copy strong, .unit-price { font-size: 15px; } .unit-copy span { font-size: 12px; } }
      `}</style>
    </main>
  );
}
