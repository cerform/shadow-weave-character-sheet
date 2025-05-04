
import React, { useState, useEffect, useCallback, useContext } from "react";
import CharacterSheet from "@/components/character-sheet/CharacterSheet";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CharacterContext } from "@/contexts/CharacterContext";
import { isOfflineMode } from "@/utils/authHelpers";

const CharacterSheetPage = () => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { isConnected, sessionData, connect } = useSocket();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { character, setCharacter } = useContext(CharacterContext);
  
  // Флаг для отслеживания инициализации
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Оптимизированная загрузка персонажа из локального хранилища
  const loadCharacter = useCallback(() => {
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
  }, [setCharacter]);
  
  // Загрузка персонажа из локального хранилища
  useEffect(() => {
    // Проверяем, было ли уже загружено
    if (isInitialized) return;
    
    loadCharacter();
    setIsInitialized(true);
  }, [isInitialized, loadCharacter]);
  
  // Проверка наличия активной сессии и подключение к ней (один раз)
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
  
  // Проверка оффлайн-режима для определения прав DM
  const isDM = currentUser?.isDM === true || isOfflineMode();
  
  return (
    <div 
      className="min-h-screen w-full"
      style={{ 
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`
      }}
    >
      <CharacterSheet 
        character={character} 
        isDM={isDM} // В автономном режиме разрешаем доступ как DM
      />
      
      {isConnected && sessionData && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500/80 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          Подключено к сессии: {sessionData.name}
        </div>
      )}
    </div>
  );
};

export default CharacterSheetPage;
