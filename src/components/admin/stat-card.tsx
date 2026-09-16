import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  hint?: string;
  accent?: "primary" | "warning" | "success" | "neutral";
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary-50 text-primary-700",
  warning: "bg-warning-soft text-amber-600",
  success: "bg-success-soft text-success",
  neutral: "bg-surface text-muted",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "primary",
}: StatCardProps) {
  return (
    <div className="card p-5">
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          ACCENTS[accent]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-muted">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default StatCard;