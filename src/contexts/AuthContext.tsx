import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserType, AuthContextType } from '@/types/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '@/firebase';
import { auth, loginWithEmail, registerWithEmail, loginWithGoogle, logout, listenToAuthChanges } from '@/services/firebase/auth';
import { toast } from 'sonner';

const defaultAuthContext: AuthContextType = {
  user: null,
  currentUser: null,
  loading: true,
  error: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  signup: async () => {},
  register: async () => {},
  logout: async () => {},
  googleLogin: async () => null,
  isAuthenticated: false,
  updateProfile: async () => {}
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Функция преобразования пользователя Firebase в UserType
const transformUser = (firebaseUser: FirebaseUser, extraData: Partial<UserType> = {}): UserType => {
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || extraData.displayName || '',
    photoURL: firebaseUser.photoURL || extraData.photoURL || '',
    username: extraData.username || firebaseUser.displayName || '',
    isDM: extraData.isDM || false,
    role: extraData.role || 'player',
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для сохранения информации о пользователе в Firestore
  const saveUserToFirestore = async (user: UserType) => {
    try {
      const userRef = doc(db, "users", user.id);
      
      // Проверим, существует ли этот пользователь
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // Обновляем существующего пользователя
        const userData = userSnap.data();
        await setDoc(userRef, {
          username: user.username || user.displayName || userData.username || '',
          email: user.email,
          updatedAt: new Date().toISOString(),
          isDM: user.isDM !== undefined ? user.isDM : userData.isDM || false,
          photoURL: user.photoURL || userData.photoURL || '',
          displayName: user.displayName || userData.displayName || '',
          role: user.role || userData.role || 'player',
          // Сохраняем другие поля, но не перезаписываем их
        }, { merge: true });
        
        console.log("Обновлен существующий пользователь:", user.id);
      } else {
        // Создаем нового пользователя
        await setDoc(userRef, {
          username: user.username || user.displayName || '',
          email: user.email,
          displayName: user.displayName || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDM: user.isDM || false,
          role: user.role || 'player',
          photoURL: user.photoURL || '',
          characters: [],
        });
        
        console.log("Создан новый пользователь:", user.id);
      }
    } catch (error) {
      console.error("Ошибка при сохра��ении пользователя в Firestore:", error);
    }
  };

  // Функция для получения расширенных данных пользователя из Firestore
  const getUserFromFirestore = async (userId: string): Promise<Partial<UserType>> => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as Partial<UserType>;
      }
      
      return {};
    } catch (error) {
      console.error("Ошибка при получении пользователя из Firestore:", error);
      return {};
    }
  };

  useEffect(() => {
    // Настройка слушателя изменения состояния аутентификации
    console.log("Setting up auth state listener");
    
    const unsubscribe = listenToAuthChanges(async (authUser) => {
      setLoading(true);
      try {
        if (authUser) {
          console.log("Auth state changed: User logged in", authUser);
          // Получаем дополнительные данные из Firestore
          const userData = await getUserFromFirestore(authUser.uid);
          const transformedUser = transformUser(authUser, userData);
          
          console.log("Трансформированный пользователь:", transformedUser);
          
          // Сохраняем в localStorage для быстрого доступа
          localStorage.setItem('authUser', JSON.stringify(transformedUser));
          
          setUser(transformedUser);
          // Сохраняем пользователя в Firestore (создаем или обновляем)
          await saveUserToFirestore(transformedUser);
        } else {
          console.log("Auth state changed: User logged out");
          // Очищаем localStorage при выходе
          localStorage.removeItem('authUser');
          setUser(null);
        }
      } catch (err) {
        console.error("Error in auth state listener", err);
        handleError(err);
      } finally {
        setLoading(false);
      }
    });

    // Очистка слушателя при размонтировании
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting login with email:", email);
      const firebaseUser = await loginWithEmail(email, password);
      if (firebaseUser) {
        console.log("Login successful", firebaseUser);
        // Получаем дополнительные данные из Firestore
        const userData = await getUserFromFirestore(firebaseUser.uid);
        const transformedUser = transformUser(firebaseUser, userData);
        setUser(transformedUser);
      }
    } catch (err) {
      console.error("Login error:", err);
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string, isDM: boolean = false) => {
    try {
      setLoading(true);
      console.log("Attempting signup:", email, displayName, isDM);
      const firebaseUser = await registerWithEmail(email, password);
      if (firebaseUser) {
        console.log("Signup successful", firebaseUser);
        // Создаем объект пользователя с дополнительными данными
        const transformedUser = transformUser(firebaseUser, { isDM, displayName });
        transformedUser.displayName = displayName;
        transformedUser.username = displayName;
        transformedUser.isDM = isDM;
        
        // Сохраняем пользователя в Firestore
        await saveUserToFirestore(transformedUser);
        
        setUser(transformedUser);
      }
    } catch (err) {
      console.error("Signup error:", err);
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Алиас для signup, чтобы соответствовать ожидаемому имени функции
  const register = signup;

  const logoutUser = async () => {
    try {
      setLoading(true);
      console.log("Attempting logout");
      await logout();
      // Очищаем localStorage при выходе
      localStorage.removeItem('authUser');
      setUser(null);
      console.log("Logout successful");
      toast.success("Вы успешно вышли из системы");
    } catch (err) {
      console.error("Logout error:", err);
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Обновленная функция для входа через Google с поддержкой redirect
  const googleLoginFn = async (): Promise<UserType | null> => {
    try {
      setLoading(true);
      console.log("Attempting Google login");
      const firebaseUser = await loginWithGoogle();
      
      // Если был выполнен редирект, управление не дойдет до этой точки
      // Если попап был успешным, обрабатываем результат
      if (firebaseUser) {
        console.log("Google login successful", firebaseUser);
        // Получаем дополнительные данные из Firestore
        const userData = await getUserFromFirestore(firebaseUser.uid);
        
        // Создаем объект пользователя с учетом данных из Firestore
        const transformedUser = transformUser(firebaseUser, {
          ...userData,
          photoURL: firebaseUser.photoURL || userData.photoURL,
          displayName: firebaseUser.displayName || userData.displayName,
          username: userData.username || firebaseUser.displayName
        });
        
        console.log("Трансформированный пользователь Google:", transformedUser);
        
        // Сохраняем в localStorage
        localStorage.setItem('authUser', JSON.stringify(transformedUser));
        
        // Сохраняем пользователя в Firestore для обновления или создания
        await saveUserToFirestore(transformedUser);
        
        // Устанавливаем пользователя в контекст
        setUser(transformedUser);
        
        toast.success("Вы успешно вошли через Google");
        
        return transformedUser;
      }
      
      // Если был выполнен редирект или произошла ошибка
      return null;
    } catch (err) {
      console.error("Google login error:", err);
      handleError(err);
      toast.error("Не удалось войти через Google: " + (err instanceof Error ? err.message : String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Добавляем алиас loginWithGoogle для совместимости с типом AuthContextType
  const googleLoginWithGoogle = async (): Promise<void> => {
    try {
      await googleLoginFn();
    } catch (err) {
      console.error("Google login error in loginWithGoogle:", err);
      throw err;
    }
  };

  // Функция обновления профиля
  const updateProfile = async (data: Partial<UserType>) => {
    try {
      if (!user) throw new Error('Пользователь не авторизован');
      
      console.log("Updating user profile", data);
      // Обновляем профиль в Firestore
      const updatedUser = { ...user, ...data };
      await saveUserToFirestore(updatedUser);
      
      // Обновляем в localStorage
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      
      toast.success("Ваш профиль успешно обновлен");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  const handleError = (err: Error | unknown) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    setError(errorMessage);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        loading,
        error,
        login,
        loginWithGoogle: googleLoginWithGoogle,
        register,
        logout: logoutUser,
        googleLogin: googleLoginFn,
        isAuthenticated: !!user,
        updateProfile,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
