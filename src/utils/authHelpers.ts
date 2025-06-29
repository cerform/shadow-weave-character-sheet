
import { auth } from '@/lib/firebase';

export const getCurrentUid = (): string | null => {
  return auth.currentUser?.uid || null;
};

export const getCurrentUser = () => {
  return auth.currentUser;
};
