
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  databaseURL: "https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shadow-char"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app); // Только Realtime Database

export default app;
// ✅ Проверка: если уже инициализирован — повторно не делаем
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Экспортируй всё отдельно (внимание на имена!)
export const app = firebaseApp;
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);