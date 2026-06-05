"use client";

import { HeroSection, PageLoading } from "@/components/design-system";
import { StudentTable } from "@/modules/teacher/components/teacher-components";
import { useStudents } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";

export default function TeacherStudentsPage() {
  const { data: students, isLoading } = useStudents();
  const meta = getPageHeroMeta("/teacher/students");

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />
      {isLoading ? <PageLoading /> : students ? <StudentTable students={students} /> : null}
    </div>
  );
}
