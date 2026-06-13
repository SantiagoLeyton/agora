import { redirect } from "next/navigation";

export default function LegacyTeacherGroupsPage() {
  redirect("/teacher/courses");
}
