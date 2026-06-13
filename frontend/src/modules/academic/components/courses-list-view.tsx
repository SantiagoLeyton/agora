"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KeyRound, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection, PageLoading, Surface } from "@/components/design-system";
import { CourseSearch } from "@/modules/academic/components/course-search";
import { CourseEnrollDialog } from "@/modules/academic/components/course-enroll-dialog";
import { useGroups } from "@/hooks/use-data";
import { useAuthStore } from "@/store";
import { getPageHeroMeta } from "@/lib/page-meta";

interface CoursesListViewProps {
  basePath: string;
  canManage?: boolean;
  onCreate?: () => void;
}

export function CoursesListView({ basePath, canManage, onCreate }: CoursesListViewProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"mis" | "explorar">("mis");
  const [enrollOpen, setEnrollOpen] = useState(false);
  const backendRole = useAuthStore((state) => state.user?.backendRole);
  const isAdmin = backendRole === "ADMINISTRADOR";
  const meta = getPageHeroMeta(basePath);

  const filters = useMemo(
    () => ({
      size: 100,
      scope: tab,
      activo: tab === "explorar" ? true : undefined,
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    [search, tab]
  );

  const { data: courses, isLoading, refetch } = useGroups(filters);

  const renderCourses = (items: typeof courses) => {
    if (isLoading) return <PageLoading />;
    if (!items || items.length === 0) {
      return (
        <Surface variant="muted" className="py-12 text-center text-sm text-muted-foreground">
          {tab === "explorar"
            ? "No hay cursos disponibles para explorar con los filtros actuales."
            : "Aún no tienes cursos en esta sección."}
        </Surface>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((course) => (
          <Surface key={course.id} hover className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge variant="outline">{course.semester}</Badge>
                <Badge variant={course.active ? "success" : "muted"}>
                  {course.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <h3 className="font-medium">{course.name}</h3>
              {course.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {course.studentsCount} estudiantes
              </p>
              {course.accessKey && canManage && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Clave: <span className="font-mono text-foreground">{course.accessKey}</span>
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {tab === "explorar" && !isAdmin ? (
                <Button variant="brand" size="sm" onClick={() => setEnrollOpen(true)}>
                  <KeyRound className="h-4 w-4" />
                  Ingresar con clave
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`${basePath}/${course.id}`}>Ver curso</Link>
                </Button>
              )}
            </div>
          </Surface>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <HeroSection
        eyebrow={meta.eyebrow}
        title="Cursos"
        description="Consulta tus cursos matriculados o explora cursos disponibles con clave de acceso."
        action={
          canManage && onCreate ? (
            <Button variant="brand" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Nuevo curso
            </Button>
          ) : undefined
        }
      />

      <CourseSearch value={search} onChange={setSearch} />

      <Tabs value={tab} onValueChange={(value) => setTab(value as "mis" | "explorar")}>
        <TabsList>
          <TabsTrigger value="mis">Mis cursos</TabsTrigger>
          <TabsTrigger value="explorar">Explorar cursos</TabsTrigger>
        </TabsList>
        <TabsContent value="mis" className="mt-6">
          {renderCourses(courses)}
        </TabsContent>
        <TabsContent value="explorar" className="mt-6">
          {!isAdmin && (
            <div className="mb-4 flex justify-end">
              <Button variant="outline" onClick={() => setEnrollOpen(true)}>
                <KeyRound className="h-4 w-4" />
                Ingresar con clave
              </Button>
            </div>
          )}
          {renderCourses(courses)}
        </TabsContent>
      </Tabs>

      <CourseEnrollDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        onSuccess={() => {
          setTab("mis");
          void refetch();
        }}
      />
    </div>
  );
}
