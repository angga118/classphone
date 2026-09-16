import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";

export async function PATCH(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { notificationEnabled } = body as { notificationEnabled?: boolean };

    if (typeof notificationEnabled !== "boolean") {
      return NextResponse.json(
        { error: "notificationEnabled must be a boolean" },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: authResult.user.id },
      data: { notificationEnabled },
    });

    return NextResponse.json({ success: true, notificationEnabled });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}