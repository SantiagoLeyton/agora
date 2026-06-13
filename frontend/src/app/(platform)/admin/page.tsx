"use client";

import Link from "next/link";
import { Shield, UserCog, Settings, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeroSection,
  MetricGrid,
  Surface,
  SectionHeader,
  ActionTile,
  ActionTileGrid,
  PageLoading,
} from "@/components/design-system";
import { InstitutionalLogo } from "@/components/shared/institutional-logo";
import { useUsers, useCases, useAttempts, useAcademicGroups } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";
import { BRAND } from "@/lib/branding";
import { mapAdminCountsToDashboardStats } from "@/lib/dashboard-adapters";

const adminMetricIcons = {
  "Usuarios registrados": UserCog,
  "Grupos académicos": Shield,
  "Casos publicados": GraduationCap,
  "Intentos registrados": Settings,
};

export default function AdminDashboardPage() {
  const meta = getPageHeroMeta("/admin");
  const { data: usersPage, isLoading: usersLoading } = useUsers({ size: 1 });
  const { data: cases, isLoading: casesLoading } = useCases();
  const { data: attemptsPage, isLoading: attemptsLoading } = useAttempts({ size: 1 });
  const { data: groupsPage, isLoading: groupsLoading } = useAcademicGroups({ size: 1 });

  if (usersLoading || casesLoading || attemptsLoading || groupsLoading) {
    return <PageLoading />;
  }

  const adminStats = mapAdminCountsToDashboardStats({
    users: usersPage?.totalElements ?? 0,
    cases: cases?.length ?? 0,
    attempts: attemptsPage?.totalElements ?? 0,
    groups: groupsPage?.totalElements ?? 0,
  });

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        tags={["Ecosistema institucional"]}
        stats={adminStats.slice(0, 3).map((s) => ({
          label: s.label.split(" ")[0],
          value: s.value,
          hint: s.change,
        }))}
        aside={
          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-background/60 p-4">
            <InstitutionalLogo size="md" showText subtitle={BRAND.institutionName} />
          </div>
        }
      />

      <MetricGrid stats={adminStats} icons={adminMetricIcons} />

      <SectionHeader title="Gestión del ecosistema" />
      <ActionTileGrid>
        <ActionTile href="/admin/users" icon={UserCog} title="Usuarios" description="Cuentas y permisos" index={0} />
        <ActionTile href="/admin/settings" icon={Settings} title="Permisos" description="Matriz de referencia" index={1} />
        <ActionTile href="/teacher" icon={GraduationCap} title="Panel docente" description="Gestión académica" index={2} />
        <ActionTile href="/simulator" icon={Shield} title="Simulador" description="Vista de casos" index={3} />
      </ActionTileGrid>

      <Surface variant="muted" className="flex flex-col items-center py-10 text-center sm:flex-row sm:text-left sm:py-8 sm:px-8 gap-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Shield className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold">Ecosistema {BRAND.platformName}</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Administración centralizada de usuarios, contenido académico y políticas institucionales
            para {BRAND.institutionName}.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/settings">Ver matriz de permisos</Link>
        </Button>
      </Surface>
    </div>
  );
}
