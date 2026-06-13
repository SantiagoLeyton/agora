"use client";

import { useState } from "react";
import { CoursesListView } from "@/modules/academic/components/courses-list-view";
import { CourseFormDialog } from "@/modules/academic/components/course-form-dialog";

export default function AdminCoursesPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CoursesListView
        basePath="/admin/courses"
        canManage
        onCreate={() => setOpen(true)}
      />
      <CourseFormDialog open={open} onOpenChange={setOpen} isAdmin />
    </>
  );
}
