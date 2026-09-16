import type { Metadata } from "next";
import { Smartphone } from "lucide-react";
import { ListingForm } from "@/components/user/listing-form";

export const metadata: Metadata = {
  title: "Jual HP Kamu",
};

export default function JualHalamanPage() {
  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <Smartphone className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Jual HP Kamu
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                Isi data HP kamu di bawah. Tim kami akan mereview dan menghubungi
                via WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <ListingForm />
        </div>
      </div>
    </div>
  );
}
