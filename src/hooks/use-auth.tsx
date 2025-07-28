import { useAuth as useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

// Re-export from the new Supabase auth context
export const useAuth = useSupabaseAuth;

// Хук для защищенных маршрутов
export const useProtectedRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  return {
    loading,
    isAuthenticated,
    user,
    isDM: false, // В Supabase это можно настроить через роли
    isPlayer: true,
    canAccessDMDashboard: isAuthenticated,
    canAccessPlayerDashboard: isAuthenticated && !loading
  };
};

// Хук для получения роли пользователя
export const useUserRole = () => {
  const { user } = useAuth();
  return {
    isDM: false, // В Supabase это можно настроить через роли
    isPlayer: true,
    role: 'player',
  };
};