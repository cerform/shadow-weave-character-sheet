
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserType {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: UserType | null;
  currentUser: UserType | null; // Добавляем для совместимости
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>; // Алиас для signup
  logout: () => Promise<void>;
  googleLogin: (redirect?: boolean) => Promise<void>; // Добавляем метод для входа через Google
}

const defaultAuthContext: AuthContextType = {
  user: null,
  currentUser: null,
  loading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  register: async () => {},
  logout: async () => {},
  googleLogin: async () => {}
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Имитируем проверку аутентификации
    const checkAuth = async () => {
      try {
        // Здесь будет проверка через firebase или другую систему аутентификации
        // Пока используем моковые данные
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Здесь будет логика входа
      const mockUser = {
        uid: '1',
        displayName: 'Тестовый пользователь',
        email: email,
        photoURL: null
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      // Здесь будет логика регистрации
      const mockUser = {
        uid: '1',
        displayName: displayName,
        email: email,
        photoURL: null
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Алиас для signup, чтобы соответствовать ожидаемому имени функции
  const register = signup;

  const logout = async () => {
    try {
      // Здесь будет логика выхода
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Добавляем функцию для входа через Google
  const googleLogin = async (redirect: boolean = true) => {
    try {
      // Здесь будет логика входа через Google
      // Пока используем моковые данные
      const mockUser = {
        uid: '2',
        displayName: 'Google Пользователь',
        email: 'google@example.com',
        photoURL: 'https://via.placeholder.com/150'
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user, // Добавляем для совместимости
        loading,
        error,
        login,
        signup,
        register,
        logout,
        googleLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
