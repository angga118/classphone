import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NavbarClient } from "@/components/shared/navbar-client";
import { notificationTypesForRole } from "@/lib/notifications";

export async function Navbar() {
  const session = await auth();

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  let initialUnread = 0;
  let initialNotifications: {
    id: string;
    type: string;
    title: string;
    message: string | null;
    link: string | null;
    read: boolean;
    createdAt: string;
  }[] = [];

  if (session?.user) {
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

    initialUnread = unreadCount;
    initialNotifications = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  return (
    <NavbarClient
      user={user}
      initialUnread={initialUnread}
      initialNotifications={initialNotifications}
    />
  );
}

export default Navbar;