"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { HeroSection, Surface, PageLoading } from "@/components/design-system";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAssignments } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";

export default function TeacherAssignmentsPage() {
  const { data: assignments, isLoading } = useAssignments();
  const meta = getPageHeroMeta("/teacher/assignments");

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      {isLoading ? (
        <PageLoading />
      ) : (
        <div className="space-y-3">
          {assignments?.map((a) => (
            <Surface key={a.id} hover>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.caseTitle}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline">{a.groupName}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Vence: {format(new Date(a.dueDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
                <div className="w-full space-y-1 sm:w-48">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Completado</span>
                    <span className="font-medium tabular-nums">{a.completionRate}%</span>
                  </div>
                  <Progress value={a.completionRate} />
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
