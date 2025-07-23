
// Экспортируем из нового местоположения
export { app, db } from '@/lib/firebase';

// Экспортируем авторизацию из нашего сервиса
export * from './auth';

// Экспортируем firebaseAuth под оригинальным именем для обратной совместимости
export { auth as firebaseAuth } from '@/lib/firebase';

// Для обратной совместимости также экспортируем интерфейсы
export type { DetailedAuthError } from './error-utils';
