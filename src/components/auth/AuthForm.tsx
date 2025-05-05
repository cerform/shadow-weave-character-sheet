
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface AuthFormProps {
  redirectTo?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ redirectTo = '/' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isDM, setIsDM] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Вход выполнен",
        description: "Вы успешно вошли в систему"
      });
      navigate(redirectTo);
    } catch (error: any) {
      console.error("Ошибка при входе:", error);
      toast({
        title: "Ошибка входа",
        description: error.message || "Не удалось войти в систему",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите имя пользователя",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await register(email, password, displayName, isDM);
      toast({
        title: "Регистрация выполнена",
        description: "Вы успешно зарегистрировались"
      });
      navigate(redirectTo);
    } catch (error: any) {
      console.error("Ошибка при регистрации:", error);
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Не удалось зарегистрироваться",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      console.log("Начинаем вход через Google");
      const result = await googleLogin();
      console.log("Результат входа через Google:", result);
      
      // Проверяем результат как объект, а не булево значение
      if (result !== null) {
        toast({
          title: "Вход выполнен",
          description: "Вы успешно вошли через Google"
        });
        navigate(redirectTo);
      }
    } catch (error: any) {
      console.error("Ошибка при входе через Google:", error);
      toast({
        title: "Ошибка входа",
        description: error.message || "Не удалось войти через Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-primary/20 bg-black/60 backdrop-blur-md">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Вход</TabsTrigger>
          <TabsTrigger value="register">Регистрация</TabsTrigger>
        </TabsList>
        
        {/* Вкладка входа */}
        <TabsContent value="login" className="space-y-4">
          <CardHeader>
            <CardTitle>Вход в аккаунт</CardTitle>
            <CardDescription>
              Войдите, чтобы получить доступ к своему профилю и персонажам
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
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
                  <a href="#" className="text-xs text-primary hover:underline">
                    Забыли пароль?
                  </a>
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
              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={isLoading}
                style={{
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.buttonText || '#FFFFFF'
                }}
              >
                <LogIn className="h-4 w-4" />
                {isLoading ? "Выполняется вход..." : "Войти"}
              </Button>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или войти через
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
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
              Войти с Google
            </Button>
          </CardContent>
        </TabsContent>
        
        {/* Вкладка регистрации */}
        <TabsContent value="register" className="space-y-4">
          <CardHeader>
            <CardTitle>Создание аккаунта</CardTitle>
            <CardDescription>
              Зарегистрируйтесь, чтобы создавать персонажей и присоединяться к игровым сессиям
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Имя пользователя</Label>
                <Input 
                  id="displayName" 
                  type="text" 
                  placeholder="GandalfTheGrey" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input 
                  id="register-email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <Input 
                  id="register-password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is-dm" 
                  checked={isDM}
                  onCheckedChange={setIsDM}
                />
                <Label htmlFor="is-dm">Я буду Мастером Подземелий</Label>
              </div>
              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={isLoading}
                style={{
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.buttonText || '#FFFFFF'
                }}
              >
                <UserPlus className="h-4 w-4" />
                {isLoading ? "Регистрация..." : "Зарегистрироваться"}
              </Button>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или зарегистрироваться через
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
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
              Регистрация с Google
            </Button>
          </CardContent>
        </TabsContent>
        
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <p className="px-8 text-center text-sm text-muted-foreground">
            Регистрируясь, вы соглашаетесь с нашими{" "}
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
      </Tabs>
    </Card>
  );
};

export default AuthForm;
