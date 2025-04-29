import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { useSession } from '@/contexts/SessionContext';
import { ArrowLeft } from 'lucide-react';

const JoinSessionPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { joinSession } = useSession();
  
  const [sessionCode, setSessionCode] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [savedCharacters, setSavedCharacters] = useState<any[]>([]);
  
  useEffect(() => {
    // Load saved characters from localStorage
    const loadedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '[]');
    setSavedCharacters(loadedCharacters);
    
    // Try to load player name from localStorage
    const savedPlayerName = localStorage.getItem('dnd-player-name');
    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
    }
  }, []);
  
  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      toast.error('Введите код сессии');
      return;
    }
    
    if (!playerName.trim()) {
      toast.error('Введите имя игрока');
      return;
    }
    
    if (!selectedCharacter && savedCharacters.length > 0) {
      toast.error('Выберите персонажа');
      return;
    }
    
    // Save player name to localStorage
    localStorage.setItem('dnd-player-name', playerName);
    
    // Find the selected character data
    const character = savedCharacters.find(c => c.id === selectedCharacter) || null;
    
    // Try to join the session
    const joined = joinSession(sessionCode, {
      name: playerName,
      character
    });
    
    if (joined) {
      toast.success('Вы присоединились к сессии!');
      navigate('/play');
    } else {
      toast.error('Сессия не найдена. Проверьте код и попробуйте снова.');
    }
  };

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="max-w-md mx-auto">
        <header className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-2">
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">Присоединиться к сессии</h1>
        </header>

        <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Код сессии</label>
              <Input 
                value={sessionCode} 
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="Например: AB12CD" 
                className="uppercase"
                maxLength={6}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Ваше имя</label>
              <Input 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Имя игрока" 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Выберите персонажа</label>
              {savedCharacters.length > 0 ? (
                <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите персонажа" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedCharacters.map((character) => (
                      <SelectItem key={character.id} value={character.id}>
                        {character.name} ({character.race}, {character.class})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-3 border rounded-md border-dashed text-sm text-muted-foreground">
                  <p>У вас пока нет созданных персонажей</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/create')}
                    className="px-0 h-auto"
                  >
                    Создать персонажа
                  </Button>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleJoinSession} 
              disabled={!sessionCode.trim() || !playerName.trim() || (!selectedCharacter && savedCharacters.length > 0)}
              className="w-full"
            >
              Присоединиться
            </Button>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Код сессии предоставляет Мастер Подземелий</p>
        </div>
      </div>
    </div>
  );
};

export default JoinSessionPage;
