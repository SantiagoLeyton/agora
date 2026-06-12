import {
  filterCompletedAttempts,
  mapAttemptToTeacherFeedbackItem,
  type TeacherFeedbackItem,
} from "@/lib/teacher-feedback-adapters";
import { attemptService } from "@/services/attempt-service";

const DEFAULT_PAGE_SIZE = 100;

async function hydrateFeedbackItem(
  attempt: Awaited<
    ReturnType<typeof attemptService.list>
  >["content"][number]
): Promise<TeacherFeedbackItem> {
  const summary = await attemptService.summary(attempt.id);
  return mapAttemptToTeacherFeedbackItem(attempt, summary);
}

export const teacherFeedbackService = {
  list: async (): Promise<TeacherFeedbackItem[]> => {
    const page = await attemptService.list({
      size: DEFAULT_PAGE_SIZE,
      sort: "fechaInicio,desc",
    });

    const completedAttempts = filterCompletedAttempts(page.content);
    return Promise.all(completedAttempts.map(hydrateFeedbackItem));
  },
} as const;
