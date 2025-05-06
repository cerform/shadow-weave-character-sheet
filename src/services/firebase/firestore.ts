
// Импортируем Firebase SDK
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Конфигурация Firebase
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

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);

// Инициализируем Firestore
export const db = getFirestore(app);
