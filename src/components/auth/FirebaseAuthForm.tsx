import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { app, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, UserPlus, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';

const auth = getAuth(app);

const FirebaseAuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"player" | "dm">("player");
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser, login, signup, googleLogin, logout } = useAuth();
  
  // Получаем returnPath из параметров state при переходе на страницу auth
  const returnPath = location.state?.returnPath || '/';
  
  // Получаем текущую тему
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Проверяем состояние аутентификации при монтировании и изменении
  useEffect(() => {
    console.log("Firebase Auth Form - Auth state:", { isAuthenticated, currentUser });
    
    // Если пользователь уже авторизован, перенаправляем на указанный путь или на главную
    if (isAuthenticated && currentUser) {
      console.log("User is authenticated, redirecting to:", returnPath);
      navigate(returnPath);
    }
  }, [isAuthenticated, currentUser, navigate, returnPath]);

  const ensureUserProfile = async (uid: string, email: string | null, displayName: string | null) => {
    try {
      const userRef = ref(db, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // Создаем новый профиль с выбранной ролью
        const isDM = role === "dm";
        await set(userRef, {
          uid,
          email,
          displayName: displayName || email?.split('@')[0] || 'Пользователь',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          photoURL: null,
          characters: [],
          isDM: isDM,
          role: role // Добавляем роль пользователя
        });
        console.log(`Профиль пользователя создан с ролью: ${role}`);
      } else {
        // Обновляем дату последнего входа
        await set(userRef, {
          ...snapshot.val(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Ошибка при создании/обновлении профиля:", error);
    }
  };

  const handleEmailAuth = async () => {
    setError("");
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, email.split('@')[0], role === "dm");
      }
      
      toast({
        title: isLogin ? "Вход выполнен" : "Регистрация завершена",
        description: isLogin 
          ? `Добро пожаловать, ${email}` 
          : `Ваш аккаунт успешно создан в роли ${role === "dm" ? "Мастера" : "Игрока"}`
      });
      
      // Добавляем небольшую задержку перед перенаправлением, чтобы состояние успело обновиться
      setTimeout(() => {
        console.log("Redirecting to:", returnPath);
        navigate(returnPath);
      }, 500);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Ошибка",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      console.log("[AUTH] Начинаем Google авторизацию");
      await googleLogin();
      
      toast({
        title: "Вход через Google",
        description: `Авторизация выполнена успешно`
      });
      
      // Добавляем небольшую задержку перед перенаправлением, чтобы состояние успело обновиться
      setTimeout(() => {
        console.log("Redirecting after Google auth to:", returnPath);
        navigate(returnPath);
      }, 500);
    } catch (err: any) {
      setError("Google авторизация не удалась: " + err.message);
      console.error("[AUTH] Ошибка Google авторизации:", err);
      toast({
        title: "Ошибка",
        description: "Google авторизация не удалась: " + err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы"
      });
    } catch (error: any) {
      console.error("Ошибка при выходе:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive"
      });
    }
  };

  if (isAuthenticated && currentUser) {
    return (
      <div className="p-6 text-center rounded-lg border border-accent bg-card/50 backdrop-blur-sm">
        <p className="mb-4 text-lg">✅ Добро пожаловать, <span className="font-bold">{currentUser.email}</span></p>
        <Button 
          onClick={handleLogout} 
          variant="destructive"
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border border-accent bg-card/50 backdrop-blur-sm w-full">
      <h2 className="text-xl font-bold mb-6">{isLogin ? "Вход в аккаунт" : "Регистрация"}</h2>

      <div className="space-y-4">
        {!isLogin && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Выберите вашу роль:</h3>
            <RadioGroup 
              value={role} 
              onValueChange={(value) => setRole(value as "player" | "dm")}
              className="flex space-x-4 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="player" id="player" />
                <Label htmlFor="player" className="cursor-pointer">🎲 Игрок</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dm" id="dm" />
                <Label htmlFor="dm" className="cursor-pointer">🎩 Мастер</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Пароль</label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>

        <Button 
          onClick={handleEmailAuth} 
          disabled={isLoading}
          className="w-full" 
          style={{
            backgroundColor: currentTheme.accent,
            color: currentTheme.buttonText || "#FFFFFF"
          }}
        >
          {isLogin ? (
            <LogIn className="h-4 w-4 mr-2" />
          ) : (
            <UserPlus className="h-4 w-4 mr-2" />
          )}
          {isLogin ? "Войти по Email" : "Зарегистрироваться"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              или
            </span>
          </div>
        </div>

        <Button 
          onClick={handleGoogleLogin} 
          variant="outline" 
          disabled={isLoading}
          className="w-full"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5 mr-2"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          {!isLogin ? `Регистрация через Google (${role === "dm" ? "Мастер" : "Игрок"})` : "Войти через Google"}
        </Button>

        <Button 
          variant="ghost" 
          className="w-full text-sm mt-2" 
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-3 text-sm bg-red-500/20 border border-red-500 rounded-md text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default FirebaseAuthForm;
