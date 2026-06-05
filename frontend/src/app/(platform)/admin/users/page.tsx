"use client";

import { HeroSection, DataTable } from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClinicalAvatar } from "@/components/design-system";
import { getPageHeroMeta } from "@/lib/page-meta";

const mockUsers = [
  { id: "1", name: "Ana Martínez", email: "ana.martinez@uni.edu", role: "student", status: "active" },
  { id: "2", name: "Dr. Carlos Mendoza", email: "c.mendoza@uni.edu", role: "teacher", status: "active" },
  { id: "3", name: "Laura Admin", email: "admin@uni.edu", role: "admin", status: "active" },
  { id: "4", name: "Diego Morales", email: "diego.morales@uni.edu", role: "student", status: "inactive" },
];

const roleLabels = { student: "Estudiante", teacher: "Docente", admin: "Administrador" };

export default function AdminUsersPage() {
  const meta = getPageHeroMeta("/admin/users");

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        action={<Button>Nuevo usuario</Button>}
      />

      <DataTable
        data={mockUsers}
        keyExtractor={(u) => u.id}
        columns={[
          {
            key: "user",
            header: "Usuario",
            cell: (u) => (
              <div className="flex items-center gap-3">
                <ClinicalAvatar name={u.name} tone="clinical" size="md" />
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "role",
            header: "Rol",
            cell: (u) => (
              <Badge variant="outline">{roleLabels[u.role as keyof typeof roleLabels]}</Badge>
            ),
          },
          {
            key: "status",
            header: "Estado",
            cell: (u) => (
              <Badge variant={u.status === "active" ? "success" : "muted"}>
                {u.status === "active" ? "Activo" : "Inactivo"}
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
