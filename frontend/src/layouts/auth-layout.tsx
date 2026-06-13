import { ReactNode } from "react";
import { InstitutionalLogo } from "@/components/shared/institutional-logo";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[480px] w-[480px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[360px] w-[360px] rounded-full bg-brand/5 blur-3xl" />
      </div>

      <div className="absolute left-6 top-6 hidden md:block">
        <InstitutionalLogo size="sm" href="/login" subtitle="CUE Alexander Von Humboldt" />
      </div>

      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}
