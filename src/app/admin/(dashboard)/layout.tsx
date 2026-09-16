import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/sidebar";
import { notificationTypesForRole } from "@/lib/notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const visibleTypes = notificationTypesForRole(session.user.role);
  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: session.user.id, type: { in: visibleTypes } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.notification.count({
      where: {
        userId: session.user.id,
        read: false,
        type: { in: visibleTypes },
      },
    }),
  ]);

  return (
    <AdminSidebar
      adminName={session.user.name}
      initialUnread={unreadCount}
      initialNotifications={notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }))}
    >
      {children}
    </AdminSidebar>
  );
}