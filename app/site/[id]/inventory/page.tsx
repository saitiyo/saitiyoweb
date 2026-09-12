"use client";

import { gql } from "@apollo/client";
import { useMemo, useState } from "react";
import {
	AlertTriangle,
	ArrowRight,
	Box,
	ChevronDown,
	CircleX,
	Package,
	Search,
} from "lucide-react";
import { useQuery } from "@apollo/client/react";
import LoadingComponent from "@/app/components/LoadingComponent";
import { useParams } from "next/navigation";
import Link from "next/link";

export const GET_INVENTORY_ITEMS = gql`
  query GetInventorySiteItems($siteId: ID!, $itemType: ItemType, $archived: Boolean) {
  getInventorySiteItems(siteId: $siteId, itemType: $itemType, archived: $archived) {
    id
    name
    imageUri
    images
    price
    costPrice
    stock
    description
    isArchived
    isMarketplaceVisible
    itemType
    siteId
    uoms {
      id
      itemId
      label
      conversionFactor
      sellingPrice
      costPrice
      isBaseUnit
      isDefault
      systemUomId
      systemUom {
        id
      }
      createdAt
      updatedAt
    }
    defaultUom {
      id
    }
    primaryCategory
    subcategory
    categoryPath
    tags
    confidence
    searchQuery
    createdAt
    updatedAt
  }
}
`;

type StockFilter = "All" | "In stock" | "Low stock" | "Out of stock";

type InventoryApiItem = {
	id: string;
	name: string;
	imageUri?: string | null;
	price?: number | null;
	stock?: number | null;
	primaryCategory?: string | null;
	subcategory?: string | null;
	uoms?: Array<{
		label?: string | null;
		conversionFactor?: number | null;
		isDefault?: boolean | null;
	}> | null;
};

type GetInventoryItemsData = {
	getInventorySiteItems: InventoryApiItem[];
};

type InventoryItem = {
	id: string;
	name: string;
	category: string;
	quantity: number;
	unit: string;
	price: number;
	stock: number;
	status: Exclude<StockFilter, "All">;
	accent: string;
};

const filters: StockFilter[] = ["All", "In stock", "Low stock", "Out of stock"];

const formatPrice = (price: number) => `Ush ${price.toLocaleString("en-US")}`;

