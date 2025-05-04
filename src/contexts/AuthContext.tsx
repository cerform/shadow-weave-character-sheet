
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { firebaseAuth, auth } from '@/services/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { syncUserWithFirestore, getCurrentUserWithData } from '@/utils/authHelpers';
import { FirestoreUserData } from '@/utils/firestoreHelpers';

// Типы для пользователя и контекста
export interface User {
  id: string;
  email: string;
  username: string;
  isDM: boolean;
  characters?: string[]; // ID сохраненных персонажей
  createdAt: string;
  firebaseUid?: string; // ID пользователя в Firebase
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isOfflineMode: boolean; // Флаг для определения автономного режима
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, isDM: boolean) => Promise<void>;
  googleLogin: (isDM: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  addCharacterToUser: (characterId: string) => Promise<void>;
  removeCharacterFromUser: (characterId: string) => Promise<void>;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Хранилище пользователей
const USER_STORAGE_KEY = 'dnd-users';
const CURRENT_USER_KEY = 'dnd-current-user';

// Функция для конвертации Firebase User в нашего User
const createUserFromFirebase = (firebaseUser: FirebaseUser, isDM: boolean = false, username?: string): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || 'anonymous@user.com',
    username: username || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    isDM,
    characters: [],
    createdAt: new Date().toISOString(),
    firebaseUid: firebaseUser.uid
  };
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false); // Добавляем флаг автономного режима

  // Инициализация при загрузке
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initAuth = async () => {
      try {
        // Пытаемся восстановить пользователя из локального хранилища
        const savedUserJSON = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUserJSON) {
          const savedUser = JSON.parse(savedUserJSON);
          setCurrentUser(savedUser);
        }

        // Слушатель изменения состояния аутентификации в Firebase
        if (firebaseAuth) {
          unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
              try {
                // Получаем данные пользователя из Firestore
                const userData = await getCurrentUserWithData() as FirestoreUserData | null;
                
                if (userData) {
                  // Если пользователь есть в Firestore, используем эти данные
                  const user: User = {
                    id: firebaseUser.uid,
                    email: userData.email || firebaseUser.email || '',
                    username: userData.displayName || firebaseUser.displayName || '',
                    isDM: userData.isDM || false,
                    characters: userData.characters || [],
                    createdAt: typeof userData.createdAt === 'string' ? userData.createdAt : new Date().toISOString(),
                    firebaseUid: firebaseUser.uid
                  };
                  
                  setCurrentUser(user);
                  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                } else {
                  // Если пользователя нет в Firestore, создаем нового
                  const newUser = createUserFromFirebase(firebaseUser);
                  
                  // Синхронизируем с Firestore
                  await syncUserWithFirestore({
                    username: newUser.username,
                    email: newUser.email,
                    isDM: newUser.isDM
                  });
                  
                  setCurrentUser(newUser);
                  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
                }
              } catch (error) {
                console.error("Ошибка при получении данных пользователя:", error);
                setIsOfflineMode(true);
              }
            } else {
              // Если в Firebase нет пользователя, очищаем текущего пользователя
              setCurrentUser(null);
              localStorage.removeItem(CURRENT_USER_KEY);
            }
            
            setIsInitializing(false);
          });
        } else {
          // Если Firebase не доступен, включаем автономный режим
          console.warn("AuthContext не доступен, используется автономный режим");
          setIsOfflineMode(true);
          setIsInitializing(false);
        }
      } catch (error) {
        console.error("Ошибка инициализации AuthContext:", error);
        console.warn("AuthContext не доступен, используется автономный режим");
        setIsOfflineMode(true);
        setIsInitializing(false);
      }
    };
    
    initAuth();
    
    return () => {
      if (unsubscribe) unsubscribe(); // Отписка при размонтировании
    };
  }, []);
  
  // Логин с email и паролем
  const login = async (email: string, password: string): Promise<void> => {
    try {
      if (isOfflineMode) {
        toast.error("Авторизация недоступна в автономном режиме");
        throw new Error("Авторизация недоступна в автономном режиме");
      }
      
      const firebaseUser = await auth.loginWithEmail(email, password);
      
      if (firebaseUser) {
        // Получаем данные пользователя из Firestore
        const userData = await getCurrentUserWithData() as FirestoreUserData | null;
        
        if (userData) {
          // Если пользователь есть в Firestore, используем эти данные
          const user: User = {
            id: firebaseUser.uid,
            email: userData.email || firebaseUser.email || '',
            username: userData.displayName || firebaseUser.displayName || '',
            isDM: userData.isDM || false,
            characters: userData.characters || [],
            createdAt: typeof userData.createdAt === 'string' ? userData.createdAt : new Date().toISOString(),
            firebaseUid: firebaseUser.uid
          };
          
          setCurrentUser(user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        } else {
          // Если пользователя нет в Firestore, создаем нового
          const newUser = createUserFromFirebase(firebaseUser);
          
          // Синхронизируем с Firestore
          await syncUserWithFirestore({
            username: newUser.username,
            email: newUser.email,
            isDM: newUser.isDM
          });
          
          setCurrentUser(newUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        }
      }
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      throw error;
    }
  };
  
  // Регистрация
  const register = async (email: string, password: string, username: string, isDM: boolean): Promise<void> => {
    try {
      if (isOfflineMode) {
        toast.error("Регистрация недоступна в автономном режиме");
        throw new Error("Регистрация недоступна в автономном режиме");
      }
      
      const firebaseUser = await auth.registerWithEmail(email, password);
      
      if (firebaseUser) {
        // Создание нового пользователя
        const newUser = createUserFromFirebase(firebaseUser, isDM, username);
        
        // Синхронизируем с Firestore
        await syncUserWithFirestore({
          username: newUser.username,
          email: newUser.email,
          isDM: newUser.isDM
        });
        
        // Обновляем состояние
        setCurrentUser(newUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      throw error;
    }
  };
  
  // Вход через Google
  const googleLogin = async (isDM: boolean): Promise<void> => {
    try {
      if (isOfflineMode) {
        toast.error("Google авторизация недоступна в автономном режиме");
        throw new Error("Google авторизация недоступна в автономном режиме");
      }
      
      const firebaseUser = await auth.loginWithGoogle();
      
      if (firebaseUser) {
        // Получаем данные пользователя из Firestore
        const userData = await getCurrentUserWithData() as FirestoreUserData | null;
        
        if (userData) {
          // Если пользователь есть в Firestore, используем эти данные
          const user: User = {
            id: firebaseUser.uid,
            email: userData.email || firebaseUser.email || '',
            username: userData.displayName || firebaseUser.displayName || '',
            isDM: userData.isDM || isDM, // Используем значение из Firestore или параметр
            characters: userData.characters || [],
            createdAt: typeof userData.createdAt === 'string' ? userData.createdAt : new Date().toISOString(),
            firebaseUid: firebaseUser.uid
          };
          
          setCurrentUser(user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        } else {
          // Если пользователя нет в Firestore, создаем нового
          const newUser = createUserFromFirebase(firebaseUser, isDM);
          
          // Синхронизируем с Firestore
          await syncUserWithFirestore({
            username: newUser.username,
            email: newUser.email,
            isDM: newUser.isDM
          });
          
          setCurrentUser(newUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        }
      }
    } catch (error) {
      console.error("Ошибка при входе через Google:", error);
      throw error;
    }
  };
  
  // Выход
  const logout = async (): Promise<void> => {
    try {
      if (!isOfflineMode) {
        await auth.logout();
      }
      setCurrentUser(null);
      localStorage.removeItem(CURRENT_USER_KEY);
      toast.success("Вы успешно вышли из системы");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      throw error;
    }
  };
  
  // Обновление данных пользователя
  const updateUser = async (data: Partial<User>): Promise<void> => {
    if (!currentUser) return Promise.reject('Не авторизован');
    
    try {
      const updatedUser = { ...currentUser, ...data };
      
      // Синхронизируем с Firestore, если не в автономном режиме
      if (!isOfflineMode) {
        await syncUserWithFirestore({
          username: updatedUser.username,
          email: updatedUser.email,
          isDM: updatedUser.isDM
        });
      }
      
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      throw error;
    }
  };
  
  // Добавление персонажа пользователю
  const addCharacterToUser = async (characterId: string): Promise<void> => {
    if (!currentUser) return Promise.reject('Не авторизован');
    
    try {
      // Проверка, не добавлен ли уже персонаж
      if (currentUser.characters?.includes(characterId)) {
        return;
      }
      
      const updatedCharacters = [...(currentUser.characters || []), characterId];
      
      // Получаем пользователя из Firestore для синхронизации, если не в автономном режиме
      if (!isOfflineMode) {
        const userData = await getCurrentUserWithData();
        
        if (userData) {
          // Обновляем локальный список
          const updatedUser = { 
            ...currentUser, 
            characters: updatedCharacters 
          };
          
          setCurrentUser(updatedUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        }
      } else {
        // В автономном режиме просто обновляем локальный стейт
        const updatedUser = { 
          ...currentUser, 
          characters: updatedCharacters 
        };
        
        setCurrentUser(updatedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Ошибка при добавлении персонажа:", error);
      throw error;
    }
  };
  
  // Удаление персонажа у пользователя
  const removeCharacterFromUser = async (characterId: string): Promise<void> => {
    if (!currentUser || !currentUser.characters) return Promise.reject('Не авторизован или нет персонажей');
    
    try {
      const updatedCharacters = currentUser.characters.filter(id => id !== characterId);
      
      // Обновляем локальный список
      const updatedUser = { 
        ...currentUser, 
        characters: updatedCharacters 
      };
      
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Ошибка при удалении персонажа:", error);
      throw error;
    }
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isInitializing,
    isOfflineMode,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    addCharacterToUser,
    removeCharacterFromUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn("AuthContext не доступен, используется автономный режим");
    // Возвращаем заглушку для работы в автономном режиме
    return {
      currentUser: null,
      isAuthenticated: false,
      isInitializing: false,
      isOfflineMode: true,
      login: async () => { 
        toast.error("Авторизация недоступна в автономном режиме"); 
        throw new Error("Авторизация недоступна в автономном режиме");
      },
      register: async () => { 
        toast.error("Регистрация недоступна в автономном режиме");
        throw new Error("Регистрация недоступна в автономном режиме");
      },
      googleLogin: async () => { 
        toast.error("Google авторизация недоступна в автономном режиме");
        throw new Error("Google авторизация недоступна в автономном режиме");
      },
      logout: async () => {},
      updateUser: async () => { throw new Error("Обновление пользователя недоступно в автономном режиме"); },
      addCharacterToUser: async () => {},
      removeCharacterFromUser: async () => {}
    };
  }
  return context;
};
