import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SupabaseAuthForm from '@/components/auth/SupabaseAuthForm';


const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading } = useAuth();
  const isCallback = searchParams.get('callback') === 'true';
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  console.log('🔍 AuthPage: рендер с состоянием:', { user: !!user, isAuthenticated, loading, isCallback, redirectAttempted });

  // Объединенная логика редиректа для всех случаев
  useEffect(() => {
    // Если уже пытались сделать редирект, не пытаемся снова
    if (redirectAttempted) {
      console.log('⏭️ AuthPage: редирект уже выполнен, пропуск');
      return;
    }

    // Условие для редиректа: пользователь авторизован и загрузка завершена
    const shouldRedirect = isAuthenticated && user && !loading;

    if (shouldRedirect) {
      console.log('🚀 AuthPage: выполняем редирект на главную страницу', {
        isAuthenticated,
        hasUser: !!user,
        loading,
        isCallback
      });
      
      setRedirectAttempted(true);
      
      // Увеличенная задержка для OAuth callback чтобы Supabase успел сохранить сессию
      const delay = isCallback ? 1000 : 300;
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, delay);
    } else if (isCallback) {
      console.log('⏳ AuthPage: OAuth callback в процессе, ожидание...', { 
        isAuthenticated, 
        user: !!user, 
        loading 
      });
    }
  }, [isAuthenticated, user, loading, isCallback, navigate, redirectAttempted]);

  // Показываем загрузку если пользователь авторизован
  if (loading) {
    console.log('⏳ AuthPage: показываем загрузку (loading=true)');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Если пользователь авторизован, показываем загрузку
  if (isAuthenticated) {
    console.log('🔄 AuthPage: показываем загрузку (isAuthenticated=true)');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  console.log('📝 AuthPage: показываем форму аутентификации');

  const handleAuthSuccess = () => {
    console.log('✅ AuthPage: успешная аутентификация, перенаправление');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="mb-4 bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Button>
        
        <Card className="bg-card/90 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Добро пожаловать</CardTitle>
            <CardDescription className="text-muted-foreground">
              Войдите или создайте аккаунт для доступа к своим персонажам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupabaseAuthForm onSuccess={handleAuthSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;