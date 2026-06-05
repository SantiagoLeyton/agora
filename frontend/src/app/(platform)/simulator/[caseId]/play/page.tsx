"use client";

import { use } from "react";
import { SimulatorPlayView } from "@/modules/simulator/components/simulator-play-view";
import { useCase } from "@/hooks/use-data";

interface SimulatorPlayPageProps {
  params: Promise<{ caseId: string }>;
}

export default function SimulatorPlayPage({ params }: SimulatorPlayPageProps) {
  const { caseId } = use(params);
  const { data: caseItem, isLoading } = useCase(caseId);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!caseItem) {
    return <p className="p-8">Caso no encontrado</p>;
  }

  return <SimulatorPlayView caseItem={caseItem} />;
}
