
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// Хук для доступа к контексту аутентификации
export const useAuth = () => {
  return useContext(AuthContext);
};
