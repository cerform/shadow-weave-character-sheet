
// Экспортируем из нового местоположения
import { app, db, storage } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { analyticsPromise, initializeAnalytics } from '@/lib/firebase';

// Экспортируем авторизацию из нашего сервиса
export * from './auth';

// Экспортируем firestore
export * from './firestore';

// Переэкспортируем остальное из firebase
export { app, db, storage, analyticsPromise, initializeAnalytics };

// Экспортируем firebaseAuth под оригинальным именем для обратной совместимости
export { auth as firebaseAuth } from './auth';

// Для обратной совместимости также экспортируем интерфейсы
export type { DetailedAuthError } from './error-utils';
