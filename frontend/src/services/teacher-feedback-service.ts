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
): Promise<TeacherFeedbackItem | null> {
  try {
    const summary = await attemptService.summary(attempt.id);
    return mapAttemptToTeacherFeedbackItem(attempt, summary);
  } catch {
    return null;
  }
}

export const teacherFeedbackService = {
  list: async (): Promise<TeacherFeedbackItem[]> => {
    const page = await attemptService.list({
      size: DEFAULT_PAGE_SIZE,
      sort: "fechaInicio,desc",
    });

    const completedAttempts = filterCompletedAttempts(page.content);
    const results = await Promise.allSettled(completedAttempts.map(hydrateFeedbackItem));
    return results
      .filter(
        (result): result is PromiseFulfilledResult<TeacherFeedbackItem | null> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value)
      .filter((item): item is TeacherFeedbackItem => item != null);
  },
} as const;
