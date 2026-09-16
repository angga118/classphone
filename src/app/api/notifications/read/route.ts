import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { notificationTypesForRole } from "@/lib/notifications";

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { id } = body as { id?: string };
    const visibleTypes = notificationTypesForRole(authResult.user.role);

    if (id) {
      // Mark a single notification as read (verify ownership + role visibility)
      const notification = await db.notification.findUnique({ where: { id } });
      if (
        !notification ||
        notification.userId !== authResult.user.id ||
        !visibleTypes.includes(notification.type)
      ) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }
      await db.notification.update({
        where: { id },
        data: { read: true },
      });
    } else {
      // Mark all role-visible notifications as read
      await db.notification.updateMany({
        where: {
          userId: authResult.user.id,
          read: false,
          type: { in: visibleTypes },
        },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
