
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const DMDashboardPage = () => {
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
        <h1 className="text-2xl font-bold mb-4">Панель Мастера Подземелий</h1>
        <p className="text-muted-foreground">Страница в разработке</p>
      </div>
    </div>
  );
};

export default DMDashboardPage;
