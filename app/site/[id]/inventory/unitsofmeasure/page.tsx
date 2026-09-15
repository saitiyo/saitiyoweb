"use client";

import { FormEvent, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
	ArrowLeft,
	Box,
	ChevronRight,
	CircleHelp,
	PencilLine,
	Plus,
	Search,
	X,
} from "lucide-react";

type Unit = { code: string; name: string };
type UnitGroup = { label: string; units: Unit[] };

const CREATE_ITEM_UOM = gql`
	mutation CreateItemUoM($input: CreateItemUoMInput!) {
		createItemUoM(input: $input) {
			id
			itemId
			label
			conversionFactor
			sellingPrice
			costPrice
			isDefault
			isBaseUnit
		}
	}
`;

const unitGroups: UnitGroup[] = [
	{ label: "Quantity", units: [{ code: "box", name: "box" }, { code: "bndl", name: "bundle" }, { code: "ctn", name: "carton" }, { code: "crt", name: "crate" }, { code: "dz", name: "dozen" },{ code: "bag", name: "bag" },{ code: "trip", name: "trip"}, { code: "pk", name: "pack" }, { code: "pr", name: "pair" }] },
	{ label: "Length", units: [{ code: "mm", name: "millimetre" }, { code: "cm", name: "centimetre" }, { code: "m", name: "metre" }, { code: "ft", name: "foot" }] },
	{ label: "Weight", units: [{ code: "g", name: "gram" }, { code: "kg", name: "kilogram" }, { code: "t", name: "tonne" }] },
];

