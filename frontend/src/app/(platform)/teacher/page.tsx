"use client";

import Link from "next/link";
import { Plus, BookOpen, Users, CalendarClock, BarChart3, MessageSquareText, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeroSection,
  MetricGrid,
  Surface,
  SectionHeader,
  ActionTile,
  ActionTileGrid,
  DataTable,
  ClinicalInsights,
} from "@/components/design-system";
import { clinicalInsights } from "@/lib/clinical-copy";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClinicalAvatar } from "@/components/design-system";
import { mockTeacherStats } from "@/mocks";
import { useStudents, useAssignments, useCases } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Student } from "@/types";

const teacherMetricIcons = {
  "Estudiantes activos": Users,
  "Promedio grupal": BarChart3,
  "Asignaciones activas": ClipboardList,
  "Estudiantes en riesgo": MessageSquareText,
};

export default function TeacherDashboardPage() {
  const { data: students, isLoading } = useStudents();
  const { data: assignments } = useAssignments();
  const { data: cases } = useCases();
  const meta = getPageHeroMeta("/teacher");

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        tags={["Gestión académica", "Seguimiento clínico"]}
        stats={mockTeacherStats.slice(0, 3).map((s) => ({
          label: s.label.replace("Estudiantes activos", "Activos").replace("Promedio grupal", "Promedio"),
          value: s.value,
          hint: s.change,
        }))}
        action={
          <Button asChild variant="brand" size="lg">
            <Link href="/teacher/cases">
              <Plus className="h-4 w-4" />
              Nuevo caso clínico
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MetricGrid stats={mockTeacherStats} icons={teacherMetricIcons} />
        </div>
        <Surface variant="muted">
          <ClinicalInsights insights={clinicalInsights.teacher} title="Inteligencia clínica" />
        </Surface>
      </div>

      <SectionHeader title="Acciones rápidas" />
      <ActionTileGrid>
        <ActionTile href="/teacher/cases" icon={BookOpen} title="Casos" description="Diseñar simulaciones" index={0} />
        <ActionTile href="/teacher/simulations" icon={CalendarClock} title="Programar" description="Agendar sesiones" index={1} />
        <ActionTile href="/teacher/evaluations" icon={BarChart3} title="Evaluar" description="Revisar desempeño" index={2} />
        <ActionTile href="/teacher/feedback" icon={MessageSquareText} title="Feedback" description="Retroalimentación" index={3} />
      </ActionTileGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <Surface className="lg:col-span-2">
          <SectionHeader
            title="Estudiantes recientes"
            action={
              <Button asChild variant="link" className="h-auto p-0">
                <Link href="/teacher/students">Ver todos</Link>
              </Button>
            }
          />
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <DataTable<Student>
              data={students?.slice(0, 5) ?? []}
              keyExtractor={(s) => `${s.email}-${s.group}`}
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
                {
                  key: "progress",
                  header: "Progreso",
                  cell: (s) => (
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={s.progress} className="h-1.5 flex-1" />
                      <span className="text-xs tabular-nums">{s.progress}%</span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Estado",
                  cell: (s) => (
                    <Badge
                      variant={
                        s.status === "active" ? "success" : s.status === "at_risk" ? "warning" : "muted"
                      }
                    >
                      {s.status === "active" ? "Activo" : s.status === "at_risk" ? "En riesgo" : "Inactivo"}
                    </Badge>
                  ),
                },
              ]}
            />
          )}
        </Surface>

        <div className="space-y-6">
          <Surface>
            <SectionHeader title="Asignaciones activas" />
            <div className="mt-4 space-y-3">
              {assignments?.map((a) => (
                <div key={a.id} className="rounded-lg border border-border/50 bg-muted/15 p-3">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.groupName}</p>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {format(new Date(a.dueDate), "d MMM", { locale: es })}
                    </span>
                    <span className="font-medium text-primary">{a.completionRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface>
            <SectionHeader title="Casos publicados" />
            <div className="mt-4 space-y-2">
              {(cases ?? []).slice(0, 3).map((c) => (
                <div key={c.id} className="flex justify-between rounded-lg border border-border/40 p-2.5 text-sm">
                  <span className="line-clamp-1 font-medium">{c.title}</span>
                  <Button asChild variant="ghost" size="sm" className="h-7 shrink-0">
                    <Link href="/teacher/cases">Editar</Link>
                  </Button>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
