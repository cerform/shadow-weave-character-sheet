
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import { ArrowLeft } from 'lucide-react';

const JoinSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { setCharacter } = useCharacter();
  const { toast } = useToast();
  const { connect, isConnected, sessionData } = useSocket();
  
  useEffect(() => {
    // Загружаем имя игрока из localStorage, если оно есть
    const savedPlayerName = localStorage.getItem('player-name');
    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
    }
  }, []);
  
  useEffect(() => {
    if (isConnected && sessionData) {
      setIsConnecting(false);
      toast({
        title: "Успешно!",
        description: `Вы подключились к сессии ${sessionData.name}`,
      });
      navigate('/character-sheet');
    }
  }, [isConnected, sessionData, navigate, toast]);
  
  const handleJoinSession = () => {
    if (!sessionCode || !playerName) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите код сессии и имя игрока.",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    
    // Сохраняем имя игрока в localStorage
    localStorage.setItem('player-name', playerName);
    
    // Retrieve character ID from localStorage
    const lastSelectedCharacterId = localStorage.getItem('last-selected-character');
    
    try {
      connect(sessionCode, playerName, lastSelectedCharacterId);
      
      // Store session info in localStorage
      localStorage.setItem('active-session', JSON.stringify({
        sessionCode,
        playerName,
        characterId: lastSelectedCharacterId
      }));
    } catch (error) {
      console.error("Ошибка при подключении:", error);
      setIsConnecting(false);
      toast({
        title: "Ошибка подключения",
        description: "Не удалось подключиться к сессии. Проверьте код сессии и попробуйте снова.",
        variant: "destructive",
      });
    }
  };
  
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Присоединиться к сессии</CardTitle>
          <CardDescription>Введите код сессии и имя игрока, чтобы присоединиться к игре.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sessionCode">Код сессии</Label>
            <Input
              type="text"
              id="sessionCode"
              placeholder="XXXXXX"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="playerName">Имя игрока</Label>
            <Input
              type="text"
              id="playerName"
              placeholder="Ваше имя"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Button 
            onClick={handleJoinSession} 
            disabled={isConnecting}
          >
            {isConnecting ? "Подключение..." : "Присоединиться"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinSessionPage;
