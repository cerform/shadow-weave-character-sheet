
// Реэкспортируем useAuth из контекста для совместимости
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// Тип для пользователя
export interface UserType {
  uid?: string;
  id?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  username?: string;
  isDM?: boolean;
  role?: 'dm' | 'player';
}

// Тип для контекста аутентификации
export interface AuthContextType {
  currentUser: UserType | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserType>;
  signUp: (email: string, password: string, username: string) => Promise<UserType>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
  user?: UserType | null;
}

// Экспортируем основной хук аутентификации
export const useAuth = () => {
  return useAuthContext();
};

// Удобный хук для проверки аутентификации
export const useIsAuthenticated = () => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  return { isAuthenticated, currentUser, loading };
};

// Хук для проверки роли пользователя
export const useUserRole = () => {
  const { currentUser } = useAuth();
  return {
    isDM: currentUser?.role === 'dm' || currentUser?.isDM === true,
    isPlayer: currentUser?.role === 'player' || (currentUser && !currentUser.isDM),
    role: currentUser?.role || (currentUser?.isDM ? 'dm' : 'player'),
  };
};

// Хук для защиты маршрутов
export const useProtectedRoute = () => {
  const { isAuthenticated, currentUser, loading } = useIsAuthenticated();
  const { isDM, isPlayer } = useUserRole();
  
  return {
    loading,
    isAuthenticated,
    isDM,
    isPlayer,
    canAccessDMDashboard: isAuthenticated && isDM,
    canAccessPlayerDashboard: isAuthenticated && isPlayer,
  };
};

// Экспортируем для обратной совместимости
export { useAuth as default };
