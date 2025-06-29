
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
  authDomain: "shadow-char.firebaseapp.com",
  databaseURL: "https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shadow-char",
  storageBucket: "shadow-char.firebasestorage.app",
  messagingSenderId: "815261687102",
  appId: "1:815261687102:web:5497647ed6ff449a57e06f",
  measurementId: "G-KQ3M1GQJX2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (with error handling for environments where it's not available)
export let analyticsPromise: Promise<any> | null = null;

export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && !analyticsPromise) {
    analyticsPromise = Promise.resolve().then(() => {
      try {
        return getAnalytics(app);
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
        return null;
      }
    });
  }
  return analyticsPromise;
};

// Initialize analytics
initializeAnalytics();

export default app;
