"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { ArrowLeft, CalendarClock, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSection, PageLoading, Surface } from "@/components/design-system";
import { useAcademicGroup, useMyAssignedSessions, useSchedules } from "@/hooks/use-data";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const courseId = Number(id);
  const { data: course, isLoading } = useAcademicGroup(courseId);
  const { data: schedulesPage } = useSchedules({ grupoId: courseId, size: 100 });
  const { data: assignedSessions } = useMyAssignedSessions();

  const sessions = useMemo(() => {
    const schedules = schedulesPage?.content ?? [];
    const assigned = assignedSessions ?? [];
    return assigned.filter((session) =>
      schedules.some((schedule) => schedule.id === session.scheduleId)
    );
  }, [assignedSessions, schedulesPage]);

  if (isLoading || !course) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/courses">
          <ArrowLeft className="h-4 w-4" />
          Volver a cursos
        </Link>
      </Button>

      <HeroSection
        eyebrow="Curso"
        title={course.nombre}
        description={course.descripcion ?? `Periodo ${course.periodo}`}
      />

      <Surface>
        <h2 className="font-medium">Simulaciones asignadas</h2>
        <div className="mt-4 space-y-3">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.scheduleId} className="rounded-xl border border-border/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{session.caseTitle}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {format(new Date(session.fechaInicio), "d MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <Badge variant="outline">{session.status}</Badge>
                </div>
                <Button asChild size="sm" className="mt-3">
                  <Link href={`/simulator/${session.caseId}`}>Ir a simulación</Link>
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no tienes simulaciones asignadas en este curso.
            </p>
          )}
        </div>
      </Surface>

      <Surface variant="muted">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Historial académico</h2>
            <p className="text-sm text-muted-foreground">
              Consulta tus evaluaciones y evolución en este curso.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/evaluation/history">
              <History className="h-4 w-4" />
              Ver historial
            </Link>
          </Button>
        </div>
      </Surface>
    </div>
  );
}
