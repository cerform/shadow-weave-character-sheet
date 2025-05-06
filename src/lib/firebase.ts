
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from "firebase/analytics";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  databaseURL: "https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shadow-char",
  storageBucket: "shadow-char.appspot.com",
  messagingSenderId: "815261687102",
  appId: "1:815261687102:web:5497647ed6ff449a57e06f",
  measurementId: "G-KQ3M1GQJX2"
};

// Инициализация Firebase - должна происходить только ОДИН раз
console.log('lib/firebase.ts: Инициализация Firebase');
const app = initializeApp(firebaseConfig);

// Инициализация сервисов Firebase
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics only if supported
const initializeAnalytics = async () => {
  try {
    if (await isSupported()) {
      return getAnalytics(app);
    }
    return null;
  } catch (error) {
    console.warn("Analytics not initialized:", error);
    return null;
  }
};

// Initialize asynchronously but don't wait
const analyticsPromise = initializeAnalytics();

// Проверка инициализации Firebase
console.log('lib/firebase.ts: Firebase инициализирован:', app.name);
console.log('lib/firebase.ts: Firestore доступен:', !!db);
console.log('lib/firebase.ts: Auth доступен:', !!auth);

export { 
  app, 
  db, 
  auth, 
  storage, 
  analyticsPromise, 
  initializeAnalytics 
};

export default app;
