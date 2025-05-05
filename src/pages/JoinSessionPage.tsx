
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
  const { setCharacter } = useCharacter();
  const { toast } = useToast();
  const { connect, isConnected, sessionData } = useSocket();
  
  useEffect(() => {
    if (isConnected && sessionData) {
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
    
    // Retrieve character ID from localStorage
    const lastSelectedCharacterId = localStorage.getItem('last-selected-character');
    
    connect(sessionCode, playerName, lastSelectedCharacterId);
    
    // Store session info in localStorage
    localStorage.setItem('active-session', JSON.stringify({
      sessionCode,
      playerName,
      characterId: lastSelectedCharacterId
    }));
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
          <Button onClick={handleJoinSession}>Присоединиться</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinSessionPage;
