import type { Role } from "@/types/auth";

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  backendRole?: Role;
  avatar?: string;
  institution?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export type CaseDifficulty = "basic" | "intermediate" | "advanced";
export type CaseStatus = "not_started" | "in_progress" | "completed";
export type PatientLive2DModel = "natori" | "haru";

export type {
  Live2DParticipantRole,
  PsychologistVisualState,
  SessionParticipant,
} from "@/types/live2d-participant";

export interface SimulationCase {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: CaseDifficulty;
  durationMinutes: number;
  status: CaseStatus;
  progress: number;
  tags: string[];
  learningObjectives: string[];
  thumbnail?: string;
  /** Avatar Live2D del paciente en sesión */
  patientModel?: PatientLive2DModel;
  /** Caso creado por docente (persistido en navegador) */
  isCustom?: boolean;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface DialogueOption {
  id: string;
  questionId?: string;
  label: string;
  description?: string;
  nextSceneId: string;
  category?: "explore" | "assess" | "intervene" | "close";
}

export interface Scene {
  id: string;
  title: string;
  setting: string;
  narrative: string;
  speaker: string;
  speakerRole: "patient" | "therapist" | "narrator" | "supervisor";
  options: DialogueOption[];
  supportTools?: string[];
}

export interface SimulationSession {
  attemptId?: number;
  status?: "EN_PROCESO" | "FINALIZADO" | "ABANDONADO";
  states?: import("@/types/simulation").SimulationStateResponse[];
  caseId: string;
  currentSceneId: string;
  /** Avatar elegido por el estudiante al iniciar */
  patientModel: PatientLive2DModel;
  decisions: { sceneId: string; optionId: string; timestamp: string }[];
  startedAt: string;
  elapsedSeconds: number;
}

export interface EvaluationMetric {
  id: string;
  label: string;
  value: number;
  maxValue: number;
  description: string;
}

export interface EvaluationResult {
  id: string;
  caseId: string;
  caseTitle: string;
  studentName: string;
  completedAt: string;
  score: number | null;
  metrics: EvaluationMetric[];
  feedback: string[];
  strengths: string[];
  improvements: string[];
  attempt?: import("@/types/simulation").AttemptResponse;
  summary?: import("@/types/simulation").AttemptSummaryResponse;
  aiSummaries?: import("@/types/simulation").AISummaryResponse[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  group: string;
  progress: number;
  casesCompleted: number;
  lastActivity: string;
  status: "active" | "inactive" | "at_risk";
}

export interface Group {
  id: string;
  name: string;
  studentsCount: number;
  activeCases: number;
  averageProgress: number;
  semester: string;
}

export interface Assignment {
  id: string;
  title: string;
  caseId: string;
  caseTitle: string;
  groupId: string;
  groupName: string;
  dueDate: string;
  completionRate: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: string;
  /** Agrupación visual en sidebar */
  section?: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}
