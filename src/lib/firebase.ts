// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
// Если используешь Firestore, раскомментируй:
// import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  databaseURL: "https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shadow-char"
};

// ✅ Защита от повторной инициализации:
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Только один раз экспортируешь:
export const app = firebaseApp;
export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp); // Realtime DB
// export const db = getFirestore(firebaseApp); // Firestore, если нужно

export default app;
