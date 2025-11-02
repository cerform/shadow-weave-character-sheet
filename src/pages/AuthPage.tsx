import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SupabaseAuthForm from '@/components/auth/SupabaseAuthForm';


const AuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  console.log('🔍 AuthPage: рендер', { isAuthenticated, loading });

  // Простой редирект: загрузка завершена + авторизован = на главную
  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      console.log('✅ Пользователь авторизован, редирект на главную');
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Пока идет загрузка - показываем спиннер
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Если авторизован - ничего не показываем (идет редирект)
  if (isAuthenticated) {
    return null;
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