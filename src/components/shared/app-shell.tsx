"use client";

import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  navbar?: React.ReactNode;
  footer?: React.ReactNode;
}

export function AppShell({ children, navbar, footer }: AppShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <main className="flex flex-1 flex-col">{children}</main>
      {footer}
    </>
  );
}

export default AppShell;