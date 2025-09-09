import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Crown } from 'lucide-react';

// Google icon as SVG component
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

interface SupabaseAuthFormProps {
  onSuccess?: () => void;
}

const SupabaseAuthForm: React.FC<SupabaseAuthFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isDM, setIsDM] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔄 Attempting to sign up with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: displayName,
            is_dm: isDM,
          }
        }
      });

      console.log('✅ Sign up response:', { data, error });

      if (error) {
        console.error('❌ Sign up error:', error);
        throw error;
      }

      if (data?.user) {
        toast({
          title: "Регистрация успешна!",
          description: data.user.email_confirmed_at 
            ? "Добро пожаловать в мир D&D!" 
            : "Проверьте email для подтверждения аккаунта",
        });
        
        // Только если email подтвержден, вызываем onSuccess
        if (data.user.email_confirmed_at || data.user.aud === 'authenticated') {
          onSuccess?.();
        }
      }
    } catch (error: any) {
      console.error('❌ Sign up catch error:', error);
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Произошла неизвестная ошибка",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔄 Attempting to sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('✅ Sign in response:', { data, error });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      if (data?.user) {
        toast({
          title: "Вход выполнен!",
          description: "Добро пожаловать обратно!",
        });
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('❌ Sign in catch error:', error);
      toast({
        title: "Ошибка входа",
        description: error.message || "Произошла неизвестная ошибка",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        throw error;
      }

      if (data?.user) {
        toast({
          title: "Анонимный вход выполнен!",
          description: "Вы можете сразу создавать персонажей",
        });
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Ошибка анонимного входа",
        description: error.message || "Произошла неизвестная ошибка",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Начинаем Google авторизацию через GIS');
      
      // Проверяем, загружен ли Google Identity Services
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services не загружен. Обновите страницу и попробуйте снова.');
      }

      // Google Client ID из переменных окружения
      const googleClientId = '1088648113433-l5tfq9sn8vvf93nj6rp3dft6vha90tmi.apps.googleusercontent.com';
      
      const codeClient = window.google.accounts.oauth2.initCodeClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: async (response: { code: string; error?: string }) => {
          if (response.error) {
            console.error('❌ Google auth error:', response.error);
            toast({
              title: "Ошибка входа через Google",
              description: response.error,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }

          try {
            console.log('🔄 Получили код от Google, отправляем на сервер');
            
            // Отправляем код на edge function
            const result = await supabase.functions.invoke('google-auth', {
              body: { code: response.code },
            });

            if (result.error) {
              throw new Error(result.error.message || 'Ошибка авторизации');
            }

            console.log('✅ Успешная авторизация через Google');

            // Перезагружаем страницу для обновления сессии
            toast({
              title: "Вход выполнен!",
              description: "Добро пожаловать!",
            });
            
            // Небольшая задержка перед перенаправлением
            setTimeout(() => {
              onSuccess?.();
            }, 1000);
            
          } catch (error) {
            console.error('❌ Ошибка обмена кода:', error);
            toast({
              title: "Ошибка входа через Google",
              description: error instanceof Error ? error.message : 'Произошла ошибка',
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
      });

      // Запускаем авторизацию
      codeClient.requestCode();
      
    } catch (error: any) {
      console.error('❌ Google auth initialization error:', error);
      toast({
        title: "Ошибка входа через Google",
        description: error.message || "Произошла неизвестная ошибка",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Вход</TabsTrigger>
          <TabsTrigger value="signup">Регистрация</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin" className="space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signin-password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="signup" className="space-y-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Имя (необязательно)</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Ваше имя"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dm-role"
                checked={isDM}
                onCheckedChange={(checked) => setIsDM(checked as boolean)}
              />
              <Label htmlFor="dm-role" className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-amber-500" />
                Я хочу быть Мастером Подземелий (DM)
              </Label>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Зарегистрироваться
            </Button>
          </form>
        </TabsContent>
      </Tabs>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">или</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full mb-2" 
        onClick={handleGoogleSignIn}
        disabled={loading}
        type="button"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && <GoogleIcon />}
        <span className="ml-2">Войти через Google</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleAnonymousSignIn}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Войти анонимно
      </Button>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Анонимный вход позволяет сразу начать создание персонажей.<br />
        Ваши персонажи будут сохранены только до очистки браузера.
      </p>
    </div>
  );
};

export default SupabaseAuthForm;