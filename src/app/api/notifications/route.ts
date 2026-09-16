import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { notificationTypesForRole } from "@/lib/notifications";

export async function GET() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  try {
    const visibleTypes = notificationTypesForRole(authResult.user.role);
    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: authResult.user.id, type: { in: visibleTypes } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          link: true,
          read: true,
          createdAt: true,
        },
      }),
      db.notification.count({
        where: {
          userId: authResult.user.id,
          read: false,
          type: { in: visibleTypes },
        },
      }),
    ]);

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
