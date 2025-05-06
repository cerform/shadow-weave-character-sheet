import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserType, AuthContextType } from '@/types/auth';
import { auth as firebaseAuth, firebaseAuth as fbAuth, db } from '@/services/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const defaultAuthContext: AuthContextType = {
  user: null,
  currentUser: null,
  loading: true,
  error: null,
  login: async () => {},
  signup: async () => {},
  register: async () => {},
  logout: async () => {},
  googleLogin: async () => null, // Возвращает null при ошибке или редиректе
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
    displayName: firebaseUser.displayName || extraData.displayName,
    photoURL: firebaseUser.photoURL || extraData.photoURL,
    username: extraData.username || firebaseUser.displayName || '',
    isDM: extraData.isDM || false, // Используем переданное значение или false по умолчанию
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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
          photoURL: user.photoURL || '',
          characters: [],
        });
        
        console.log("Создан новый пользователь:", user.id);
      }
    } catch (error) {
      console.error("Ошибка при сохранении пользователя в Firestore:", error);
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
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (authUser) => {
      setLoading(true);
      try {
        if (authUser) {
          console.log("Auth state changed: User logged in", authUser);
          // Пользователь авторизован
          // Получаем дополнительные данные из Firestore
          const userData = await getUserFromFirestore(authUser.uid);
          const transformedUser = transformUser(authUser, userData);
          
          // Убедимся, что пользователь правильно трансформирован и имеет все необходимые данные
          console.log("Трансформированный пользователь:", transformedUser);
          
          setUser(transformedUser);
          // Сохраняем пользователя в Firestore (создаем или обновляем)
          await saveUserToFirestore(transformedUser);
        } else {
          console.log("Auth state changed: User logged out");
          // Пользователь не авторизован
          setUser(null);
        }
      } catch (err) {
        console.error("Error in auth state listener", err);
        setError(err as Error);
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
      const userCredential = await firebaseAuth.loginWithEmail(email, password);
      if (userCredential) {
        console.log("Login successful", userCredential);
        // Получаем дополнительные данные из Firestore
        const userData = await getUserFromFirestore(userCredential.uid);
        const transformedUser = transformUser(userCredential, userData);
        setUser(transformedUser);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string, isDM: boolean = false) => {
    try {
      setLoading(true);
      console.log("Attempting signup:", email, displayName, isDM);
      const userCredential = await firebaseAuth.registerWithEmail(email, password);
      if (userCredential) {
        console.log("Signup successful", userCredential);
        // Создаем объект пользователя с дополнительными данными
        const transformedUser = transformUser(userCredential, { isDM, displayName });
        transformedUser.displayName = displayName;
        transformedUser.username = displayName;
        transformedUser.isDM = isDM;
        
        // Сохраняем пользователя в Firestore
        await saveUserToFirestore(transformedUser);
        
        setUser(transformedUser);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Алиас для signup, чтобы соответствовать ожидаемому имени функции
  const register = signup;

  const logout = async () => {
    try {
      setLoading(true);
      console.log("Attempting logout");
      await firebaseAuth.logout();
      setUser(null);
      console.log("Logout successful");
      toast({
        title: "Выход",
        description: "Вы успешно вышли из системы"
      });
    } catch (err) {
      console.error("Logout error:", err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Обновленная функция для входа через Google с поддержкой redirect
  const googleLogin = async (): Promise<UserType | null> => {
    try {
      setLoading(true);
      console.log("Attempting Google login");
      const userCredential = await firebaseAuth.loginWithGoogle();
      
      // Если был выполнен редирект, управление не дойдет до этой точки
      // Если попап был успешным, обрабатываем результат
      if (userCredential) {
        console.log("Google login successful", userCredential);
        // Получаем дополнительные данные из Firestore
        const userData = await getUserFromFirestore(userCredential.uid);
        
        // Создаем объект пользователя с учетом данных из Firestore
        const transformedUser = transformUser(userCredential, {
          ...userData,
          photoURL: userCredential.photoURL || userData.photoURL,
          displayName: userCredential.displayName || userData.displayName,
          username: userData.username || userCredential.displayName
        });
        
        console.log("Трансформированный пользователь Google:", transformedUser);
        
        // Сохраняем пользователя в Firestore для обновления или создания
        await saveUserToFirestore(transformedUser);
        
        // Устанавливаем пользователя в контекст
        setUser(transformedUser);
        
        toast({
          title: "Вход выполнен",
          description: "Вы успешно вошли через Google"
        });
        
        return transformedUser;
      }
      
      // Если был выполнен редирект или произошла ошибка
      return null;
    } catch (err) {
      console.error("Google login error:", err);
      setError(err as Error);
      toast({
        title: "Ошибка входа",
        description: (err as Error).message || "Не удалось войти через Google",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
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
      setUser(updatedUser);
      
      toast({
        title: "Профиль обновлен",
        description: "Ваш профиль успешно обновлен"
      });
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err as Error);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        loading,
        error: error ? error.message : null,
        login,
        register,
        logout,
        googleLogin,
        isAuthenticated: !!user,
        updateProfile,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
