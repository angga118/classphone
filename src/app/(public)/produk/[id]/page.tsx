import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard, parseProductPhotos } from "@/components/shared/product-card";
import { PhotoGallery } from "@/components/shared/photo-gallery";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { Price } from "@/components/shared/price";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Cpu,
  HardDrive,
  Info,
  Layers,
  MessageCircle,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

interface ProdukDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProdukDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });

  if (!product) {
    return { title: "Produk Tidak Ditemukan" };
  }

  return {
    title: product.name,
    description: product.description ?? undefined,
  };
}

export default async function ProdukDetailPage({ params }: ProdukDetailPageProps) {
  const { id } = await params;

  const [product, settings] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.settings.findUnique({ where: { id: "default" } }),
  ]);

  if (!product || product.stockStatus === "DRAFT") {
    notFound();
  }

  const photos = parseProductPhotos(product.photos);

  // Related: same brand, available, exclude current
  const related = await db.product.findMany({
    where: {
      brand: product.brand,
      stockStatus: "AVAILABLE",
      id: { not: product.id },
    },
    take: 4,
  });

  // WhatsApp buy message from template
  const template = settings?.messageTemplateBeli ?? "";
  const waMessage = template
    .replaceAll("{nama_hp}", product.name)
    .replaceAll("{kode}", product.id)
    .replaceAll(
      "{harga}",
      new Intl.NumberFormat("id-ID").format(Math.round(product.price))
    );
  const waPhone = settings?.adminWhatsappNumber ?? "6281234567890";

  const specs = [
    { icon: Smartphone, label: "Brand", value: product.brand },
    { icon: Layers, label: "Model", value: product.model },
    { icon: HardDrive, label: "Penyimpanan", value: product.storage },
    { icon: Cpu, label: "Kondisi", value: conditionLabel(product.condition) },
  ];

  return (
    <>
      <div className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            {/* ---------- Gallery ---------- */}
            <PhotoGallery photos={photos} alt={product.name} />

            {/* ---------- Summary ---------- */}
            <div>
              <div className="flex items-center gap-2">
                <ConditionBadge condition={product.condition} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  Tersedia
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {product.brand} · {product.model} · {product.storage}
              </p>

              <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50/60 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  Harga
                </p>
                <Price
                  value={product.price}
                  className="mt-1 text-3xl font-extrabold text-primary-900 sm:text-4xl"
                />
              </div>

              {/* Specs */}
              <dl className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white shadow-sm">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <dt className="flex items-center gap-2.5 text-sm text-muted">
                      <spec.icon className="size-4 text-primary-600" aria-hidden="true" />
                      {spec.label}
                    </dt>
                    <dd className="text-sm font-bold text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              {/* WhatsApp CTA */}
              <div className="mt-6 rounded-2xl border border-wa/30 bg-wa-soft/60 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <MessageCircle className="size-4 text-wa" aria-hidden="true" />
                  Siap untuk deal?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Klik tombol di bawah untuk chat langsung dengan admin
                  GadgetHub dan konfirmasi ketersediaan unit.
                </p>
                <WhatsAppButton
                  phone={waPhone}
                  message={waMessage}
                  className="mt-4 w-full"
                />
              </div>
            </div>
          </div>

          {/* ---------- Description ---------- */}
          <section className="mt-14">
            <SectionHeading title="Deskripsi Produk" />
            <div className="mt-5 max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
              {product.description ? (
                <p className="whitespace-pre-line leading-relaxed text-ink">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-muted">
                  Deskripsi lengkap produk ini belum tersedia. Silakan hubungi
                  admin via WhatsApp untuk info lebih lanjut.
                </p>
              )}
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-surface p-4 text-xs leading-relaxed text-muted">
                <Info className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden="true" />
                <span>
                  Semua unit GadgetHub telah direview admin sebelum ditayangkan.
                  Untuk keamanan transaksi bernilai tinggi, deal dilakukan
                  langsung via WhatsApp tanpa pembayaran online.
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ---------- Related ---------- */}
      {related.length > 0 ? (
        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title={`Produk ${product.brand} Lainnya`}
              subtitle="Unit lain dari brand yang sama, siap untuk dipertimbangkan."
            />
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function conditionLabel(condition: "NEW" | "LIKE_NEW" | "USED"): string {
  switch (condition) {
    case "NEW":
      return "Baru";
    case "LIKE_NEW":
      return "Seperti Baru";
    default:
      return "Bekas";
  }
}