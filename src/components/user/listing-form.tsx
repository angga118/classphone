"use client";

import { useRef, useState, useCallback } from "react";

import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"] as const;

const CONDITION_OPTIONS = [
  { value: "MINT", label: "Mulus" },
  { value: "NORMAL", label: "Normal" },
  { value: "DAMAGED", label: "Rusak" },
] as const;

const COMPLETENESS_OPTIONS = [
  "Box",
  "Charger",
  "Dus",
  "Kabel",
  "Nota",
  "Bonus",
] as const;

const MAX_PHOTOS = 5;
const MIN_PHOTOS = 3;
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.7;
const MAX_RAW_SIZE = 5 * 1024 * 1024; // 5 MB before compression

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error(`${file.name} bukan file gambar.`));
      return;
    }
    if (file.size > MAX_RAW_SIZE) {
      reject(
        new Error(
          `${file.name} terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maks 5 MB sebelum kompresi.`
        )
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Gagal memproses gambar."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error("Gagal membaca gambar."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ListingForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("");
  const [condition, setCondition] = useState("");
  const [completeness, setCompleteness] = useState<string[]>([]);
  const [askingPrice, setAskingPrice] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const toggleCompleteness = (item: string) => {
    setCompleteness((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = MAX_PHOTOS - photos.length;
      if (remaining <= 0) return;

      setCompressing(true);
      setError(null);

      const toProcess = Array.from(files).slice(0, remaining);
      const results: string[] = [];
      const errors: string[] = [];

      for (const file of toProcess) {
        try {
          const compressed = await compressImage(file);
          results.push(compressed);
        } catch (err) {
          errors.push((err as Error).message);
        }
      }

      if (errors.length > 0) {
        setError(errors.join(" "));
      }
      if (results.length > 0) {
        setPhotos((prev) => [...prev, ...results]);
      }
      setCompressing(false);
    },
    [photos.length]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (photos.length < MIN_PHOTOS) {
      setError(`Minimal ${MIN_PHOTOS} foto diperlukan.`);
      return;
    }

    setLoading(true);

    try {
      const body = {
        brand: brand.trim(),
        model: model.trim(),
        storage,
        condition,
        completeness,
        description: description.trim() || undefined,
        photos,
        askingPrice: askingPrice ? Number(askingPrice) : undefined,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim listing.");
        setLoading(false);
        return;
      }

      router.push("/dashboard?success=1");
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Brand & Model */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="brand">
            Brand <span className="text-danger">*</span>
          </Label>
          <Input
            id="brand"
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Apple, Samsung"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model">
            Model <span className="text-danger">*</span>
          </Label>
          <Input
            id="model"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. iPhone 15 Pro Max"
          />
        </div>
      </div>

      {/* Storage & Condition */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="storage">
            Storage <span className="text-danger">*</span>
          </Label>
          <Select
            id="storage"
            required
            value={storage}
            onChange={(e) => setStorage(e.target.value)}
          >
            <option value="">Pilih storage</option>
            {STORAGE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="condition">
            Kondisi <span className="text-danger">*</span>
          </Label>
          <Select
            id="condition"
            required
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Pilih kondisi</option>
            {CONDITION_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Asking Price */}
      <div className="space-y-1.5">
        <Label htmlFor="askingPrice">Harga yang diinginkan (opsional)</Label>
        <Input
          id="askingPrice"
          type="number"
          min={0}
          value={askingPrice}
          onChange={(e) => setAskingPrice(e.target.value)}
          placeholder="e.g. 5000000"
        />
      </div>

      {/* Completeness */}
      <div className="space-y-2">
        <Label>Kelengkapan</Label>
        <div className="flex flex-wrap gap-2">
          {COMPLETENESS_OPTIONS.map((item) => {
            const active = completeness.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleCompleteness(item)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                  active
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-line bg-white text-muted hover:border-primary-300 hover:text-ink"
                }`}
              >
                {active && <Check className="size-3.5" aria-hidden="true" />}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi Kondisi HP</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Jelaskan kondisi fisik HP, misal: goresan, baterai, kelengkapan, riwayat servis, dll."
        />
      </div>

      {/* Photos */}
      <div className="space-y-2">
        <Label>
          Foto <span className="text-danger">*</span>{" "}
          <span className="text-xs font-normal text-muted">
            (min {MIN_PHOTOS}, maks {MAX_PHOTOS})
          </span>
        </Label>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 transition-colors ${
            dragOver
              ? "border-primary-500 bg-primary-50"
              : "border-line bg-surface hover:border-primary-300"
          }`}
        >
          {compressing ? (
            <Loader2 className="size-8 text-primary-500 animate-spin" />
          ) : (
            <Camera className="size-8 text-muted" aria-hidden="true" />
          )}
          <p className="text-sm font-medium text-ink">
            {compressing
              ? "Memproses foto..."
              : "Klik atau seret foto ke sini"}
          </p>
          <p className="text-xs text-muted">
            JPG/PNG, maks 5 MB per foto sebelum kompresi
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Thumbnail grid */}
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Foto ${i + 1}`}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Hapus foto ${i + 1}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length > 0 && photos.length < MIN_PHOTOS && (
          <p className="text-xs text-warning">
            Minimal {MIN_PHOTOS} foto diperlukan. ({photos.length}/{MIN_PHOTOS})
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={loading || compressing}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            "Kirim Listing"
          )}
        </Button>
      </div>
    </form>
  );
}
