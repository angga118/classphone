import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Package,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatIDR } from "@/components/shared/price";
import { StatusBadge } from "@/components/shared/status-badge";
import { PhotoGallery } from "@/components/shared/photo-gallery";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseListingPhotos(photos: string): string[] {
  try {
    const parsed = JSON.parse(photos);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (p): p is string => typeof p === "string" && p.length > 0
      );
    }
  } catch {
    // fall through
  }
  return [];
}

function parseCompleteness(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((c): c is string => typeof c === "string");
    }
  } catch {
    // fall through
  }
  return [];
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Listing ${id.slice(0, 8)}` };
}

export default async function ListingDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) notFound();

  const { id } = await params;

  const listing = await db.listing.findUnique({
    where: { id },
  });

  if (!listing) notFound();
  if (listing.userId !== session.user.id) notFound();

  const photos = parseListingPhotos(listing.photos);
  const completeness = parseCompleteness(listing.completeness);

  // Build WhatsApp link for PENDING_REVIEW / APPROVED / DEAL / COMPLETED
  let waPhone: string | null = null;
  let waMessage: string | null = null;
  if (
    listing.status === "PENDING_REVIEW" ||
    listing.status === "APPROVED" ||
    listing.status === "DEAL" ||
    listing.status === "COMPLETED"
  ) {
    const settings = await db.settings.findUnique({
      where: { id: "default" },
    });
    const template =
      settings?.messageTemplateJual ??
      "Halo Admin, saya ingin konfirmasi penjualan {nama_hp} (ID Listing: {kode}) dengan harga disepakati Rp {harga}. Mohon info langkah selanjutnya.";
    const namaHp = `${listing.brand} ${listing.model}`;
    const harga = (listing.dealPrice ?? listing.askingPrice ?? 0).toLocaleString("id-ID");
    waMessage = template
      .replace(/\{nama_hp\}/g, namaHp)
      .replace(/\{kode\}/g, listing.id)
      .replace(/\{harga\}/g, harga);
    waPhone = settings?.adminWhatsappNumber ?? "6281234567890";
  }

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke Dashboard
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {listing.brand} {listing.model}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {listing.storage} · {formatDate(listing.createdAt)}
            </p>
          </div>
          <StatusBadge status={listing.status} />
        </div>

        {/* Photo gallery */}
        {photos.length > 0 && (
          <div className="mt-8">
            <PhotoGallery
              photos={photos}
              alt={`${listing.brand} ${listing.model}`}
            />
          </div>
        )}

        {/* Details card */}
        <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-ink">Detail Listing</h2>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted">Brand</dt>
              <dd className="mt-0.5 font-semibold text-ink">{listing.brand}</dd>
            </div>
            <div>
              <dt className="text-muted">Model</dt>
              <dd className="mt-0.5 font-semibold text-ink">{listing.model}</dd>
            </div>
            <div>
              <dt className="text-muted">Storage</dt>
              <dd className="mt-0.5 font-semibold text-ink">
                {listing.storage}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Kondisi</dt>
              <dd className="mt-0.5 font-semibold text-ink">
                {listing.condition === "MINT"
                  ? "Mulus"
                  : listing.condition === "NORMAL"
                    ? "Normal"
                    : "Rusak"}
              </dd>
            </div>
            {listing.askingPrice && (
              <div>
                <dt className="text-muted">Harga yang Diinginkan</dt>
                <dd className="mt-0.5 font-bold text-primary-900">
                  {formatIDR(listing.askingPrice)}
                </dd>
              </div>
            )}
            {listing.dealPrice != null && (
              <div>
                <dt className="text-muted">Harga Deal</dt>
                <dd className="mt-0.5 font-bold text-info-700">
                  {formatIDR(listing.dealPrice)}
                </dd>
              </div>
            )}
          </dl>

          {/* Completeness */}
          {completeness.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Kelengkapan
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {completeness.map((item) => (
                  <Badge key={item} variant="neutral">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Deskripsi Kondisi
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {listing.description}
              </p>
            </div>
          )}
        </div>

        {/* Admin note (for rejected) */}
        {listing.status === "REJECTED" && listing.adminNote && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger-soft p-5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-bold text-danger">Ditolak</p>
              <p className="mt-1 text-sm leading-relaxed text-danger/80">
                {listing.adminNote}
              </p>
            </div>
          </div>
        )}

        {/* Chat Admin via WhatsApp */}
        {(listing.status === "PENDING_REVIEW" ||
          listing.status === "APPROVED" ||
          listing.status === "DEAL" ||
          listing.status === "COMPLETED") && waPhone && waMessage && (
          <div className="mt-6 rounded-2xl border border-wa/20 bg-wa-soft p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-wa text-white shadow-sm">
                <Package className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink">
                  {listing.status === "DEAL"
                    ? "Deal!"
                    : listing.status === "COMPLETED"
                      ? "Transaksi Selesai"
                      : listing.status === "APPROVED"
                        ? "Listing Disetujui"
                        : "Menunggu Review"}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  Hubungi admin via WhatsApp untuk melanjutkan.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <WhatsAppButton
                phone={waPhone}
                message={waMessage}
                label="Chat Admin via WhatsApp"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
