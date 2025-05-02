
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Session, User } from '../types/session';

interface SessionStore {
  // Состояние
  sessions: Session[];
  currentSession: Session | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  
  // Методы для управления сессиями
  createSession: (name: string, description?: string) => Session;
  joinSession: (code: string, userName: string) => boolean;
  leaveSession: () => void;
  endSession: (sessionId: string) => void;
  
  // Методы для управления пользователями
  setCurrentUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateUserTheme: (userId: string, theme: string) => void;
  
  // Методы для работы с текущей сессией
  updateCurrentSession: (updates: Partial<Session>) => void;
  addUserToSession: (sessionId: string, user: User) => void;
  removeUserFromSession: (sessionId: string, userId: string) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      sessions: [],
      currentSession: null,
      currentUser: null,
      loading: false,
      error: null,
      
      // Методы для управления сессиями
      createSession: (name: string, description?: string) => {
        const newUser: User = {
          id: uuidv4(),
          name: 'Мастер',
          themePreference: 'dark',
          isOnline: true,
          isDM: true,
        };
        
        const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newSession: Session = {
          id: uuidv4(),
          name,
          description,
          code: sessionCode,
          dmId: newUser.id,
          users: [newUser],
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isActive: true,
        };
        
        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSession: newSession,
          currentUser: newUser,
        }));
        
        return newSession;
      },
      
      joinSession: (code: string, userName: string) => {
        const session = get().sessions.find(
          (s) => s.code.toLowerCase() === code.toLowerCase()
        );
        
        if (!session) {
          set({ error: 'Сессия не найдена' });
          return false;
        }
        
        const newUser: User = {
          id: uuidv4(),
          name: userName,
          themePreference: 'dark',
          isOnline: true,
          isDM: false,
        };
        
        set((state) => {
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === session.id) {
              return {
                ...s,
                users: [...s.users, newUser],
                lastActive: new Date().toISOString(),
              };
            }
            return s;
          });
          
          return {
            sessions: updatedSessions,
            currentSession: {
              ...session,
              users: [...session.users, newUser],
              lastActive: new Date().toISOString(),
            },
            currentUser: newUser,
          };
        });
        
        return true;
      },
      
      leaveSession: () => {
        const { currentUser, currentSession } = get();
        
        if (!currentUser || !currentSession) return;
        
        set((state) => {
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === currentSession.id) {
              return {
                ...s,
                users: s.users.map((u) => {
                  if (u.id === currentUser.id) {
                    return { ...u, isOnline: false };
                  }
                  return u;
                }),
                lastActive: new Date().toISOString(),
              };
            }
            return s;
          });
          
          return {
            sessions: updatedSessions,
            currentSession: null,
            currentUser: null,
          };
        });
      },
      
      endSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
          currentUser: state.currentSession?.id === sessionId ? null : state.currentUser,
        }));
      },
      
      // Методы для управления пользователями
      setCurrentUser: (user: User) => {
        set({ currentUser: user });
      },
      
      updateUser: (userId: string, updates: Partial<User>) => {
        const { currentSession } = get();
        
        if (!currentSession) return;
        
        set((state) => {
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === currentSession.id) {
              return {
                ...s,
                users: s.users.map((u) => {
                  if (u.id === userId) {
                    return { ...u, ...updates };
                  }
                  return u;
                }),
              };
            }
            return s;
          });
          
          const updatedCurrentSession = {
            ...currentSession,
            users: currentSession.users.map((u) => {
              if (u.id === userId) {
                return { ...u, ...updates };
              }
              return u;
            }),
          };
          
          const updatedCurrentUser = userId === state.currentUser?.id
            ? { ...state.currentUser, ...updates }
            : state.currentUser;
          
          return {
            sessions: updatedSessions,
            currentSession: updatedCurrentSession,
            currentUser: updatedCurrentUser,
          };
        });
      },
      
      updateUserTheme: (userId: string, theme: string) => {
        get().updateUser(userId, { themePreference: theme });
      },
      
      // Методы для работы с текущей сессией
      updateCurrentSession: (updates: Partial<Session>) => {
        const { currentSession } = get();
        
        if (!currentSession) return;
        
        set((state) => {
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === currentSession.id) {
              return { ...s, ...updates };
            }
            return s;
          });
          
          return {
            sessions: updatedSessions,
            currentSession: { ...currentSession, ...updates },
          };
        });
      },
      
      addUserToSession: (sessionId: string, user: User) => {
        set((state) => {
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === sessionId) {
              if (s.users.some((u) => u.id === user.id)) {
                return {
                  ...s,
                  users: s.users.map((u) => (u.id === user.id ? { ...user, isOnline: true } : u)),
                };
              }
              return {
                ...s,
                users: [...s.users, user],
              };
            }
            return s;
          });
          
          const currentSessionUpdate =
            state.currentSession?.id === sessionId
              ? {
                  currentSession: {
                    ...state.currentSession,
                    users: state.currentSession.users.some((u) => u.id === user.id)
                      ? state.currentSession.users.map((u) =>
                          u.id === user.id ? { ...user, isOnline: true } : u
                        )
                      : [...state.currentSession.users, user],
                  },
                }
              : {};
          
          return {
            sessions: updatedSessions,
            ...currentSessionUpdate,
          };
        });
      },
      
      removeUserFromSession: (sessionId: string, userId: string) => {
        set((state) => {
          const updatedSessions = state.sessions.map((s) => {
            if (s.id === sessionId) {
              return {
                ...s,
                users: s.users.filter((u) => u.id !== userId),
              };
            }
            return s;
          });
          
          const currentSessionUpdate =
            state.currentSession?.id === sessionId
              ? {
                  currentSession: {
                    ...state.currentSession,
                    users: state.currentSession.users.filter((u) => u.id !== userId),
                  },
                }
              : {};
          
          return {
            sessions: updatedSessions,
            ...currentSessionUpdate,
          };
        });
      },
    }),
    {
      name: 'session-storage', // имя для локального хранилища
      partialize: (state) => ({
        sessions: state.sessions,
      }),
    }
  )
);
