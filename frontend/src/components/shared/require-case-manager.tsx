"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoading } from "@/components/design-system";
import { canManageClinicalCases } from "@/lib/case-permissions";
import { useAuthStore } from "@/store";

export function RequireCaseManager({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const backendRole = useAuthStore((state) => state.user?.backendRole);
  const allowed = canManageClinicalCases(backendRole);

  useEffect(() => {
    if (!allowed) {
      router.replace("/teacher/cases");
    }
  }, [allowed, router]);

  if (!allowed) {
    return <PageLoading />;
  }

  return <>{children}</>;
}
