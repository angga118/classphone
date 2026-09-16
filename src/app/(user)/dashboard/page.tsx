import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  History,
  ListChecks,
  Smartphone,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatIDR } from "@/components/shared/price";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) notFound();

  const [listings, transactions] = await Promise.all([
    db.listing.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    db.transaction.findMany({
      where: { userId: session.user.id },
      include: {
        listing: { select: { brand: true, model: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Halo, {session.user.name ?? "Pengguna"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Kelola listing dan riwayat transaksi kamu.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="md" href="/jual-hp">
              <Smartphone className="size-4" aria-hidden="true" />
              Jual HP Kamu
            </Button>
            <Button variant="outline" size="md" href="/pengaturan">
              Pengaturan
            </Button>
          </div>
        </div>

        {/* Success banner */}
        <div id="success-banner" className="mt-6 hidden">
          <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success-soft px-4 py-3 text-sm font-medium text-success">
            Listing berhasil dikirim! Tim kami akan segera mereview.
          </div>
        </div>

        {/* ---------- Listings Section ---------- */}
        <section className="mt-10">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-100">
              <ListChecks className="size-4 text-primary-700" />
            </span>
            <h2 className="text-lg font-bold text-ink">Listing Saya</h2>
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">
              {listings.length}
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-white py-12 text-center">
              <EmptyState
                icon={Smartphone}
                title="Belum ada listing"
                description="Mulai jual HP kamu sekarang!"
              />
              <Button
                variant="primary"
                size="md"
                href="/jual-hp"
                className="mt-6"
              >
                Jual HP Kamu
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/dashboard/listing/${listing.id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-ink">
                        {listing.brand} {listing.model}
                      </p>
                      <p className="text-xs text-muted">
                        {listing.storage}
                        {listing.askingPrice
                          ? ` · ${formatIDR(listing.askingPrice)}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={listing.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">
                      {formatDate(listing.createdAt)}
                    </span>
                    <span className="text-xs font-semibold text-primary-600">
                      Lihat Detail →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ---------- Transactions Section ---------- */}
        <section className="mt-12">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-100">
              <History className="size-4 text-primary-700" />
            </span>
            <h2 className="text-lg font-bold text-ink">Riwayat Transaksi</h2>
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">
              {transactions.length}
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-white py-12 text-center">
              <EmptyState
                icon={History}
                title="Belum ada transaksi"
                description="Riwayat transaksi kamu akan muncul di sini."
              />
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-surface">
                      <th className="px-4 py-3 font-semibold text-muted">
                        Tipe
                      </th>
                      <th className="px-4 py-3 font-semibold text-muted">
                        Produk
                      </th>
                      <th className="px-4 py-3 font-semibold text-muted">
                        Harga
                      </th>
                      <th className="px-4 py-3 font-semibold text-muted">
                        Status
                      </th>
                      <th className="px-4 py-3 font-semibold text-muted">
                        Tanggal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const productName = tx.listing
                        ? `${tx.listing.brand} ${tx.listing.model}`
                        : tx.product?.name ?? "—";
                      return (
                        <tr
                          key={tx.id}
                          className="border-b border-line last:border-0"
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                tx.type === "SELL"
                                  ? "bg-primary-50 text-primary-700"
                                  : "bg-wa-soft text-wa-dark"
                              }`}
                            >
                              {tx.type === "SELL" ? "Jual" : "Beli"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-ink">
                            {productName}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-ink">
                            {formatIDR(tx.finalPrice)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                tx.status === "COMPLETED"
                                  ? "bg-success-soft text-success"
                                  : tx.status === "CANCELLED"
                                    ? "bg-danger-soft text-danger"
                                    : "bg-warning-soft text-amber-600"
                              }`}
                            >
                              {tx.status === "COMPLETED"
                                ? "Selesai"
                                : tx.status === "CANCELLED"
                                  ? "Dibatalkan"
                                  : "Proses"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {formatDate(tx.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
