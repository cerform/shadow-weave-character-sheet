
// Экспортируем внешний firebase.ts как единую точку входа
export * from '@/firebase';

// Экспортируем авторизацию
export * from './auth';

// Для обратной совместимости также экспортируем интерфейсы
export type { DetailedAuthError } from './error-utils';
