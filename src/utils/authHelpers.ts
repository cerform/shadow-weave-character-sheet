
import { auth } from '@/services/firebase/auth';

/**
 * Получает текущий UID пользователя или null если пользователь не авторизован
 */
export const getCurrentUid = (): string | null => {
  const currentUser = auth.currentUser;
  return currentUser ? currentUser.uid : null;
};
