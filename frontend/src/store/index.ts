import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  setAccessTokenProvider,
  setRefreshTokenHook,
} from "@/services/auth-token-provider";
import { authService } from "@/services/auth-service";
import { resetUserScopedClientState } from "@/lib/user-session-cleanup";
import { mapAuthenticatedUserToUser } from "@/types/auth";
import type { PatientLive2DModel, SimulationSession, User } from "@/types";

interface AuthState {
  user: User | null;
  role: User["role"] | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  setCurrentUser: (user: User) => void;
  setAuthLoading: (isLoading: boolean) => void;
  clearSession: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
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
  setSession: (session: SimulationSession) => void;
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
    (set, get) => ({
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const response = await authService.login({
            correo: email.trim(),
            password,
          });
          const user = mapAuthenticatedUserToUser(response.usuario);

          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            role: user.role,
            user,
          });

          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      register: async () => false,
      logout: async () => {
        const refreshToken = get().refreshToken;

        if (refreshToken) {
          try {
            await authService.logout({ refreshToken });
          } catch {
            // Local cleanup must happen even if the server token was already invalid.
          }
        }

        get().clearSession();
        resetUserScopedClientState();
      },
      refreshSession: async () => {
        const refreshToken = get().refreshToken;

        if (!refreshToken) {
          get().clearSession();
          return null;
        }

        try {
          const response = await authService.refresh({ refreshToken });
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });
          return response.accessToken;
        } catch {
          get().clearSession();
          return null;
        }
      },
      setCurrentUser: (user) =>
        set({
          user,
          role: user.role,
          isAuthenticated: true,
          isLoading: false,
        }),
      setAuthLoading: (isLoading) => set({ isLoading }),
      clearSession: () => {
        resetUserScopedClientState();
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "simulador-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

setAccessTokenProvider(() => useAuthStore.getState().accessToken);
setRefreshTokenHook(() => useAuthStore.getState().refreshSession());

export const useSimulatorStore = create<SimulatorState>()((set, get) => ({
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
  setSession: (session) =>
    set({
      session,
      isPlaying: session.status !== "FINALIZADO" && session.status !== "ABANDONADO",
      timerRunning: session.status === "EN_PROCESO",
    }),
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
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
