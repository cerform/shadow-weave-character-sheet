
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import NavigationButtons from "@/components/ui/NavigationButtons";
import { Checkbox } from "@/components/ui/checkbox";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { isAuthenticated, login, register, googleLogin } = useAuth();
  
  // Состояние форм
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    username: "",
    isDM: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Получаем адрес перенаправления из query параметров
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  // Если пользователь уже аутентифицирован, перенаправляем его
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);
  
  // Обработчики изменения полей формы
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setRegisterForm(prev => ({ ...prev, [name]: fieldValue }));
  };
  
  // Обработчик входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(loginForm.email, loginForm.password);
      navigate(redirectTo);
    } catch (error) {
      console.error("Ошибка входа:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик регистрации
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.email || !registerForm.password || !registerForm.username) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await register(
        registerForm.email,
        registerForm.password,
        registerForm.username,
        registerForm.isDM
      );
      navigate(redirectTo);
    } catch (error) {
      console.error("Ошибка регистрации:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик входа через Google
  const handleGoogleLogin = async (isDM: boolean) => {
    try {
      setIsSubmitting(true);
      await googleLogin(isDM);
      navigate(redirectTo);
    } catch (error) {
      console.error("Ошибка входа через Google:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`min-h-screen p-6 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      {/* Навигация */}
      <div className="max-w-md mx-auto mb-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Назад
          </Button>
          <ThemeSelector />
        </div>
        
        {/* Кнопки навигации */}
        <NavigationButtons className="mt-4" />
      </div>
      
      <Card className="max-w-md mx-auto bg-card/30 backdrop-blur-sm border-primary/20">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="flex items-center gap-1">
              <LogIn className="size-4" />
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-1">
              <UserPlus className="size-4" />
              Регистрация
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle>Вход в аккаунт</CardTitle>
                <CardDescription>
                  Войдите, чтобы получить доступ к своим персонажам и игровым сессиям
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input 
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Выполняется вход..." : "Войти"}
                </Button>
                
                <div className="relative w-full flex items-center gap-2 my-2">
                  <div className="flex-grow h-px bg-muted"></div>
                  <span className="text-xs text-muted-foreground">или</span>
                  <div className="flex-grow h-px bg-muted"></div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleGoogleLogin(false)}
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Войти через Google
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardHeader>
                <CardTitle>Создание аккаунта</CardTitle>
                <CardDescription>
                  Создайте аккаунт, чтобы сохранять персонажей и присоединяться к игровым сессиям
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-username">Имя пользователя</Label>
                  <Input 
                    id="register-username"
                    name="username"
                    type="text"
                    placeholder="Ваше имя или никнейм"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input 
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="is-dm" 
                    name="isDM"
                    checked={registerForm.isDM}
                    onCheckedChange={(checked) => 
                      setRegisterForm(prev => ({ ...prev, isDM: !!checked }))
                    }
                  />
                  <Label htmlFor="is-dm" className="text-sm font-normal cursor-pointer">
                    Я буду Мастером Подземелий (Dungeon Master)
                  </Label>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Создание аккаунта..." : "Создать аккаунт"}
                </Button>
                
                <div className="relative w-full flex items-center gap-2 my-2">
                  <div className="flex-grow h-px bg-muted"></div>
                  <span className="text-xs text-muted-foreground">или</span>
                  <div className="flex-grow h-px bg-muted"></div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleGoogleLogin(registerForm.isDM)}
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Регистрация через Google
                </Button>
                
                <div className="text-center text-xs text-muted-foreground mt-2">
                  Регистрируясь, вы соглашаетесь с нашими условиями использования и политикой конфиденциальности
                </div>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;
