
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Типы для пользователя и контекста
export interface User {
  id: string;
  email: string;
  username: string;
  isDM: boolean;
  characters?: string[]; // ID сохраненных персонажей
  createdAt: string;
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
    
    // Проверка сохраненной сессии
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setIsInitializing(false);
  }, []);
  
  // Сохранение пользователей при изменениях
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users]);
  
  // Сохранение текущего пользователя
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);
  
  // Логин
  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Имитация асинхронности
      setTimeout(() => {
        // Поиск пользователя по email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          reject(new Error('Пользователь не найден'));
          return;
        }
        
        // В реальном приложении здесь была бы проверка пароля
        // Это простая имитация для примера
        setCurrentUser(user);
        resolve();
      }, 600);
    });
  };
  
  // Регистрация
  const register = async (email: string, password: string, username: string, isDM: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Имитация асинхронности
      setTimeout(() => {
        // Проверка, не существует ли уже пользователь с таким email
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          reject(new Error('Пользователь с таким email уже существует'));
          return;
        }
        
        // Создание нового пользователя
        const newUser: User = {
          id: uuidv4(),
          email,
          username,
          isDM,
          characters: [],
          createdAt: new Date().toISOString()
        };
        
        // Добавление в список пользователей
        setUsers(prevUsers => [...prevUsers, newUser]);
        
        // Устанавливаем как текущего пользователя
        setCurrentUser(newUser);
        resolve();
      }, 600);
    });
  };
  
  // Вход через Google (имитация)
  const googleLogin = async (isDM: boolean): Promise<void> => {
    return new Promise((resolve) => {
      // Имитация входа через Google OAuth
      setTimeout(() => {
        const randomId = Math.floor(Math.random() * 10000);
        const email = `user${randomId}@gmail.com`;
        
        // Проверка, существует ли пользователь
        let user = users.find(u => u.email === email);
        
        if (!user) {
          // Создание нового пользователя
          user = {
            id: uuidv4(),
            email,
            username: `User ${randomId}`,
            isDM,
            characters: [],
            createdAt: new Date().toISOString()
          };
          
          setUsers(prevUsers => [...prevUsers, user!]);
        }
        
        setCurrentUser(user);
        resolve();
      }, 1000);
    });
  };
  
  // Выход
  const logout = async (): Promise<void> => {
    return new Promise(resolve => {
      setCurrentUser(null);
      resolve();
    });
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
