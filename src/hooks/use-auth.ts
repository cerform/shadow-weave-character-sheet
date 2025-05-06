
// Экспорт useAuth из AuthContext для совместимости с существующим кодом
export { useAuth, AuthProvider, AuthContext } from '@/contexts/AuthContext';

// Экспортируем типы для удобства использования
export type { UserType, AuthContextType } from '@/types/auth';

// Удобный хук для проверки аутентификации
export const useIsAuthenticated = () => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  return { isAuthenticated, currentUser, loading };
};
