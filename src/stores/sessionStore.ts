import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Session, User, Character as SessionCharacter } from '../types/session';
import { sessionService, characterService } from '../services/sessionService';
import { auth } from '../services/firebase';
import { toast } from 'sonner';
import { Character } from '@/contexts/CharacterContext';
import { CharacterSheet } from '@/types/character';

interface SessionStore {
  // Состояние
  sessions: Session[];
  currentSession: Session | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  characters: Character[];
  
  // Методы для управления сессиями
  createSession: (name: string, description?: string) => Promise<Session | null>;
  joinSession: (code: string, userName: string, character?: SessionCharacter | Partial<SessionCharacter>) => Promise<boolean>;
  leaveSession: () => void;
  endSession: (sessionId: string) => Promise<boolean>;
  fetchSessions: () => Promise<void>;
  
  // Методы для управления пользователями
  setCurrentUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateUserTheme: (userId: string, theme: string) => void;
  
  // Методы для работы с текущей сессией
  updateCurrentSession: (updates: Partial<Session>) => void;
  addUserToSession: (sessionId: string, user: User) => Promise<boolean>;
  removeUserFromSession: (sessionId: string, userId: string) => void;
  
  // Методы для работы с персонажами
  fetchCharacters: () => Promise<void>;
  saveCharacter: (character: Character) => Promise<boolean>;
  deleteCharacter: (characterId: string) => Promise<boolean>;
  clearAllCharacters: () => Promise<boolean>;
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
      characters: [],
      
      // Методы для управления сессиями
      createSession: async (name: string, description?: string) => {
        set({ loading: true, error: null });
        
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            throw new Error("Пользователь не авторизован");
          }
          
          const session = await sessionService.createSession(name, description);
          if (!session) {
            throw new Error("Ошибка при создании сессии");
          }
          
          // Обновляем состояние
          set(state => ({
            sessions: [...state.sessions, session],
            currentSession: session,
            currentUser: {
              id: currentUser.uid,
              name: currentUser.displayName || 'Мастер',
              themePreference: 'dark',
              isOnline: true,
              isDM: true
            },
            loading: false
          }));
          
