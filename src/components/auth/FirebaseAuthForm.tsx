
import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { app } from "@/services/firebase"; // <-- путь к инициализации firebaseConfig

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const FirebaseAuthForm: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async () => {
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const popupResult = await signInWithPopup(auth, provider);
      if (!popupResult.user) {
        throw new Error("Popup failed");
      }
    } catch (popupError) {
      console.warn("Popup blocked or failed, trying redirect...");
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError: any) {
        setError("Ошибка входа через Google: " + redirectError.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div className="p-4 text-center">
        <p className="mb-2">✅ Добро пожаловать, {user.email}</p>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm mx-auto bg-black text-white border border-yellow-600 rounded-xl">
      <h2 className="text-xl font-bold mb-4">{isLogin ? "Вход в аккаунт" : "Регистрация"}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-gray-900 border border-gray-600 p-2 mb-2 w-full rounded"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-gray-900 border border-gray-600 p-2 mb-4 w-full rounded"
      />

      <button onClick={handleEmailAuth} className="bg-yellow-600 text-black font-bold px-4 py-2 w-full rounded mb-2">
        {isLogin ? "Войти по Email" : "Зарегистрироваться"}
      </button>

      <button onClick={handleGoogleLogin} className="bg-white text-black font-bold px-4 py-2 w-full rounded mb-2">
        🔒 Войти через Google
      </button>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm text-yellow-400 underline w-full text-center"
      >
        {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
      </button>

      {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
    </div>
  );
};

export default FirebaseAuthForm;
