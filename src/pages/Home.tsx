
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, User, Sparkles, Book, Dice1 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCharacter } from '@/contexts/CharacterContext';
import { useSessionStore } from '@/stores/sessionStore';
import { Character } from '@/types/character';
import { User } from '@/types/session';
import { isOfflineMode } from '@/utils/authHelpers';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Character card component
interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
}

const CharacterCard = ({ character, isSelected, onSelect, onView }: CharacterCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <CardTitle>{character.name}</CardTitle>
        <CardDescription>
          {character.race} {character.class || character.className}, {character.level} уровень
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Класс брони:</span>
            <span>{character.armorClass || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>HP:</span>
            <span>{character.currentHp || 0}/{character.maxHp || 0}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={(e) => { e.stopPropagation(); onView(); }} className="w-full">
          Открыть
        </Button>
      </CardFooter>
    </Card>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { character, setCharacter } = useCharacter();
  
  // Session state
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState(currentUser?.displayName || '');
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  
  // Get characters from localStorage
  const [characters, setCharacters] = useState<Character[]>([]);
  
  // Session store
  const { 
    createSession, 
    joinSession, 
    currentSession,
    fetchSessions,
    sessions,
    fetchCharacters,
    loading
  } = useSessionStore();
  
  // Load characters from localStorage
  useEffect(() => {
    const loadCharacters = () => {
      try {
        const savedCharacters = localStorage.getItem('dnd-characters');
        if (savedCharacters) {
          const parsedCharacters = JSON.parse(savedCharacters);
          setCharacters(parsedCharacters);
          
          // If there's a last selected character, select it
          const lastSelectedId = localStorage.getItem('last-selected-character');
          if (lastSelectedId) {
            setSelectedCharacterId(lastSelectedId);
          }
        }
      } catch (error) {
        console.error('Error loading characters:', error);
      }
    };
    
    loadCharacters();
    
    // If online, also fetch from server
    if (!isOfflineMode()) {
      fetchCharacters();
      fetchSessions();
    }
  }, [fetchCharacters, fetchSessions]);
  
  // Handle character selection
  const handleSelectCharacter = (characterId: string) => {
    setSelectedCharacterId(characterId);
    
    // Find the character in the list
    const selectedCharacter = characters.find(c => c.id === characterId);
    if (selectedCharacter) {
      // Set as current character
      setCharacter(selectedCharacter);
      // Save selection to localStorage
      localStorage.setItem('last-selected-character', characterId);
    }
  };
  
  // Handle character creation
  const handleCreateCharacter = () => {
    navigate('/character-creation');
  };
  
  // Handle character view
  const handleViewCharacter = (characterId: string) => {
    // Set as current character
    const selectedCharacter = characters.find(c => c.id === characterId);
    if (selectedCharacter) {
      setCharacter(selectedCharacter);
      localStorage.setItem('last-selected-character', characterId);
    }
    
    navigate('/character-sheet');
  };
  
  // Handle session creation
  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название сессии",
        variant: "destructive",
      });
      return;
    }
    
    const session = await createSession(sessionName, sessionDescription);
    
    if (session) {
      navigate('/session');
    }
  };
  
  // Handle joining a session
  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код сессии",
        variant: "destructive",
      });
      return;
    }
    
    if (!playerName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ваше имя",
        variant: "destructive",
      });
      return;
    }
    
    // Find selected character
    const selectedCharacter = characters.find(c => c.id === selectedCharacterId);
    
    const success = await joinSession(
      sessionCode, 
      playerName,
      selectedCharacter ? {
        id: selectedCharacter.id || '',
        name: selectedCharacter.name,
        race: selectedCharacter.race,
        class: selectedCharacter.class || selectedCharacter.className || '',
        level: selectedCharacter.level,
        avatarUrl: selectedCharacter.image
      } : undefined
    );
    
    if (success) {
      // Save session info to localStorage
      localStorage.setItem('active-session', JSON.stringify({
        sessionCode,
        playerName,
        characterId: selectedCharacterId
      }));
      
      navigate('/session');
    }
  };
  
  // If already in a session, redirect to session page
  useEffect(() => {
    if (currentSession) {
      navigate('/session');
    }
  }, [currentSession, navigate]);
  
  return (
    <div 
      className="min-h-screen w-full py-12 px-4 md:px-6"
      style={{ 
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`
      }}
    >
      <div className="container mx-auto grid gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать в D&D Companion</h1>
          <p className="text-muted-foreground">
            Создавайте персонажей, присоединяйтесь к сессиям и играйте вместе
          </p>
        </div>
        
        <Tabs defaultValue="characters" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="characters">
              <Dice1 className="mr-2 h-4 w-4" />
              Персонажи
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <User className="mr-2 h-4 w-4" />
              Сессии
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="characters" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Ваши персонажи</h2>
              <Button onClick={handleCreateCharacter}>
                <Plus className="mr-2 h-4 w-4" />
                Создать персонажа
              </Button>
            </div>
            
            {characters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((char) => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    isSelected={selectedCharacterId === char.id}
                    onSelect={() => handleSelectCharacter(char.id || '')}
                    onView={() => handleViewCharacter(char.id || '')}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">У вас пока нет персонажей</p>
                  <Button onClick={handleCreateCharacter} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Создать персонажа
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Создать сессию</CardTitle>
                  <CardDescription>
                    Создайте новую игровую сессию как Мастер
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-name">Название сессии</Label>
                    <Input 
                      id="session-name" 
                      placeholder="Введите название сессии" 
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-description">Описание (необязательно)</Label>
                    <Input 
                      id="session-description" 
                      placeholder="Краткое описание сессии" 
                      value={sessionDescription}
                      onChange={(e) => setSessionDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleCreateSession}
                    disabled={loading || !sessionName.trim()}
                  >
                    {loading ? "Создание..." : "Создать сессию"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Присоединиться к сессии</CardTitle>
                  <CardDescription>
                    Присоединитесь к существующей сессии как игрок
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-code">Код сессии</Label>
                    <Input 
                      id="session-code" 
                      placeholder="Введите код сессии" 
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player-name">Ваше имя</Label>
                    <Input 
                      id="player-name" 
                      placeholder="Как вас зовут?" 
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="character-select">Выберите персонажа (необязательно)</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {characters.length > 0 ? (
                        characters.map((char) => (
                          <Card 
                            key={char.id} 
                            className={`cursor-pointer border ${selectedCharacterId === char.id ? 'border-primary' : 'border-border'}`}
                            onClick={() => setSelectedCharacterId(char.id || null)}
                          >
                            <CardContent className="p-3 flex items-center justify-between">
                              <div>
                                <p className="font-medium">{char.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {char.race} {char.class || char.className}, {char.level} уровень
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">У вас нет персонажей</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleJoinSession}
                    disabled={loading || !sessionCode.trim() || !playerName.trim()}
                  >
                    {loading ? "Подключение..." : "Присоединиться"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {sessions && sessions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Ваши сессии</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <CardTitle>{session.name}</CardTitle>
                        <CardDescription>
                          Код: {session.code}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          {session.description || "Нет описания"}
                        </p>
                        <p className="text-sm mt-2">
                          Игроков: {session.users?.length || 0}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            // Save session info to localStorage
                            localStorage.setItem('active-session', JSON.stringify({
                              sessionCode: session.code,
                              playerName: currentUser?.displayName || 'DM',
                              isDM: true
                            }));
                            navigate('/session');
                          }}
                        >
                          Продолжить сессию
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
