import { useAuth as useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect } from 'react';
import { UserRolesService, AppRole } from '@/services/userRolesService';

// Re-export from the new Supabase auth context
export const useAuth = useSupabaseAuth;

// Хук для защищенных маршрутов
export const useProtectedRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true); // Начинаем с true
  const [rolesFetched, setRolesFetched] = useState(false);
  
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (isAuthenticated && user) {
        setRolesLoading(true);
        try {
          const roles = await UserRolesService.getCurrentUserRoles();
          setUserRoles(roles);
          console.log('Загружены роли пользователя:', roles);
        } catch (error) {
          console.error('Ошибка загрузки ролей:', error);
          setUserRoles(['player']); // Дефолтная роль при ошибке
        } finally {
          setRolesLoading(false);
          setRolesFetched(true);
        }
      } else if (!loading) {
        // Если не авторизован и загрузка auth завершена
        setUserRoles([]);
        setRolesLoading(false);
        setRolesFetched(true);
      }
    };

    fetchUserRoles();
  }, [isAuthenticated, user, loading]);

  const isAdmin = userRoles.includes('admin');
  const isDM = userRoles.includes('dm') || isAdmin;
  const isPlayer = userRoles.includes('player') || userRoles.length === 0;

  // loading = true если:
  // 1. Идет загрузка auth ИЛИ
  // 2. Идет загрузка ролей ИЛИ
  // 3. Пользователь авторизован, но роли еще не загружены
  const combinedLoading = loading || rolesLoading || (isAuthenticated && !rolesFetched);

  return {
    loading: combinedLoading,
    isAuthenticated,
    user,
    userRoles,
    isAdmin,
    isDM,
    isPlayer,
    canAccessDMDashboard: isAuthenticated && isDM,
    canAccessPlayerDashboard: isAuthenticated && !combinedLoading
  };
};

// Хук для получения роли пользователя
export const useUserRole = () => {
  const { userRoles, isAdmin, isDM, isPlayer } = useProtectedRoute();
  
  return {
    userRoles,
    isAdmin,
    isDM,
    isPlayer,
    role: isAdmin ? 'admin' : isDM ? 'dm' : 'player',
  };
};