
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Хук для доступа к контексту аутентификации
 * @returns {object} Объект с данными пользователя и методами аутентификации
 */
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    console.error('useAuth должен использоваться внутри AuthProvider');
    
    // Возвращаем заглушку с базовыми данными, чтобы избежать ошибок при использовании
    return {
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      login: () => Promise.reject('AuthProvider не найден'),
      logout: () => Promise.reject('AuthProvider не найден'),
      register: () => Promise.reject('AuthProvider не найден'),
      resetPassword: () => Promise.reject('AuthProvider не найден'),
      updateUserProfile: () => Promise.reject('AuthProvider не найден'),
      googleLogin: () => Promise.reject('AuthProvider не найден')
    };
  }
  
  return authContext;
};

export default useAuth;