          toast.success("Сессия успешно создана");
          return session;
        } catch (error: any) {
          set({ loading: false, error: error.message });
          toast.error(error.message);
          return null;
        }
      },
      
      fetchSessions: async () => {
        set({ loading: true, error: null });
        
        try {
          const sessions = await sessionService.getUserSessions();
          set({ sessions, loading: false });
        } catch (error: any) {
          set({ loading: false, error: error.message });
          toast.error("Не удалось загрузить сессии");
        }
      },
      
      joinSession: async (code: string, userName: string, character?: SessionCharacter | Partial<SessionCharacter>) => {
        set({ loading: true, error: null });
        
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            toast.error("Пользователь не авторизован");
            set({ loading: false, error: "Пользователь не авторизован" });
            return false;
          }
          
          // Получаем сессию по коду
          const session = await sessionService.getSessionByCode(code);
          if (!session) {
            toast.error("Сессия с таким кодом не найдена");
            set({ loading: false, error: "Сессия не найдена" });
            return false;
          }
          
          // Создаем пользователя
          // Преобразуем character к типу SessionCharacter, если нужно
          let sessionCharacter: SessionCharacter | undefined;
          
          if (character) {
            sessionCharacter = {
              id: character.id || '',
              name: character.name || 'Персонаж',
              race: character.race || '',
              class: (character as Character).class || (character as Character).className || '',
              level: character.level || 1,
              avatarUrl: (character as Character).image
            };
          }
          
          const user: User = {
            id: currentUser.uid,
            name: userName,
            themePreference: 'dark',
            isOnline: true,
            isDM: false,
            character: sessionCharacter
          };
          
          // Присоединяемся к сессии
          const joined = await sessionService.joinSession(session.id, user);
          if (!joined) {
            throw new Error("Не удалось присоединиться к сессии");
          }
          
          // Получаем обновленную сессию
          const updatedSession = await sessionService.getSessionById(session.id);
          
          // Обновляем состояние
          set({
            currentSession: updatedSession,
            currentUser: user,
            loading: false
          });
          
          toast.success("Успешно присоединились к сессии");
          return true;
        } catch (error: any) {
          set({ loading: false, error: error.message });
          toast.error(error.message);
          return false;
        }
      },
      
      leaveSession: () => {
        const { currentUser, currentSession } = get();
        
        if (!currentUser || !currentSession) return;
        
        set({
          currentSession: null,
          currentUser: null
        });
        
        toast.info("Вы покинули сессию");
      },
      
      endSession: async (sessionId: string) => {
        set({ loading: true, error: null });
        
        try {
          const deleted = await sessionService.deleteSession(sessionId);
          if (!deleted) {
            throw new Error("Не удалось удалить сессию");
          }
          
          set(state => ({
            sessions: state.sessions.filter(s => s.id !== sessionId),
            currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
            loading: false
          }));
          
          return true;
        } catch (error: any) {
          set({ loading: false, error: error.message });
          toast.error(error.message);
          return false;
        }
      },
      
      // Методы для управления пользователями
      setCurrentUser: (user: User) => {
        set({ currentUser: user });
      },
      
      updateUser: (userId: string, updates: Partial<User>) => {
        const { currentSession } = get();
        
        if (!currentSession) return;
        
        // Обновление пользователей в текущей сессии
        const updatedUsers = currentSession.users?.map(u => {
          if (u.id === userId) {
            return { ...u, ...updates };
          }
          return u;
        });
        
        // Обновление текущего пользователя
        const updatedCurrentUser = get().currentUser?.id === userId
          ? { ...get().currentUser!, ...updates }
          : get().currentUser;
        
        // Обновление сессий
        set(state => ({
          currentSession: currentSession ? {
            ...currentSession,
            users: updatedUsers
          } : null,
          currentUser: updatedCurrentUser
        }));
      },
      
      updateUserTheme: (userId: string, theme: string) => {
        get().updateUser(userId, { themePreference: theme });
      },
      
      // Методы для работы с текущей сессией
      updateCurrentSession: (updates: Partial<Session>) => {
        const { currentSession } = get();
        
        if (!currentSession) return;
        
        set({
          currentSession: { ...currentSession, ...updates }
        });
      },
      
      addUserToSession: async (sessionId: string, user: User) => {
        try {
          const joined = await sessionService.joinSession(sessionId, user);
          
          if (joined) {
            // Получаем обновленную сессию
            const updatedSession = await sessionService.getSessionById(sessionId);
            
            // Обновляем состояние, если это текущая сессия
            if (get().currentSession?.id === sessionId) {
              set({ currentSession: updatedSession });
            }
          }
          
          return joined;
        } catch (error) {
          console.error("Ошибка при добавлении пользователя:", error);
          return false;
        }
      },
      
      removeUserFromSession: (sessionId: string, userId: string) => {
        // Этот метод требует доработки для работы с Firebase
        console.log("Метод removeUserFromSession не реализован для Firebase");
      },
      
      // Методы для работы с персонажами
      fetchCharacters: async () => {
        try {
          set({ loading: true });
          // Convert CharacterSheet[] to Character[]
          const fetchedCharacters = await characterService.getCharactersByUserId();
          const characters: Character[] = fetchedCharacters.map((char: any) => {
            return {
              ...(char as Character),
              race: char.race || '', // Ensure required properties exist
              class: char.class || char.className || '',
              gender: char.gender || '',
              alignment: char.alignment || '',
              background: char.background || '',
              backstory: char.backstory || '',
              languages: char.languages || [],
              proficiencies: char.proficiencies || [],
              equipment: char.equipment || [],
              abilities: {
                STR: char.abilities?.STR || 10,
                DEX: char.abilities?.DEX || 10,
                CON: char.abilities?.CON || 10,
                INT: char.abilities?.INT || 10,
                WIS: char.abilities?.WIS || 10,
                CHA: char.abilities?.CHA || 10,
                ...(char.abilities || {})
              }
            };
          });
          
          set({ characters, loading: false });
        } catch (error) {
          console.error("Ошибка при загрузке персонажей:", error);
          set({ loading: false });
        }
      },
      
      saveCharacter: async (character: Character) => {
        try {
          // Convert Character to CharacterSheet
          const characterToSave: any = {
            ...character,
            // Ensure character has all required fields for CharacterSheet
            userId: character.userId || auth.currentUser?.uid,
            race: character.race || '',
            background: character.background || '',
            backstory: character.backstory || ''
          };
          
          const result = await characterService.saveCharacter(characterToSave);
          
          if (result) {
            // Refresh the character list
            await get().fetchCharacters();
            return true;
          }
          
          return false;
        } catch (error) {
          console.error("Ошибка при сохранении персонажа:", error);
          return false;
        }
      },
      
      deleteCharacter: async (characterId: string) => {
        try {
          const deleted = await characterService.deleteCharacter(characterId);
          
          if (deleted) {
            // Refresh the character list
            await get().fetchCharacters();
            toast.success("Персонаж успешно удален");
            return true;
          } else {
            toast.error("Не удалось удалить персонажа");
            return false;
          }
        } catch (error) {
          console.error("Ошибка при удалении персонажа:", error);
          toast.error("Не удалось удалить персонажа");
          return false;
        }
      },
      
      clearAllCharacters: async () => {
        try {
          // Тут должна быть реализация удаления всех персонажей
          set({ characters: [] });
          toast.success("Все персонажи удалены");
          return true;
        } catch (error) {
          console.error("Ошибка при удалении всех персонажей:", error);
          toast.error("Не удалось удалить персонажей");
          return false;
        }
      }
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({
        // Сохраняем только текущего пользователя и сессию
        currentUser: state.currentUser,
        currentSession: state.currentSession
      }),
    }
  )
);
