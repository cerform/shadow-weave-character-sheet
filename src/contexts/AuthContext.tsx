
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/services/firebase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { firebaseAuth } from '@/services/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { getCurrentUser, getCurrentUid, isAuthenticated } from '@/utils/authHelpers';
import { FirestoreUserData } from '@/utils/firestoreHelpers';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Интерфейс для текущего пользователя
interface CurrentUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username: string;
  isDM?: boolean;
  characters?: string[];
}

// Интерфейс для контекста аутентификации
interface AuthContextType {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; photoURL?: string; username?: string; isDM?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Функция для синхронизации пользователя с Firestore
  const syncUserWithFirestore = async (userData: { 
    username?: string;
    email?: string;
    isDM?: boolean;
  }) => {
    try {
      const uid = getCurrentUid();
      if (!uid) {
        console.error("syncUserWithFirestore: Пользователь не авторизован");
        return null;
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      const timestamp = new Date().toISOString();
      
      if (userDoc.exists()) {
        // Обновляем существующего пользователя
        console.log("syncUserWithFirestore: Обновляем пользователя", uid);
        await updateDoc(userRef, {
          ...userData,
          updatedAt: timestamp
        });
      } else {
        // Создаем нового пользователя
        console.log("syncUserWithFirestore: Создаем нового пользователя", uid);
        await setDoc(userRef, {
          ...userData,
          createdAt: timestamp,
          updatedAt: timestamp,
          characters: []
        });
      }
      
      return uid;
    } catch (error) {
      console.error("Ошибка при синхронизации пользователя с Firestore:", error);
      return null;
    }
  };

  // Функция для получения данных пользователя из Firestore
  const getCurrentUserWithData = async (): Promise<FirestoreUserData | null> => {
    try {
      const uid = getCurrentUid();
      if (!uid) {
        console.error("getCurrentUserWithData: Пользователь не авторизован");
        return null;
      }

      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        console.log("getCurrentUserWithData: Данные пользователя получены");
        return userDoc.data() as FirestoreUserData;
      } else {
        console.log("getCurrentUserWithData: Пользователь найден в Firebase Auth, но не в Firestore");
        return null;
      }
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      return null;
    }
  };

  // При изменении состояния авторизации обновляем текущего пользователя
  useEffect(() => {
    setIsLoading(true);
    console.log("AuthProvider: Инициализация слушателя авторизации");

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      console.log("AuthProvider: Изменение состояния авторизации", user ? user.uid : "Не авторизован");
      
      if (user) {
        try {
          // Получаем дополнительные данные пользователя из Firestore
          const firestoreData = await getCurrentUserWithData();
          console.log("AuthProvider: Данные пользователя из Firestore:", firestoreData);
          
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            username: firestoreData?.username || user.displayName || "Пользователь",
            isDM: firestoreData?.isDM || false,
            characters: firestoreData?.characters || []
          });
        } catch (error) {
          console.error("AuthProvider: Ошибка при получении данных пользователя:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  // Регистрация нового пользователя
  const register = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      const userCredential = await auth.registerWithEmail(email, password);
      
      if (userCredential) {
        // Синхронизируем данные пользователя с Firestore
        await syncUserWithFirestore({ username, email });
        
        toast({
          title: "Успешная регистрация",
          description: "Ваш аккаунт создан успешно"
        });
        
        // Обновляем текущего пользователя
        setCurrentUser({
          uid: userCredential.uid,
          email: userCredential.email,
          displayName: userCredential.displayName,
          photoURL: userCredential.photoURL,
          username: username || "Пользователь",
          isDM: false,
          characters: []
        });
        
        navigate('/');
      }
    } catch (error: any) {
      console.error("Ошибка при регистрации:", error);
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Не удалось зарегистрироваться. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Вход в аккаунт
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await auth.loginWithEmail(email, password);
      
      if (userCredential) {
        // Получаем дополнительные данные пользователя из Firestore
        const firestoreData = await getCurrentUserWithData();
        
        toast({
          title: "Успешный вход",
          description: "Вы вошли в свой аккаунт"
        });
        
        // Обновляем текущего пользователя
        setCurrentUser({
          uid: userCredential.uid,
          email: userCredential.email,
          displayName: userCredential.displayName,
          photoURL: userCredential.photoURL,
          username: firestoreData?.username || userCredential.displayName || "Пользователь",
          isDM: firestoreData?.isDM || false,
          characters: firestoreData?.characters || []
        });
        
        navigate('/');
      }
    } catch (error: any) {
      console.error("Ошибка при входе:", error);
      toast({
        title: "Ошибка входа",
        description: error.message || "Не удалось войти. Пожалуйста, проверьте свои учетные данные и попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Выход из аккаунта
  const logout = async () => {
    try {
      setIsLoading(true);
      await auth.logout();
      setCurrentUser(null);
      
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из своего аккаунта"
      });
      
      navigate('/');
    } catch (error: any) {
      console.error("Ошибка при выходе:", error);
      toast({
        title: "Ошибка выхода",
        description: error.message || "Не удалось выйти. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Сброс пароля
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      // TODO: Реализовать сброс пароля через Firebase
      toast({
        title: "Ссылка отправлена",
        description: "Проверьте вашу электронную почту для сброса пароля"
      });
    } catch (error: any) {
      console.error("Ошибка при сбросе пароля:", error);
      toast({
        title: "Ошибка сброса пароля",
        description: error.message || "Не удалось отправить ссылку для сброса пароля. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обновление профиля пользователя
  const updateProfile = async (data: { displayName?: string; photoURL?: string; username?: string; isDM?: boolean }) => {
    try {
      setIsLoading(true);
      
      if (!currentUser) {
        throw new Error("Пользователь не авторизован");
      }
      
      // Синхронизируем данные пользователя с Firestore
      await syncUserWithFirestore(data);
      
      // Обновляем локальное состояние пользователя
      setCurrentUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          displayName: data.displayName || prev.displayName,
          photoURL: data.photoURL || prev.photoURL,
          username: data.username || prev.username,
          isDM: data.isDM !== undefined ? data.isDM : prev.isDM
        };
      });
      
      toast({
        title: "Профиль обновлен",
        description: "Ваш профиль был успешно обновлен"
      });
    } catch (error: any) {
      console.error("Ошибка при обновлении профиля:", error);
      toast({
        title: "Ошибка обновления профиля",
        description: error.message || "Не удалось обновить профиль. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    register,
    login,
    logout,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
