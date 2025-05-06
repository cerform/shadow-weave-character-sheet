
// Импортируем готовый экземпляр Firebase из централизованного места
import { db as firebaseDb } from '@/lib/firebase';

// Реэкспортируем базу данных для использования в сервисах
export const db = firebaseDb;
