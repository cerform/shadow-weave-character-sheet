
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import { useTheme } from '@/hooks/use-theme';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = location.state?.returnPath || '/';

  return (
    <div className="min-h-screen p-6 bg-black/60">
      <div className="container mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="mb-8 bg-black/60 border-white/20 text-white hover:bg-black/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Button>
        
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-white">
            Аутентификация
          </h1>
          
          <p className="text-gray-300 mb-8 text-center">
            Войдите или зарегистрируйтесь, чтобы сохранять своих персонажей в облаке и иметь к ним доступ с любого устройства
          </p>
          
          <div className="w-full bg-black/80 p-8 rounded-lg shadow-xl border border-white/10">
            <AuthForm redirectTo={returnPath} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
