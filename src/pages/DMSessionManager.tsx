
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2 } from 'lucide-react';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';

const generateRandomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const DMSessionManager: React.FC = () => {
  const { toast } = useToast();
  const [sessionName, setSessionName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const createSession = () => {
    setIsCreating(true);
    
    try {
      // Генерируем случайный код сессии
      const code = generateRandomCode();
      setSessionCode(code);
      
      // В реальном приложении здесь был бы запрос к серверу
      setTimeout(() => {
        toast({
          title: "Сессия создана",
          description: `Сессия "${sessionName || 'Новая игра'}" успешно создана.`
        });
        setIsCreating(false);
      }, 1000);
    } catch (error) {
      console.error('Ошибка при создании сессии:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать сессию. Попробуйте еще раз.",
        variant: "destructive"
      });
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Скопировано",
          description: "Код сессии скопирован в буфер обмена."
        });
      },
      (err) => {
        console.error('Не удалось скопировать: ', err);
      }
    );
  };

  const shareSession = () => {
    if (navigator.share) {
      navigator.share({
        title: `Игровая сессия D&D: ${sessionName || 'Новая игра'}`,
        text: `Присоединяйтесь к моей сессии D&D! Код для входа: ${sessionCode}`,
        url: `${window.location.origin}/join-game?code=${sessionCode}`,
      })
      .catch((error) => console.error('Ошибка при шеринге:', error));
    } else {
      copyToClipboard(`${window.location.origin}/join-game?code=${sessionCode}`);
    }
  };

  return (
    <MobileOptimizedLayout title="Создание игровой сессии">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Создать новую игровую сессию</CardTitle>
            <CardDescription>
              Создайте игровую сессию для ваших игроков. Они смогут присоединиться к ней с помощью кода доступа.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Название сессии</Label>
              <Input
                id="session-name"
                placeholder="Например: Приключение в Забытых Королевствах"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </div>
            
            <Button
              onClick={createSession}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? "Создание..." : "Создать сессию"}
            </Button>
            
            {sessionCode && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Код для подключения:</p>
                  <p className="text-2xl font-bold tracking-wider">{sessionCode}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => copyToClipboard(sessionCode)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Копировать код
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={shareSession}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Поделиться
                  </Button>
                </div>
                
                <Button 
                  variant="default" 
                  className="w-full"
                  // В реальном приложении здесь был бы переход к сессии
                  onClick={() => {
                    window.location.href = `/dm-session/${sessionCode}`;
                  }}
                >
                  Начать игровую сессию
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileOptimizedLayout>
  );
};

export default DMSessionManager;
