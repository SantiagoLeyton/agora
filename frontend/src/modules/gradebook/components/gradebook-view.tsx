"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Search, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HeroSection,
  PageLoading,
  Surface,
  SectionHeader,
} from "@/components/design-system";
import { DataTable } from "@/components/design-system/data-table";
import { GradebookAnalyticsPanel } from "@/modules/gradebook/components/gradebook-analytics-panel";
import { GradebookDetailPanel } from "@/modules/gradebook/components/gradebook-detail-panel";
import {
  useCases,
  useGradebookAnalytics,
  useGradebookDetail,
  useGradebookEntries,
  useGroups,
  useStudents,
} from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";
import {
  gradebookService,
  triggerFileDownload,
} from "@/services/gradebook-service";
import { ApiError } from "@/services/api-error";
import type { GradebookFilters } from "@/types/gradebook";

const ESTADOS = ["En progreso", "Finalizado", "Abandonado"] as const;

interface GradebookViewProps {
  basePath: "/teacher/grades" | "/admin/grades";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return format(new Date(value), "d MMM yyyy", { locale: es });
}

function formatGrade(nota: number | null | undefined) {
  if (nota == null) return "—";
  return `${nota.toFixed(1)} / 5.0`;
}

export function GradebookView({ basePath }: GradebookViewProps) {
  const meta = getPageHeroMeta(basePath);
  const [filters, setFilters] = useState<GradebookFilters>({ page: 0, size: 20, sort: "id,desc" });
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<"csv" | "excel" | null>(null);

  const { data: groups } = useGroups({ size: 100, activo: true });
  const { data: cases } = useCases({ size: 100, activo: true });
  const { data: students } = useStudents();
  const { data: page, isLoading, isError, error } = useGradebookEntries(filters);
  const { data: analytics } = useGradebookAnalytics(filters);
  const { data: detail, isLoading: detailLoading } = useGradebookDetail(selectedAttemptId ?? undefined);

  const exportFilters = useMemo(
    () => ({
      grupoId: filters.grupoId,
      casoId: filters.casoId,
      estudianteId: filters.estudianteId,
      desde: filters.desde,
      hasta: filters.hasta,
      estado: filters.estado,
      notaMinima: filters.notaMinima,
      notaMaxima: filters.notaMaxima,
    }),
    [filters]
  );

  const updateFilter = (patch: Partial<GradebookFilters>) => {
    setFilters((current) => ({ ...current, ...patch, page: 0 }));
  };

  const clearFilters = () => {
    setFilters({ page: 0, size: 20, sort: "id,desc" });
  };

  const handleExport = async (format: "csv" | "excel") => {
    setExportError(null);
    setIsExporting(format);
    try {
      const blob = await gradebookService.downloadExport(format, exportFilters);
      triggerFileDownload(blob, format === "csv" ? "calificaciones.csv" : "calificaciones.xlsx");
    } catch (exportFailure) {
      setExportError(
        exportFailure instanceof ApiError
          ? exportFailure.message
          : "No se pudo exportar el libro de calificaciones."
      );
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      <Surface>
        <SectionHeader
          title="Filtros"
          description="Curso → programación → caso → intentos → calificaciones"
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="grupoId">Curso</Label>
            <select
              id="grupoId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={filters.grupoId ?? ""}
              onChange={(event) =>
                updateFilter({
                  grupoId: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            >
              <option value="">Todos</option>
              {groups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="casoId">Caso</Label>
            <select
              id="casoId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={filters.casoId ?? ""}
              onChange={(event) =>
                updateFilter({
                  casoId: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            >
              <option value="">Todos</option>
              {cases?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estudianteId">Estudiante</Label>
            <select
              id="estudianteId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={filters.estudianteId ?? ""}
              onChange={(event) =>
                updateFilter({
                  estudianteId: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            >
              <option value="">Todos</option>
              {(students ?? []).map((student) => {
                const numericId = student.id.includes("-")
                  ? Number(student.id.split("-")[1])
                  : Number(student.id);
                return (
                  <option key={student.id} value={numericId}>
                    {student.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <select
              id="estado"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={filters.estado ?? ""}
              onChange={(event) =>
                updateFilter({ estado: event.target.value || undefined })
              }
            >
              <option value="">Todos</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desde">Desde</Label>
            <Input
              id="desde"
              type="date"
              value={filters.desde?.slice(0, 10) ?? ""}
              onChange={(event) =>
                updateFilter({
                  desde: event.target.value
                    ? new Date(`${event.target.value}T00:00:00.000Z`).toISOString()
                    : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hasta">Hasta</Label>
            <Input
              id="hasta"
              type="date"
              value={filters.hasta?.slice(0, 10) ?? ""}
              onChange={(event) =>
                updateFilter({
                  hasta: event.target.value
                    ? new Date(`${event.target.value}T23:59:59.999Z`).toISOString()
                    : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notaMinima">Nota mínima</Label>
            <Input
              id="notaMinima"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={filters.notaMinima ?? ""}
              onChange={(event) =>
                updateFilter({
                  notaMinima: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notaMaxima">Nota máxima</Label>
            <Input
              id="notaMaxima"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={filters.notaMaxima ?? ""}
              onChange={(event) =>
                updateFilter({
                  notaMaxima: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting !== null}
            onClick={() => handleExport("csv")}
          >
            <Download className="h-4 w-4" />
            {isExporting === "csv" ? "Exportando CSV..." : "Exportar CSV"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting !== null}
            onClick={() => handleExport("excel")}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {isExporting === "excel" ? "Exportando Excel..." : "Exportar Excel"}
          </Button>
        </div>
        {exportError && <p className="mt-3 text-sm text-destructive">{exportError}</p>}
      </Surface>

      <GradebookAnalyticsPanel analytics={analytics} />

      {isLoading ? (
        <PageLoading />
      ) : isError ? (
        <Surface variant="muted" className="py-12 text-center text-sm text-muted-foreground">
          {error instanceof ApiError
            ? error.message
            : "No se pudo cargar el libro de calificaciones."}
        </Surface>
      ) : (
        <Surface padding="none">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <SectionHeader
              title="Calificaciones"
              description={`${page?.totalElements ?? 0} intentos visibles`}
            />
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <DataTable
            data={page?.content ?? []}
            keyExtractor={(row) => String(row.attemptId)}
            emptyMessage="No hay intentos que coincidan con los filtros."
            columns={[
              {
                key: "estudiante",
                header: "Estudiante",
                cell: (row) => (
                  <div>
                    <p className="font-medium">{row.estudianteNombre}</p>
                    <p className="text-xs text-muted-foreground">{row.estudianteCorreo}</p>
                  </div>
                ),
              },
              { key: "curso", header: "Curso", cell: (row) => row.grupoNombre ?? "—" },
              { key: "caso", header: "Caso", cell: (row) => row.casoTitulo },
              {
                key: "fecha",
                header: "Fecha",
                cell: (row) => formatDate(row.fechaPresentacion),
              },
              {
                key: "estado",
                header: "Estado",
                cell: (row) => <Badge variant="outline">{row.estado}</Badge>,
              },
              {
                key: "nota",
                header: "Nota",
                cell: (row) => (
                  <span className={row.aprobado ? "text-success" : "text-destructive"}>
                    {formatGrade(row.notaFinal)}
                  </span>
                ),
              },
              {
                key: "rda",
                header: "RDA",
                cell: (row) => (
                  <span className="text-xs tabular-nums">
                    {row.rdaCumplidos}/{row.rdaParciales}/{row.rdaPendientes}
                  </span>
                ),
              },
              {
                key: "feedbackDocente",
                header: "Feedback docente",
                cell: (row) => (
                  <span className="line-clamp-2 max-w-[180px] text-xs text-muted-foreground">
                    {row.feedbackDocente ?? "—"}
                  </span>
                ),
              },
              {
                key: "feedbackIa",
                header: "Feedback IA",
                cell: (row) => (
                  <span className="line-clamp-2 max-w-[180px] text-xs text-muted-foreground">
                    {row.feedbackIa ?? "—"}
                  </span>
                ),
              },
              {
                key: "accion",
                header: "",
                cell: (row) => (
                  <Button
                    variant={selectedAttemptId === row.attemptId ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedAttemptId(row.attemptId)}
                  >
                    Ver detalle
                  </Button>
                ),
              },
            ]}
          />

          {page && page.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/50 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Página {page.number + 1} de {page.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page.first}
                  onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 0) - 1 }))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page.last}
                  onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 0) + 1 }))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Surface>
      )}

      {selectedAttemptId && detailLoading && <PageLoading />}
      {selectedAttemptId && detail && (
        <GradebookDetailPanel detail={detail} onClose={() => setSelectedAttemptId(null)} />
      )}
    </div>
  );
}
