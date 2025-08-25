
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCharacter } from '@/contexts/CharacterContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sessionService } from '@/services/sessionService';
import { useToast } from '@/hooks/use-toast';

const JoinSessionPage: React.FC = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { characters } = useCharacter();

  const handleJoinSession = async () => {
    if (!sessionCode.trim() || !playerName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код сессии и имя игрока",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const sessionId = await sessionService.joinSession(
        sessionCode.trim().toUpperCase(),
        playerName.trim(),
        selectedCharacterId && selectedCharacterId !== 'no-character' ? selectedCharacterId : undefined
      );

      toast({
        title: "Успех!",
        description: "Вы успешно присоединились к сессии",
      });

      // Перенаправляем на страницу сессии игрока
      navigate(`/player-session/${sessionId}`);
    } catch (error: any) {
      toast({
        title: "Ошибка присоединения",
        description: error.message || "Не удалось присоединиться к сессии",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Присоединение к сессии</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionCode">Код сессии</Label>
              <Input
                id="sessionCode"
                type="text"
                placeholder="Введите код сессии..."
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="uppercase tracking-wider"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playerName">Имя игрока</Label>
              <Input
                id="playerName"
                type="text"
                placeholder="Ваше имя в игре..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            {characters.length > 0 && (
              <div className="space-y-2">
                <Label>Персонаж (необязательно)</Label>
                <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите персонажа" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-character">Без персонажа</SelectItem>
                    {characters.map((character) => (
                      <SelectItem key={character.id} value={character.id}>
                        {character.name} ({character.class} {character.level} уровня)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              onClick={handleJoinSession} 
              disabled={isJoining || !sessionCode.trim() || !playerName.trim()}
              className="w-full"
            >
              {isJoining ? 'Присоединение...' : 'Присоединиться к сессии'}
            </Button>

            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-muted-foreground"
              >
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinSessionPage;
