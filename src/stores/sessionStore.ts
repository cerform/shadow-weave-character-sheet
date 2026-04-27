/**
 * Session store — Zustand-based state for the current game session.
 *
 * REFACTORED (Phase 1): Removed useSession() and useAuth() hook calls from
 * non-component code. React hooks must only be called inside React components
 * or custom hooks — calling them here caused React Error #185.
 *
 * Session state is now managed directly via Zustand. Components that need
 * session data should use this store via `useSessionStore()`.
 *
 * For real-time Supabase session CRUD, use sessionService.ts directly.
 */
import { create } from 'zustand';
import { DMSession } from '@/contexts/SessionContext';

interface SessionStoreState {
  currentSession: DMSession | null;
  sessions: DMSession[];
  isLoading: boolean;
}

interface SessionStoreActions {
  setCurrentSession: (session: DMSession | null) => void;
  setSessions: (sessions: DMSession[]) => void;
  addSession: (session: DMSession) => void;
  updateSession: (update: Partial<DMSession> & { id: string }) => void;
  removeSession: (id: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

type SessionStore = SessionStoreState & SessionStoreActions;

const initialState: SessionStoreState = {
  currentSession: null,
  sessions: [],
  isLoading: false,
};

const useSessionStore = create<SessionStore>((set) => ({
  ...initialState,

  setCurrentSession: (session) => set({ currentSession: session }),

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),

  updateSession: (update) =>
    set((state) => {
      const sessions = state.sessions.map((s) =>
        s.id === update.id ? { ...s, ...update } : s
      );
      const currentSession =
        state.currentSession?.id === update.id
          ? { ...state.currentSession, ...update }
          : state.currentSession;
      return { sessions, currentSession };
    }),

  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      currentSession:
        state.currentSession?.id === id ? null : state.currentSession,
    })),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set(initialState),
}));

export default useSessionStore;
export type { SessionStore };
