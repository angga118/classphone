import type { Metadata } from "next";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { KatalogFilter } from "@/components/shared/katalog-filter";
import { Button } from "@/components/ui/button";

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

        {/* ---------- Filter bar (mobile sheet + desktop inline) ---------- */}
        <KatalogFilter
          q={q}
          brand={brand}
          condition={condition}
          storage={storage}
          minPrice={params.minPrice?.trim()}
          maxPrice={params.maxPrice?.trim()}
          sort={sort}
          brandRows={brandRows}
          storageRows={storageRows}
          hasActiveFilter={hasActiveFilter}
        />

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