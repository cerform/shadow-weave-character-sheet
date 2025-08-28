import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SupabaseAuthForm from '@/components/auth/SupabaseAuthForm';


const AuthPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  console.log('🔍 AuthPage: рендер с состоянием:', { user: !!user, isAuthenticated, loading });

  // Если пользователь уже авторизован, перенаправляем его
  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      console.log('🚀 AuthPage: перенаправление на главную - пользователь авторизован');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

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