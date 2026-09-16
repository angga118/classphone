import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Katalog HP",
  description:
    "Jelajahi katalog HP bekas & baru di GadgetHub. Filter berdasarkan brand, kondisi, penyimpanan, dan harga.",
};

interface KatalogPageProps {
  searchParams: Promise<{
    q?: string;
    brand?: string;
    condition?: string;
    storage?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
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

export default async function KatalogPage({ searchParams }: KatalogPageProps) {
  const params = await searchParams;

  const q = params.q?.trim();
  const brand = params.brand?.trim();
  const condition = params.condition?.trim();
  const storage = params.storage?.trim();
  const minPrice = params.minPrice?.trim() ? Number(params.minPrice) : NaN;
  const maxPrice = params.maxPrice?.trim() ? Number(params.maxPrice) : NaN;
  const sort = params.sort ?? "newest";

  // ---------- Build where clause ----------
  const where: Prisma.ProductWhereInput = { stockStatus: "AVAILABLE" };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { brand: { contains: q } },
      { model: { contains: q } },
    ];
  }
  if (brand) where.brand = { contains: brand };
  if (
    condition === "NEW" ||
    condition === "LIKE_NEW" ||
    condition === "USED"
  ) {
    where.condition = condition;
  }
  if (storage) where.storage = storage;
  const priceFilter: Record<string, number> = {};
  if (!Number.isNaN(minPrice)) priceFilter.gte = minPrice;
  if (!Number.isNaN(maxPrice)) priceFilter.lte = maxPrice;
  if (Object.keys(priceFilter).length > 0) where.price = priceFilter;

  // ---------- Sorting ----------
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  // ---------- Fetch ----------
  const [products, brandRows, storageRows] = await Promise.all([
    db.product.findMany({ where, orderBy }),
    db.product.findMany({
      where: { stockStatus: "AVAILABLE" },
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
    db.product.findMany({
      where: { stockStatus: "AVAILABLE" },
      distinct: ["storage"],
      select: { storage: true },
      orderBy: { storage: "asc" },
    }),
  ]);

  const hasActiveFilter = Boolean(
    q || brand || condition || storage || !Number.isNaN(minPrice) || !Number.isNaN(maxPrice)
  );

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <SectionHeading
          title="Katalog HP"
          subtitle="Temukan HP bekas & baru berkualitas. Semua unit tersedia dan sudah direview admin."
        />

        {/* ---------- Filter bar ---------- */}
        <form
          method="get"
          className="mt-8 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted">
            <SlidersHorizontal className="size-4 text-primary-600" aria-hidden="true" />
            Filter Produk
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
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
                className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3.5 text-sm text-ink shadow-sm transition-colors placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </label>

            <select
              name="brand"
              defaultValue={brand ?? ""}
              className="h-11 w-full appearance-none rounded-xl border border-line bg-white px-3.5 pr-9 text-sm text-ink shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">Semua Brand</option>
              {brandRows.map((row) => (
                <option key={row.brand} value={row.brand}>
                  {row.brand}
                </option>
              ))}
            </select>

            <select
              name="condition"
              defaultValue={condition ?? ""}
              className="h-11 w-full appearance-none rounded-xl border border-line bg-white px-3.5 pr-9 text-sm text-ink shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">Semua Kondisi</option>
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              name="storage"
              defaultValue={storage ?? ""}
              className="h-11 w-full appearance-none rounded-xl border border-line bg-white px-3.5 pr-9 text-sm text-ink shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">Semua Penyimpanan</option>
              {storageRows.map((row) => (
                <option key={row.storage} value={row.storage}>
                  {row.storage}
                </option>
              ))}
            </select>
          </div>

          {/* Price + sort + actions */}
          <div className="mt-3 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minPrice"
                defaultValue={!Number.isNaN(minPrice) ? minPrice : ""}
                placeholder="Harga min"
                min={0}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink shadow-sm transition-colors placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <span className="text-muted">—</span>
              <input
                type="number"
                name="maxPrice"
                defaultValue={!Number.isNaN(maxPrice) ? maxPrice : ""}
                placeholder="Harga max"
                min={0}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink shadow-sm transition-colors placeholder:text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <select
              name="sort"
              defaultValue={sort}
              className="h-11 w-full appearance-none rounded-xl border border-line bg-white px-3.5 pr-9 text-sm text-ink shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Urutkan: {opt.label}
                </option>
              ))}
            </select>

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

        {/* ---------- Results ---------- */}
        <p className="mt-8 text-sm text-muted">
          Menampilkan{" "}
          <span className="font-bold text-ink">{products.length}</span>{" "}
          {products.length === 1 ? "produk" : "produk"} tersedia
        </p>

        {products.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-line bg-white py-20 text-center">
            <EmptyState
              title="Tidak ada produk ditemukan"
              description="Coba ubah kata kunci atau filter yang kamu gunakan. Mungkin produk yang kamu cari sedang tidak tersedia."
            />
            <Button variant="outline" size="md" href="/katalog" className="mt-6">
              Reset Semua Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}