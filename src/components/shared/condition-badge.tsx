import type { ProductCondition } from "@/generated/prisma/enums";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const CONDITION_MAP: Record<
  ProductCondition,
  { variant: BadgeProps["variant"]; label: string }
> = {
  NEW: { variant: "success", label: "Baru" },
  LIKE_NEW: { variant: "info", label: "Seperti Baru" },
  USED: { variant: "neutral", label: "Bekas" },
};

interface ConditionBadgeProps {
  condition: ProductCondition;
  className?: string;
}

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  const config = CONDITION_MAP[condition] ?? CONDITION_MAP.USED;
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export default ConditionBadge;