
// Экспортируем основную конфигурацию Firebase
export { app, analyticsPromise } from './config';

// Экспортируем сервисы Firebase
export { db } from './firestore';
export { storage } from './storage';
export { auth, firebaseAuth } from './auth';

// Экспортируем интерфейсы ошибок
export type { DetailedAuthError } from './error-utils';
