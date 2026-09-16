import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatIDR } from "@/components/shared/price";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Listing Masuk",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "PENDING_REVIEW", label: "Menunggu Review" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "DEAL", label: "Deal" },
  { value: "COMPLETED", label: "Selesai" },
];

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}

export default async function ListingMasukPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = STATUS_FILTERS.some((f) => f.value === status)
    ? (status as ListingStatus)
    : undefined;

  const listings = await db.listing.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Listing Masuk
        </h1>
        <p className="mt-1 text-sm text-muted">
          Kelola pengajuan jual HP dari user.
        </p>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const active = (status ?? "") === filter.value;
          return (
            <Link
              key={filter.value || "all"}
              href={filter.value ? `/admin/listing-masuk?status=${filter.value}` : "/admin/listing-masuk"}
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

      {/* Table */}
      {listings.length === 0 ? (
        <div className="card py-12 text-center">
          <EmptyState
            icon={ClipboardList}
            title="Tidak ada listing"
            description="Belum ada pengajuan jual pada filter ini."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="px-4 py-3 font-semibold text-muted">ID</th>
                  <th className="px-4 py-3 font-semibold text-muted">HP</th>
                  <th className="px-4 py-3 font-semibold text-muted">User</th>
                  <th className="px-4 py-3 font-semibold text-muted">Harga Minta</th>
                  <th className="px-4 py-3 font-semibold text-muted">Status</th>
                  <th className="px-4 py-3 font-semibold text-muted">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {shortId(listing.id)}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {listing.brand} {listing.model}
                      <span className="block text-xs text-muted">
                        {listing.storage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{listing.user.name}</td>
                    <td className="px-4 py-3 tabular-nums text-ink">
                      {listing.askingPrice ? formatIDR(listing.askingPrice) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={listing.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(listing.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/listing-masuk/${listing.id}`}
                        className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-800"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}