export default function InventoryPage() {
	const params = useParams();
	const siteId = typeof params.id === "string" ? params.id : params.id?.[0];
	const [activeFilter, setActiveFilter] = useState<StockFilter>("All");
	const [search, setSearch] = useState("");
	const { data, loading, error } = useQuery<GetInventoryItemsData>(GET_INVENTORY_ITEMS, {
		variables: { siteId },
		skip: !siteId,
		fetchPolicy: "no-cache",
	});

	const inventory = useMemo<InventoryItem[]>(() => (data?.getInventorySiteItems ?? []).map((item) => {
		const stock = item.stock ?? 0;
		const defaultUom = item.uoms?.find((uom) => uom.isDefault) ?? item.uoms?.[0];
		const status: Exclude<StockFilter, "All"> = stock <= 0 ? "Out of stock" : stock <= 10 ? "Low stock" : "In stock";

		return {
			id: item.id,
			name: item.name,
			category: item.primaryCategory ?? item.subcategory ?? "Uncategorized",
			quantity: defaultUom?.conversionFactor ?? 1,
			unit: defaultUom?.label ?? "UoM",
			price: item.price ?? 0,
			stock,
			status,
			accent: status === "Out of stock" ? "#f5dddd" : status === "Low stock" ? "#f8e9cf" : "#e0efe2",
		};
	}), [data]);

	const visibleItems = useMemo(() => {
		const query = search.trim().toLowerCase();
		return inventory.filter((item) => {
			const matchesFilter = activeFilter === "All" || item.status === activeFilter;
			const matchesSearch = !query || `${item.name} ${item.category}`.toLowerCase().includes(query);
			return matchesFilter && matchesSearch;
		});
	}, [activeFilter, inventory, search]);

	const lowStockCount = inventory.filter((item) => item.status === "Low stock").length;
	const outOfStockCount = inventory.filter((item) => item.status === "Out of stock").length;

	if (loading) return <LoadingComponent />;
	if (error) return <main className="inventory-page"><p role="alert">Unable to load inventory items.</p></main>;

	return (
		<main className="inventory-page">
			<header className="inventory-header flex justify-between mb-6">
				<div><p className="eyebrow">Site materials</p></div>
				<Link className="relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-lg !bg-black px-4 py-2.5 text-sm font-semibold !text-white transition hover:!bg-[#242424]" href={`/site/${siteId}/inventory/addinventory`}>Add Item</Link>
			</header>

			<section className="inventory-toolbar mb-5 flex flex-col gap-3 rounded-2xl border border-[#dce5e9] bg-white p-3 shadow-[0_5px_16px_rgba(31,52,64,0.05)] lg:flex-row lg:items-center lg:justify-between" aria-label="Inventory controls">
				<label className="search-box flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-[#e1e9ed] bg-[#f7f9fa] px-4 text-[#8a99a2] transition focus-within:border-[#aebfc7] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#eef3f5] lg:max-w-3xl"><Search size={20} aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products by name or category..." aria-label="Search products" className="min-w-0 flex-1 bg-transparent text-sm text-[#17232d] outline-none placeholder:text-[#9aa7af]" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="flex text-[#87949d] transition hover:text-[#17232d]"><CircleX size={17} /></button>}</label>
				<button className="sort-button flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[#e1e9ed] bg-white px-4 text-sm font-semibold text-[#52616b] transition hover:border-[#bdcbd1] hover:bg-[#f8fafb] lg:min-w-44" type="button"><span className="text-[11px] font-semibold uppercase tracking-wide text-[#94a0a9]">Sort by</span> Recent <ChevronDown size={16} className="text-[#87949d]" /></button>
			</section>

			<div className="filter-row mb-8 flex flex-wrap items-center gap-1.5 rounded-xl border border-[#dce5e9] bg-white p-1.5 shadow-sm" role="tablist" aria-label="Filter inventory">
				<span className="hidden px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#98a5ad] sm:inline">View</span>
				{filters.map((filter) => <button className={`filter-chip flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition ${activeFilter === filter ? "active border-[#7e2925] bg-[#7e2925] text-white shadow-[0_3px_8px_rgba(126,41,37,0.16)]" : "border-transparent bg-transparent text-[#84909a] hover:bg-[#f1f5f7] hover:text-[#52616b]"}`} key={filter} onClick={() => setActiveFilter(filter)} role="tab" aria-selected={activeFilter === filter} type="button">{filter}{filter !== "All" && <span className={`filter-count rounded-md px-1.5 py-0.5 text-[10px] ${activeFilter === filter ? "bg-white/20 text-white" : "bg-[#edf2f5] text-[#73818a]"}`}>{filter === "Low stock" ? lowStockCount : filter === "Out of stock" ? outOfStockCount : inventory.filter((item) => item.status === "In stock").length}</span>}</button>)}
			</div>

			<section className="summary-grid" aria-label="Inventory summary">
				<section aria-label="Inventory summary" className="mb-9 grid grid-cols-3 gap-2 sm:gap-3">
					<div className="flex min-h-24 flex-col items-start justify-between gap-3 rounded-2xl border border-[#e0e7eb] bg-white p-3 shadow-sm sm:min-h-28 sm:flex-row sm:items-center sm:gap-4 sm:p-5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f4f5] text-[#788790] sm:h-11 sm:w-11 sm:rounded-xl"><Package size={18} className="sm:h-[21px] sm:w-[21px]" /></span><span><span className="block whitespace-nowrap text-[10px] font-semibold text-[#84919a] sm:text-sm">Total items</span><strong className="mt-1 block text-2xl font-bold tracking-[-0.05em] sm:text-3xl">{inventory.length}</strong></span></div>
					<div className="flex min-h-24 flex-col items-start justify-between gap-3 rounded-2xl border border-[#f1dfbe] bg-[#fff0d9] p-3 text-[#765325] shadow-sm sm:min-h-28 sm:flex-row sm:items-center sm:gap-4 sm:p-5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8e3be] sm:h-11 sm:w-11 sm:rounded-xl"><AlertTriangle size={18} className="sm:h-[21px] sm:w-[21px]" /></span><span><span className="block whitespace-nowrap text-[10px] font-semibold opacity-75 sm:text-sm">Low stock</span><strong className="mt-1 block text-2xl font-bold tracking-[-0.05em] sm:text-3xl">{lowStockCount}</strong></span></div>
					<div className="flex min-h-24 flex-col items-start justify-between gap-3 rounded-2xl border border-[#f0cccc] bg-[#fae5e5] p-3 text-[#812e34] shadow-sm sm:min-h-28 sm:flex-row sm:items-center sm:gap-4 sm:p-5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5d2d2] sm:h-11 sm:w-11 sm:rounded-xl"><CircleX size={18} className="sm:h-[21px] sm:w-[21px]" /></span><span><span className="block whitespace-nowrap text-[10px] font-semibold opacity-75 sm:text-sm">Out of stock</span><strong className="mt-1 block text-2xl font-bold tracking-[-0.05em] sm:text-3xl">{outOfStockCount}</strong></span></div>
				</section>
			</section>

			<section className="products-section mb-6">
				<div className="section-heading"><div><p className="eyebrow">Current catalogue</p><h2>{activeFilter === "All" ? "All products" : activeFilter}</h2></div><span>{visibleItems.length} items</span></div>
				<div className="product-list grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					{visibleItems.map((item) => <article className="product-row inventory-product-card relative flex min-h-[214px] flex-col justify-between rounded-2xl border border-[#d9e2e6] bg-white p-5 shadow-[0_5px_16px_rgba(31,52,64,0.08)] transition hover:-translate-y-1 hover:border-[#b8c8cf] hover:shadow-[0_12px_24px_rgba(31,52,64,0.14)]" key={item.id}><div className="product-card-top flex items-start justify-between"><div className="product-icon flex h-14 w-14 items-center justify-center rounded-xl text-[#74818b]" style={{ backgroundColor: item.accent }}><Box size={27} strokeWidth={1.7} /></div><button className="row-action flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f4f5] text-[#74818b] transition hover:bg-[#e3eaed] hover:text-[#17232d]" type="button" aria-label={`Open ${item.name}`}><ArrowRight size={18} /></button></div><div className="product-main mt-5"><h3 className="text-lg font-bold tracking-[-0.025em] text-[#17232d]">{item.name}</h3><p className="mt-1.5 text-xs text-[#87949d]">{item.category} <span className="px-1">·</span> {item.quantity} {item.unit}</p></div><div className="product-stock mt-5 flex items-center justify-between gap-3 border-t border-[#edf1f3] pt-4"><strong className="text-[15px] font-bold text-[#17232d]">{formatPrice(item.price)}</strong><span className={`stock-pill rounded-full px-2.5 py-1 text-[10px] font-bold ${item.status === "In stock" ? "bg-[#e8f2db] text-[#527235]" : item.status === "Low stock" ? "bg-[#fff0d9] text-[#936a31]" : "bg-[#fae5e5] text-[#a1484b]"}`}>{item.status === "In stock" ? `${item.stock} in stock` : item.status}</span></div></article>)}
					{visibleItems.length === 0 && <div className="empty-state"><Search size={24} /><strong>No products found</strong><span>Try a different search or filter.</span></div>}
				</div>
			</section>

		</main>
	);
}

<style jsx>{`
	.inventory-page { --ink: #17232d; --muted: #86919a; --line: #e3e9ed; min-height: calc(100vh - 84px); background: #f5f8fa; color: var(--ink); padding: 32px clamp(24px, 4vw, 64px) 48px; }
	.inventory-header, .inventory-toolbar, .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
	.inventory-header { margin-bottom: 26px; } .eyebrow { color: #91a0aa; font-size: 11px; font-weight: 700; letter-spacing: .13em; margin: 0 0 7px; text-transform: uppercase; } h1, h2, h3, p { margin: 0; } h1 { font-size: clamp(30px, 4vw, 44px); letter-spacing: -.04em; line-height: 1; } h2 { font-size: 22px; letter-spacing: -.03em; text-transform: capitalize; }
	.site-switcher, .sort-button { align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 10px; color: var(--ink); display: flex; gap: 11px; padding: 10px 14px; } .site-switcher { min-width: 210px; text-align: left; } .site-mark { align-items: center; background: #eff5e8; border-radius: 8px; color: #66824d; display: flex; height: 32px; justify-content: center; width: 32px; } .site-switcher-copy { display: flex; flex: 1; flex-direction: column; font-size: 13px; font-weight: 700; gap: 2px; } .site-switcher-copy small, .sort-button span { color: var(--muted); font-size: 10px; font-weight: 600; }
	.inventory-toolbar { align-items: stretch; background: #fff; border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 4px 14px rgba(31, 52, 64, .04); margin-bottom: 14px; padding: 10px; } .search-box { align-items: center; background: #f5f8fa; border: 1px solid #edf1f3; border-radius: 10px; color: #94a0a9; display: flex; flex: 1; gap: 12px; max-width: 660px; padding: 12px 14px; } .search-box input { border: 0; color: var(--ink); flex: 1; font: inherit; font-size: 14px; outline: 0; } .search-box input::placeholder { color: #a5afb6; } .search-box button { background: transparent; border: 0; color: #9aa5ad; display: flex; padding: 0; } .sort-button { border: 1px solid #edf1f3; font-size: 13px; gap: 8px; } .sort-button span { margin-right: 4px; }
	.filter-row { align-items: center; background: #fff; border: 1px solid var(--line); border-radius: 12px; display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 25px; padding: 6px; } .filter-chip { align-items: center; background: transparent; border: 1px solid transparent; border-radius: 7px; color: #84909a; display: flex; font-size: 12px; font-weight: 700; gap: 8px; padding: 8px 13px; } .filter-chip:hover { background: #f5f8fa; color: #52616b; } .filter-chip.active { background: #7e2925; border-color: #7e2925; color: #fff; box-shadow: 0 3px 8px rgba(126, 41, 37, .15); } .filter-chip.active .filter-count { background: rgba(255, 255, 255, .18); color: #fff; } .filter-count { background: #edf2f5; border-radius: 5px; font-size: 10px; min-width: 17px; padding: 2px 5px; text-align: center; }
	.summary-grid { display: grid; gap: 14px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-bottom: 34px; max-width: 850px; } .summary-card { align-items: center; border: 1px solid transparent; border-radius: 14px; display: flex; gap: 13px; min-height: 102px; padding: 18px 20px; } .total-card { background: #fff; border-color: var(--line); } .warning-card { background: #fff0d9; color: #765325; } .danger-card { background: #fae5e5; color: #812e34; } .summary-icon { align-items: center; display: flex; } .summary-card span { display: block; font-size: 13px; font-weight: 600; opacity: .72; } .summary-card strong { display: block; font-size: 27px; letter-spacing: -.04em; margin-top: 5px; }
	.products-section { margin-top: 24px; max-width: 1100px; } .section-heading { margin-bottom: 20px; } .section-heading > span { color: var(--muted); font-size: 12px; font-weight: 600; } .product-list { display: grid; gap: 14px; grid-template-columns: repeat(3, minmax(0, 1fr)); } .product-row { background: #fff; border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 4px 12px rgba(31, 52, 64, .045); display: grid; gap: 20px; min-height: 214px; padding: 18px; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; } .product-row:hover { border-color: #c9d5da; box-shadow: 0 10px 22px rgba(31, 52, 64, .09); transform: translateY(-2px); } .product-icon { align-items: center; border-radius: 12px; color: #74818b; display: flex; height: 58px; justify-content: center; width: 58px; } .product-main { min-width: 0; } .product-main h3 { font-size: 17px; letter-spacing: -.025em; } .product-main p { color: #96a0a8; font-size: 12px; margin-top: 6px; } .product-main p span { padding: 0 4px; } .product-stock { align-items: center; border-top: 1px solid #edf1f3; display: flex; justify-content: space-between; gap: 10px; padding-top: 14px; } .product-stock strong { font-size: 15px; } .stock-pill { border-radius: 99px; font-size: 11px; font-weight: 700; padding: 5px 10px; white-space: nowrap; } .in-stock { background: #e8f2db; color: #527235; } .low-stock { background: #fff0d9; color: #936a31; } .out-of-stock { background: #fae5e5; color: #a1484b; } .row-action { align-items: center; background: #f5f8fa; border: 0; border-radius: 50%; color: #8c969e; display: flex; height: 32px; justify-content: center; padding: 0; position: absolute; right: 16px; top: 18px; width: 32px; } .product-row { position: relative; } .empty-state { align-items: center; background: #fff; border: 1px dashed var(--line); border-radius: 14px; color: var(--muted); display: flex; flex-direction: column; gap: 8px; padding: 45px; } .empty-state strong { color: var(--ink); }
	.mobile-nav { display: none; }
	@media (max-width: 991px) { .inventory-page { min-height: calc(100vh - 20px); padding: 28px 24px 105px; } }
	@media (max-width: 991px) { .product-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
	@media (max-width: 640px) { .inventory-page { padding: 29px 17px 30px; } .inventory-header { margin-bottom: 23px; } .inventory-header h1 { font-size: 32px; } .eyebrow { font-size: 10px; } .site-switcher { min-width: 0; padding: 7px; } .site-switcher-copy { display: none; } .inventory-toolbar { align-items: stretch; flex-direction: column; gap: 10px; } .search-box { max-width: none; padding: 15px 16px; } .sort-button { justify-content: space-between; width: 100%; } .filter-row { flex-wrap: nowrap; margin: 0 -17px 24px; overflow-x: auto; padding: 0 17px 3px; scrollbar-width: none; } .filter-row::-webkit-scrollbar { display: none; } .filter-chip { flex: 0 0 auto; } .summary-grid { gap: 9px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-bottom: 30px; } .summary-card { align-items: center; flex-direction: row; gap: 7px; min-height: 88px; padding: 11px 9px; } .summary-card span { font-size: 10px; white-space: nowrap; } .summary-card strong { font-size: 22px; } .summary-icon svg { height: 17px; width: 17px; } .products-section { margin-top: 18px; } .section-heading { margin-bottom: 16px; } .section-heading h2 { font-size: 19px; } .product-list { grid-template-columns: 1fr; } .product-row { gap: 16px; min-height: 190px; padding: 16px; } .product-icon { height: 52px; width: 52px; } .product-main h3 { font-size: 15px; } .product-main p { font-size: 10px; white-space: nowrap; } .product-stock { min-width: 0; } .stock-pill { font-size: 10px; padding: 4px 7px; } .row-action { right: 14px; top: 15px; } }
`}</style>
