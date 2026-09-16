import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, requireAdmin } from "@/lib/guards";
import type { ListingStatus } from "@/generated/prisma/enums";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["DEAL"],
  DEAL: ["COMPLETED"],
  REJECTED: [],
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const listing = await db.listing.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
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

    return NextResponse.json(listing);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, dealPrice, adminNote } = body as {
      status?: string;
      dealPrice?: number;
      adminNote?: string;
    };

    const listing = await db.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Validate dealPrice if provided
    if (dealPrice != null && (!Number.isFinite(dealPrice) || dealPrice <= 0)) {
      return NextResponse.json(
        { error: "dealPrice must be a positive number" },
        { status: 400 }
      );
    }

    // Validate status transition
    if (status) {
      const allowed = VALID_TRANSITIONS[listing.status];
      if (!allowed || !allowed.includes(status)) {
        return NextResponse.json(
          {
            error: `Cannot transition from ${listing.status} to ${status}`,
          },
          { status: 400 }
        );
      }
    }

    // REJECTED requires adminNote
    if (status === "REJECTED" && !adminNote) {
      return NextResponse.json(
        { error: "adminNote is required when rejecting a listing" },
        { status: 400 }
      );
    }

    const updateData: {
      status?: ListingStatus;
      dealPrice?: number;
      adminNote?: string;
    } = {};

    if (status) updateData.status = status as ListingStatus;
    if (dealPrice != null) updateData.dealPrice = dealPrice;
    if (adminNote != null) updateData.adminNote = adminNote;

    const updated = await db.listing.update({
      where: { id },
      data: updateData,
    });

    // Transition to DEAL: create SELL transaction (idempotent)
    if (status === "DEAL") {
      const existingTx = await db.transaction.findFirst({
        where: { listingId: id },
      });
      if (!existingTx) {
        await db.transaction.create({
          data: {
            type: "SELL",
            listingId: id,
            userId: listing.userId,
            finalPrice: dealPrice ?? listing.dealPrice ?? listing.askingPrice ?? 0,
            status: "IN_PROGRESS",
          },
        });
      }
    }

    // Void existing transactions when rejecting
    if (status === "REJECTED") {
      await db.transaction.updateMany({
        where: { listingId: id, status: "IN_PROGRESS" },
        data: { status: "CANCELLED" },
      });
    }

    // Notify the listing owner about the status change
    if (status) {
      const link = `/dashboard/listing/${id}`;
      let notifType: string | null = null;
      let notifTitle = "";
      let notifMessage = "";

      switch (status) {
        case "APPROVED":
          notifType = "LISTING_APPROVED";
          notifTitle = "Pengajuan Disetujui";
          notifMessage = `${listing.brand} ${listing.model} — lanjutkan negosiasi via WhatsApp`;
          break;
        case "REJECTED":
          notifType = "LISTING_REJECTED";
          notifTitle = "Pengajuan Ditolak";
          notifMessage =
            adminNote ?? `${listing.brand} ${listing.model} ditolak`;
          break;
        case "DEAL":
          notifType = "LISTING_DEAL";
          notifTitle = "Transaksi Deal";
          notifMessage = `${listing.brand} ${listing.model} — harga deal ${(
            dealPrice ?? listing.dealPrice ?? listing.askingPrice ?? 0
          ).toLocaleString("id-ID")}`;
          break;
        case "COMPLETED":
          notifType = "LISTING_COMPLETED";
          notifTitle = "Transaksi Selesai";
          notifMessage = `${listing.brand} ${listing.model}`;
          break;
      }

      if (notifType) {
        // Respect the owner's notification preference
        const owner = await db.user.findUnique({
          where: { id: listing.userId },
          select: { notificationEnabled: true },
        });
        if (owner?.notificationEnabled) {
          await db.notification.create({
            data: {
              userId: listing.userId,
              type: notifType,
              title: notifTitle,
              message: notifMessage,
              link,
            },
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
