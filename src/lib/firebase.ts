// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔥 Конфиг Firebase проекта
const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  projectId: "shadow-char",
  storageBucket: "shadow-char.appspot.com",
     
};

// ✅ Безопасная инициализация — предотвращаем ошибку "already exists"
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Экспорт сервисов
export const app = firebaseApp;
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp); // Firestore используется здесь
