
// Создаем мок для Firebase Auth, если реальный Firebase не используется
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Возвращаем функцию отписки
    return () => {};
  },
  signInWithEmailAndPassword: async () => {
    throw new Error('Firebase Auth not initialized');
  },
  createUserWithEmailAndPassword: async () => {
    throw new Error('Firebase Auth not initialized');
  },
  signOut: async () => {
    return Promise.resolve();
  },
  sendPasswordResetEmail: async () => {
    throw new Error('Firebase Auth not initialized');
  },
  // Добавляем дополнительные свойства для совместимости с типом Auth
  app: {} as any,
  name: 'auth-mock',
  config: {},
  setPersistence: async () => Promise.resolve(),
  useDeviceLanguage: () => {},
  languageCode: null,
  tenantId: null,
  settings: {} as any,
  updateCurrentUser: async () => Promise.resolve(),
  onIdTokenChanged: () => () => {},
  beforeAuthStateChanged: () => Promise.resolve(() => {}),
  useEmulator: () => {},
  emulatorConfig: null,
  // Добавляем недостающее свойство authStateReady
  authStateReady: () => Promise.resolve()
};

// Создаем моки для Firestore и Storage
const mockDb = {};
const mockStorage = {};

// Export the mock instances
export const auth = mockAuth;
export const db = mockDb;
export const storage = mockStorage;
