
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import FirebaseAuthForm from '@/components/auth/FirebaseAuthForm';
import { useTheme } from '@/hooks/use-theme';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = location.state?.returnPath || '/';
  const [authType, setAuthType] = useState<'standard' | 'firebase'>('standard');

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
          
          <Tabs value={authType} onValueChange={(value) => setAuthType(value as 'standard' | 'firebase')} className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Стандартная форма</TabsTrigger>
              <TabsTrigger value="firebase">Упрощенная форма</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard">
              <AuthForm redirectTo={returnPath} />
            </TabsContent>
            
            <TabsContent value="firebase">
              <FirebaseAuthForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
