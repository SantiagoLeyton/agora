"use client";

import {
  HeroSection,
  Surface,
  SectionHeader,
  DataTable,
} from "@/components/design-system";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getPageHeroMeta } from "@/lib/page-meta";
import { BRAND } from "@/lib/branding";

const permissions = [
  { module: "Simulador", student: true, teacher: true, admin: true },
  { module: "Evaluación", student: true, teacher: true, admin: true },
  { module: "Panel docente", student: false, teacher: true, admin: true },
  { module: "Administración", student: false, teacher: false, admin: true },
];

export default function AdminSettingsPage() {
  const meta = getPageHeroMeta("/admin/settings");

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <SectionHeader title="Institución" description="Datos generales de la organización" />
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inst-name">Nombre de la institución</Label>
              <Input id="inst-name" defaultValue={BRAND.institutionName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inst-domain">Dominio de correo</Label>
              <Input id="inst-domain" defaultValue="@uni.edu" />
            </div>
            <Button>Guardar cambios</Button>
          </div>
        </Surface>

        <Surface>
          <SectionHeader title="Simulador" description="Configuración del módulo de simulación" />
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-time">Tiempo máximo por sesión (min)</Label>
              <Input id="session-time" type="number" defaultValue="90" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-score">Puntuación mínima aprobatoria (%)</Label>
              <Input id="min-score" type="number" defaultValue="70" />
            </div>
            <Button>Guardar cambios</Button>
          </div>
        </Surface>

        <Surface className="lg:col-span-2">
          <SectionHeader title="Permisos por rol" description="Control de acceso a módulos del sistema" />
          <div className="mt-4">
            <DataTable
              data={permissions}
              keyExtractor={(r) => r.module}
              columns={[
                { key: "module", header: "Módulo", cell: (r) => <span className="font-medium">{r.module}</span> },
                {
                  key: "student",
                  header: "Estudiante",
                  className: "text-center",
                  cell: (r) => (
                    <span className={r.student ? "text-success" : "text-muted-foreground"}>
                      {r.student ? "✓" : "—"}
                    </span>
                  ),
                },
                {
                  key: "teacher",
                  header: "Docente",
                  className: "text-center",
                  cell: (r) => (
                    <span className={r.teacher ? "text-success" : "text-muted-foreground"}>
                      {r.teacher ? "✓" : "—"}
                    </span>
                  ),
                },
                {
                  key: "admin",
                  header: "Admin",
                  className: "text-center",
                  cell: (r) => (
                    <span className={r.admin ? "text-success" : "text-muted-foreground"}>
                      {r.admin ? "✓" : "—"}
                    </span>
                  ),
                },
              ]}
            />
          </div>
          <Separator className="my-6" />
          <Button>Actualizar permisos</Button>
        </Surface>
      </div>
    </div>
  );
}
