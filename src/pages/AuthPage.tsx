
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FirebaseAuthForm from '@/components/auth/FirebaseAuthForm';
import { useTheme } from '@/hooks/use-theme';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const AuthPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser } = useAuth();
  const returnPath = location.state?.returnPath || '/';

  // Если пользователь уже авторизован, перенаправляем его на главную
  useEffect(() => {
    console.log("AuthPage - Auth state:", { isAuthenticated, currentUser });
    if (isAuthenticated && currentUser) {
      console.log("User is already authenticated, redirecting to home");
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <div className={`min-h-screen p-6 flex flex-col justify-center items-center bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="container max-w-md mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Button>
        
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Аутентификация
          </h1>
          
          <p className="text-muted-foreground mb-6 text-center">
            Войдите или зарегистрируйтесь, чтобы сохранять своих персонажей в облаке и иметь к ним доступ с любого устройства
          </p>
          
          <FirebaseAuthForm />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
