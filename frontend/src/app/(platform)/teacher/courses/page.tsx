"use client";

import { useState } from "react";
import { CoursesListView } from "@/modules/academic/components/courses-list-view";
import { CourseFormDialog } from "@/modules/academic/components/course-form-dialog";
import { useAuthStore } from "@/store";

export default function TeacherCoursesPage() {
  const [open, setOpen] = useState(false);
  const role = useAuthStore((state) => state.user?.role);

  return (
    <>
      <CoursesListView
        basePath="/teacher/courses"
        canManage
        onCreate={() => setOpen(true)}
      />
      <CourseFormDialog
        open={open}
        onOpenChange={setOpen}
        isAdmin={role === "admin"}
      />
    </>
  );
}
