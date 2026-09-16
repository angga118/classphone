"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  initialUnread: number;
  initialNotifications: NotificationItem[];
  className?: string;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function NotificationBell({
  initialUnread,
  initialNotifications,
  className,
}: NotificationBellProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications
  );

  // Close dropdown on outside click and Escape
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Poll every 30 seconds (silent refresh)
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
        if (typeof data.unreadCount === "number") {
          setUnread(data.unreadCount);
        }
      } catch {
        // silent — keep current state
      }
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenNotification = useCallback(
    async (item: NotificationItem) => {
      if (!item.read) {
        try {
          await fetch("/api/notifications/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.id }),
          });
          setUnread((u) => Math.max(0, u - 1));
          setNotifications((list) =>
            list.map((n) => (n.id === item.id ? { ...n, read: true } : n))
          );
        } catch {
          // still navigate
        }
      }
      setOpen(false);
      if (item.link) router.push(item.link);
    },
    [router]
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setUnread(0);
      setNotifications((list) => list.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifikasi"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-ink transition-colors hover:bg-surface"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {/* Dropdown panel */}
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
            <p className="text-sm font-bold text-ink">Notifikasi</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-800"
              >
                <CheckCheck className="size-3.5" aria-hidden="true" />
                Tandai semua dibaca
              </button>
            ) : null}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted">
                Tidak ada notifikasi.
              </p>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenNotification(item)}
                  className={cn(
                    "block w-full border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface",
                    !item.read && "bg-primary-50/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  {item.message ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">
                      {item.message}
                    </p>
                  ) : null}
                  {item.link ? (
                    <span className="mt-1 inline-block text-xs font-semibold text-primary-600">
                      Lihat detail →
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;