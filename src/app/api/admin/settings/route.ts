import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    let settings = await db.settings.findUnique({ where: { id: "default" } });

    if (!settings) {
      settings = await db.settings.create({ data: { id: "default" } });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { adminWhatsappNumber, messageTemplateJual, messageTemplateBeli } =
      body as {
        adminWhatsappNumber?: string;
        messageTemplateJual?: string;
        messageTemplateBeli?: string;
      };

    // Basic validation
    if (
      adminWhatsappNumber != null &&
      typeof adminWhatsappNumber !== "string"
    ) {
      return NextResponse.json(
        { error: "adminWhatsappNumber must be a string" },
        { status: 400 }
      );
    }
    if (messageTemplateJual != null && typeof messageTemplateJual !== "string") {
      return NextResponse.json(
        { error: "messageTemplateJual must be a string" },
        { status: 400 }
      );
    }
    if (messageTemplateBeli != null && typeof messageTemplateBeli !== "string") {
      return NextResponse.json(
        { error: "messageTemplateBeli must be a string" },
        { status: 400 }
      );
    }

    const settings = await db.settings.upsert({
      where: { id: "default" },
      update: {
        ...(adminWhatsappNumber != null && { adminWhatsappNumber }),
        ...(messageTemplateJual != null && { messageTemplateJual }),
        ...(messageTemplateBeli != null && { messageTemplateBeli }),
      },
      create: {
        id: "default",
        adminWhatsappNumber: adminWhatsappNumber ?? "6281234567890",
        messageTemplateJual:
          messageTemplateJual ??
          "Halo Admin, saya ingin konfirmasi penjualan {nama_hp} (ID Listing: {kode}) dengan harga disepakati Rp {harga}. Mohon info langkah selanjutnya.",
        messageTemplateBeli:
          messageTemplateBeli ??
          "Halo Admin, saya ingin beli {nama_hp} (Kode: {kode}) seharga Rp {harga}. Apakah masih tersedia?",
      },
    });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
