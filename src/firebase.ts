
// Этот файл просто переадресует к основной структуре в lib/firebase.ts
// для обратной совместимости с существующим кодом

import { app, db, auth, storage, analyticsPromise, initializeAnalytics } from './lib/firebase';

export { 
  app, 
  db, 
  auth, 
  storage,
  analyticsPromise, 
  initializeAnalytics 
};

export default app;
