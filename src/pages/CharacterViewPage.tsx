import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CharacterSheet from "@/components/character-sheet/CharacterSheet";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { useToast } from "@/hooks/use-toast";
import { CharacterContext } from "@/contexts/CharacterContext";
import { auth } from "@/services/firebase";
import characterService from "@/services/characterService";
import { isOfflineMode } from "@/utils/authHelpers";

const CharacterViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { toast } = useToast();
  const { setCharacter } = useContext(CharacterContext);

  // Загрузка персонажа по ID
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          toast({
            title: "Ошибка",
            description: "ID персонажа не указан",
            variant: "destructive"
          });
          navigate('/characters');
          return;
        }
        
        // Проверка авторизации
        const currentUser = auth.currentUser;
        
        // Пробуем загрузить персонажа через сервис
        let foundCharacter = null;
        
        try {
          foundCharacter = await characterService.getCharacterById(id);
        } catch (error) {
          console.error("Ошибка при загрузке персонажа из Firestore:", error);
        }
        
        // Если персонаж не найден через сервис или в оффлайн-режиме, проверяем localStorage
        if (!foundCharacter || isOfflineMode()) {
          const savedCharacters = localStorage.getItem("dnd-characters");
          
          if (savedCharacters) {
            const characters = JSON.parse(savedCharacters);
            const localCharacter = characters.find((char: Character) => char.id === id);
            
            if (localCharacter) {
              foundCharacter = localCharacter;
              
              // Если пользователь авторизован и не в оффлайн-режиме, синхронизируем с Firestore
              if (currentUser && !isOfflineMode()) {
                try {
                  foundCharacter.userId = currentUser.uid;
                  await characterService.saveCharacter(foundCharacter);
                } catch (syncError) {
                  console.error("Ошибка синхронизации с Firestore:", syncError);
                }
              }
            }
          }
        }
        
        if (foundCharacter) {
          setCharacter(foundCharacter); // Устанавливаем персонажа в контекст
          // Сохраняем ID последнего просмотренного персонажа
          localStorage.setItem("last-selected-character", id);
        } else {
          toast({
            title: "Ошибка",
            description: "Персонаж не найден",
            variant: "destructive"
          });
          // Если персонаж не найден, переходим на страницу списка персонажей
          setTimeout(() => {
            navigate('/characters');
          }, 1500);
        }
      } catch (error) {
        console.error("Ошибка при загрузке персонажа:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные персонажа",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCharacter();
    }
  }, [id, navigate, toast, setCharacter]);

  // Получаем персонажа из контекста
  const { character } = useContext(CharacterContext);

  // Отображаем загрузку
  if (loading) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center"
        style={{ 
          background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-lg text-white">Загрузка персонажа...</p>
        </div>
      </div>
    );
  }
  
  // Если персонаж не найден, отображаем сообщение
  if (!character) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center"
        style={{ 
          background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`
        }}
      >
        <div className="text-center p-6 bg-black/50 rounded-lg">
          <h2 className="text-xl text-white mb-4">Персонаж не найден</h2>
          <button 
            onClick={() => navigate('/characters')} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            К списку персонажей
          </button>
        </div>
      </div>
    );
  }

  // Отображаем лист персонажа
  return (
    <div 
      className="min-h-screen w-full"
      style={{ 
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`
      }}
    >
      <CharacterSheet character={character} />
    </div>
  );
};

export default CharacterViewPage;
