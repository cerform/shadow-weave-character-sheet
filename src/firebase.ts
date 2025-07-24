import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "твой_api_key",
  authDomain: "твой_домен",
  projectId: "shadow-char",
  storageBucket: "shadow-char.appspot.com",
  messagingSenderId: "твой_sender_id",
  appId: "твой_app_id",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // <-- Firestore!

export { app, auth, db }; // 👈 экспортируем Firestore здесь
