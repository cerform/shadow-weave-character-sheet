
// Экспортируем внешний firebase.ts как единую точку входа,
// переименовывая auth из @/firebase для избежания конфликта имен
import { app, db, storage, analyticsPromise, initializeAnalytics } from '@/firebase';
import { auth as firebaseDefaultAuth } from '@/firebase';

// Экспортируем авторизацию из нашего сервиса
export * from './auth';

// Экспортируем firestore
export * from './firestore';

// Переэкспортируем остальное из firebase
export { app, db, storage, analyticsPromise, initializeAnalytics };

// Экспортируем firebaseAuth под оригинальным именем для обратной совместимости
export { firebaseDefaultAuth as firebaseAuth };

// Для обратной совместимости также экспортируем интерфейсы
export type { DetailedAuthError } from './error-utils';
