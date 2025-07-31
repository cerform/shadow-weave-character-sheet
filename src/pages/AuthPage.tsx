import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SupabaseAuthForm from '@/components/auth/SupabaseAuthForm';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  // Если пользователь уже авторизован, перенаправляем его
  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Показываем загрузку если пользователь авторизован
  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </BackgroundWrapper>
    );
  }

  // Если пользователь авторизован, показываем загрузку
  if (isAuthenticated) {
    return (
      <BackgroundWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </BackgroundWrapper>
    );
  }

  const handleAuthSuccess = () => {
    navigate('/', { replace: true });
  };

  return (
    <BackgroundWrapper>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Button>
          
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
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
    </BackgroundWrapper>
  );
};

export default AuthPage;