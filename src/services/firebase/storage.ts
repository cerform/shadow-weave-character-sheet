
import { getStorage } from 'firebase/storage';
import { app } from '@/lib/firebase';

// Initialize Storage
export const storage = getStorage(app);
