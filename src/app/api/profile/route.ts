import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";

export async function GET() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  try {
    const user = await db.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        notificationEnabled: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { name, phone, address } = body as {
      name?: string;
      phone?: string;
      address?: string;
    };

    const updateData: Record<string, string | null> = {};
    if (name != null) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await db.user.update({
      where: { id: authResult.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        notificationEnabled: true,
        role: true,
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
