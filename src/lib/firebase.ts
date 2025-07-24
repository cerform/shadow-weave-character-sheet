// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// ✅ Конфиг именно под твой проект
const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  databaseURL: "https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shadow-char"
};

// ✅ Проверка: если уже инициализирован — повторно не инициализируем
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Экспорт необходимых сервисов
export const app = firebaseApp;
export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp); // Используем Realtime Database
