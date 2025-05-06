
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { createSession } from '@/services/sessionService';
import { Copy } from 'lucide-react';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';

const CreateSessionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [sessionLink, setSessionLink] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);

  const handleCreateSession = async () => {
    if (!name.trim()) {
      toast.error('Пожалуйста, введите название сессии');
      return;
    }

    if (!user) {
      toast.error('Необходимо авторизоваться');
      navigate('/auth', { state: { returnPath: '/create-session' } });
      return;
    }

    try {
      setIsCreating(true);
      const session = await createSession(name, user.uid);
      setSessionKey(session.sessionKey);
      
      // Создаем ссылку для приглашения
      const url = `${window.location.origin}/join/${session.id}?key=${session.sessionKey}`;
      setSessionLink(url);
      
      toast.success('Сессия успешно создана!');
      
      // Перенаправляем на страницу сессии мастера
      navigate(`/dm-session/${session.id}`);
    } catch (error) {
      console.error('Ошибка при создании сессии:', error);
      toast.error('Не удалось создать сессию');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Скопировано в буфер обмена');
      },
      (err) => {
        console.error('Не удалось скопировать: ', err);
        toast.error('Не удалось скопировать');
      }
    );
  };

  return (
    <OBSLayout
      topPanelContent={
        <div className="flex justify-between items-center p-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
          >
            На главную
          </Button>
          
          <h1 className="text-xl font-bold">
            Создание игровой сессии
          </h1>
          
          <IconOnlyNavigation includeThemeSelector />
        </div>
      }
    >
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="bg-black/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Создать новую сессию</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="session-name" className="block text-sm font-medium">
                Название сессии
              </label>
              <Input
                id="session-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите название сессии"
                className="w-full"
              />
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleCreateSession} 
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? 'Создание...' : 'Создать сессию'}
              </Button>
            </div>

            {sessionLink && sessionKey && (
              <div className="mt-6 space-y-4 p-4 border rounded-md">
                <div>
                  <h3 className="font-medium mb-2">Код сессии:</h3>
                  <div className="flex gap-2">
                    <div className="bg-black/20 px-4 py-2 rounded font-mono flex-1 flex items-center justify-center text-xl">
                      {sessionKey}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => copyToClipboard(sessionKey)}
                      title="Копировать код"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Ссылка для приглашения:</h3>
                  <div className="flex gap-2">
                    <div className="bg-black/20 px-4 py-2 rounded font-mono text-xs flex-1 overflow-x-auto whitespace-nowrap">
                      {sessionLink}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => copyToClipboard(sessionLink)}
                      title="Копировать ссылку"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OBSLayout>
  );
};

export default CreateSessionPage;
