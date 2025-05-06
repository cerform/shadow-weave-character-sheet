
import React from 'react';
import FirebaseDebugger from '@/components/debug/FirebaseDebugger';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const DebugPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ChevronLeft size={16} className="mr-1" /> Назад
        </Button>
        <h1 className="text-2xl font-bold">Отладка Firebase</h1>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <FirebaseDebugger />
        
        <div className="bg-black/70 rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Информация о проекте</h2>
          <p>Эта страница предназначена для тестирования и отладки подключения к Firebase.</p>
          <p className="mt-2">Используйте эту страницу для проверки:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Подключения к Firebase</li>
            <li>Прав доступа к коллекциям</li>
            <li>Наличия документов в коллекциях</li>
            <li>Текущего статуса авторизации</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
