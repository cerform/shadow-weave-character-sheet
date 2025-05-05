
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme } from '@/hooks/use-theme';
import { useSessionStore } from '@/stores/sessionStore';
import { ArrowLeft, Shield } from 'lucide-react';
import { auth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Character as SessionCharacter } from '@/types/session';
import { Character } from '@/types/character';

const JoinSessionPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { joinSession, fetchCharacters, characters } = useSessionStore();
  
  const [sessionCode, setSessionCode] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  
  useEffect(() => {
    // Проверяем авторизацию
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Пользователь авторизован
        setPlayerName(user.displayName || '');
      } else {
        // Пользователь не авторизован
        navigate('/auth');
        toast.warning('Для присоединения к сессии необходимо войти в аккаунт');
      }
      setIsAuthLoading(false);
    });
    
    // Загружаем персонажей
    fetchCharacters();
    
    return () => unsubscribe();
  }, [navigate, fetchCharacters]);
  
  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      toast.error('Введите код сессии');
      return;
    }
    
    if (!playerName.trim()) {
      toast.error('Введите имя игрока');
      return;
    }
    
    if (!selectedCharacter && characters.length > 0) {
      toast.error('Выберите персонажа');
      return;
    }
    
    // Найти выбранного персонажа
    const character = characters.find(c => c.id === selectedCharacter);
    
    try {
      setIsJoining(true);
      // Преобразуем Character в SessionCharacter
      const sessionCharacter: SessionCharacter | undefined = character ? {
        id: character.id || '',
        name: character.name || 'Персонаж',
        race: character.race || '',
        class: character.class || character.className || '',
        level: character.level || 1,
        avatarUrl: character.image
      } : undefined;
      
      // Пытаемся присоединиться к сессии
      const joined = await joinSession(sessionCode, playerName, sessionCharacter);
      
      if (joined) {
        navigate('/play');
      }
    } catch (error) {
      console.error("Ошибка при присоединении к сессии:", error);
    } finally {
      setIsJoining(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Проверка авторизации...</p>
      </div>
    );
  }

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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Вход в игровую сессию
            </CardTitle>
          </CardHeader>
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
              <p className="text-xs text-muted-foreground mt-1">
                Это имя будет видно другим игрокам
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Выберите персонажа</label>
              {characters.length > 0 ? (
                <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите персонажа" />
                  </SelectTrigger>
                  <SelectContent>
                    {characters.map((character) => (
                      <SelectItem key={character.id} value={character.id || ''}>
                        {character.name} ({character.race}, {character.class || character.className})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-3 border rounded-md border-dashed text-sm text-muted-foreground">
                  <p>У вас пока нет созданных персонажей</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/create-character')}
                    className="px-0 h-auto"
                  >
                    Создать персонажа
                  </Button>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleJoinSession} 
              disabled={!sessionCode.trim() || !playerName.trim() || (!selectedCharacter && characters.length > 0) || isJoining}
              className="w-full"
            >
              {isJoining ? "Присоединение..." : "Присоединиться"}
            </Button>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Код сес��ии предоставляет Мастер Подземелий</p>
        </div>
      </div>
    </div>
  );
};

export default JoinSessionPage;
