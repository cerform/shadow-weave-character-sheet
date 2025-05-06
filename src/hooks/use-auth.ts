
// Экспорт useAuth из AuthContext для совместимости с существующим кодом
export { useAuth, AuthProvider, AuthContext } from '@/contexts/AuthContext';

// Экспортируем типы для удобства использования
export type { UserType, AuthContextType } from '@/types/auth';

// Импортируем AuthContext для использования в хуках
import { useAuth } from '@/contexts/AuthContext';

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
