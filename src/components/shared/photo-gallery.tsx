"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  photos: string[];
  alt: string;
}

export function PhotoGallery({ photos, alt }: PhotoGalleryProps) {
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  if (!current) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-line bg-surface">
        <Smartphone className="size-16 text-primary-200" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={`${alt} — foto ${active + 1}`}
          className="aspect-[4/3] w-full object-cover"
        />
      </div>

      {photos.length > 1 ? (
        <div className="mt-3 flex gap-3">
          {photos.map((photo, i) => (
            <button
              key={`${photo}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Lihat foto ${i + 1}`}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition-all",
                i === active
                  ? "border-primary-600 shadow-sm"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`${alt} — thumbnail ${i + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default PhotoGallery;