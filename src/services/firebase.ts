// Импортируем необходимые типы из firebase
import { Firestore, DocumentData, DocumentReference, CollectionReference } from "firebase/firestore";
import { Auth, UserCredential } from "firebase/auth";

// Создаем мок для Firebase Auth, если реальный Firebase не используется
const mockAuth: Partial<Auth> = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Возвращаем функцию отписки
    return () => {};
  },
  // Реализуем типизированные версии методов аутентификации
  signInWithEmailAndPassword: async (email: string, password: string): Promise<UserCredential> => {
    throw new Error('Firebase Auth not initialized');
  },
  createUserWithEmailAndPassword: async (email: string, password: string): Promise<UserCredential> => {
    throw new Error('Firebase Auth not initialized');
  },
  signOut: async () => {
    return Promise.resolve();
  },
  sendPasswordResetEmail: async (email: string) => {
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
  }
};

// Создаем типизированные моки для Firestore
const mockFirestore: Firestore = {
  type: "firestore",
  app: {} as any,
  toJSON: () => ({}),
  collection: () => ({
    type: "collection",
    id: "mock-collection",
    path: "mock-path",
    parent: null,
    withConverter: () => ({} as any),
    doc: () => ({
      type: "document",
      id: "mock-id",
      path: "mock-path",
      parent: {} as any,
      withConverter: () => ({} as any),
      collection: () => ({} as any),
      firestore: {} as any,
      converter: null,
      get: async () => ({
        exists: false,
        data: () => null,
        id: "mock-id",
        ref: {} as any,
        metadata: {} as any
      }),
      set: async () => {},
      update: async () => {}
    } as DocumentReference<DocumentData>),
    where: () => ({
      get: async () => ({
        empty: true,
        docs: [],
        size: 0,
        forEach: () => {},
        docChanges: () => []
      })
    } as any),
    add: async () => ({
      id: 'mock-id'
    } as any),
    orderBy: () => ({} as any),
    limit: () => ({} as any),
    startAfter: () => ({} as any),
    endBefore: () => ({} as any),
    firestore: {} as any,
    converter: null,
  } as CollectionReference<DocumentData>)
} as Firestore;

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
export const auth = mockAuth as Auth;
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
