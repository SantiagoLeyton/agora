"use client";

import { use } from "react";
import { CourseDetailView } from "@/modules/academic/components/course-detail-view";

export default function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CourseDetailView courseId={Number(id)} backHref="/admin/courses" />;
}
