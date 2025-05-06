
import { app } from '@/firebase';
import { getAnalytics, isSupported } from "firebase/analytics";

// Используем уже существующее приложение из firebase.ts
// и добавляем инициализацию Analytics

// Initialize Analytics only if supported (prevents errors in environments like SSR)
export const initializeAnalytics = async () => {
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
export const analyticsPromise = initializeAnalytics();
