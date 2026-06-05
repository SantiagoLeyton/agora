"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { getRoleHomePath } from "@/lib/auth";

export function useAuthRedirect() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [isAuthenticated, user, router]);
}
