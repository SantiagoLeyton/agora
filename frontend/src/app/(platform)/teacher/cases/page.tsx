"use client";

import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSection, Surface, PageLoading } from "@/components/design-system";
import { useCases } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";

export default function TeacherCasesPage() {
  const { data: cases, isLoading } = useCases();
  const meta = getPageHeroMeta("/teacher/cases");

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        action={
          <Button variant="brand" asChild>
            <Link href="/teacher/cases/new">
              <Plus className="h-4 w-4" />
              Crear caso
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <PageLoading />
      ) : (
        <div className="space-y-3">
          {cases?.map((caseItem) => (
            <Surface key={caseItem.id} hover className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{caseItem.category}</Badge>
                  <Badge variant={caseItem.difficulty === "advanced" ? "destructive" : "muted"}>
                    {caseItem.difficulty}
                  </Badge>
                  {caseItem.isCustom && (
                    <Badge variant="secondary">Personalizado</Badge>
                  )}
                  {caseItem.patientModel === "haru" && (
                    <Badge variant="outline">Avatar femenino</Badge>
                  )}
                </div>
                <h3 className="font-medium">{caseItem.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{caseItem.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/simulator/${caseItem.id}`}>
                    <Eye className="h-3.5 w-3.5" />
                    Vista previa
                  </Link>
                </Button>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
