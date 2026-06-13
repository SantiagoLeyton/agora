"use client";

import { use } from "react";
import { CourseDetailView } from "@/modules/academic/components/course-detail-view";

export default function TeacherCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CourseDetailView courseId={Number(id)} backHref="/teacher/courses" />;
}
