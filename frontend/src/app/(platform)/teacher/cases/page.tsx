"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeroSection, Surface, PageLoading } from "@/components/design-system";
import { useCases } from "@/hooks/use-data";
import { useAuthStore } from "@/store";
import { canManageClinicalCases } from "@/lib/case-permissions";
import { getPageHeroMeta } from "@/lib/page-meta";
import type { CaseFilters } from "@/types/clinical-case";

function formatDate(value?: string): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function TeacherCasesPage() {
  const meta = getPageHeroMeta("/teacher/cases");
  const backendRole = useAuthStore((state) => state.user?.backendRole);
  const canManage = canManageClinicalCases(backendRole);
  const [search, setSearch] = useState("");
  const [nivelDificultad, setNivelDificultad] = useState("");
  const [rdaSearch, setRdaSearch] = useState("");
  const [activo, setActivo] = useState<string>("");

  const filters = useMemo<CaseFilters>(() => {
    const next: CaseFilters = { size: 100 };
    if (search.trim()) next.search = search.trim();
    if (nivelDificultad) next.nivelDificultad = nivelDificultad;
    if (rdaSearch.trim()) next.rdaSearch = rdaSearch.trim();
    if (activo === "true" || activo === "false") next.activo = activo === "true";
    return next;
  }, [search, nivelDificultad, rdaSearch, activo]);

  const { data: cases, isLoading } = useCases(filters);

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description="Repositorio académico de casos clínicos con trazabilidad de autor, fechas y resultados de aprendizaje."
        action={
          canManage ? (
            <Button variant="brand" asChild>
              <Link href="/teacher/cases/new">
                <Plus className="h-4 w-4" />
                Crear caso
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Surface className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="case-search">Buscar</Label>
          <Input
            id="case-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Título o descripción"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="case-level">Nivel</Label>
          <select
            id="case-level"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={nivelDificultad}
            onChange={(e) => setNivelDificultad(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="BASICO">Básico</option>
            <option value="INTERMEDIO">Intermedio</option>
            <option value="AVANZADO">Avanzado</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="case-rda">RDA</Label>
          <Input
            id="case-rda"
            value={rdaSearch}
            onChange={(e) => setRdaSearch(e.target.value)}
            placeholder="Filtrar por resultado de aprendizaje"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="case-status">Estado</Label>
          <select
            id="case-status"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            value={activo}
            onChange={(e) => setActivo(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </Surface>

      {isLoading ? (
        <PageLoading />
      ) : (
        <div className="space-y-3">
          {cases?.map((caseItem) => (
            <Surface
              key={caseItem.id}
              hover
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{caseItem.category}</Badge>
                  <Badge variant={caseItem.difficulty === "advanced" ? "destructive" : "muted"}>
                    {caseItem.difficulty}
                  </Badge>
                  <Badge variant={caseItem.isActive === false ? "secondary" : "outline"}>
                    {caseItem.isActive === false ? "Inactivo" : "Activo"}
                  </Badge>
                </div>
                <h3 className="font-medium">{caseItem.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {caseItem.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Autor: {caseItem.authorName ?? "Sin autor"}</span>
                  <span>Creado: {formatDate(caseItem.createdAt)}</span>
                  <span>Actualizado: {formatDate(caseItem.updatedAt)}</span>
                </div>
                {caseItem.learningObjectives.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {caseItem.learningObjectives.slice(0, 3).map((rda) => (
                      <Badge key={rda} variant="secondary" className="font-normal">
                        {rda}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {canManage && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/teacher/cases/${caseItem.id}/edit`}>
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                  </Button>
                )}
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
