export interface TeacherMetricsOverview {
  enrolledParticipants: number;
  activeSchedules: number;
  completionRate: number;
  pendingFeedback: number;
  elevatedIndicators: number;
  completedAttempts: number;
  inProgressAttempts: number;
  abandonedAttempts: number;
}

export interface EmotionalProfileMetric {
  name: string;
  average: number;
  sampleSize: number;
}

export interface GroupMetrics {
  groupId: number;
  groupName: string;
  studentsCount: number;
  participationRate: number;
  completionRate: number;
  strength?: string | null;
  attentionArea?: string | null;
}

export interface MostPracticedCase {
  id: number;
  titulo: string;
  count: number;
}

export interface TeacherMetricsSemesterSummary {
  completedSessions: number;
  averageSessionDurationSeconds: number;
  mostPracticedCase?: MostPracticedCase | null;
}

export interface TeacherMetricsParticipation {
  responsesCount: number;
  journalsCount: number;
  aiSummariesCount: number;
}

export interface TeacherMetricsMetadata {
  period?: string | null;
  generatedAt: string;
  sampleSize: number;
  academicNotice: string;
}

export interface TeacherMetricsResponse {
  overview: TeacherMetricsOverview;
  emotionalProfile: EmotionalProfileMetric[];
  byGroup: GroupMetrics[];
  semesterSummary: TeacherMetricsSemesterSummary;
  participation: TeacherMetricsParticipation;
  metadata: TeacherMetricsMetadata;
}

type QueryValue = string | number | boolean | undefined | null;

export interface TeacherMetricsFilters {
  [key: string]: QueryValue;
  periodo?: string;
  grupoId?: number;
}
