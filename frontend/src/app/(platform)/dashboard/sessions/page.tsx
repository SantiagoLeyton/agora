"use client";

import Link from "next/link";
import { CalendarClock, Play, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HeroSection,
  Surface,
  SectionHeader,
  PageLoading,
} from "@/components/design-system";
import { useMyAssignedSessions } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";
import {
  assignedSessionStatusLabel,
  canStartAssignedSession,
} from "@/lib/student-session-adapters";
import { ApiError } from "@/services/api-error";

export default function AssignedSessionsPage() {
  const meta = getPageHeroMeta("/dashboard/sessions");
  const { data: sessions, isLoading, isError, error } = useMyAssignedSessions();

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
      />

      {isError ? (
        <Surface variant="muted" className="py-12 text-center text-sm text-muted-foreground">
          {error instanceof ApiError
            ? error.message
            : "No se pudieron cargar las sesiones asignadas."}
        </Surface>
      ) : !sessions?.length ? (
        <Surface variant="muted" className="py-16 text-center">
          <CalendarClock className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No hay sesiones asignadas</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuando tu docente programe una simulación en tu grupo, aparecerá aquí.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/simulator">Explorar catálogo libre</Link>
          </Button>
        </Surface>
      ) : (
        <div className="space-y-4">
          <SectionHeader title="Programaciones de tu grupo" />
          {sessions.map((session) => (
            <Surface key={session.scheduleId} padding="md" className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-display text-lg font-semibold">{session.caseTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.groupName} · {session.teacherEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(session.fechaInicio), "d MMM yyyy HH:mm", { locale: es })}
                    {" — "}
                    {format(new Date(session.fechaFin), "d MMM yyyy HH:mm", { locale: es })}
                  </p>
                </div>
                <Badge variant={session.activo ? "default" : "muted"}>
                  {assignedSessionStatusLabel(session.status)}
                </Badge>
              </div>

              {canStartAssignedSession(session) ? (
                <Button asChild>
                  <Link
                    href={
                      session.status === "en_proceso" && session.attemptId
                        ? `/simulator/${session.caseId}/play?programacionId=${session.scheduleId}`
                        : `/simulator/${session.caseId}?programacionId=${session.scheduleId}`
                    }
                  >
                    <Play className="h-4 w-4" />
                    {session.status === "en_proceso" ? "Continuar sesión" : "Iniciar sesión asignada"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {session.status === "finalizada"
                    ? "Sesión finalizada."
                    : session.status === "cerrada"
                      ? "El periodo de esta programación ya finalizó."
                      : "Esta sesión aún no está disponible."}
                </p>
              )}
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
