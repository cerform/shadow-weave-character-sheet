import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Тестовая страница</h1>
        <p className="mb-4">Эта страница нужна для проверки навигации.</p>
        <Button onClick={() => navigate('/')} className="mr-4">
          На главную
        </Button>
        <Button onClick={() => navigate('/dm-dashboard-new')} className="mr-4">
          DM Dashboard
        </Button>
        <Button onClick={() => navigate('/battle-map-fixed')}>
          Battle Map
        </Button>
      </div>
    </div>
  );
};

export default TestPage;