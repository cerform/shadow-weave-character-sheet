
// This is a minimal firebase service to support the application functioning without Supabase

// Mock auth service
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Return an unsubscribe function
    return () => {};
  },
  signInWithEmailAndPassword: async () => {
    throw new Error("Firebase authentication not implemented. Use offline mode.");
  },
  createUserWithEmailAndPassword: async () => {
    throw new Error("Firebase authentication not implemented. Use offline mode.");
  },
  signOut: async () => {
    localStorage.removeItem("currentUser");
    return Promise.resolve();
  },
};

// Mock firestore service
export const db = {
  collection: () => ({
    doc: () => ({
      get: async () => ({
        exists: false,
        data: () => null,
      }),
      set: async () => {},
      update: async () => {},
    }),
  }),
};

// Mock storage service
export const storage = {
  ref: () => ({
    put: async () => {},
    getDownloadURL: async () => "",
  }),
};
