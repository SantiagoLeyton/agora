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
  PageLoading,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { ClinicalAvatar } from "@/components/design-system";
import { useAuthStore } from "@/store";
import { useStudents, useAssignments, useCases, useTeacherMetrics } from "@/hooks/use-data";
import { canManageClinicalCases } from "@/lib/case-permissions";
import { getPageHeroMeta } from "@/lib/page-meta";
import { mapTeacherMetricsToOverviewStats } from "@/lib/teacher-metrics-adapters";
import { mapTeacherMetricsToDashboardHero } from "@/lib/dashboard-adapters";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Student } from "@/types";

const teacherMetricIcons = {
  "Participantes matriculados": Users,
  "Tasa de finalización": BarChart3,
  "Programaciones activas": ClipboardList,
  "Pendientes de retroalimentación": MessageSquareText,
};

export default function TeacherDashboardPage() {
  const backendRole = useAuthStore((state) => state.user?.backendRole);
  const canManageCases = canManageClinicalCases(backendRole);
  const { data: students, isLoading } = useStudents();
  const { data: assignments } = useAssignments();
  const { data: cases } = useCases();
  const { data: metrics, isLoading: metricsLoading } = useTeacherMetrics();
  const meta = getPageHeroMeta("/teacher");
  const metricStats = metrics ? mapTeacherMetricsToOverviewStats(metrics) : [];

  if (metricsLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        tags={["Gestión académica", "Seguimiento clínico"]}
        stats={mapTeacherMetricsToDashboardHero(metrics)}
        action={
          canManageCases ? (
            <Button asChild variant="brand" size="lg">
              <Link href="/teacher/cases/new">
                <Plus className="h-4 w-4" />
                Nuevo caso clínico
              </Link>
            </Button>
          ) : undefined
        }
      />

      <MetricGrid stats={metricStats} icons={teacherMetricIcons} />

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
          ) : !students?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay estudiantes asignados a tus grupos.
            </p>
          ) : (
            <DataTable<Student>
              data={students.slice(0, 5)}
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
                  key: "group",
                  header: "Grupo",
                  cell: (s) => <span className="text-sm">{s.group}</span>,
                },
                {
                  key: "status",
                  header: "Estado",
                  cell: (s) => (
                    <Badge variant={s.status === "active" ? "success" : "muted"}>
                      {s.status === "active" ? "Activo" : "Inactivo"}
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
              {!assignments?.length ? (
                <p className="text-sm text-muted-foreground">No hay programaciones activas.</p>
              ) : (
                assignments.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border/50 bg-muted/15 p-3">
                    <p className="text-sm font-medium">{a.caseTitle}</p>
                    <p className="text-xs text-muted-foreground">{a.groupName}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Vence {format(new Date(a.dueDate), "d MMM yyyy", { locale: es })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Surface>

          <Surface>
            <SectionHeader title="Casos publicados" />
            <div className="mt-4 space-y-2">
              {!cases?.length ? (
                <p className="text-sm text-muted-foreground">No hay casos publicados.</p>
              ) : (
                cases.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex justify-between rounded-lg border border-border/40 p-2.5 text-sm">
                    <span className="line-clamp-1 font-medium">{c.title}</span>
                    <Button asChild variant="ghost" size="sm" className="h-7 shrink-0">
                      <Link href="/teacher/cases">Ver</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
