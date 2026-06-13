"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/design-system";
import { RequireCaseManager } from "@/components/shared/require-case-manager";
import { CreateCaseForm } from "@/modules/teacher/components/create-case-form";
import { getPageHeroMeta } from "@/lib/page-meta";

export default function TeacherNewCasePage() {
  const meta = getPageHeroMeta("/teacher/cases");

  return (
    <RequireCaseManager>
      <div className="space-y-8">
        <HeroSection
          eyebrow={meta.eyebrow}
          title="Nuevo caso clínico"
          description="Define el escenario, el avatar del paciente y las primeras decisiones. Los estudiantes podrán practicarlo desde el simulador."
          action={
            <Button variant="outline" asChild>
              <Link href="/teacher/cases">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
          }
        />
        <CreateCaseForm />
      </div>
    </RequireCaseManager>
  );
}
