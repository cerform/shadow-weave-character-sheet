// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Экспорт нужных сущностей
export const app = firebaseApp;
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);