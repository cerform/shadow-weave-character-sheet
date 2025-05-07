
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Characters } from '@/types/character';
import { getSessionByCode, joinSession } from '@/services/sessionService';
import { socketService } from '@/services/socket';

interface JoinSessionFormProps {
  characters: Characters[];
  isLoading?: boolean;
}

const JoinSessionForm: React.FC<JoinSessionFormProps> = ({ characters, isLoading }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите код сессии',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedCharacterId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите персонажа',
        variant: 'destructive',
      });
      return;
    }
    
    setIsJoining(true);
    
    try {
      // Проверяем существование сессии
      const session = await getSessionByCode(sessionCode);
      
      if (!session) {
        toast({
          title: 'Ошибка',
          description: 'Сессия с указанным кодом не найдена или неактивна',
          variant: 'destructive',
        });
        setIsJoining(false);
        return;
      }
      
      // Присоединяемся к сессии
      const joined = await joinSession(
        session.id, 
        selectedCharacterId, 
        playerName || characters.find(c => c.id === selectedCharacterId)?.name
      );
      
      if (joined) {
        // Подключаем WebSocket
        socketService.connect(
          sessionCode,
          playerName || characters.find(c => c.id === selectedCharacterId)?.name || 'Игрок',
          selectedCharacterId
        );
        
        toast({
          title: 'Успешно',
          description: 'Вы присоединились к игровой сессии',
        });
        
        // Переходим на страницу сессии
        navigate(`/game-session/${session.id}`);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось присоединиться к сессии',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Ошибка при присоединении к сессии:', error);
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при присоединении к сессии',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Присоединиться к игровой сессии</CardTitle>
        <CardDescription>
          Введите код сессии и выберите персонажа для игры
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-code">Код сессии</Label>
            <Input
              id="session-code"
              placeholder="Введите код сессии"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="uppercase"
              disabled={isJoining}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="character">Персонаж</Label>
            <Select
              value={selectedCharacterId}
              onValueChange={setSelectedCharacterId}
              disabled={isJoining || isLoading || characters.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите персонажа" />
              </SelectTrigger>
              <SelectContent>
                {characters.map((char) => (
                  <SelectItem key={char.id} value={char.id}>
                    {char.name} ({char.race} {char.class}, уровень {char.level})
                  </SelectItem>
                ))}
                {characters.length === 0 && (
                  <SelectItem value="no-characters" disabled>
                    У вас нет персонажей
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="player-name">
              Имя игрока (опционально)
            </Label>
            <Input
              id="player-name"
              placeholder="Ваше имя в игре"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isJoining}
            />
            <p className="text-sm text-muted-foreground">
              Оставьте пустым, чтобы использовать имя персонажа
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isJoining || !sessionCode || !selectedCharacterId}
            loading={isJoining}
          >
            {isJoining ? 'Подключение...' : 'Присоединиться к сессии'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/characters')}>
          Создать персонажа
        </Button>
        <Button variant="ghost" onClick={() => navigate('/player')}>
          Вернуться
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JoinSessionForm;
