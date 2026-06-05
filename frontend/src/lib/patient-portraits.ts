/** Identidad visual del paciente por caso clínico (no estilo anime). */
export type PatientPortraitVariant = "maria" | "carlos" | "laura" | "diego";

export interface PatientPortraitMeta {
  variant: PatientPortraitVariant;
  displayName: string;
  age: number;
  context: string;
}

const portraitByCase: Record<string, PatientPortraitMeta> = {
  "case-anxiety-001": {
    variant: "maria",
    displayName: "María González",
    age: 22,
    context: "Estudiante universitaria",
  },
  "case-depression-002": {
    variant: "carlos",
    displayName: "Carlos Méndez",
    age: 35,
    context: "Duelo y episodio depresivo leve",
  },
  "case-crisis-003": {
    variant: "laura",
    displayName: "Laura Vega",
    age: 28,
    context: "Evaluación de crisis",
  },
  "case-family-004": {
    variant: "diego",
    displayName: "Diego Rojas",
    age: 16,
    context: "Adolescente — conflicto familiar",
  },
};

const defaultPortrait: PatientPortraitMeta = portraitByCase["case-anxiety-001"];

export function getPatientPortraitMeta(caseId: string): PatientPortraitMeta {
  return portraitByCase[caseId] ?? defaultPortrait;
}
