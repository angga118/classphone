"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types & options                                                    */
/* ------------------------------------------------------------------ */

interface KatalogFilterProps {
  q?: string;
  brand?: string;
  condition?: string;
  storage?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  brandRows: { brand: string }[];
  storageRows: { storage: string }[];
  hasActiveFilter: boolean;
}

const CONDITION_OPTIONS = [
  { value: "NEW", label: "Baru" },
  { value: "LIKE_NEW", label: "Seperti Baru" },
  { value: "USED", label: "Bekas" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga Terendah" },
  { value: "price_desc", label: "Harga Tertinggi" },
] as const;

const fieldClasses =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink shadow-sm transition-colors placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100";

const selectClasses =
  "h-11 w-full appearance-none rounded-xl border border-line bg-white px-3.5 pr-9 text-sm text-ink shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function KatalogFilter({
  q,
  brand,
  condition,
  storage,
  minPrice,
  maxPrice,
  sort = "newest",
  brandRows,
  storageRows,
  hasActiveFilter,
}: KatalogFilterProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  // Lock body scroll + close on Escape while the sheet is open
  useEffect(() => {
    if (!sheetOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSheetOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sheetOpen]);

  const activeCount = [
    q,
    brand,
    condition,
    storage,
    minPrice,
    maxPrice,
    sort && sort !== "newest" ? sort : "",
  ].filter(Boolean).length;

  // Shared field markup — reused by the desktop form and the mobile sheet.
  const renderFields = (): React.ReactNode[] => [
    <>
      {/* Search */}
      <label className="relative block">
        <span className="sr-only">Cari HP</span>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari nama, brand, atau model…"
          className={`${fieldClasses} pl-10`}
        />
      </label>

      {/* Brand */}
      <select name="brand" defaultValue={brand ?? ""} className={selectClasses}>
        <option value="">Semua Brand</option>
        {brandRows.map((row) => (
          <option key={row.brand} value={row.brand}>
            {row.brand}
          </option>
        ))}
      </select>

      {/* Condition */}
      <select
        name="condition"
        defaultValue={condition ?? ""}
        className={selectClasses}
      >
        <option value="">Semua Kondisi</option>
        {CONDITION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Storage */}
      <select name="storage" defaultValue={storage ?? ""} className={selectClasses}>
        <option value="">Semua Penyimpanan</option>
        {storageRows.map((row) => (
          <option key={row.storage} value={row.storage}>
            {row.storage}
          </option>
        ))}
      </select>

      {/* Price range */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          name="minPrice"
          defaultValue={minPrice ?? ""}
          placeholder="Harga min"
          min={0}
          className={fieldClasses}
        />
        <span className="text-muted">—</span>
        <input
          type="number"
          name="maxPrice"
          defaultValue={maxPrice ?? ""}
          placeholder="Harga max"
          min={0}
          className={fieldClasses}
        />
      </div>

      {/* Sort */}
      <select name="sort" defaultValue={sort} className={selectClasses}>
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Urutkan: {opt.label}
          </option>
        ))}
      </select>
    </>,
  ];

  const renderActions = () => (
    <div className="flex gap-2">
      <Button type="submit" size="md" className="flex-1">
        Terapkan
      </Button>
      {hasActiveFilter ? (
        <Button
          type="button"
          variant="outline"
          size="md"
          href="/katalog"
          className="flex-1"
        >
          <XCircle className="size-4" aria-hidden="true" />
          Reset
        </Button>
      ) : null}
    </div>
  );

  return (
    <>
      {/* ---------- Mobile trigger (<lg) ---------- */}
      <div className="mt-8 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50"
        >
          <SlidersHorizontal className="size-4 text-primary-600" aria-hidden="true" />
          Filter & Sort
          {activeCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>
        {hasActiveFilter ? (
          <Button
            variant="outline"
            size="md"
            href="/katalog"
            className="shrink-0"
          >
            <XCircle className="size-4" aria-hidden="true" />
            Reset
          </Button>
        ) : null}
      </div>

      {/* ---------- Desktop inline form (lg+) ---------- */}
      <form
        method="get"
        className="mt-8 hidden rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5 lg:block"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted">
          <SlidersHorizontal className="size-4 text-primary-600" aria-hidden="true" />
          Filter Produk
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {renderFields().slice(0, 4)}
        </div>

        <div className="mt-3 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          {renderFields().slice(4, 6)}
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <Button type="submit" size="md" className="flex-1">
              Terapkan
            </Button>
            {hasActiveFilter ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                href="/katalog"
                className="flex-1"
              >
                <XCircle className="size-4" aria-hidden="true" />
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      {/* ---------- Mobile bottom sheet (<lg) ---------- */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-slide-up absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-white shadow-xl">
            {/* Handle + header */}
            <div className="sticky top-0 z-10 border-b border-line bg-white">
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" />
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-bold text-ink">Filter & Sort</p>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="flex size-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface hover:text-ink"
                  aria-label="Tutup filter"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <form method="get" className="space-y-4 p-4 pb-8">
              {renderFields()}
              {renderActions()}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default KatalogFilter;