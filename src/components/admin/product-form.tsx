"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/generated/prisma/client";
import { parseProductPhotos } from "@/components/shared/product-card";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"] as const;

const CONDITION_OPTIONS = [
  { value: "NEW", label: "Baru" },
  { value: "LIKE_NEW", label: "Seperti Baru" },
  { value: "USED", label: "Bekas" },
] as const;

const STOCK_OPTIONS = [
  { value: "AVAILABLE", label: "Tersedia" },
  { value: "BOOKED", label: "Dipesan" },
  { value: "SOLD", label: "Terjual" },
  { value: "DRAFT", label: "Draft" },
] as const;

const MAX_PHOTOS = 5;
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

interface ProductFormProps {
  product?: Product | null;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [model, setModel] = useState(product?.model ?? "");
  const [storage, setStorage] = useState(product?.storage ?? "");
  const [condition, setCondition] = useState(product?.condition ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stockStatus, setStockStatus] = useState<string>(
    product?.stockStatus ?? "AVAILABLE"
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [photos, setPhotos] = useState<string[]>(
    product ? parseProductPhotos(product.photos) : []
  );

  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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

    if (photos.length === 0) {
      setError("Minimal 1 foto diperlukan.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Harga harus lebih dari 0.");
      return;
    }

    setLoading(true);

    const body = {
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      storage,
      condition,
      price: Number(price),
      stockStatus,
      description: description.trim() || undefined,
      photos,
    };

    try {
      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan produk.");
        setLoading(false);
        return;
      }

      router.push("/admin/produk");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      ) : null}

      {/* Nama & Brand */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Nama Produk <span className="text-danger">*</span>
          </Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. iPhone 15 Pro Max"
          />
        </div>
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
      </div>

      {/* Model & Storage */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="model">
            Model <span className="text-danger">*</span>
          </Label>
          <Input
            id="model"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Pro Max"
          />
        </div>
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
      </div>

      {/* Kondisi & Harga */}
      <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="space-y-1.5">
          <Label htmlFor="price">
            Harga (Rp) <span className="text-danger">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 5000000"
          />
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-1.5">
        <Label htmlFor="stockStatus">Status Stok</Label>
        <Select
          id="stockStatus"
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
        >
          {STOCK_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Deskripsi */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kondisi fisik, kelengkapan, riwayat pemakaian, dll."
          rows={4}
        />
      </div>

      {/* Foto */}
      <div className="space-y-2">
        <Label>
          Foto <span className="text-danger">*</span>{" "}
          <span className="text-xs font-normal text-muted">
            (maks {MAX_PHOTOS} foto)
          </span>
        </Label>

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
            <Loader2 className="size-8 animate-spin text-primary-500" />
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

        {photos.length > 0 ? (
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
                  className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label={`Hapus foto ${i + 1}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Submit */}
      <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
        <Button variant="outline" href="/admin/produk" className="sm:w-auto">
          Batal
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={loading || compressing}
          className="sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Menyimpan...
            </>
          ) : isEdit ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Simpan Perubahan
            </>
          ) : (
            "Tambah Produk"
          )}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;