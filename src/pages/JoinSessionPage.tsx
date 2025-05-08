
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCharacter } from '@/contexts/CharacterContext';
import { useSession } from '@/contexts/SessionContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Character } from '@/types/character';

const JoinSessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { characters, getUserCharacters } = useCharacter();
  const { joinSession, sessions } = useSession();
  const [loading, setLoading] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);
  
  // Используем characterId из location state, если он есть
  useEffect(() => {
    if (location.state?.characterId) {
      setSelectedCharacterId(location.state.characterId);
    }
  }, [location.state]);
  
  // Загружаем персонажей при монтировании
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const chars = await getUserCharacters('current-user');
        if (chars.length > 0 && !selectedCharacterId) {
          setSelectedCharacterId(chars[0].id);
        }
      } catch (error) {
        console.error('Ошибка при загрузке персонажей:', error);
        toast.error('Не удалось загрузить персонажей');
      }
    };
    
    loadCharacters();
  }, []);
  
  // Обработчик присоединения к сессии
  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      toast.error('Введите код сессии');
      return;
    }
    
    if (!selectedCharacterId) {
      toast.error('Выберите персонажа');
      return;
    }
    
    const character = characters.find(c => c.id === selectedCharacterId);
    if (!character) {
      toast.error('Выбранный персонаж не найден');
      return;
    }
    
    try {
      setLoading(true);
      
      // Используем контекст сессии для присоединения
      const success = joinSession(sessionCode, {
        name: character.name || 'Безымянный персонаж',
        character
      });
      
      if (success) {
        toast.success('Вы успешно присоединились к сессии');
        navigate('/game-session');
      } else {
        toast.error('Сессия с таким кодом не найдена');
      }
    } catch (error) {
      console.error('Ошибка при присоединении к сессии:', error);
      toast.error('Не удалось присоединиться к сессии');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft size={16} />
          На главную
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-center">Присоединение к игровой сессии</h1>
      
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Присоединиться к сессии</CardTitle>
          <CardDescription>
            Введите код сессии и выберите персонажа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Код сессии */}
            <div className="space-y-2">
              <Label htmlFor="sessionCode">Код сессии</Label>
              <Input
                id="sessionCode"
                placeholder="Введите код сессии"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                className="uppercase"
                maxLength={6}
              />
            </div>
            
            {/* Выбор персонажа */}
            <div className="space-y-2">
              <Label htmlFor="character">Выберите персонажа</Label>
              {characters.length === 0 ? (
                <div className="text-center p-4 border rounded-md bg-accent/10">
                  <p className="text-muted-foreground mb-4">У вас пока нет персонажей</p>
                  <Button onClick={() => navigate('/character-creation')}>
                    Создать персонажа
                  </Button>
                </div>
              ) : (
                <Select 
                  value={selectedCharacterId}
                  onValueChange={setSelectedCharacterId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите персонажа" />
                  </SelectTrigger>
                  <SelectContent>
                    {characters.map((character: Character) => (
                      <SelectItem key={character.id} value={character.id}>
                        {character.name || 'Безымянный персонаж'} ({character.race} {character.class || character.className}, ур. {character.level || 1})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {/* Информация о выбранном персонаже */}
            {selectedCharacter && (
              <div className="p-4 border rounded-md bg-primary/5">
                <h3 className="font-medium mb-2">Выбранный персонаж</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Имя:</span> {selectedCharacter.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Уровень:</span> {selectedCharacter.level || 1}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Раса:</span> {selectedCharacter.race}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Класс:</span> {selectedCharacter.class || selectedCharacter.className}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleJoinSession}
            disabled={loading || !sessionCode.trim() || !selectedCharacterId}
          >
            {loading ? 'Присоединение...' : 'Присоединиться к сессии'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinSessionPage;
