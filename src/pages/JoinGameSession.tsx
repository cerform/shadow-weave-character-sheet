
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';

const JoinGameSession: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Если код сессии передан в URL, подставляем его автоматически
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setSessionCode(codeFromUrl);
    }
    
    // Пробуем получить имя игрока из localStorage
    const savedName = localStorage.getItem('player-name');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, [searchParams]);
  
  const joinSession = () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код сессии",
        variant: "destructive"
      });
      return;
    }
    
    if (!playerName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ваше имя",
        variant: "destructive"
      });
      return;
    }
    
    setIsJoining(true);
    
    // Сохраняем имя игрока в localStorage
    localStorage.setItem('player-name', playerName);
    
    // В реальном приложении здесь был бы запрос к серверу
    setTimeout(() => {
      // Симулируем результат проверки сессии
      const sessionExists = sessionCode.length >= 4; // Просто для демонстрации
      
      if (sessionExists) {
        toast({
          title: "Успешно",
          description: "Вы присоединились к игровой сессии."
        });
        
        // Перенаправляем на страницу сессии
        navigate(`/session/${sessionCode}`);
      } else {
        toast({
          title: "Ошибка",
          description: "Сессия с указанным кодом не найдена.",
          variant: "destructive"
        });
        setIsJoining(false);
      }
    }, 1000);
  };
  
  return (
    <MobileOptimizedLayout title="Присоединиться к игре">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Присоединиться к игровой сессии</CardTitle>
            <CardDescription>
              Введите код сессии, полученный от Мастера Игры, и ваше имя или никнейм.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-code">Код сессии</Label>
              <Input
                id="session-code"
                placeholder="Например: AB12CD"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="player-name">Ваше имя или никнейм</Label>
              <Input
                id="player-name"
                placeholder="Как вас будут видеть другие игроки"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            
            <Button
              onClick={joinSession}
              disabled={isJoining}
              className="w-full"
            >
              {isJoining ? "Подключение..." : "Присоединиться к сессии"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileOptimizedLayout>
  );
};

export default JoinGameSession;
