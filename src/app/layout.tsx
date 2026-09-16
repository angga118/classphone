import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shared/app-shell";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GadgetHub Jual Beli HP Bekas & Baru",
    template: "%s · GadgetHub",
  },
  description:
    "GadgetHub adalah marketplace jual beli HP bekas dan baru yang aman & terpercaya. Proses review ketat, harga transparan, dan deal langsung via WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <AppShell navbar={<Navbar />} footer={<Footer />}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}