
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  // Автоматический редирект если пользователь авторизован с правами admin
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Проверяем роли через user_roles
      const checkAdminAccess = async () => {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUser.uid);
        
        if (data?.some(r => r.role === 'admin')) {
          console.log('🔄 Редирект admin с /unauthorized на /admin');
          navigate('/admin', { replace: true });
        } else if (data?.some(r => r.role === 'dm')) {
          console.log('🔄 Редирект DM с /unauthorized на /dm');
          navigate('/dm', { replace: true });
        }
      };
      
      checkAdminAccess();
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  const handleRedirect = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Перенаправляем в соответствии с ролью
    if (currentUser?.role === 'dm' || currentUser?.isDM) {
      navigate('/dm');
    } else {
      navigate('/player');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-black/50 backdrop-blur-sm border-red-500/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-400">
            Доступ запрещен
          </CardTitle>
          <CardDescription className="text-gray-300">
            У вас недостаточно прав для доступа к этой странице
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-400 mb-4">
            Эта страница доступна только администраторам или пользователям с соответствующими правами.
          </p>
          {!currentUser && (
            <p className="text-sm text-gray-500">
              Попробуйте войти в систему с правильными учетными данными.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          {!currentUser && (
            <Button 
              onClick={() => navigate('/auth')}
              className="flex-1"
            >
              Войти
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
