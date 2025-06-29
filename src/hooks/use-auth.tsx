
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Хук для защищенных маршрутов
export const useProtectedRoute = () => {
  const { user, currentUser, loading, isAuthenticated } = useAuth();
  
  const activeUser = currentUser || user;
  
  return {
    loading,
    isAuthenticated,
    user: activeUser,
    isDM: activeUser?.isDM || false,
    isPlayer: !activeUser?.isDM,
    canAccessDMDashboard: isAuthenticated && (activeUser?.isDM || false),
    canAccessPlayerDashboard: isAuthenticated && !loading
  };
};
