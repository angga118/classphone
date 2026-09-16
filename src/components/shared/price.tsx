import { cn } from "@/lib/utils";

/** Format a number as Indonesian Rupiah, e.g. "Rp 12.500.000". */
export function formatIDR(value: number): string {
  const formatted = new Intl.NumberFormat("id-ID").format(Math.round(value));
  return `Rp ${formatted}`;
}

interface PriceProps {
  value: number;
  className?: string;
}

export function Price({ value, className }: PriceProps) {
  return <span className={cn("tabular-nums", className)}>{formatIDR(value)}</span>;
}

export default Price;