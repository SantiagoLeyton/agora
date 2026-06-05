/** Re-exports del design system — compatibilidad */
export {
  MetricCard,
  MetricGrid,
  SectionHeader as PageHeader,
  SectionHeader,
  Surface as PremiumSurface,
  EmptyState,
  HeroSection,
} from "@/components/design-system";

import { MetricCard } from "@/components/design-system";
import type { DashboardStat } from "@/types";

/** @deprecated use MetricCard directamente */
export function StatCard({ stat, index = 0 }: { stat: DashboardStat; index?: number }) {
  return (
    <MetricCard
      label={stat.label}
      value={stat.value}
      change={stat.change}
      trend={stat.trend}
      index={index}
    />
  );
}
