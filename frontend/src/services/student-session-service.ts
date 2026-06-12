import { mapSchedulesToAssignedSessions } from "@/lib/student-session-adapters";
import { scheduleService } from "@/services/academic-admin-service";
import { attemptService } from "@/services/attempt-service";
import { clinicalCaseService } from "@/services/case-service";

const DEFAULT_PAGE_SIZE = 100;

export const studentSessionService = {
  listAssigned: async () => {
    const [schedulesPage, attemptsPage, casesPage] = await Promise.all([
      scheduleService.list({ size: DEFAULT_PAGE_SIZE, sort: "fechaInicio,desc" }),
      attemptService.list({ size: DEFAULT_PAGE_SIZE, sort: "fechaInicio,desc" }),
      clinicalCaseService.list({ activo: true, size: DEFAULT_PAGE_SIZE }),
    ]);

    const caseTitlesById = new Map(
      casesPage.content.map((clinicalCase) => [clinicalCase.id, clinicalCase.titulo])
    );

    return mapSchedulesToAssignedSessions(
      schedulesPage.content,
      attemptsPage.content,
      caseTitlesById
    );
  },
} as const;
