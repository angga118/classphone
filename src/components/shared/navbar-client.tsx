"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Smartphone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NotificationBell,
  type NotificationItem,
} from "@/components/shared/notification-bell";
import { cn } from "@/lib/utils";

export interface NavbarUser {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface NavbarClientProps {
  user: NavbarUser | null;
  initialUnread?: number;
  initialNotifications?: NotificationItem[];
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const activeLinkClasses =
  "bg-primary-50 text-primary-700 hover:bg-primary-50 hover:text-primary-700";

export function NavbarClient({
  user,
  initialUnread = 0,
  initialNotifications = [],
}: NavbarClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Close user menu on outside click and Escape
  useEffect(() => {
    if (!userMenuOpen) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setUserMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const initials = getInitials(user?.name);
  const settingsHref =
    user?.role === "ADMIN" ? "/admin/pengaturan" : "/pengaturan";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 shadow-sm backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Col 1 — Logo (left) */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <Smartphone className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-ink">Classphone</span>
          </Link>
        </div>

        {/* Col 2 — Centered nav links (lg+) */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Button
            variant="ghost"
            size="sm"
            href="/katalog"
            className={cn(isActive(pathname, "/katalog") && activeLinkClasses)}
          >
            Katalog
          </Button>

          {user?.role === "ADMIN" ? (
            <Button
              variant="ghost"
              size="sm"
              href="/admin"
              className={cn(isActive(pathname, "/admin") && activeLinkClasses)}
            >
              Dashboard Admin
            </Button>
          ) : user ? (
            <Button
              variant="ghost"
              size="sm"
              href="/dashboard"
              className={cn(
                isActive(pathname, "/dashboard") && activeLinkClasses
              )}
            >
              Dashboard
            </Button>
          ) : null}
        </nav>

        {/* Col 3 — Actions (right) */}
        <div className="flex items-center justify-end gap-2">
          {/* Desktop actions (lg+) */}
          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <NotificationBell
                  initialUnread={initialUnread}
                  initialNotifications={initialNotifications}
                />

                {/* User menu with avatar + dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    className="flex items-center rounded-xl p-0.5 pr-1.5 transition-colors hover:bg-surface"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                      {initials}
                    </span>
                    <span className="hidden max-w-28 truncate pl-1.5 text-sm font-semibold text-ink xl:inline">
                      {user.name ?? "Akun"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "ml-0.5 size-4 text-muted transition-transform duration-200",
                        userMenuOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {userMenuOpen ? (
                    <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
                      <div className="border-b border-line bg-surface px-4 py-3">
                        <p className="truncate text-sm font-bold text-ink">
                          {user.name ?? "Akun Saya"}
                        </p>
                        {user.email ? (
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {user.email}
                          </p>
                        ) : null}
                      </div>
                      <div className="p-1.5">
                        <Link
                          href={settingsHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
                        >
                          <Settings
                            className="size-4 text-muted"
                            aria-hidden="true"
                          />
                          Pengaturan
                        </Link>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
                        >
                          <LogOut className="size-4" aria-hidden="true" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" href="/login">
                  Masuk
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  href="/register"
                  className="ml-1"
                >
                  Daftar
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle (<lg) */}
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-xl border border-line text-ink transition-colors hover:bg-surface lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu (<lg) — animated slide-down panel */}
      {open && (
        <div className="animate-slide-down max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-white px-4 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col gap-0.5">
            {/* Nav links */}
            <Link
              href="/katalog"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface",
                isActive(pathname, "/katalog") && "bg-primary-50 text-primary-700"
              )}
            >
              Katalog
            </Link>

            {user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface",
                  isActive(pathname, "/admin") && "bg-primary-50 text-primary-700"
                )}
              >
                Dashboard Admin
              </Link>
            ) : user ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface",
                  isActive(pathname, "/dashboard") && "bg-primary-50 text-primary-700"
                )}
              >
                Dashboard
              </Link>
            ) : null}

            <span className="my-1 h-px bg-line" />

            {/* Account actions */}
            {user ? (
              <>
                <div className="flex items-center justify-between rounded-xl px-3 py-1.5">
                  <span className="text-sm font-semibold text-ink">
                    Notifikasi
                  </span>
                  <NotificationBell
                    initialUnread={initialUnread}
                    initialNotifications={initialNotifications}
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user.name ?? "Akun Saya"}
                    </p>
                    {user.email ? (
                      <p className="truncate text-xs text-muted">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Link
                  href={settingsHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface"
                >
                  <Settings className="size-4 text-muted" aria-hidden="true" />
                  Pengaturan
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-danger transition-colors hover:bg-danger-soft"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="md"
                  href="/login"
                  className="flex-1"
                >
                  Masuk
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  href="/register"
                  className="flex-1"
                >
                  Daftar
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}