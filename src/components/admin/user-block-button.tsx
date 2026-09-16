"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserBlockButtonProps {
  userId: string;
  userName: string;
  isBlocked: boolean;
}

export function UserBlockButton({
  userId,
  userName,
  isBlocked,
}: UserBlockButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const action = isBlocked ? "Buka blokir" : "Blokir";
    if (!confirm(`${action} user "${userName}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Gagal memperbarui user.");
        setLoading(false);
      }
    } catch {
      alert("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <Button
      variant={isBlocked ? "outline" : "danger"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : isBlocked ? (
        <ShieldCheck className="size-4" aria-hidden="true" />
      ) : (
        <Ban className="size-4" aria-hidden="true" />
      )}
      {isBlocked ? "Buka Blokir" : "Blokir"}
    </Button>
  );
}

export default UserBlockButton;