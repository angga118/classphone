import type { Product } from "@/generated/prisma/client";
import { ArrowRight, Smartphone } from "lucide-react";
import { Price } from "@/components/shared/price";
import { ConditionBadge } from "@/components/shared/condition-badge";

/** Safely parse the JSON-encoded `photos` field of a Product. */
export function parseProductPhotos(photos: string): string[] {
  try {
    const parsed = JSON.parse(photos);
    if (Array.isArray(parsed)) {
      return parsed.filter((p): p is string => typeof p === "string" && p.length > 0);
    }
  } catch {
    // fall through
  }
  return [];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const photos = parseProductPhotos(product.photos);
  const photo = photos[0];

  return (
    <a
      href={`/produk/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-md"
    >
      {/* Photo — 4:3 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Smartphone className="size-12 text-primary-200" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <ConditionBadge condition={product.condition} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {product.brand} · {product.storage}
        </p>
        <h3 className="mt-1 line-clamp-1 font-semibold text-ink">{product.name}</h3>
        <div className="mt-2 flex items-end justify-between gap-3">
          <Price value={product.price} className="text-lg font-extrabold text-primary-900" />
        </div>
        <span className="mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line text-sm font-semibold text-ink transition-colors group-hover:border-primary-600 group-hover:bg-primary-600 group-hover:text-white">
          Lihat Detail
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}

export default ProductCard;