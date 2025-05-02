
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  console.log("NotFound page rendering");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md text-center space-y-8 bg-card/50 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-primary/20">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Страница не найдена</h2>
        <p className="text-muted-foreground">Извините, запрашиваемая страница не существует</p>
        
        <Button onClick={() => navigate('/')} className="flex items-center gap-2">
          <Home className="size-4" />
          На главную
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
