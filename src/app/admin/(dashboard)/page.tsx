import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Package,
  Plus,
  ReceiptText,
} from "lucide-react";
import { db } from "@/lib/db";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalListings, pendingListings, availableProducts, transactionsThisMonth, recentListings] =
    await Promise.all([
      db.listing.count(),
      db.listing.count({ where: { status: "PENDING_REVIEW" } }),
      db.product.count({ where: { stockStatus: "AVAILABLE" } }),
      db.transaction.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.listing.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
    ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Ringkasan aktivitas marketplace GadgetHub.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="md" href="/admin/produk/tambah">
            <Plus className="size-4" aria-hidden="true" />
            Tambah Produk
          </Button>
          <Button variant="outline" size="md" href="/admin/listing-masuk">
            Review Listing
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Listing Masuk"
          value={totalListings}
          hint="Total pengajuan jual"
          accent="primary"
        />
        <StatCard
          icon={ReceiptText}
          label="Menunggu Review"
          value={pendingListings}
          hint="Perlu ditindaklanjuti"
          accent="warning"
        />
        <StatCard
          icon={Package}
          label="Produk Tersedia"
          value={availableProducts}
          hint="Tampil di katalog"
          accent="success"
        />
        <StatCard
          icon={CheckCircle2}
          label="Transaksi Bulan Ini"
          value={transactionsThisMonth}
          hint="Sejak awal bulan"
          accent="neutral"
        />
      </div>

      {/* Recent listings */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Listing Terbaru</h2>
          <Link
            href="/admin/listing-masuk"
            className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-800"
          >
            Lihat Semua →
          </Link>
        </div>

        {recentListings.length === 0 ? (
          <div className="card mt-4 py-12 text-center">
            <EmptyState
              icon={ClipboardList}
              title="Belum ada listing"
              description="Pengajuan jual dari user akan muncul di sini."
            />
          </div>
        ) : (
          <div className="card mt-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface">
                    <th className="px-4 py-3 font-semibold text-muted">HP</th>
                    <th className="px-4 py-3 font-semibold text-muted">User</th>
                    <th className="px-4 py-3 font-semibold text-muted">Status</th>
                    <th className="px-4 py-3 font-semibold text-muted">Tanggal</th>
                    <th className="px-4 py-3 font-semibold text-muted">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-ink">
                        {listing.brand} {listing.model}
                        <span className="block text-xs text-muted">
                          {listing.storage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {listing.user.name}
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
      </section>
    </div>
  );
}