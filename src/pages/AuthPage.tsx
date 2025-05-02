
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import { ArrowLeft, Mail, Shield, Github } from "lucide-react";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { login, register, googleLogin, isAuthenticated } = useAuth();
  
  // Получаем адрес перенаправления из query параметров
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  // Состояния для форм
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDM, setIsDM] = useState(false);
  
  // Если пользователь уже аутентифицирован, перенаправляем его
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);
  
  // Функция для входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Вход выполнен успешно!");
      navigate(redirectTo);
    } catch (error: any) {
      console.error("Ошибка входа:", error);
      toast.error(error?.message || "Неверный логин или пароль");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для регистрации
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Пароль должен содержать не менее 6 символов");
      return;
    }
    
    setIsLoading(true);
    try {
      await register(email, password, username, isDM);
      toast.success("Регистрация прошла успешно!");
      navigate(redirectTo);
    } catch (error: any) {
      console.error("Ошибка регистрации:", error);
      toast.error(error?.message || "Ошибка при создании аккаунта");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для входа через Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await googleLogin(isDM);
      toast.success("Вход выполнен успешно!");
      navigate(redirectTo);
    } catch (error: any) {
      console.error("Ошибка входа:", error);
      toast.error(error?.message || "Не удалось выполнить вход");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen p-6 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="max-w-md mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Назад
        </Button>
        
        <div className="text-center mb-6">
          <ThemeSelector />
        </div>
        
        <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              D&D 5e - Вход в систему
            </CardTitle>
            <CardDescription>
              Войдите или создайте новый аккаунт
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              
              {/* Таб входа */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="dm-login"
                      checked={isDM}
                      onChange={(e) => setIsDM(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="dm-login" className="flex items-center gap-1">
                      <Shield className="size-4" />
                      Войти как Мастер
                    </Label>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Загрузка..." : "Войти"}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted-foreground/30"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">
                        или войти через
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </form>
              </TabsContent>
              
              {/* Таб регистрации */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input 
                      id="username" 
                      placeholder="Ваше имя" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input 
                      id="email-register" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Пароль</Label>
                    <Input 
                      id="password-register" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="dm-register"
                      checked={isDM}
                      onChange={(e) => setIsDM(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="dm-register" className="flex items-center gap-1">
                      <Shield className="size-4" />
                      Регистрация как Мастер
                    </Label>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Загрузка..." : "Зарегистрироваться"}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted-foreground/30"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">
                        или зарегистрироваться через
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <p>D&D 5e Character Sheet © 2025</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
