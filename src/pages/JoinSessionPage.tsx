
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Character } from '@/types/character';
import { auth } from '@/services/firebase';

const JoinSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const [sessionCode, setSessionCode] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const { joinSession, fetchCharacters, characters, loading } = useSessionStore();

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleJoinSession = async () => {
    if (!sessionCode || !userName) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите код сессии и имя пользователя.",
        variant: "destructive"
      });
      return;
    }

    const success = await joinSession(sessionCode, userName, selectedCharacter);
    if (success) {
      navigate('/session');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Присоединиться к сессии</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionCode">Код сессии</Label>
            <Input
              id="sessionCode"
              placeholder="Введите код сессии"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userName">Имя пользователя</Label>
            <Input
              id="userName"
              placeholder="Введите ваше имя"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div>
            <Label>Выберите персонажа (необязательно)</Label>
            <div className="flex flex-col gap-2 mt-2">
              {characters.map((character) => (
                <label
                  key={character.id}
                  className={`flex items-center p-3 border rounded-md cursor-pointer hover:bg-muted ${selectedCharacter?.id === character.id ? 'bg-muted' : ''}`}
                  style={{ borderColor: currentTheme.accent }}
                >
                  <input
                    type="radio"
                    name="character"
                    value={character.id}
                    className="mr-2"
                    onChange={() => setSelectedCharacter(character)}
                  />
                  <Avatar className="mr-2">
                    <AvatarImage src={character.avatarUrl || ''} alt={character.name} />
                    <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{character.name} - {character.class}</span>
                  <p>{character.age ? `Возраст: ${character.age}` : ""}</p>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleJoinSession} disabled={loading} className="w-full">
            {loading ? "Присоединение..." : "Присоединиться"}
          </Button>
          <Button variant="link" onClick={() => navigate('/')}>
            Назад на главную
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinSessionPage;
