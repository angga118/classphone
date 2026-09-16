import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { listingSchema } from "@/lib/validators";

export async function GET() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  try {
    const listings = await db.listing.findMany({
      where: { userId: authResult.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const parsed = listingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { photos, completeness, ...rest } = parsed.data;

    const listing = await db.listing.create({
      data: {
        ...rest,
        userId: authResult.user.id,
        photos: JSON.stringify(photos),
        completeness: JSON.stringify(completeness ?? []),
        status: "PENDING_REVIEW",
      },
    });

    // Notify all admins about the new listing
    const admins = await db.user.findMany({
      where: { role: "ADMIN", notificationEnabled: true },
      select: { id: true },
    });
    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "NEW_LISTING",
          title: "Pengajuan jual baru",
          message: `${listing.brand} ${listing.model} (${listing.storage})`,
          link: `/admin/listing-masuk/${listing.id}`,
        })),
      });
    }

    return NextResponse.json(listing, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
