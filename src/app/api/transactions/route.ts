import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { type, listingId, productId, finalPrice } = body as {
      type?: string;
      listingId?: string;
      productId?: string;
      finalPrice?: number;
    };

    if (!type || !["SELL", "BUY"].includes(type)) {
      return NextResponse.json(
        { error: "type must be SELL or BUY" },
        { status: 400 }
      );
    }

    if (!listingId && !productId) {
      return NextResponse.json(
        { error: "At least one of listingId or productId is required" },
        { status: 400 }
      );
    }

    if (finalPrice == null || finalPrice < 0) {
      return NextResponse.json(
        { error: "finalPrice is required and must be non-negative" },
        { status: 400 }
      );
    }

    // Ownership / existence checks
    if (type === "SELL" && listingId) {
      const listing = await db.listing.findUnique({
        where: { id: listingId },
        select: { userId: true },
      });
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }
      if (
        listing.userId !== authResult.user.id &&
        authResult.user.role !== "ADMIN"
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (type === "BUY" && productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
    }

    const transaction = await db.transaction.create({
      data: {
        type: type as "SELL" | "BUY",
        listingId: listingId ?? null,
        productId: productId ?? null,
        userId: authResult.user.id,
        finalPrice,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
