import { useAuth as useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect } from 'react';
import { UserRolesService, AppRole } from '@/services/userRolesService';

// Re-export from the new Supabase auth context
export const useAuth = useSupabaseAuth;

// Хук для защищенных маршрутов
export const useProtectedRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (isAuthenticated && user) {
        setRolesLoading(true);
        const roles = await UserRolesService.getCurrentUserRoles();
        setUserRoles(roles);
        console.log('Загружены роли пользователя:', roles);
        setRolesLoading(false);
      } else {
        setUserRoles([]);
        setRolesLoading(false);
      }
    };

    fetchUserRoles();
  }, [isAuthenticated, user]);

  const isAdmin = userRoles.includes('admin');
  const isDM = userRoles.includes('dm') || isAdmin;
  const isPlayer = userRoles.includes('player') || userRoles.length === 0;

  return {
    loading: loading || rolesLoading,
    isAuthenticated,
    user,
    userRoles,
    isAdmin,
    isDM,
    isPlayer,
    canAccessDMDashboard: isAuthenticated && isDM,
    canAccessPlayerDashboard: isAuthenticated && !loading
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