export default function UnitsOfMeasurePage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const siteId = typeof params.id === "string" ? params.id : params.id?.[0];
	const itemId = searchParams.get("itemId");
	const [search, setSearch] = useState("");
	const [isCustomOpen, setIsCustomOpen] = useState(false);
	const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
	const [conversionFactor, setConversionFactor] = useState("1");
	const [sellingPrice, setSellingPrice] = useState("0");
	const [costPrice, setCostPrice] = useState("0");
	const [errorMessage, setErrorMessage] = useState("");
	const [createItemUom, { loading: isSaving }] = useMutation(CREATE_ITEM_UOM);
	const visibleGroups = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return unitGroups;
		return unitGroups.map((group) => ({ ...group, units: group.units.filter((unit) => `${unit.code} ${unit.name}`.includes(query)) })).filter((group) => group.units.length > 0);
	}, [search]);
	const closeModal = () => { setIsCustomOpen(false); setSelectedUnit(null); setErrorMessage(""); };
	const openUnit = (unit: Unit) => { setSelectedUnit(unit); setConversionFactor("1"); setErrorMessage(""); };
	const saveUnit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const label = isCustomOpen ? String(formData.get("label") ?? "").trim() : selectedUnit?.name.trim() ?? "";
		const conversionValue = conversionFactor.trim();
		const sellingValue = sellingPrice.trim();
		const costValue = costPrice.trim();
		const conversion = Number(conversionFactor);
		const selling = Number(sellingPrice);
		const cost = Number(costPrice);

		if (!itemId) { setErrorMessage("This page needs an inventory item before a unit can be added."); return; }
		if (!label) { setErrorMessage("Enter a unit label."); return; }
		if (!conversionValue || !Number.isFinite(conversion) || conversion <= 0) { setErrorMessage("Conversion must be greater than 0."); return; }
		if (!sellingValue || !Number.isFinite(selling) || selling < 0) { setErrorMessage("Enter a valid selling price."); return; }
		if (!costValue || !Number.isFinite(cost) || cost < 0) { setErrorMessage("Enter a valid cost price."); return; }
		setErrorMessage("");
		try {
			await createItemUom({
				variables: {
					input: {
						itemId,
						label,
						conversionFactor: conversion,
						sellingPrice: selling,
						costPrice: cost,
						isDefault: false,
						isBaseUnit: false,
					},
				},
				refetchQueries: [{ query: gql`query RefreshInventoryItem($id: ID!) { getInventoryItem(id: $id) { id } }`, variables: { id: itemId } }],
			});
			closeModal();
			router.push(`/site/${siteId}/inventory/inventorydetails?itemId=${encodeURIComponent(itemId)}`);
		} catch (error) { setErrorMessage(error instanceof Error ? error.message : "Unable to add this unit."); }
	};

	return (
		<main className="units-page">
			<header className="units-header">
				<Link href={`/site/${siteId}/inventory`} className="header-icon" aria-label="Back to inventory"><ArrowLeft size={25} /></Link>
				<div className="header-copy"><p className="overline">Inventory setup</p><h1>Choose unit type</h1></div>
				<button type="button" className="header-icon help-button" aria-label="Unit help"><CircleHelp size={21} /></button>
			</header>
			<section className="context-banner" aria-label="Current base unit"><span>Base unit</span><strong>unit</strong><span className="context-dot">·</span><span>Now adding a derived unit</span></section>
			<div className="units-content">
				<label className="search-field"><Search size={20} aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search units..." aria-label="Search units" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={17} /></button>}</label>
				<button type="button" className="custom-unit-card" onClick={() => { setIsCustomOpen(true); setErrorMessage(""); }}><span className="custom-icon"><PencilLine size={22} /></span><span className="custom-copy"><strong>Custom unit</strong><span>Define your own unit label and conversion</span></span><ChevronRight size={21} className="row-chevron" /></button>
				{visibleGroups.length > 0 ? visibleGroups.map((group) => <section className="unit-group" key={group.label}><h2><span className="group-symbol">#</span>{group.label}</h2><div className="unit-list">{group.units.map((unit) => <button type="button" className="unit-row" key={unit.code} onClick={() => openUnit(unit)}><span className="unit-code">{unit.code}</span><strong>{unit.name}</strong><ChevronRight size={19} className="row-chevron" /></button>)}</div></section>) : <div className="empty-state"><Search size={24} /><strong>No units found</strong><span>Try a different search term.</span></div>}
			</div>
			{(isCustomOpen || selectedUnit) && <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}><section className="unit-modal" role="dialog" aria-modal="true" aria-labelledby="unit-modal-title" onMouseDown={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={closeModal} aria-label="Close"><X size={20} /></button><span className="modal-icon">{isCustomOpen ? <PencilLine size={22} /> : <Box size={22} />}</span><p className="overline">{isCustomOpen ? "New derived unit" : `Add to item ${itemId ? `#${itemId.slice(-6)}` : ""}`}</p><h2 id="unit-modal-title">{isCustomOpen ? "Create custom unit" : selectedUnit?.name}</h2><form onSubmit={saveUnit}>{isCustomOpen && <label>Unit label<input name="label" required placeholder="e.g. pallet" /></label>}<label>Conversion to base unit<input required type="number" min="0.01" step="0.01" value={conversionFactor} onChange={(event) => setConversionFactor(event.target.value)} placeholder="e.g. 12" /></label><label>Selling price<input required type="number" min="0" step="0.01" value={sellingPrice} onChange={(event) => setSellingPrice(event.target.value)} /></label><label>Cost price<input required type="number" min="0" step="0.01" value={costPrice} onChange={(event) => setCostPrice(event.target.value)} /></label>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<button className="modal-submit" type="submit" disabled={isSaving}><Plus size={18} /> {isSaving ? "Adding..." : "Add unit to item"}</button></form></section></div>}
			<style>{pageStyles}</style>
		</main>
	);
}

const pageStyles = `
	.units-page { --ink: #000; --muted: #000; --line: #000; min-height: calc(100vh - 84px); background: #fff; color: var(--ink); padding-bottom: 64px; }
	.units-header { align-items: center; background: #fff; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: 52px 1fr 52px; min-height: 108px; padding: 18px clamp(30px, 6vw, 96px); } .header-icon { align-items: center; background: transparent; border: 0; color: #000; display: flex; height: 42px; justify-content: center; transition: color .2s ease; width: 42px; } .header-icon:hover { color: #000; } .header-copy { text-align: center; } .overline { color: #000; font-size: 10px; font-weight: 800; letter-spacing: .14em; margin: 0 0 6px; text-transform: uppercase; } h1, h2, p { margin: 0; } h1 { font-size: clamp(25px, 3vw, 34px); font-weight: 500; letter-spacing: -.035em; } .help-button { justify-self: end; color: #000; }
	.context-banner { align-items: center; background: #fff; border-bottom: 1px solid #000; color: #000; display: flex; font-size: 14px; gap: 6px; justify-content: center; min-height: 58px; padding: 0 18px; } .context-banner strong { color: #000; font-weight: 750; } .context-dot { color: #000; font-size: 18px; }
	.units-content { display: grid; grid-template-columns: minmax(0, 1fr); margin: 0 auto; max-width: 860px; padding: 42px 32px 60px; } .search-field { align-items: center; background: #fff; border: 1px solid #000; border-radius: 13px; color: #000; display: flex; gap: 12px; min-height: 58px; padding: 0 17px; transition: border-color .2s ease, box-shadow .2s ease; } .search-field:focus-within { border-color: #000; box-shadow: 0 0 0 4px rgba(0,0,0,.12); } .search-field input { background: transparent; border: 0; color: #000; flex: 1; font: inherit; font-size: 15px; outline: none; } .search-field input::placeholder { color: #000; } .search-field button { background: transparent; border: 0; color: #000; display: flex; }
	.custom-unit-card { align-items: center; background: #fff; border: 1px solid #000; border-radius: 17px; box-shadow: 0 5px 15px rgba(0,0,0,.12); color: #000; display: flex; gap: 16px; margin: 26px 0 44px; min-height: 126px; padding: 22px; text-align: left; transition: border-color .2s ease, transform .2s ease; width: 100%; } .custom-unit-card:hover { border-color: #000; transform: translateY(-2px); } .custom-icon, .modal-icon { align-items: center; background: #000; border-radius: 12px; color: #fff; display: flex; flex: 0 0 54px; height: 54px; justify-content: center; } .custom-copy { display: flex; flex: 1; flex-direction: column; gap: 5px; min-width: 0; } .custom-copy strong { font-size: 17px; } .custom-copy span { color: #000; font-size: 14px; line-height: 1.4; max-width: 290px; } .row-chevron { color: #000; flex: 0 0 auto; }
	.unit-group { margin-bottom: 29px; } .unit-group h2 { align-items: center; color: #000; display: flex; font-size: 13px; font-weight: 800; gap: 10px; letter-spacing: .12em; margin: 0 0 12px 2px; text-transform: uppercase; } .group-symbol { color: #000; font-size: 21px; font-weight: 400; line-height: .7; } .unit-list { background: #fff; border: 1px solid #000; box-shadow: 0 3px 11px rgba(0,0,0,.1); } .unit-row { align-items: center; background: #fff; border: 0; border-bottom: 1px solid #000; color: #000; display: flex; gap: 19px; min-height: 78px; padding: 12px 21px; text-align: left; transition: background .2s ease; width: 100%; } .unit-row:last-child { border-bottom: 0; } .unit-row:hover { background: #000; color: #fff; } .unit-row:hover .row-chevron { color: #fff; } .unit-row strong { flex: 1; font-size: 16px; font-weight: 700; } .unit-code { align-items: center; background: #000; border-radius: 9px; color: #fff; display: flex; font-size: 14px; font-weight: 700; justify-content: center; min-width: 66px; padding: 9px 8px; }
	.empty-state { align-items: center; color: #000; display: flex; flex-direction: column; gap: 8px; padding: 52px 20px; text-align: center; } .empty-state strong { color: #000; }
	.modal-backdrop { align-items: flex-end; background: rgba(0,0,0,.7); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 20; } .unit-modal { background: #fff; border: 1px solid #000; border-radius: 20px; box-shadow: 0 18px 50px rgba(0,0,0,.3); max-width: 450px; padding: 28px; position: relative; width: 100%; } .modal-close { align-items: center; background: #fff; border: 1px solid #000; border-radius: 50%; color: #000; display: flex; height: 34px; justify-content: center; position: absolute; right: 20px; top: 20px; width: 34px; } .modal-icon { margin-bottom: 20px; } .unit-modal h2 { font-size: 26px; letter-spacing: -.04em; margin-bottom: 23px; } .unit-modal form { display: grid; gap: 14px; } .unit-modal label { color: #000; display: grid; font-size: 12px; font-weight: 800; gap: 7px; } .unit-modal input { background: #fff; border: 1px solid #000; border-radius: 10px; color: #000; font: inherit; padding: 12px; outline: 0; } .unit-modal input:focus { border-color: #000; } .modal-submit { align-items: center; background: #000; border: 1px solid #000; border-radius: 10px; color: #fff; display: flex; font: inherit; font-size: 14px; font-weight: 750; gap: 7px; justify-content: center; margin-top: 8px; min-height: 46px; padding: 0 16px; width: 100%; }
	.modal-backdrop { align-items: flex-end; background: rgba(0,0,0,.7); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 20; } .unit-modal { background: #fff; border: 1px solid #000; border-radius: 20px; box-shadow: 0 18px 50px rgba(0,0,0,.3); max-width: 450px; padding: 28px; position: relative; width: 100%; } .modal-close { align-items: center; background: #fff; border: 1px solid #000; border-radius: 50%; color: #000; display: flex; height: 34px; justify-content: center; position: absolute; right: 20px; top: 20px; width: 34px; } .modal-icon { margin-bottom: 20px; } .unit-modal h2 { font-size: 26px; letter-spacing: -.04em; margin-bottom: 23px; } .unit-modal form { display: grid; gap: 14px; } .unit-modal label { color: #000; display: grid; font-size: 12px; font-weight: 800; gap: 7px; } .unit-modal input { background: #fff; border: 1px solid #000; border-radius: 10px; color: #000; font: inherit; padding: 12px; outline: 0; } .unit-modal input:focus { border-color: #000; } .form-error { color: #000; font-size: 13px; font-weight: 700; } .modal-submit { align-items: center; background: #000; border: 1px solid #000; border-radius: 10px; color: #fff; display: flex; font: inherit; font-size: 14px; font-weight: 750; gap: 7px; justify-content: center; margin-top: 8px; min-height: 46px; padding: 0 16px; width: 100%; } .modal-submit:disabled { cursor: wait; opacity: .55; }
	@media (max-width: 640px) { .units-page { min-height: calc(100vh - 20px); padding-bottom: 30px; } .units-header { grid-template-columns: 42px 1fr 42px; min-height: 95px; padding: 10px 13px; } .header-icon { width: 38px; } .help-button { display: none; } .context-banner { font-size: 13px; min-height: 60px; } .units-content { padding: 26px 17px 30px; } .custom-unit-card { margin: 26px 0 44px; min-height: 128px; padding: 18px 17px; } .custom-copy span { font-size: 13px; } .unit-row { min-height: 78px; padding: 11px 16px; } .unit-row strong { font-size: 15px; } .unit-code { min-width: 66px; } .unit-modal { border-radius: 20px 20px 0 0; padding: 25px 20px 30px; } }
	@media (min-width: 641px) { .modal-backdrop { align-items: center; } }
`;
