
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, UserPlus, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const FirebaseAuthForm: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Получаем текущую тему
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    console.log("Firebase Auth Form mounted");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed in FirebaseAuthForm:", currentUser?.email);
      setUser(currentUser);
      if (currentUser) {
        // Перенаправляем на главную страницу при успешной авторизации
        console.log("User is logged in, redirecting to home");
        toast({
          title: "Вход выполнен",
          description: `Добро пожаловать, ${currentUser.email}`
        });
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleEmailAuth = async () => {
    setError("");
    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Регистрация",
          description: "Вы успешно зарегистрировались"
        });
      }
    } catch (err: any) {
      console.error("Ошибка аутентификации:", err);
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
      console.log("Начинаем вход через Google с popup");
      try {
        const popupResult = await signInWithPopup(auth, provider);
        if (!popupResult.user) {
          throw new Error("Popup failed");
        }
        navigate('/');
      } catch (popupError) {
        console.warn("Popup заблокирован или возникла ошибка, пробуем redirect:", popupError);
        try {
          await signInWithRedirect(auth, provider);
          // После редиректа код не выполнится
        } catch (redirectError: any) {
          setError("Ошибка входа через Google: " + redirectError.message);
          toast({
            title: "Ошибка",
            description: "Ошибка входа через Google: " + redirectError.message,
            variant: "destructive"
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Выход",
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

  if (user) {
    return (
      <div className="p-6 text-center rounded-lg border border-accent bg-card/50 backdrop-blur-sm">
        <p className="mb-4 text-lg">✅ Добро пожаловать, <span className="font-bold">{user.email}</span></p>
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
          Войти через Google
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
