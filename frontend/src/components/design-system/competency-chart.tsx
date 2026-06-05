"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Surface } from "./surface";
import { SectionHeader } from "./section-header";
import type { EvaluationMetric } from "@/types";

interface CompetencyRadarProps {
  metrics: EvaluationMetric[];
  className?: string;
}

export function CompetencyRadar({ metrics, className }: CompetencyRadarProps) {
  const data = metrics.map((m) => ({
    subject: m.label.length > 18 ? `${m.label.slice(0, 16)}…` : m.label,
    value: m.value,
    fullMark: m.maxValue,
  }));

  return (
    <Surface className={className}>
      <SectionHeader
        title="Perfil de competencias"
        description="Distribución clínica evaluada en esta simulación"
      />
      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <Radar
              name="Competencia"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value ?? 0}%`, "Nivel"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Surface>
  );
}

interface TrendPoint {
  label: string;
  value: number;
}

interface CompetencyTrendProps {
  data: TrendPoint[];
  className?: string;
}

export function CompetencyTrend({ data, className }: CompetencyTrendProps) {
  return (
    <Surface className={className}>
      <SectionHeader
        title="Evolución formativa"
        description="Progreso en simulaciones del semestre"
      />
      <div className="mt-4 h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [`${value ?? 0}%`, "Promedio"]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Surface>
  );
}
