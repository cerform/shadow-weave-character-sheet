
// Реэкспортируем useAuth из контекста для совместимости
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { User, UserType, AuthContextType } from '@/types/auth';

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
