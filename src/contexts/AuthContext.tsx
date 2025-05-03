
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { firebaseAuth } from '@/services/firebase';
import { User as FirebaseUser } from 'firebase/auth';

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
    id: uuidv4(),
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

  // Инициализация при загрузке
  useEffect(() => {
    // Загрузка списка пользователей
    const storedUsers = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    
    // Слушатель изменения состояния аутентификации в Firebase
    const unsubscribe = firebaseAuth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Проверяем, есть ли пользователь в локальном хранилище
        const storedUsers = localStorage.getItem(USER_STORAGE_KEY);
        let usersList: User[] = [];
        
        if (storedUsers) {
          usersList = JSON.parse(storedUsers);
          const existingUser = usersList.find(u => u.firebaseUid === firebaseUser.uid);
          
          if (existingUser) {
            setCurrentUser(existingUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(existingUser));
          } else {
            // Если пользователь есть в Firebase, но нет в локальном хранилище,
            // создаем нового пользователя
            const newUser = createUserFromFirebase(firebaseUser);
            usersList.push(newUser);
            setUsers(usersList);
            setCurrentUser(newUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usersList));
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
          }
        } else {
          // Если нет списка пользователей, создаем новый
          const newUser = createUserFromFirebase(firebaseUser);
          setUsers([newUser]);
          setCurrentUser(newUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify([newUser]));
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        }
      } else {
        // Если в Firebase нет пользователя, очищаем текущего пользователя
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      setIsInitializing(false);
    });
    
    return () => unsubscribe(); // Отписка при размонтировании
  }, []);
  
  // Сохранение пользователей при изменениях
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users]);
  
  // Логин с email и паролем
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const firebaseUser = await firebaseAuth.loginWithEmail(email, password);
      
      if (firebaseUser) {
        // Поиск пользователя в локальном хранилище по Firebase UID
        const existingUser = users.find(u => u.firebaseUid === firebaseUser.uid);
        
        if (existingUser) {
          setCurrentUser(existingUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(existingUser));
        } else {
          // Если пользователя нет в локальном хранилище, создаем нового
          const newUser = createUserFromFirebase(firebaseUser);
          const updatedUsers = [...users, newUser];
          setUsers(updatedUsers);
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
      const firebaseUser = await firebaseAuth.registerWithEmail(email, password);
      
      if (firebaseUser) {
        // Создание нового пользователя
        const newUser = createUserFromFirebase(firebaseUser, isDM, username);
        
        // Добавление в список пользователей
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
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
      const firebaseUser = await firebaseAuth.loginWithGoogle();
      
      if (firebaseUser) {
        // Проверка, существует ли уже пользователь
        const existingUser = users.find(u => u.firebaseUid === firebaseUser.uid);
        
        if (existingUser) {
          setCurrentUser(existingUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(existingUser));
        } else {
          // Если пользователя нет, создаем нового
          const newUser = createUserFromFirebase(firebaseUser, isDM);
          const updatedUsers = [...users, newUser];
          setUsers(updatedUsers);
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
      await firebaseAuth.logout();
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
    
    return new Promise(resolve => {
      const updatedUser = { ...currentUser, ...data };
      
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === currentUser.id ? updatedUser : u
      ));
      
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      resolve();
    });
  };
  
  // Добавление персонажа пользователю
  const addCharacterToUser = async (characterId: string): Promise<void> => {
    if (!currentUser) return Promise.reject('Не авторизован');
    
    return new Promise(resolve => {
      // Проверка, не добавлен ли уже персонаж
      if (currentUser.characters?.includes(characterId)) {
        resolve();
        return;
      }
      
      const updatedCharacters = [...(currentUser.characters || []), characterId];
      
      const updatedUser = { 
        ...currentUser, 
        characters: updatedCharacters 
      };
      
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === currentUser.id ? updatedUser : u
      ));
      
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      resolve();
    });
  };
  
  // Удаление персонажа у пользователя
  const removeCharacterFromUser = async (characterId: string): Promise<void> => {
    if (!currentUser || !currentUser.characters) return Promise.reject('Не авторизован или нет персонажей');
    
    return new Promise(resolve => {
      const updatedCharacters = currentUser.characters.filter(id => id !== characterId);
      
      const updatedUser = { 
        ...currentUser, 
        characters: updatedCharacters 
      };
      
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === currentUser.id ? updatedUser : u
      ));
      
      setCurrentUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      resolve();
    });
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isInitializing,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
