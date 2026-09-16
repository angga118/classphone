"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SettingsData {
  adminWhatsappNumber: string;
  messageTemplateJual: string;
  messageTemplateBeli: string;
}

const SAMPLE = {
  nama_hp: "iPhone 15 Pro Max",
  kode: "GH-8f3k2a",
  harga: "12.500.000",
};

function renderTemplate(template: string): string {
  return template
    .replaceAll("{nama_hp}", SAMPLE.nama_hp)
    .replaceAll("{kode}", SAMPLE.kode)
    .replaceAll("{harga}", SAMPLE.harga);
}

export default function AdminPengaturanPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsData>({
    adminWhatsappNumber: "",
    messageTemplateJual: "",
    messageTemplateBeli: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Gagal memuat pengaturan.");
        } else {
          setSettings({
            adminWhatsappNumber: data.adminWhatsappNumber ?? "",
            messageTemplateJual: data.messageTemplateJual ?? "",
            messageTemplateBeli: data.messageTemplateBeli ?? "",
          });
        }
      } catch {
        setError("Terjadi kesalahan jaringan. Coba lagi.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan pengaturan.");
        setSaving(false);
        return;
      }
      setSettings({
        adminWhatsappNumber: data.adminWhatsappNumber ?? settings.adminWhatsappNumber,
        messageTemplateJual: data.messageTemplateJual ?? settings.messageTemplateJual,
        messageTemplateBeli: data.messageTemplateBeli ?? settings.messageTemplateBeli,
      });
      setSuccess("Pengaturan berhasil disimpan.");
      setSaving(false);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setSaving(false);
    }
  }

  const previewJual = renderTemplate(settings.messageTemplateJual);
  const previewBeli = renderTemplate(settings.messageTemplateBeli);
  const waLink = `https://wa.me/${settings.adminWhatsappNumber}?text=${encodeURIComponent(previewBeli)}`;

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-primary-600" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
          <SettingsIcon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Pengaturan
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Nomor WhatsApp admin & template pesan otomatis.
          </p>
        </div>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* WhatsApp number */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-ink">Nomor WhatsApp Admin</h2>
          <p className="mt-1 text-xs text-muted">
            Format internasional tanpa tanda +, contoh: 6281234567890
          </p>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="adminWhatsappNumber">Nomor WhatsApp</Label>
            <Input
              id="adminWhatsappNumber"
              value={settings.adminWhatsappNumber}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  adminWhatsappNumber: e.target.value,
                }))
              }
              placeholder="6281234567890"
            />
          </div>
        </div>

        {/* Template jual */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-ink">Template Pesan Jual</h2>
          <p className="mt-1 text-xs text-muted">
            Placeholder: {"{nama_hp}"}, {"{kode}"}, {"{harga}"}
          </p>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="messageTemplateJual">Pesan Konfirmasi Jual</Label>
            <Textarea
              id="messageTemplateJual"
              value={settings.messageTemplateJual}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  messageTemplateJual: e.target.value,
                }))
              }
              rows={4}
            />
          </div>
        </div>

        {/* Template beli */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-ink">Template Pesan Beli</h2>
          <p className="mt-1 text-xs text-muted">
            Placeholder: {"{nama_hp}"}, {"{kode}"}, {"{harga}"}
          </p>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="messageTemplateBeli">Pesan Beli Produk</Label>
            <Textarea
              id="messageTemplateBeli"
              value={settings.messageTemplateBeli}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  messageTemplateBeli: e.target.value,
                }))
              }
              rows={4}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="card border-primary-100 bg-primary-50/40 p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <MessageCircle className="size-4 text-wa" aria-hidden="true" />
            Pratinjau
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Link wa.me
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all text-sm font-medium text-primary-700 hover:underline"
              >
                {waLink}
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Contoh pesan jual
              </p>
              <p className="mt-1 rounded-xl bg-white p-3 text-sm leading-relaxed text-ink shadow-sm">
                {previewJual || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Contoh pesan beli
              </p>
              <p className="mt-1 rounded-xl bg-white p-3 text-sm leading-relaxed text-ink shadow-sm">
                {previewBeli || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end border-t border-line pt-6">
          <Button
            type="submit"
            size="lg"
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden="true" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}