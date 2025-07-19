
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { LogIn, UserPlus, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthFormProps {
  redirectTo?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ redirectTo = '/' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isDM, setIsDM] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Проверка на мобильное устройство
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Очистка сообщения об ошибке при смене вкладки
  useEffect(() => {
    setError(null);
  }, [isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: "Вход выполнен",
          description: "Вы успешно вошли в систему"
        });
      } else {
        if (!displayName) {
          throw new Error("Пожалуйста, введите имя пользователя");
        }
        await register(email, password, displayName, isDM);
        toast({
          title: "Регистрация выполнена",
          description: "Вы успешно зарегистрировались"
        });
      }
      navigate(redirectTo);
    } catch (error: any) {
      setError(error.message || "Произошла ошибка аутентификации");
      toast({
        title: isLogin ? "Ошибка входа" : "Ошибка регистрации",
        description: error.message || "Не удалось выполнить операцию",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Начинаем вход через Google");
      await googleLogin();
      // Если редирект, то этот код может не выполниться
      toast({
        title: "Вход через Google",
        description: "Вход выполняется..."
      });
    } catch (error: any) {
      console.error("Ошибка входа через Google:", error);
      setError(error.message || "Не удалось войти через Google");
      toast({
        title: "Ошибка входа",
        description: error.message || "Не удалось войти через Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Стили для переключателя DM
  const dmSwitchStyle = {
    '--switch-thumb-color': isDM ? currentTheme.accent : 'white',
    '--switch-background-checked': isDM ? `${currentTheme.accent}50` : 'transparent',
    '--switch-border-checked': isDM ? currentTheme.accent : 'gray'
  } as React.CSSProperties;

  return (
    <Card className="w-full shadow-lg border-primary/20 bg-black/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle>{isLogin ? "Вход в аккаунт" : "Регистрация"}</CardTitle>
        <CardDescription>
          {isLogin 
            ? "Войдите, чтобы получить доступ к своему профилю и персонажам" 
            : "Зарегистрируйтесь, чтобы создавать персонажами и присоединяться к игровым сессиям"}
        </CardDescription>
      </CardHeader>
      
      {/* Отображение ошибки аутентификации, если есть */}
      {error && (
        <div className="px-6">
          <Alert 
            variant="destructive"
            className="mb-4"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <CardContent className="space-y-4">
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Имя пользователя</Label>
              <Input 
                id="displayName" 
                type="text" 
                placeholder="GandalfTheGrey" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your.email@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Пароль</Label>
              {isLogin && (
                <a href="#" className="text-xs text-primary hover:underline">
                  Забыли пароль?
                </a>
              )}
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="is-dm" 
                checked={isDM}
                onCheckedChange={setIsDM}
                style={dmSwitchStyle}
                className={`${isDM ? 'border-accent bg-accent/30' : ''} transition-colors`}
              />
              <Label 
                htmlFor="is-dm" 
                className={`${isDM ? 'text-accent font-medium' : ''} cursor-pointer transition-colors`}
                style={{ color: isDM ? currentTheme.accent : undefined }}
              >
                Я буду Мастером Подземелий
              </Label>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full gap-2" 
            disabled={isLoading}
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText || '#FFFFFF'
            }}
          >
            {isLogin ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isLoading 
              ? (isLogin ? "Выполняется вход..." : "Регистрация...") 
              : (isLogin ? "Войти" : "Зарегистрироваться")}
          </Button>
        </form>
        
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              или {isLogin ? "войти" : "зарегистрироваться"} через
            </span>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
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
          {isLoading 
            ? "Авторизация..." 
            : (isLogin ? "Войти с Google" : "Регистрация с Google")}
        </Button>
        
        {isMobile && (
          <Alert variant="warning" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              На мобильных устройствах может потребоваться разрешить всплывающие окна и cookies для входа через Google.
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          type="button"
          variant="ghost"
          className="w-full text-sm mt-4"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </Button>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <p className="px-8 text-center text-sm text-muted-foreground">
          {isLogin ? "Войдя" : "Регистрируясь"}, вы соглашаетесь с нашими{" "}
          <a
            href="#"
            className="underline underline-offset-4 hover:text-primary"
          >
            Условиями использования
          </a>{" "}
          и{" "}
          <a
            href="#"
            className="underline underline-offset-4 hover:text-primary"
          >
            Политикой конфиденциальности
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
