
import { getStorage } from 'firebase/storage';
import { app } from './config';

// Initialize Storage
export const storage = getStorage(app);
