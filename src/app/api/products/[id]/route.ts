import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, brand, model, storage, condition, price, stockStatus, description, photos } =
      body as {
        name?: string;
        brand?: string;
        model?: string;
        storage?: string;
        condition?: string;
        price?: number;
        stockStatus?: string;
        description?: string;
        photos?: string[];
      };

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        ...(name != null && { name }),
        ...(brand != null && { brand }),
        ...(model != null && { model }),
        ...(storage != null && { storage }),
        ...(condition != null && { condition: condition as never }),
        ...(price != null && { price }),
        ...(stockStatus != null && { stockStatus: stockStatus as never }),
        ...(description != null && { description }),
        ...(photos != null && { photos: JSON.stringify(photos) }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await db.product.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
