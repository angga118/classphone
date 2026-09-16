import type { Metadata } from "next";
import { Users as UsersIcon } from "lucide-react";
import { db } from "@/lib/db";
import { UserBlockButton } from "@/components/admin/user-block-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Kelola User",
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isBlocked: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Kelola User
        </h1>
        <p className="mt-1 text-sm text-muted">
          Daftar pengguna terdaftar di GadgetHub.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="card py-12 text-center">
          <EmptyState
            icon={UsersIcon}
            title="Belum ada user"
            description="User yang mendaftar akan muncul di sini."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Mobile card list */}
          <ul className="divide-y divide-line sm:hidden">
            {users.map((user) => (
              <li key={user.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                    <Badge
                      variant={user.role === "ADMIN" ? "info" : "neutral"}
                    >
                      {user.role === "ADMIN" ? "Admin" : "User"}
                    </Badge>
                    {user.isBlocked ? (
                      <Badge variant="danger">Diblokir</Badge>
                    ) : (
                      <Badge variant="success">Aktif</Badge>
                    )}
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div className="min-w-0">
                    <dt className="text-muted">Phone</dt>
                    <dd className="truncate font-medium text-ink">
                      {user.phone ?? "—"}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted">Listing</dt>
                    <dd className="font-medium tabular-nums text-ink">
                      {user._count.listings}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted">Bergabung</dt>
                    <dd className="font-medium text-ink">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3">
                  {user.role !== "ADMIN" ? (
                    <UserBlockButton
                      userId={user.id}
                      userName={user.name}
                      isBlocked={user.isBlocked}
                    />
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="px-4 py-3 font-semibold text-muted">Nama</th>
                  <th className="px-4 py-3 font-semibold text-muted">Email</th>
                  <th className="px-4 py-3 font-semibold text-muted">Phone</th>
                  <th className="px-4 py-3 font-semibold text-muted">Role</th>
                  <th className="px-4 py-3 font-semibold text-muted">Listing</th>
                  <th className="px-4 py-3 font-semibold text-muted">Status</th>
                  <th className="px-4 py-3 font-semibold text-muted">Bergabung</th>
                  <th className="px-4 py-3 font-semibold text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-muted">{user.email}</td>
                    <td className="px-4 py-3 text-muted">{user.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.role === "ADMIN" ? "info" : "neutral"}
                      >
                        {user.role === "ADMIN" ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink">
                      {user._count.listings}
                    </td>
                    <td className="px-4 py-3">
                      {user.isBlocked ? (
                        <Badge variant="danger">Diblokir</Badge>
                      ) : (
                        <Badge variant="success">Aktif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== "ADMIN" ? (
                        <UserBlockButton
                          userId={user.id}
                          userName={user.name}
                          isBlocked={user.isBlocked}
                        />
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}