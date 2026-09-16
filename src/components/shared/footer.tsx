import Link from "next/link";
import { MessageCircle, ShieldCheck, Smartphone } from "lucide-react";

const NAV_LINKS = [
  { href: "/katalog", label: "Katalog" },
  { href: "/jual-hp", label: "Jual HP" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                <Smartphone className="size-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-ink">
                Gadget<span className="text-primary-600">Hub</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Marketplace jual beli HP bekas & baru yang aman dan terpercaya.
              Setiap unit melewati review ketat admin sebelum ditayangkan.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-muted">
              <MessageCircle className="size-4 text-wa" aria-hidden="true" />
              <span>Deal & transaksi dilakukan via WhatsApp.</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-primary-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">
              Kenapa GadgetHub?
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" aria-hidden="true" />
                Unit dicek & direview admin
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" aria-hidden="true" />
                Harga transparan, tanpa biaya online
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" aria-hidden="true" />
                Deal langsung via WhatsApp
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} GadgetHub. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-xs text-muted">
            Dibuat dengan <span className="text-primary-600">kepercayaan</span> untuk
            transaksi yang aman.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;