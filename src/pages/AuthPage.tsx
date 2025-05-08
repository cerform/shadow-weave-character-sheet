
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" />
        На главную
      </Button>
      
      <div className="bg-card p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-4">Авторизация</h1>
        <p className="text-muted-foreground">Страница авторизации в разработке</p>
        <div className="space-x-4 mt-4">
          <Button onClick={() => navigate('/')}>Демо-вход</Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
