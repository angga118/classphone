import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalListings,
      pendingListings,
      approvedListings,
      availableProducts,
      soldProducts,
      transactionsThisMonth,
      recentListings,
    ] = await Promise.all([
      db.listing.count(),
      db.listing.count({ where: { status: "PENDING_REVIEW" } }),
      db.listing.count({ where: { status: "APPROVED" } }),
      db.product.count({ where: { stockStatus: "AVAILABLE" } }),
      db.product.count({ where: { stockStatus: "SOLD" } }),
      db.transaction.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      db.listing.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          brand: true,
          model: true,
          status: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalListings,
      pendingListings,
      approvedListings,
      availableProducts,
      soldProducts,
      transactionsThisMonth,
      recentListings,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
