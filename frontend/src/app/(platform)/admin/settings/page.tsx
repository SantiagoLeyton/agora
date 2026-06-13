"use client";

import {
  HeroSection,
  Surface,
  SectionHeader,
  DataTable,
} from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { getPageHeroMeta } from "@/lib/page-meta";
import { BRAND } from "@/lib/branding";
import { useRoles } from "@/hooks/use-data";

const permissions = [
  { module: "Cursos", estudiante: true, docente: true, docenteAdmin: true, administrador: true },
  { module: "Simulador", estudiante: true, docente: true, docenteAdmin: true, administrador: false },
  { module: "Evaluación y feedback", estudiante: true, docente: true, docenteAdmin: true, administrador: true },
  { module: "Gestión de casos clínicos", estudiante: false, docente: false, docenteAdmin: true, administrador: true },
  { module: "Métricas pedagógicas", estudiante: false, docente: true, docenteAdmin: true, administrador: true },
  { module: "Usuarios institucionales", estudiante: false, docente: false, docenteAdmin: false, administrador: true },
];

export default function AdminSettingsPage() {
  const meta = getPageHeroMeta("/admin/settings");
  const { data: roles = [] } = useRoles();

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      <Surface>
        <SectionHeader
          title="Institución"
          description="Identidad académica fija de la plataforma"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge variant="outline">{BRAND.institutionName}</Badge>
          <p className="text-sm text-muted-foreground">
            La institución no es configurable desde el panel administrativo.
          </p>
        </div>
      </Surface>

      <Surface>
        <SectionHeader
          title="Roles del sistema"
          description="Roles persistidos en la base de datos"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {roles.map((role) => (
            <Badge key={role.id} variant="secondary">
              {role.nombre}
            </Badge>
          ))}
        </div>
      </Surface>

      <Surface>
        <SectionHeader
          title="Permisos por rol (solo lectura)"
          description="Matriz de referencia académica. Los permisos efectivos se aplican en backend y no son editables desde esta pantalla."
        />
        <div className="mt-4">
          <DataTable
            data={permissions}
            keyExtractor={(row) => row.module}
            columns={[
              { key: "module", header: "Módulo", cell: (row) => <span className="font-medium">{row.module}</span> },
              {
                key: "estudiante",
                header: "Estudiante",
                className: "text-center",
                cell: (row) => (row.estudiante ? "✓" : "—"),
              },
              {
                key: "docente",
                header: "Docente",
                className: "text-center",
                cell: (row) => (row.docente ? "✓" : "—"),
              },
              {
                key: "docenteAdmin",
                header: "Docente Admin",
                className: "text-center",
                cell: (row) => (row.docenteAdmin ? "✓" : "—"),
              },
              {
                key: "administrador",
                header: "Administrador",
                className: "text-center",
                cell: (row) => (row.administrador ? "✓" : "—"),
              },
            ]}
          />
        </div>
      </Surface>
    </div>
  );
}
