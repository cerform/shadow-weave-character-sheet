
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg", // В реальных проектах этот ключ должен быть в .env
  authDomain: "shadow-char.firebaseapp.com",
  databaseURL: "https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shadow-char",
  storageBucket: "shadow-char.firebasestorage.app",
  messagingSenderId: "815261687102",
  appId: "1:815261687102:web:5497647ed6ff449a57e06f",
  measurementId: "G-KQ3M1GQJX2"
};

// Инициализация Firebase
console.log('Инициализация Firebase');
export const app = initializeApp(firebaseConfig);

// Инициализация сервисов Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Проверка инициализации Firebase
console.log('Firebase инициализирован:', app.name);
console.log('Firestore доступен:', !!db);
console.log('Auth доступен:', !!auth);

export default app;
