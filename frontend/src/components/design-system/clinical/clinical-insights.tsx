"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { tokens } from "@/styles/tokens";

type InsightSeverity = "info" | "warning" | "alert" | "success";

interface ClinicalInsight {
  id: string;
  severity: InsightSeverity;
  message: string;
  detail?: string;
}

const severityConfig: Record<
  InsightSeverity,
  { icon: typeof Info; className: string }
> = {
  info: { icon: Info, className: "border-info/20 bg-info/[0.06] text-info" },
  warning: { icon: AlertTriangle, className: "border-warning/25 bg-warning/[0.06] text-warning" },
  alert: { icon: Sparkles, className: "border-brand/20 bg-brand/[0.05] text-brand" },
  success: { icon: CheckCircle2, className: "border-success/25 bg-success/[0.06] text-success" },
};

interface ClinicalInsightsProps {
  insights: ClinicalInsight[];
  title?: string;
  className?: string;
}

export function ClinicalInsights({
  insights,
  title = "Insights clínicos",
  className,
}: ClinicalInsightsProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      {insights.map((insight, i) => {
        const config = severityConfig[insight.severity];
        const Icon = config.icon;
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * tokens.motion.stagger }}
            whileHover={{ y: -1 }}
            className={cn(
              "rounded-xl border p-3.5 transition-shadow duration-300 hover:shadow-[var(--shadow-sm)]",
              config.className
            )}
          >
            <div className="flex gap-2.5">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium leading-snug text-foreground">{insight.message}</p>
                {insight.detail && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{insight.detail}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
