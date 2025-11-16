
import React from 'react';
// import FirebaseDebugger from '@/components/debug/FirebaseDebugger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Database, ExternalLink } from 'lucide-react';

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* React Hooks Debug */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              React Hooks Debugger
            </CardTitle>
            <CardDescription>
              Автоматическое сканирование на нарушения Rules of Hooks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Детальный анализ проекта на соответствие React Rules of Hooks
              </p>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                <li>Поиск условных хуков</li>
                <li>Обнаружение хуков в циклах</li>
                <li>Проверка порядка вызова хуков</li>
                <li>Live мониторинг ошибок</li>
              </ul>
            </div>
            <Button 
              onClick={() => navigate('/debug/hooks')}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Открыть Hooks Debugger
            </Button>
          </CardContent>
        </Card>

        {/* Firebase Debug */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Firebase Database
            </CardTitle>
            <CardDescription>
              Информация о подключении к Firebase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <h3 className="font-bold mb-2 text-green-400">
                🔄 Realtime Database
              </h3>
              <p className="text-sm">Система успешно переключена на Firebase Realtime Database.</p>
              <p className="mt-2 text-xs">
                URL: <code className="bg-black/50 px-2 py-1 rounded">
                  https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app/
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Информация */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о проекте</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Эта страница предназначена для тестирования и отладки подключений.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Используйте эту страницу для проверки:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Соответствия React Rules of Hooks</li>
            <li>Подключения к Firebase</li>
            <li>Прав доступа к коллекциям</li>
            <li>Текущего статуса авторизации</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPage;
