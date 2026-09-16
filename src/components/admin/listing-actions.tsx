"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  PackagePlus,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ListingStatus } from "@/generated/prisma/enums";

interface ListingActionsProps {
  listingId: string;
  status: ListingStatus;
  dealPrice: number | null;
  hasProduct: boolean;
  productId: string | null;
}

export function ListingActions({
  listingId,
  status,
  dealPrice,
  hasProduct,
  productId,
}: ListingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dealPriceInput, setDealPriceInput] = useState(
    dealPrice ? String(dealPrice) : ""
  );
  const [rejectNote, setRejectNote] = useState("");
  const [converted, setConverted] = useState<{
    id: string;
    name: string;
  } | null>(null);

  async function patch(body: Record<string, unknown>, successMsg: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memperbarui listing.");
        setLoading(false);
        return;
      }
      setSuccess(successMsg);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    }
    setLoading(false);
  }

  async function handleApprove() {
    if (!confirm("Setujui listing ini?")) return;
    await patch({ status: "APPROVED" }, "Listing disetujui.");
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectNote.trim()) {
      setError("Tuliskan alasan penolakan terlebih dahulu.");
      return;
    }
    await patch(
      { status: "REJECTED", adminNote: rejectNote.trim() },
      "Listing ditolak."
    );
  }

  async function handleDeal(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(dealPriceInput);
    if (!price || price <= 0) {
      setError("Masukkan harga deal yang valid.");
      return;
    }
    await patch(
      { status: "DEAL", dealPrice: price },
      "Listing ditandai DEAL."
    );
  }

  async function handleComplete() {
    if (!confirm("Tandai listing ini sebagai SELESAI?")) return;
    await patch({ status: "COMPLETED" }, "Listing ditandai selesai.");
  }

  async function handleConvert() {
    if (!confirm("Konversi listing ini menjadi produk di katalog?")) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/products/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengonversi listing.");
        setLoading(false);
        return;
      }
      setConverted({ id: data.id, name: data.name });
      setSuccess("Produk berhasil dibuat dari listing ini.");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    }
    setLoading(false);
  }

  const showApprove = status === "PENDING_REVIEW";
  const showReject = status === "PENDING_REVIEW";
  const showDeal = status === "APPROVED";
  const showComplete = status === "DEAL";
  const showConvert = status === "DEAL" || status === "COMPLETED";

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-success/20 bg-success-soft px-4 py-3 text-sm font-medium text-success"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {success}
        </div>
      ) : null}

      {converted ? (
        <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <PackagePlus className="size-4 text-primary-600" aria-hidden="true" />
            Produk berhasil dibuat
          </p>
          <p className="mt-1 text-sm text-muted">{converted.name}</p>
          <Button
            variant="primary"
            size="sm"
            href={`/admin/produk/tambah?id=${converted.id}`}
            className="mt-3"
          >
            Kelola Produk
          </Button>
        </div>
      ) : null}

      {hasProduct && productId ? (
        <div className="rounded-xl border border-success/20 bg-success-soft/60 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldCheck className="size-4 text-success" aria-hidden="true" />
            Sudah dikonversi menjadi produk
          </p>
          <Button
            variant="outline"
            size="sm"
            href={`/admin/produk/tambah?id=${productId}`}
            className="mt-3"
          >
            Lihat Produk
          </Button>
        </div>
      ) : null}

      {/* Setujui (PENDING_REVIEW → APPROVED) */}
      {showApprove ? (
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-ink">Setujui Listing</h3>
          <p className="mt-0.5 text-xs text-muted">
            Setujui listing ini agar penjual bisa melanjutkan proses jual.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-3"
            onClick={handleApprove}
            disabled={loading}
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            Setujui
          </Button>
        </div>
      ) : null}

      {/* Tolak (PENDING_REVIEW → REJECTED) */}
      {showReject ? (
        <form
          onSubmit={handleReject}
          className="rounded-2xl border border-line bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-ink">Tolak Listing</h3>
          <p className="mt-0.5 text-xs text-muted">
            Tuliskan alasan penolakan yang akan dilihat penjual.
          </p>
          <div className="mt-3 space-y-3">
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Foto kurang jelas, mohon kirim ulang foto kondisi HP."
              rows={3}
            />
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={loading}
            >
              <XCircle className="size-4" aria-hidden="true" />
              Tolak Listing
            </Button>
          </div>
        </form>
      ) : null}

      {/* Tandai Deal (APPROVED → DEAL) */}
      {showDeal ? (
        <form
          onSubmit={handleDeal}
          className="rounded-2xl border border-line bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-ink">Tandai Deal</h3>
          <p className="mt-0.5 text-xs text-muted">
            Catat harga yang disepakati dengan penjual melalui WhatsApp.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="dealPrice">Harga Deal (Rp)</Label>
              <Input
                id="dealPrice"
                type="number"
                min={0}
                value={dealPriceInput}
                onChange={(e) => setDealPriceInput(e.target.value)}
                placeholder="e.g. 4500000"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Tandai Deal
            </Button>
          </div>
        </form>
      ) : null}

      {/* Tandai Selesai (DEAL → COMPLETED) */}
      {showComplete ? (
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-ink">Tandai Selesai</h3>
          <p className="mt-0.5 text-xs text-muted">
            Transaksi telah selesai dilakukan. Listing ditutup.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-3"
            onClick={handleComplete}
            disabled={loading}
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Tandai Selesai
          </Button>
        </div>
      ) : null}

      {/* Convert ke Produk (DEAL / COMPLETED) */}
      {showConvert ? (
        <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5">
          <h3 className="text-sm font-bold text-ink">Convert ke Produk</h3>
          <p className="mt-0.5 text-xs text-muted">
            Jadikan listing ini produk yang tampil di katalog publik.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-3"
            onClick={handleConvert}
            disabled={loading}
          >
            <PackagePlus className="size-4" aria-hidden="true" />
            Convert ke Produk
          </Button>
        </div>
      ) : null}

      {!showApprove &&
      !showReject &&
      !showDeal &&
      !showComplete &&
      !showConvert ? (
        <div className="rounded-2xl border border-line bg-white p-5 text-sm text-muted shadow-sm">
          Tidak ada aksi yang tersedia untuk status ini.
        </div>
      ) : null}
    </div>
  );
}

export default ListingActions;
