
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';
import { socketService, GameSession } from '@/services/socket';
import { Users, Play, Loader2 } from 'lucide-react';

interface JoinSessionPanelProps {
  onSessionJoined?: (session: GameSession) => void;
}

const JoinSessionPanel: React.FC<JoinSessionPanelProps> = ({ onSessionJoined }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { character } = useCharacter();
  const { toast } = useToast();

  React.useEffect(() => {
    const initConnection = async () => {
      try {
        const connected = await socketService.connect();
        setIsConnected(connected);
        if (connected) {
          socketService.startHeartbeat();
        }
      } catch (error) {
        console.error('Ошибка подключения:', error);
      }
    };

    initConnection();
  }, []);

  const handleJoinSession = async () => {
    if (!sessionCode.trim() || !playerName.trim()) {
      toast({
        title: "Заполните все поля",
        description: "Введите код сессии и ваше имя",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsJoining(true);
      console.log('🎮 Присоединение к сессии:', sessionCode, 'как:', playerName);
      
      const session = await socketService.joinSession(
        sessionCode.toUpperCase(),
        playerName,
        character || undefined
      );
      
      toast({
        title: "🎉 Успешно присоединились!",
        description: `Добро пожаловать в сессию "${session.name}"`,
      });

      onSessionJoined?.(session);
      
    } catch (error) {
      console.error('❌ Ошибка присоединения:', error);
      toast({
        title: "Ошибка присоединения",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Users className="h-8 w-8 text-blue-500" />
            Присоединиться к игре
          </CardTitle>
          <p className="text-muted-foreground">Введите код сессии для подключения</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="session-code">Код сессии</Label>
            <Input
              id="session-code"
              placeholder="Например: ABC123"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Код сессии можно получить у Мастера игры
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-name">Ваше имя</Label>
            <Input
              id="player-name"
              placeholder="Введите ваше имя игрока"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
            />
          </div>

          {character && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-2">🧙 Ваш персонаж:</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{character.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {character.race} {character.class}, Уровень {character.level}
                    </p>
                  </div>
                  <Badge variant="outline">Готов к игре</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={handleJoinSession} 
            className="w-full h-12 text-lg"
            disabled={!isConnected || isJoining || !sessionCode.trim() || !playerName.trim()}
          >
            {isJoining ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Подключение...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                {isConnected ? 'Присоединиться к игре' : 'Подключение к серверу...'}
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              ⏳ Устанавливается соединение с игровым сервером...
            </p>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Еще нет персонажа? <a href="/character" className="text-primary hover:underline">Создать персонажа</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinSessionPanel;
