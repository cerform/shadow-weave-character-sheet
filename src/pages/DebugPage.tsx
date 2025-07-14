
import React from 'react';
// import FirebaseDebugger from '@/components/debug/FirebaseDebugger';
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
        {/* <FirebaseDebugger /> */}
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">🔄 Миграция на Realtime Database</h2>
          <p>Система успешно переключена на Firebase Realtime Database.</p>
          <p className="mt-2">URL базы данных: <code className="bg-black/50 px-2 py-1 rounded">https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app/</code></p>
        </div>
        
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
