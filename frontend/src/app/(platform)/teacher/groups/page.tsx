"use client";

import { HeroSection, PageLoading } from "@/components/design-system";
import { GroupCard } from "@/modules/teacher/components/teacher-components";
import { useGroups } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";

export default function TeacherGroupsPage() {
  const { data: groups, isLoading } = useGroups();
  const meta = getPageHeroMeta("/teacher/groups");

  return (
    <div className="space-y-8">
      <HeroSection eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />
      {isLoading ? (
        <PageLoading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups?.map((group, index) => (
            <GroupCard key={group.id} group={group} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
