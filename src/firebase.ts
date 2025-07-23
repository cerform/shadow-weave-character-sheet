
// Этот файл просто переадресует к основной структуре в lib/firebase.ts
// для обратной совместимости с существующим кодом

import { app, db, auth } from './lib/firebase';

export { 
  app, 
  db, 
  auth
};

export default app;
