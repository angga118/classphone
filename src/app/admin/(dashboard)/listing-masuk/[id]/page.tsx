import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import { parseProductPhotos } from "@/components/shared/product-card";
import { PhotoGallery } from "@/components/shared/photo-gallery";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatIDR } from "@/components/shared/price";
import { ListingActions } from "@/components/admin/listing-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ListingCondition, ListingStatus } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "Detail Listing",
};

const CONDITION_LABEL: Record<ListingCondition, string> = {
  MINT: "Mulus",
  NORMAL: "Normal",
  DAMAGED: "Rusak",
};

const FLOW: ListingStatus[] = [
  "PENDING_REVIEW",
  "APPROVED",
  "DEAL",
  "COMPLETED",
];

const FLOW_LABEL: Record<ListingStatus, string> = {
  PENDING_REVIEW: "Menunggu Review",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  DEAL: "Deal",
  COMPLETED: "Selesai",
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function parseCompleteness(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((c): c is string => typeof c === "string")
      : [];
  } catch {
    return [];
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      product: { select: { id: true, name: true } },
    },
  });

  if (!listing) notFound();

  const photos = parseProductPhotos(listing.photos);
  const completeness = parseCompleteness(listing.completeness);
  const currentIndex = FLOW.indexOf(listing.status);
  const isRejected = listing.status === "REJECTED";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Back link */}
      <Link
        href="/admin/listing-masuk"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary-700"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke Listing Masuk
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {listing.brand} {listing.model}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {listing.storage} · Diajukan {formatDate(listing.createdAt)}
          </p>
        </div>
        <StatusBadge status={listing.status} className="self-start sm:self-auto" />
      </div>

      {/* Rejected banner */}
      {isRejected && listing.adminNote ? (
        <div className="rounded-2xl border border-danger/20 bg-danger-soft p-5">
          <p className="text-sm font-bold text-danger">Alasan Penolakan</p>
          <p className="mt-1 text-sm leading-relaxed text-ink">
            {listing.adminNote}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Gallery */}
          <PhotoGallery photos={photos} alt={`${listing.brand} ${listing.model}`} />

          {/* Info card */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">Detail Unit</h2>
            <dl className="mt-4 divide-y divide-line">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted">Brand</dt>
                <dd className="text-sm font-bold text-ink">{listing.brand}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted">Model</dt>
                <dd className="text-sm font-bold text-ink">{listing.model}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted">Storage</dt>
                <dd className="text-sm font-bold text-ink">{listing.storage}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted">Kondisi</dt>
                <dd className="text-sm font-bold text-ink">
                  {CONDITION_LABEL[listing.condition]}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted">Harga Minta</dt>
                <dd className="text-sm font-bold text-ink">
                  {listing.askingPrice ? formatIDR(listing.askingPrice) : "—"}
                </dd>
              </div>
              {listing.dealPrice != null ? (
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-muted">Harga Deal</dt>
                  <dd className="text-sm font-bold text-primary-700">
                    {formatIDR(listing.dealPrice)}
                  </dd>
                </div>
              ) : null}
            </dl>

            {/* Completeness */}
            <div className="mt-4">
              <p className="text-sm font-semibold text-ink">Kelengkapan</p>
              {completeness.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {completeness.map((item) => (
                    <Badge key={item} variant="neutral">
                      <Check className="size-3.5 text-success" aria-hidden="true" />
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted">Tidak ada data kelengkapan.</p>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-ink">Deskripsi User</p>
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  {listing.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* User info */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">Informasi Penjual</h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <UserIcon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{listing.user.name}</p>
                <p className="text-xs text-muted">{listing.user.email}</p>
              </div>
            </div>
            {listing.user.phone ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <Phone className="size-4 text-primary-600" aria-hidden="true" />
                {listing.user.phone}
              </p>
            ) : null}
            {listing.user.phone ? (
              <a
                href={`https://wa.me/${listing.user.phone.replace(/^0/, "62")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-wa px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-wa-dark"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Chat Penjual
              </a>
            ) : null}
          </div>

          {/* Timeline */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">Timeline Status</h2>
            {isRejected ? (
              <p className="mt-3 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
                Listing ditolak oleh admin.
              </p>
            ) : (
              <ol className="mt-4 space-y-0">
                {FLOW.map((step, i) => {
                  const reached = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  return (
                    <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
                      {i < FLOW.length - 1 ? (
                        <span
                          className={cn(
                            "absolute left-[11px] top-6 h-full w-0.5",
                            i < currentIndex ? "bg-primary-500" : "bg-line"
                          )}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className={cn(
                          "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                          reached
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-line bg-white text-muted"
                        )}
                      >
                        {reached ? (
                          <Check className="size-3.5" aria-hidden="true" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-line" />
                        )}
                      </span>
                      <div className="pt-0.5">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            isCurrent ? "text-primary-700" : reached ? "text-ink" : "text-muted"
                          )}
                        >
                          {FLOW_LABEL[step]}
                        </p>
                        {isCurrent ? (
                          <p className="text-xs text-muted">Status saat ini</p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Actions */}
          <div className="card p-5 sm:p-6">
            <h2 className="text-base font-bold text-ink">Aksi Admin</h2>
            <div className="mt-4">
              <ListingActions
                listingId={listing.id}
                status={listing.status}
                dealPrice={listing.dealPrice}
                hasProduct={!!listing.product}
                productId={listing.product?.id ?? null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
