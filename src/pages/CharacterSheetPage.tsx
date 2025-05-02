
import React, { useState, useEffect } from "react";
import CharacterSheet from "@/components/character-sheet/CharacterSheet";
import { PlayerDicePanel } from "@/components/character-sheet/PlayerDicePanel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/hooks/use-toast";

const CharacterSheetPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [character, setCharacter] = useState<any>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { isConnected, sessionData, connect } = useSocket();
  const { toast } = useToast();
  
  // Загрузка персонажа из локального хранилища
  useEffect(() => {
    // Проверяем в локальном хранилище последнего выбранного персонажа
    const loadCharacter = () => {
      try {
        const lastSelectedCharacterId = localStorage.getItem('last-selected-character');
        
        if (lastSelectedCharacterId) {
          const savedCharacters = localStorage.getItem('dnd-characters');
          if (savedCharacters) {
            const parsedCharacters = JSON.parse(savedCharacters);
            const foundCharacter = parsedCharacters.find((c: any) => c.id === lastSelectedCharacterId);
            
            if (foundCharacter) {
              setCharacter(foundCharacter);
              return;
            }
          }
        }
        
        // Если нет выбранного персонажа, берем первого из списка
        const savedCharacters = localStorage.getItem('dnd-characters');
        if (savedCharacters) {
          const parsedCharacters = JSON.parse(savedCharacters);
          if (parsedCharacters.length > 0) {
            setCharacter(parsedCharacters[0]);
            localStorage.setItem('last-selected-character', parsedCharacters[0].id);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке персонажа:', error);
      }
    };
    
    loadCharacter();
  }, []);
  
  // Проверка наличия активной сессии и подключение к ней
  useEffect(() => {
    // Проверяем наличие активной сессии в sessionStore
    const checkActiveSession = () => {
      const activeSessionData = localStorage.getItem('active-session');
      
      if (activeSessionData && !isConnected) {
        try {
          const { sessionCode, playerName, characterId } = JSON.parse(activeSessionData);
          
          if (sessionCode && playerName) {
            // Пытаемся подключиться к активной сессии
            connect(sessionCode, playerName, characterId);
            
            toast({
              title: "Подключение к сессии",
              description: `Попытка подключения к сессии ${sessionCode}`,
            });
          }
        } catch (error) {
          console.error('Ошибка при подключении к активной сессии:', error);
        }
      }
    };
    
    checkActiveSession();
  }, [isConnected, connect, toast]);
  
  return (
    <div className="relative">
      <CharacterSheet character={character} />
      
      <div className="fixed bottom-24 right-6 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              size="lg" 
              className="rounded-full h-18 w-18 p-0 shadow-lg" 
              style={{ 
                width: '70px', 
                height: '70px',
                backgroundColor: `rgba(${currentTheme.accent}, 0.9)`,
                color: currentTheme.textColor
              }}
            >
              <Dices className="h-10 w-10" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md md:max-w-lg w-[95%] bg-black/90 border-white/20 p-0 pt-4">
            <SheetHeader className="px-6">
              <SheetTitle className="text-white text-2xl">Кубики</SheetTitle>
              <SheetDescription className="text-white/70 text-base">
                Используйте виртуальные кубики для бросков
              </SheetDescription>
            </SheetHeader>
            <div className="py-2 h-[calc(100vh-120px)] overflow-y-auto px-4">
              <PlayerDicePanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {isConnected && sessionData && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500/80 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          Подключено к сессии: {sessionData.name}
        </div>
      )}
    </div>
  );
};

export default CharacterSheetPage;
