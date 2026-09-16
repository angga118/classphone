import type { LucideIcon } from "lucide-react";
import { PackageSearch } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageSearch,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div className={className}>
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-surface">
        <Icon className="size-8 text-primary-600" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default EmptyState;