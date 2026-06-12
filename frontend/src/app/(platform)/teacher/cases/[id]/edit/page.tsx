"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/design-system";
import { CaseBuilderForm } from "@/modules/teacher/components/create-case-form";
import { getPageHeroMeta } from "@/lib/page-meta";

interface EditCasePageProps {
  params: Promise<{ id: string }>;
}

export default function EditCasePage({ params }: EditCasePageProps) {
  const { id } = use(params);
  const meta = getPageHeroMeta("/teacher/cases");

  return (
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
      <CaseBuilderForm mode="edit" caseId={id} />
    </div>
  );
}
