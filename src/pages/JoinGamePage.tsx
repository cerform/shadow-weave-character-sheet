
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Search, User } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';

const JoinGamePage = () => {
  const { sessionCode: urlSessionCode } = useParams();
  const [sessionCode, setSessionCode] = useState(urlSessionCode || '');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { joinSession } = useSessionStore();
  
  // Загрузка сохраненных персонажей при монтировании
  useEffect(() => {
    const loadCharacters = () => {
      try {
        const savedCharacters = localStorage.getItem('dnd-characters');
        if (savedCharacters) {
          const parsedCharacters = JSON.parse(savedCharacters);
          setCharacters(parsedCharacters);
        }
      } catch (error) {
        console.error('Ошибка при загрузке персонажей:', error);
      }
    };
    
    loadCharacters();
  }, []);
  
  // Обработка присоединения к сессии
  const handleJoinSession = () => {
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
    
    // Получаем выбранного персонажа
    const selectedCharacter = selectedCharacterId 
      ? characters.find(c => c.id === selectedCharacterId) 
      : null;
    
    // Присоединение к сессии через sessionStore
    const joined = joinSession(sessionCode, playerName);
    
    if (joined) {
      toast({
        title: "Успешно",
        description: `Вы присоединились к сессии`
      });
      
      // Переходим на страницу игровой сессии
      navigate('/player-session');
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к сессии. Проверьте код сессии.",
        variant: "destructive"
      });
      setIsJoining(false);
    }
  };

  return (
    <div className="container p-4 mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Присоединиться к игровой сессии</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Присоединиться к сессии</CardTitle>
          <CardDescription>
            Введите код сессии, полученный от Мастера подземелий
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionCode">Код сессии</Label>
            <Input 
              id="sessionCode" 
              placeholder="Например: AB12CD"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="playerName">Ваше имя</Label>
            <Input 
              id="playerName" 
              placeholder="Как вас будут видеть другие игроки"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Выберите персонажа</Label>
            {characters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {characters.map(character => (
                  <div 
                    key={character.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedCharacterId === character.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedCharacterId(character.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/5 rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{character.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {character.race} {character.className} (Ур. {character.level})
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed rounded-md">
                <p className="text-muted-foreground">У вас пока нет персонажей</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/character-creation')}
                  className="mt-2"
                >
                  Создать персонажа
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleJoinSession} 
            className="w-full"
            disabled={isJoining}
          >
            {isJoining ? 'Присоединение...' : 'Присоединиться к сессии'}
            {!isJoining && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JoinGamePage;
