import { db } from "@/lib/db";
import { parseProductPhotos } from "@/components/shared/product-card";
import { ProductCard } from "@/components/shared/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  Handshake,
  ShieldCheck,
  Smartphone,
  Tag,
  Wallet,
} from "lucide-react";

const POPULAR_BRANDS = ["Apple", "Samsung", "Xiaomi", "Oppo", "Google"];

const STEPS = [
  {
    icon: Smartphone,
    title: "Jual HP Kamu",
    description:
      "Daftarkan HP kamu lewat form penjualan, lengkapi foto dan kondisi unit.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Review & Tawar",
    description:
      "Tim GadgetHub memeriksa unit, menetapkan harga wajar, dan menawar via WhatsApp.",
  },
  {
    icon: Handshake,
    title: "Deal via WhatsApp",
    description:
      "Sepakat harga? Selesaikan transaksi langsung dengan admin — aman tanpa pembayaran online.",
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Garansi Toko",
    description:
      "Setiap unit yang ditayangkan sudah melalui pengecekan admin dan dijamin kondisinya.",
  },
  {
    icon: Wallet,
    title: "Proses Aman",
    description:
      "Tanpa pembayaran online, tanpa rekber. Transaksi disepakati langsung bersama admin.",
  },
  {
    icon: BadgeCheck,
    title: "Harga Transparan",
    description:
      "Harga jual dan tawaran semuanya jelas, tanpa biaya tersembunyi.",
  },
];

export default async function LandingPage() {
  const featured = await db.product.findMany({
    where: { stockStatus: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-hero-glow">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700">
                <Tag className="size-3.5" aria-hidden="true" />
                Jual beli HP bekas & baru, aman & terpercaya
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
                HP Impianmu,{" "}
                <span className="text-ink">Harga Terbaik</span> Tanpa
                Rasa Khawatir
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                GadgetHub menghubungkan penjual dan pembeli HP secara langsung.
                Setiap unit direview admin, harga transparan, dan deal dilakukan
                lewat WhatsApp.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="primary" size="lg" href="/jual-hp">
                  Jual HP Kamu
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  href="/katalog"
                  className="border-primary-200 text-primary-700 hover:bg-primary-50"
                >
                  Lihat Katalog
                </Button>
              </div>

              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
                {[
                  ["100%", "Unit direview"],
                  ["0", "Biaya online"],
                  ["WA", "Deal langsung"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="text-xl font-extrabold text-ink">{value}</dt>
                    <dd className="mt-0.5 text-xs text-muted">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Hero visual — stacked cards */}
            <div className="relative hidden lg:block">
              <div className="relative ml-auto w-[86%] rounded-3xl border border-line bg-white p-5 shadow-xl">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
                  {featured[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={parseProductPhotos(featured[0].photos)[0]}
                      alt={featured[0].name}
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">
                      {featured[0]?.name ?? "Produk Pilihan"}
                    </p>
                    <p className="text-xs text-muted">
                      {featured[0]?.storage ?? "Kualitas terjamin"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-success">Tersedia</span>
                </div>
              </div>
              <div className="absolute -left-2 bottom-6 w-[46%] -rotate-3 rounded-2xl border border-line bg-white p-3 shadow-lg">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-surface">
                  {featured[1] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={parseProductPhotos(featured[1].photos)[0]}
                      alt={featured[1].name}
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
              <div className="absolute right-0 top-6 flex -translate-y-1/2 items-center gap-2 rounded-xl border border-wa/30 bg-white px-3 py-2 shadow-md">
                <span className="flex size-7 items-center justify-center rounded-lg bg-wa-soft">
                  <Handshake className="size-4 text-wa" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold text-ink">
                  Deal via WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Brand chips ---------------- */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-muted">
            Brand Populer
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {POPULAR_BRANDS.map((brand) => (
              <a
                key={brand}
                href={`/katalog?brand=${encodeURIComponent(brand)}`}
                className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                {brand}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Featured products ---------------- */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              title="Produk Unggulan"
              subtitle="Pilihan HP berkualitas yang sedang tersedia. Semua unit sudah direview admin."
            />
            <Button variant="ghost" size="md" href="/katalog" className="shrink-0 self-start sm:self-auto">
              Lihat Semua
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>

          {featured.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-line bg-white py-16 text-center">
              <p className="text-sm text-muted">
                Belum ada produk tersedia saat ini. Nantikan segera!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Cara Kerja GadgetHub"
            subtitle="Tiga langkah sederhana untuk menjual atau membeli HP dengan aman."
            align="center"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-line bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="absolute right-5 top-4 text-4xl font-extrabold text-primary-100">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Trust ---------------- */}
      <section className="bg-primary-950 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Transaksi Bernilai Tinggi, Dilindungi Penuh
            </h2>
            <p className="mt-3 text-base leading-relaxed text-primary-200">
              Kami memahami bahwa membeli HP bukan keputusan kecil. Karena itu
              setiap langkah dirancang untuk membangun kepercayaan.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-wa text-white shadow-sm">
                  <point.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-200">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA band ---------------- */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white px-6 py-12 text-center shadow-sm sm:px-12">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Punya HP yang ingin dijual?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted">
              Dapatkan harga terbaik dengan proses yang mudah dan aman. Admin
              kami siap membantu dari review hingga deal.
            </p>
            <Button variant="primary" size="lg" href="/jual-hp" className="mt-7">
              Mulai Jual Sekarang
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}