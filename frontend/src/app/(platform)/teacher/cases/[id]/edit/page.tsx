"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/design-system";
import { RequireCaseManager } from "@/components/shared/require-case-manager";
import { CaseBuilderForm } from "@/modules/teacher/components/create-case-form";
import { CaseLifecycleActions } from "@/modules/academic/components/case-lifecycle-actions";
import { useCase } from "@/hooks/use-data";
import { getPageHeroMeta } from "@/lib/page-meta";

interface EditCasePageProps {
  params: Promise<{ id: string }>;
}

export default function EditCasePage({ params }: EditCasePageProps) {
  const { id } = use(params);
  const meta = getPageHeroMeta("/teacher/cases");
  const { data: clinicalCase } = useCase(id);

  return (
    <RequireCaseManager>
      <div className="space-y-8">
        <HeroSection
          eyebrow={meta.eyebrow}
          title="Editar caso clínico"
          description="Actualiza el contenido pedagógico, las escenas y los resultados de aprendizaje del repositorio."
          action={
            <Button variant="outline" asChild>
              <Link href="/teacher/cases">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
          }
        />
        {clinicalCase && (
          <CaseLifecycleActions
            caseId={id}
            title={clinicalCase.title}
            isActive={clinicalCase.isActive !== false}
          />
        )}
        <CaseBuilderForm mode="edit" caseId={id} />
      </div>
    </RequireCaseManager>
  );
}
