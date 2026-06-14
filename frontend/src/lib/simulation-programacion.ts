import type { SimulationCase } from "@/types";
import type { SimulationSession } from "@/types";

export function resolveProgramacionIdForStart(options: {
  queryParam?: string | null;
  session?: SimulationSession | null;
  caseItem?: Pick<SimulationCase, "programacionActivaId" | "presentable"> | null;
}): number | undefined {
  if (options.queryParam) {
    const parsed = Number(options.queryParam);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (options.session?.programacionId && Number.isFinite(options.session.programacionId)) {
    return options.session.programacionId;
  }
  if (options.caseItem?.programacionActivaId && Number.isFinite(options.caseItem.programacionActivaId)) {
    return options.caseItem.programacionActivaId;
  }
  return undefined;
}

export function canStudentStartAcademicCase(
  caseItem: Pick<SimulationCase, "presentable" | "programacionActivaId">,
  resolvedProgramacionId?: number
): boolean {
  if (caseItem.presentable !== true) return false;
  return Number.isFinite(resolvedProgramacionId ?? caseItem.programacionActivaId);
}

export function isFreePracticeCase(
  caseItem: Pick<SimulationCase, "presentable">,
  isStudent: boolean
): boolean {
  return isStudent && caseItem.presentable !== true;
}
