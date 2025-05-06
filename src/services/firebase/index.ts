
// Экспортируем внешний firebase.ts как единую точку входа,
// переименовывая auth из @/firebase для избежания конфликта имен
import { app, db, storage } from '@/firebase';
import { getAuth } from 'firebase/auth';

// Экспортируем авторизацию из нашего сервиса
export * from './auth';

// Экспортируем firestore
export * from './firestore';

// Переэкспортируем остальное из firebase
export { app, db, storage };

// Экспортируем firebaseAuth под оригинальным именем для обратной совместимости
export { auth as firebaseAuth } from './auth';

// Для обратной совместимости также экспортируем интерфейсы
export type { DetailedAuthError } from './error-utils';
