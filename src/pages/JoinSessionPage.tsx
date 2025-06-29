
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import PlayerSessionClient from '@/components/session/PlayerSessionClient';

const JoinSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const { toast } = useToast();
  
  const handleJoinSession = () => {
    if (!sessionCode || !playerName) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите код сессии и имя игрока.",
        variant: "destructive",
      });
      return;
    }
    
    setIsJoined(true);
  };
  
  const handleLeaveSession = () => {
    setIsJoined(false);
    setSessionCode('');
    setPlayerName('');
  };

  if (isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="max-w-7xl mx-auto">
          <PlayerSessionClient 
            roomCode={sessionCode}
            playerName={playerName}
            onLeave={handleLeaveSession}
          />
        </div>
      </div>
    );
  }

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
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
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
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Button onClick={handleJoinSession}>
            Присоединиться
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinSessionPage;
