
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import RegistrationForm from "@/components/auth/RegistrationForm";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  
  // Получаем адрес перенаправления из query параметров
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  // Если пользователь уже аутентифицирован, перенаправляем его
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);
  
  return (
    <div className={`min-h-screen p-6 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="max-w-md mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Назад
        </Button>
        
        <div className="text-center mb-6">
          <ThemeSelector />
        </div>
        
        <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm redirectTo={redirectTo} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegistrationForm redirectTo={redirectTo} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
