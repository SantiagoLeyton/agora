"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/layouts/sidebar";
import { Navbar } from "@/layouts/navbar";
import { AtmosphereBackground, PageContainer } from "@/components/design-system";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isSimulatorPlay =
    pathname?.includes("/simulator/") && pathname.endsWith("/play");

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <AtmosphereBackground />
      <Sidebar />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main
          className={cn(
            "relative min-h-0 flex-1",
            isSimulatorPlay ? "overflow-hidden" : "overflow-y-auto"
          )}
        >
          <div
            className={cn(
              "page-content-layer",
              isSimulatorPlay ? "flex h-full min-h-0 flex-col" : "min-h-full"
            )}
          >
            {isSimulatorPlay ? (
              <div className="flex h-full min-h-0 w-full max-w-none flex-1 flex-col overflow-hidden">
                {children}
              </div>
            ) : (
              <PageContainer>{children}</PageContainer>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
