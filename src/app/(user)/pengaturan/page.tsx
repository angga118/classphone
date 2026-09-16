"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  notificationEnabled: boolean;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  /* --- Profile fields --- */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  /* --- Password --- */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  /* --- Notifications --- */
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);

  /* ------------------------------------------------------------------ */
  /*  Fetch profile                                                      */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data);
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        setAddress(data.address ?? "");
        setNotifEnabled(data.notificationEnabled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Submit handlers                                                    */
  /* ------------------------------------------------------------------ */

  const handleProfileSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setProfileSaving(true);
      setProfileMsg(null);
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, address }),
        });
        const data = await res.json();
        if (!res.ok) {
          setProfileMsg({ type: "err", text: data.error ?? "Gagal menyimpan." });
        } else {
          setProfileMsg({ type: "ok", text: "Profil berhasil disimpan." });
          setProfile((p) => (p ? { ...p, ...data } : p));
        }
      } catch {
        setProfileMsg({ type: "err", text: "Gagal menghubungi server." });
      } finally {
        setProfileSaving(false);
      }
    },
    [name, phone, address]
  );

  const handlePasswordChange = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPw !== confirmPw) {
        setPwMsg({ type: "err", text: "Konfirmasi password tidak cocok." });
        return;
      }
      setPwSaving(true);
      setPwMsg(null);
      try {
        const res = await fetch("/api/profile/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: currentPw,
            newPassword: newPw,
            confirmPassword: confirmPw,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setPwMsg({
            type: "err",
            text: data.error ?? "Gagal mengubah password.",
          });
        } else {
          setPwMsg({ type: "ok", text: "Password berhasil diubah." });
          setCurrentPw("");
          setNewPw("");
          setConfirmPw("");
        }
      } catch {
        setPwMsg({ type: "err", text: "Gagal menghubungi server." });
      } finally {
        setPwSaving(false);
      }
    },
    [currentPw, newPw, confirmPw]
  );

  const toggleNotification = useCallback(async () => {
    const next = !notifEnabled;
    setNotifSaving(true);
    try {
      const res = await fetch("/api/profile/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationEnabled: next }),
      });
      if (res.ok) {
        setNotifEnabled(next);
      }
    } catch {
      // keep previous state
    } finally {
      setNotifSaving(false);
    }
  }, [notifEnabled]);

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="bg-surface">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-10">
          <Loader2 className="size-6 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke Dashboard
        </Link>

        {/* Header */}
        <div className="mt-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Pengaturan
          </h1>
          <p className="mt-1 text-sm text-muted">
            Kelola profil, keamanan, dan preferensi akun kamu.
          </p>
        </div>

        {/* ===== 1. Data Profil ===== */}
        <section className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-ink">Data Profil</h2>
          <p className="mt-1 text-sm text-muted">
            Informasi dasar yang ditampilkan di akun kamu.
          </p>

          <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">No. HP / WhatsApp</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6281234567890"
              />
              <p className="text-xs text-muted">
                Nomor ini digunakan admin untuk menghubungi Anda via telepon
                atau WhatsApp.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat lengkap"
              />
            </div>

            {profileMsg && (
              <p
                className={`text-sm font-medium ${profileMsg.type === "ok" ? "text-success" : "text-danger"}`}
              >
                {profileMsg.text}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                size="md"
                disabled={profileSaving}
                className="w-full sm:w-auto"
              >
                {profileSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Simpan Profil
              </Button>
            </div>
          </form>
        </section>

        {/* ===== 2. Ubah Password ===== */}
        <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary-600" aria-hidden="true" />
            <h2 className="text-base font-bold text-ink">Ubah Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPw">Password Lama</Label>
              <Input
                id="currentPw"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPw">Password Baru</Label>
              <Input
                id="newPw"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPw">Konfirmasi Password Baru</Label>
              <Input
                id="confirmPw"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {pwMsg && (
              <p
                className={`text-sm font-medium ${pwMsg.type === "ok" ? "text-success" : "text-danger"}`}
              >
                {pwMsg.text}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                size="md"
                disabled={pwSaving}
                className="w-full sm:w-auto"
              >
                {pwSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Ubah Password
              </Button>
            </div>
          </form>
        </section>

        {/* ===== 3. Preferensi Notifikasi ===== */}
        <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-ink">Preferensi Notifikasi</h2>
          <p className="mt-1 text-sm text-muted">
            Atur pemberitahuan in-app untuk update listing dan transaksi.
          </p>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">
                Terima notifikasi in-app
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Status:{" "}
                <span className={notifEnabled ? "text-success" : "text-muted"}>
                  {notifEnabled ? "Aktif" : "Nonaktif"}
                </span>
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notifEnabled}
              disabled={notifSaving}
              onClick={toggleNotification}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                notifEnabled ? "bg-primary-600" : "bg-line"
              }`}
            >
              <span
                className={`pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform ${
                  notifEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
