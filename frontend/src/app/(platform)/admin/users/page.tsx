"use client";

import { HeroSection, DataTable } from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClinicalAvatar } from "@/components/design-system";
import { getPageHeroMeta } from "@/lib/page-meta";
import { fullName } from "@/lib/academic-adapters";
import { useRoles, useUsers } from "@/hooks/use-data";

const roleLabels = {
  ESTUDIANTE: "Estudiante",
  DOCENTE: "Docente",
  DOCENTE_ADMIN: "Docente administrador",
  ADMINISTRADOR: "Administrador",
} as const;

export default function AdminUsersPage() {
  const meta = getPageHeroMeta("/admin/users");
  const { data: usersPage } = useUsers({ size: 100 });
  const { data: roles = [] } = useRoles();
  const users = usersPage?.content ?? [];
  const getRoleLabel = (role: string) => {
    if (role in roleLabels) {
      return roleLabels[role as keyof typeof roleLabels];
    }
    const backendRole = roles.find((item) => item.nombre === role);
    return backendRole?.nombre ?? role;
  };

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        action={<Button>Nuevo usuario</Button>}
      />

      <DataTable
        data={users}
        keyExtractor={(user) => String(user.id)}
        columns={[
          {
            key: "user",
            header: "Usuario",
            cell: (user) => {
              const name = fullName(user.nombre, user.apellido);

              return (
                <div className="flex items-center gap-3">
                  <ClinicalAvatar name={name} tone="clinical" size="md" />
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{user.correo}</p>
                  </div>
                </div>
              );
            },
          },
          {
            key: "role",
            header: "Rol",
            cell: (user) => (
              <Badge variant="outline">{getRoleLabel(user.rol)}</Badge>
            ),
          },
          {
            key: "status",
            header: "Estado",
            cell: (user) => (
              <Badge variant={user.activo ? "success" : "muted"}>
                {user.activo ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Acciones",
            className: "text-right",
            cell: () => (
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
