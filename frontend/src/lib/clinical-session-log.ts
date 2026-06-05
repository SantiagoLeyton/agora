import type { ClinicalDialogueTurn } from "@/lib/clinical-dialogue";

export interface ClinicalLogEntry {
  id: string;
  intervention: string;
  response: string;
  impact: string[];
}

/** Bitácora derivada del historial conversacional (lista para enriquecerse con IA). */
export function buildClinicalSessionLog(
  turns: ClinicalDialogueTurn[]
): ClinicalLogEntry[] {
  const entries: ClinicalLogEntry[] = [];

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    if (turn.role !== "psychologist") continue;

    const next = turns[i + 1];
    if (!next || next.role !== "patient") continue;

    entries.push({
      id: `log-${turn.id}`,
      intervention: turn.text,
      response: next.text,
      impact: (next.impactDeltas ?? []).map((d) => d.label),
    });
  }

  return entries;
}
