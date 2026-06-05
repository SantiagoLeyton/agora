import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authenticateMockUser } from "@/lib/auth";
import type { User, SimulationSession, PatientLive2DModel } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

interface SimulatorState {
  session: SimulationSession | null;
  isPlaying: boolean;
  timerRunning: boolean;
  startSession: (
    caseId: string,
    sceneId: string,
    patientModel: PatientLive2DModel
  ) => void;
  selectOption: (sceneId: string, optionId: string, nextSceneId: string) => void;
  setCurrentScene: (sceneId: string) => void;
  tickTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  endSession: () => void;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 600));
        const user = authenticateMockUser(email, password);
        if (!user) return null;
        set({ isAuthenticated: true, user });
        return user;
      },
      register: async (data) => {
        await new Promise((r) => setTimeout(r, 600));
        set({
          isAuthenticated: false,
          user: {
            id: "usr-new",
            email: data.email,
            name: data.name,
            role: "student",
            institution: "Universidad Evangélica",
          },
        });
        return true;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "simulador-auth" }
  )
);

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  session: null,
  isPlaying: false,
  timerRunning: false,
  startSession: (caseId, sceneId, patientModel) =>
    set({
      isPlaying: true,
      timerRunning: true,
      session: {
        caseId,
        currentSceneId: sceneId,
        patientModel,
        decisions: [],
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0,
      },
    }),
  selectOption: (sceneId, optionId, nextSceneId) => {
    const session = get().session;
    if (!session) return;
    set({
      session: {
        ...session,
        currentSceneId: nextSceneId,
        decisions: [
          ...session.decisions,
          { sceneId, optionId, timestamp: new Date().toISOString() },
        ],
      },
    });
  },
  setCurrentScene: (sceneId) => {
    const session = get().session;
    if (!session) return;
    set({ session: { ...session, currentSceneId: sceneId } });
  },
  tickTimer: () => {
    const session = get().session;
    if (!session || !get().timerRunning) return;
    set({ session: { ...session, elapsedSeconds: session.elapsedSeconds + 1 } });
  },
  pauseTimer: () => set({ timerRunning: false }),
  resumeTimer: () => set({ timerRunning: true }),
  endSession: () => set({ session: null, isPlaying: false, timerRunning: false }),
}));

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
