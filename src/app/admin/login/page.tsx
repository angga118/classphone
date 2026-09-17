"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, getSession } from "next-auth/react";
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau kata sandi salah. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      const session = await getSession();

      if (session?.user?.role === "ADMIN") {
        router.push("/admin");
        router.refresh();
        return;
      }

      // Logged in but not an admin — sign out and send back home.
      await signOut({ redirect: false });
      setError("Akun ini tidak memiliki akses admin.");
      router.push("/");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-14">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-line bg-white p-8 shadow-md sm:p-10">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <Smartphone className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-ink">
              Gadget<span className="text-primary-600">Hub</span>
            </span>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary-600" aria-hidden="true" />
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Admin Panel
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Masuk untuk mengelola listing, produk, dan pengaturan GadgetHub.
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
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="email"
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
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Memproses…" : "Masuk sebagai Admin"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Bukan admin?{" "}
          <a href="/" className="font-bold text-primary-600 transition-colors hover:text-primary-800">
            Kembali ke situs
          </a>
        </p>
      </div>
    </div>
  );
}