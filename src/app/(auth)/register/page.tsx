"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone: phone || undefined }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Gagal membuat akun. Silakan coba lagi.");
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/dashboard");
        return;
      }

      // If auto sign-in fails, show success with link to login
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal membuat akun. Silakan coba lagi."
      );
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface px-4 py-14">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-10 text-center shadow-md">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success-soft">
            <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">
            Akun Berhasil Dibuat!
          </h1>
          <p className="mt-2 text-sm text-muted">
            Kamu sudah bisa masuk menggunakan email dan kata sandi yang sudah
            didaftarkan.
          </p>
          <Button
            variant="primary"
            size="lg"
            href="/login"
            className="mt-6 w-full"
          >
            Masuk ke Akun
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-surface px-4 py-14">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-line bg-white p-8 shadow-md sm:p-10">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <Smartphone className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-ink">
              Gadget<span className="text-primary-600">Hub</span>
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">
            Daftar Akun Baru
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Buat akun untuk menjual atau memantau harga HP favoritmu.
          </p>

          {error ? (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Kata Sandi</Label>
              <div className="relative">
                <Shield
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">
                No. WhatsApp{" "}
                <span className="font-normal text-muted">(opsional)</span>
              </Label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="628xxxxxxxxxx"
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Membuat akun…" : "Buat Akun"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-bold text-primary-600 transition-colors hover:text-primary-800"
          >
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}