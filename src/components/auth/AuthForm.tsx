import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';
import { Loader2, LogIn, Lock, Mail, User, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  redirectTo?: string;
}

const AuthForm = ({ redirectTo = '/' }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Получаем текущий домен для отображения в сообщении об ошибке
    setCurrentDomain(window.location.origin);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Пожалуйста, введите email и пароль');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      toast.success('Вход выполнен успешно');
      navigate(redirectTo);
    } catch (error: any) {
      toast.error(`Ошибка входа: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Пожалуйста, введите email и пароль');
      return;
    }
    
    try {
      setLoading(true);
      await register(email, password, name);
      toast.success('Регистрация успешна');
      navigate(redirectTo);
    } catch (error: any) {
      toast.error(`Ошибка регистрации: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setGoogleAuthError(false);
      await googleLogin(false);
      toast.success('Вход с Google выполнен успешно');
      navigate(redirectTo);
    } catch (error: any) {
      console.error("Ошибка при входе через Google:", error);
      
      // Проверяем наличие ошибки неавторизованного домена
      if (error.code === 'auth/unauthorized-domain') {
        setGoogleAuthError(true);
        toast.error('Ошибка: Текущий домен не авторизован в консоли Firebase');
      } else {
        toast.error(`Ошибка входа через Google: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Аутентификация</CardTitle>
        <CardDescription>
          Войдите или создайте новый аккаунт для сохранения персонажей
        </CardDescription>
      </CardHeader>
      <CardContent>
        {googleAuthError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="mb-2">Домен <strong>{currentDomain}</strong> не авторизован в Firebase.</p>
              <p>Для использования входа через Google вам необходимо:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Войти в <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center">консоль Firebase <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Открыть проект "shadow-char"</li>
                <li>Перейти в Authentication &gt; Settings &gt; Authorized domains</li>
                <li>Добавить домен: <strong>{currentDomain}</strong></li>
              </ol>
              <p className="mt-2">Пока используйте вход по email.</p>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вход</TabsTrigger>
            <TabsTrigger value="register">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Войти
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Зарегистрироваться
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="relative w-full my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Или</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleGoogleLogin} 
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Войти через Google
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
