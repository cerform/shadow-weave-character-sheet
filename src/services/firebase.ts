
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
  config: {
    apiKey: 'mock',
    apiHost: 'mock',
    apiScheme: 'mock',
    tokenApiHost: 'mock',
    sdkClientVersion: 'mock'
  },
  setPersistence: async () => Promise.resolve(),
  useDeviceLanguage: () => {},
  languageCode: null,
  tenantId: null,
  settings: {} as any,
  updateCurrentUser: async () => Promise.resolve(),
  onIdTokenChanged: () => () => {},
  // Исправляем тип возвращаемого значения
  beforeAuthStateChanged: () => () => {},
  useEmulator: () => {},
  emulatorConfig: null,
  // Добавляем недостающее свойство authStateReady
  authStateReady: () => Promise.resolve()
};

// Создаем моки для Firestore и Storage
const mockFirestore = {
  collection: () => ({
    doc: () => ({
      get: async () => ({
        exists: false,
        data: () => null
      }),
      set: async () => {},
      update: async () => {}
    }),
    where: () => ({
      get: async () => ({
        empty: true,
        docs: []
      })
    }),
    add: async () => ({
      id: 'mock-id'
    })
  })
};

const mockStorage = {
  ref: () => ({
    put: async () => ({
      ref: {
        getDownloadURL: async () => 'https://mock-url.com/image.jpg'
      }
    }),
    delete: async () => {}
  })
};

// Экспортируем моки в качестве сервисов Firebase
export const auth = mockAuth;
export const db = mockFirestore;
export const storage = mockStorage;

// Если доступен реальный Firebase, можно раскомментировать и использовать его
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyAeKvsN-wul7CsemTA-cFxZI0iO9sWe0fg",
//   authDomain: "shadow-char.firebaseapp.com",
//   databaseURL: "https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "shadow-char",
//   storageBucket: "shadow-char.firebasestorage.app",
//   messagingSenderId: "815261687102",
//   appId: "1:815261687102:web:5497647ed6ff449a57e06f",
//   measurementId: "G-KQ3M1GQJX2"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);
