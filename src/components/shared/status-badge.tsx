import type { ListingStatus } from "@/generated/prisma/enums";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const STATUS_MAP: Record<
  ListingStatus,
  { variant: BadgeProps["variant"]; label: string }
> = {
  PENDING_REVIEW: { variant: "warning", label: "Menunggu Review" },
  APPROVED: { variant: "success", label: "Disetujui" },
  REJECTED: { variant: "danger", label: "Ditolak" },
  DEAL: { variant: "info", label: "Deal" },
  COMPLETED: { variant: "success", label: "Selesai" },
};

interface StatusBadgeProps {
  status: ListingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.PENDING_REVIEW;
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export default StatusBadge;
