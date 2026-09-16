import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function POST(req: Request) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { listingId } = body as { listingId?: string };

    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }

    const listing = await db.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.status !== "DEAL" && listing.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Listing must be in DEAL or COMPLETED status to convert" },
        { status: 400 }
      );
    }

    // Prevent duplicate conversion
    const existing = await db.product.findUnique({
      where: { sourceListingId: listing.id },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Listing sudah dikonversi ke produk" },
        { status: 409 }
      );
    }

    // Map listing condition to product condition
    const conditionMap: Record<string, "NEW" | "LIKE_NEW" | "USED"> = {
      MINT: "LIKE_NEW",
      NORMAL: "USED",
      DAMAGED: "USED",
    };

    const product = await db.product.create({
      data: {
        name: `${listing.brand} ${listing.model}`,
        brand: listing.brand,
        model: listing.model,
        storage: listing.storage,
        condition: conditionMap[listing.condition] ?? "USED",
        price: listing.dealPrice ?? listing.askingPrice ?? 0,
        photos: listing.photos,
        description: listing.description ?? undefined,
        sourceListingId: listing.id,
      },
    });

    // Notify the admin who performed the conversion
    const admin = await db.user.findUnique({
      where: { id: authResult.user.id },
      select: { notificationEnabled: true },
    });
    if (admin?.notificationEnabled) {
      await db.notification.create({
        data: {
          userId: authResult.user.id,
          type: "PRODUCT_CONVERTED",
          title: "Listing Dikonversi ke Produk",
          message: `${listing.brand} ${listing.model} sekarang tersedia di katalog`,
          link: `/produk/${product.id}`,
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
