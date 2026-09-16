"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  ChevronLeft,
  FileText,
  LogOut,
  Package,
  Settings,
  Smartphone,
  Users,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NotificationBell,
  type NotificationItem,
} from "@/components/shared/notification-bell";

interface AdminLayoutProps {
  children: React.ReactNode;
  adminName?: string | null;
  initialUnread?: number;
  initialNotifications?: NotificationItem[];
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/listing-masuk", label: "Listing Masuk", icon: FileText },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({
  children,
  adminName,
  initialUnread = 0,
  initialNotifications = [],
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/admin/login");
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Link
          href="/"
          className="flex size-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm"
        >
          <Smartphone className="size-5" aria-hidden="true" />
        </Link>
        <div>
          <span className="text-lg font-extrabold tracking-tight text-ink">
            Gadget<span className="text-primary-600">Hub</span>
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-muted hover:bg-surface hover:text-ink"
              )}
            >
              <item.icon
                className={cn(
                  "size-4.5",
                  active ? "text-primary-600" : "text-muted"
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="border-t border-line px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition-all hover:bg-surface hover:text-ink"
        >
          <ChevronLeft className="size-4.5" aria-hidden="true" />
          Kembali ke Situs
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-line bg-white lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3.5 rounded-lg p-1.5 text-muted hover:bg-surface hover:text-ink"
              aria-label="Tutup sidebar"
            >
              <X className="size-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted hover:bg-surface hover:text-ink lg:hidden"
            aria-label="Buka sidebar"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <NotificationBell
              initialUnread={initialUnread}
              initialNotifications={initialNotifications}
            />
            <span className="text-sm font-medium text-ink">
              {adminName ?? "Admin"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default AdminSidebar;
