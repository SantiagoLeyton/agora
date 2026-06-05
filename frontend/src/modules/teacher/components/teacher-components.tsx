"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClinicalAvatar } from "@/components/design-system";
import { DataTable, Surface } from "@/components/design-system";
import type { Student } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: { label: "Activo", variant: "success" as const },
  inactive: { label: "Inactivo", variant: "muted" as const },
  at_risk: { label: "En riesgo", variant: "warning" as const },
};

interface StudentTableProps {
  students: Student[];
}

export function StudentTable({ students }: StudentTableProps) {
  return (
    <DataTable<Student>
      data={students}
      keyExtractor={(s) => s.id}
      emptyMessage="No hay estudiantes registrados"
      columns={[
        {
          key: "name",
          header: "Estudiante",
          cell: (s) => (
            <div className="flex items-center gap-3">
              <ClinicalAvatar name={s.name} tone="student" size="md" />
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.email}</p>
              </div>
            </div>
          ),
        },
        { key: "group", header: "Grupo", cell: (s) => <span className="text-muted-foreground">{s.group}</span> },
        {
          key: "progress",
          header: "Progreso",
          cell: (s) => (
            <div className="flex min-w-[120px] items-center gap-2">
              <Progress value={s.progress} className="h-1.5 flex-1" />
              <span className="text-xs tabular-nums">{s.progress}%</span>
            </div>
          ),
        },
        { key: "cases", header: "Casos", cell: (s) => s.casesCompleted },
        {
          key: "status",
          header: "Estado",
          cell: (s) => {
            const status = statusConfig[s.status];
            return <Badge variant={status.variant}>{status.label}</Badge>;
          },
        },
      ]}
    />
  );
}

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    studentsCount: number;
    activeCases: number;
    averageProgress: number;
    semester: string;
  };
  index: number;
}

export function GroupCard({ group, index }: GroupCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Surface hover className="h-full">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-semibold">{group.name}</h3>
            <p className="text-xs text-muted-foreground">Semestre {group.semester}</p>
          </div>
          <Badge variant="outline">{group.studentsCount} estudiantes</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Casos activos</p>
            <p className="font-semibold">{group.activeCases}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Progreso promedio</p>
            <p
              className={cn(
                "font-semibold tabular-nums",
                group.averageProgress >= 70 ? "text-success" : "text-warning"
              )}
            >
              {group.averageProgress}%
            </p>
          </div>
        </div>
        <Progress value={group.averageProgress} className="mt-4 h-1.5" />
      </Surface>
    </motion.div>
  );
}
