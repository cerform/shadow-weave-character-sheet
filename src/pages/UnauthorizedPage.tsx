
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
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
    <BackgroundWrapper>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-black/50 backdrop-blur-sm border-red-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-500/20 p-3 rounded-full mb-4">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Доступ запрещен</CardTitle>
            <CardDescription>
              У вас нет прав для доступа к запрошенной странице
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              {isAuthenticated 
                ? "Ваша учетная запись не имеет необходимых прав для просмотра этой страницы. Возможно, вам нужно войти с другой учетной записью."
                : "Вам необходимо войти в систему для доступа к этой странице."}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              className="w-full" 
              onClick={handleRedirect}
            >
              {isAuthenticated ? "Перейти в доступный раздел" : "Войти в систему"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> На главную
            </Button>
          </CardFooter>
        </Card>
      </div>
    </BackgroundWrapper>
  );
};

export default UnauthorizedPage;
