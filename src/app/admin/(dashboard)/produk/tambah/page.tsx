import type { Metadata } from "next";
import { Package, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Tambah / Edit Produk",
};

export default async function TambahProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  let product = null;
  if (id) {
    product = await db.product.findUnique({ where: { id } });
  }

  const isEdit = !!product;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
          {isEdit ? (
            <Pencil className="size-5" aria-hidden="true" />
          ) : (
            <Package className="size-5" aria-hidden="true" />
          )}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {isEdit ? "Edit Produk" : "Tambah Produk"}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {isEdit
              ? "Perbarui detail produk yang tampil di katalog."
              : "Tambahkan produk baru ke katalog GadgetHub."}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        {isEdit ? (
          <ProductForm product={product} />
        ) : (
          <ProductForm product={null} />
        )}
      </div>
    </div>
  );
}