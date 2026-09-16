import type { Metadata } from "next";
import Link from "next/link";
import { Package, Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { parseProductPhotos } from "@/components/shared/product-card";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { formatIDR } from "@/components/shared/price";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StockStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Kelola Produk",
};

const STOCK_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "AVAILABLE", label: "Tersedia" },
  { value: "BOOKED", label: "Dipesan" },
  { value: "SOLD", label: "Terjual" },
  { value: "DRAFT", label: "Draft" },
];

const STOCK_BADGE: Record<
  StockStatus,
  { variant: "success" | "warning" | "neutral"; label: string }
> = {
  AVAILABLE: { variant: "success", label: "Tersedia" },
  BOOKED: { variant: "warning", label: "Dipesan" },
  SOLD: { variant: "neutral", label: "Terjual" },
  DRAFT: { variant: "neutral", label: "Draft" },
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function AdminProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ stockStatus?: string }>;
}) {
  const { stockStatus } = await searchParams;
  const stockFilter = STOCK_FILTERS.some((f) => f.value === stockStatus)
    ? (stockStatus as StockStatus)
    : undefined;

  const products = await db.product.findMany({
    where: stockFilter ? { stockStatus: stockFilter } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Kelola Produk
          </h1>
          <p className="mt-1 text-sm text-muted">
            Stok produk yang tampil di katalog publik.
          </p>
        </div>
        <Button variant="primary" size="md" href="/admin/produk/tambah">
          <Plus className="size-4" aria-hidden="true" />
          Tambah Produk
        </Button>
      </div>

      {/* Stock filter chips */}
      <div className="flex flex-wrap gap-2">
        {STOCK_FILTERS.map((filter) => {
          const active = (stockStatus ?? "") === filter.value;
          return (
            <Link
              key={filter.value || "all"}
              href={
                filter.value
                  ? `/admin/produk?stockStatus=${filter.value}`
                  : "/admin/produk"
              }
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                active
                  ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                  : "border-line bg-white text-muted hover:border-primary-300 hover:text-ink"
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="card py-12 text-center">
          <EmptyState
            icon={Package}
            title="Belum ada produk"
            description="Tambahkan produk baru atau konversi listing yang sudah deal."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Mobile card list */}
          <ul className="divide-y divide-line sm:hidden">
            {products.map((product) => {
              const photo = parseProductPhotos(product.photos)[0];
              const stock = STOCK_BADGE[product.stockStatus];
              return (
                <li key={product.id} className="flex gap-3 p-4">
                  <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo}
                        alt={product.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Package className="size-5 text-primary-200" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {product.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {product.brand} · {product.model} · {product.storage}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold tabular-nums text-ink">
                        {formatIDR(product.price)}
                      </span>
                      <Badge variant={stock.variant}>{stock.label}</Badge>
                      <span className="text-xs text-muted">
                        {formatDate(product.createdAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        href={`/admin/produk/tambah?id=${product.id}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                        Edit
                      </Button>
                      <ProductDeleteButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="px-4 py-3 font-semibold text-muted">Produk</th>
                  <th className="px-4 py-3 font-semibold text-muted">Kondisi</th>
                  <th className="px-4 py-3 font-semibold text-muted">Harga</th>
                  <th className="px-4 py-3 font-semibold text-muted">Stok</th>
                  <th className="px-4 py-3 font-semibold text-muted">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const photo = parseProductPhotos(product.photos)[0];
                  const stock = STOCK_BADGE[product.stockStatus];
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface">
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photo}
                                alt={product.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <Package className="size-5 text-primary-200" aria-hidden="true" />
                            )}
                          </span>
                          <div>
                            <p className="font-medium text-ink">{product.name}</p>
                            <p className="text-xs text-muted">
                              {product.brand} · {product.model} · {product.storage}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ConditionBadge condition={product.condition} />
                      </td>
                      <td className="px-4 py-3 tabular-nums font-semibold text-ink">
                        {formatIDR(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={stock.variant}>{stock.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            href={`/admin/produk/tambah?id=${product.id}`}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                            Edit
                          </Button>
                          <ProductDeleteButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}