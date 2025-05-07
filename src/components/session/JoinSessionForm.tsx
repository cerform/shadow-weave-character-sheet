
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { joinSessionByCode } from '@/services/sessionService';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/services/socket';
import { Character } from '@/types/character';

interface JoinSessionFormProps {
  characters: Character[];
  isLoading: boolean;
}

const JoinSessionForm: React.FC<JoinSessionFormProps> = ({ characters, isLoading }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { connect } = useSocket();

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim()) {
      toast.error('Введите код сессии');
      return;
    }
    
    if (!selectedCharacterId) {
      toast.error('Выберите персонажа для присоединения к сессии');
      return;
    }
    
    if (!currentUser) {
      toast.error('Вы должны быть авторизованы для присоединения к сессии');
      return;
    }
    
    setIsJoining(true);
    
    try {
      // Получаем выбранного персонажа
      const character = characters.find(c => c.id === selectedCharacterId);
      
      if (!character) {
        throw new Error('Выбранный персонаж не найден');
      }
      
      // Присоединяемся к сессии
      const session = await joinSessionByCode(sessionCode, {
        userId: currentUser.uid,
        name: currentUser.displayName || 'Игрок',
        characterId: selectedCharacterId
      });
      
      // Подключаемся к WebSocket
      connect(sessionCode, character.name, selectedCharacterId);
      
      // Сохраняем информацию о сессии в localStorage
      localStorage.setItem('active-session', JSON.stringify({
        sessionId: session.id,
        sessionCode: session.code,
        characterId: selectedCharacterId
      }));
      
      toast.success(`Вы присоединились к сессии "${session.name}"`);
      
      // Переходим на страницу сессии
      navigate(`/game-session/${session.id}`);
    } catch (error) {
      console.error('Ошибка при присоединении к сессии:', error);
      toast.error('Не удалось присоединиться к сессии. Проверьте код и попробуйте снова.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Присоединиться к игровой сессии</CardTitle>
        <CardDescription>
          Введите код сессии и выберите персонажа
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoinSession} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-code">Код сессии</Label>
            <Input
              id="session-code"
              placeholder="Введите код сессии"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              disabled={isJoining}
              maxLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="character-select">Выберите персонажа</Label>
            {isLoading ? (
              <div className="h-10 bg-muted animate-pulse rounded flex items-center justify-center">
                Загрузка персонажей...
              </div>
            ) : characters.length > 0 ? (
              <Select
                value={selectedCharacterId}
                onValueChange={setSelectedCharacterId}
                disabled={isJoining}
              >
                <SelectTrigger id="character-select">
                  <SelectValue placeholder="Выберите персонажа" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map((character) => (
                    <SelectItem key={character.id} value={character.id || ''}>
                      {character.name} ({character.race}, {character.class || character.className}, ур. {character.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-4 text-center bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">У вас нет созданных персонажей</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/characters/create')}
                  className="mt-2"
                >
                  Создать персонажа
                </Button>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isJoining || !sessionCode.trim() || !selectedCharacterId || isLoading}
          >
            {isJoining ? 'Присоединение...' : 'Присоединиться к сессии'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" onClick={() => navigate('/')}>
          Вернуться
        </Button>
      </CardFooter>
    </>
  );
};

export default JoinSessionForm;
