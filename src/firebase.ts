
// Этот файл просто переадресует к новой структуре в lib/firebase.ts
// для обратной совместимости с существующим кодом

export { 
  app, 
  db, 
  auth, 
  storage,
  analyticsPromise, 
  initializeAnalytics 
} from './lib/firebase';

export default app;
