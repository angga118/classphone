import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  className?: string;
  label?: string;
}

export function WhatsAppButton({
  phone,
  message,
  className,
  label = "Beli via WhatsApp",
}: WhatsAppButtonProps) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-wa px-6 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-wa-dark hover:shadow-md active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa focus-visible:ring-offset-2",
        className
      )}
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      {label}
    </a>
  );
}

export default WhatsAppButton;