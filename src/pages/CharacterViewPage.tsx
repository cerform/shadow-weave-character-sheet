
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CharacterSheet from "@/components/character-sheet/CharacterSheet";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { useToast } from "@/hooks/use-toast";
import { Character } from "@/contexts/CharacterContext";
import { auth } from "@/services/firebase";
import characterService from "@/services/characterService";

const CharacterViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { toast } = useToast();

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
        
        console.log("Загрузка персонажа с ID:", id);
        
        // Проверка авторизации
        const currentUser = auth.currentUser;
        console.log("Текущий пользователь:", currentUser ? currentUser.email : "Не авторизован");
        
        // Пробуем загрузить персонажа через сервис
        let foundCharacter = null;
        
        try {
          console.log("Пытаемся загрузить из Firestore...");
          foundCharacter = await characterService.getCharacterById(id);
          
          if (foundCharacter) {
            console.log("Персонаж загружен из Firestore:", foundCharacter.name);
          } else {
            console.log("Персонаж не найден в Firestore");
          }
        } catch (error) {
          console.error("Ошибка при загрузке персонажа из Firestore:", error);
        }
        
        // Если персонаж не найден через сервис, проверяем localStorage
        if (!foundCharacter) {
          console.log("Пытаемся загрузить из localStorage...");
          const savedCharacters = localStorage.getItem("dnd-characters");
          
          if (savedCharacters) {
            const characters = JSON.parse(savedCharacters);
            foundCharacter = characters.find((char: Character) => char.id === id);
            
            if (foundCharacter) {
              console.log("Персонаж загружен из localStorage:", foundCharacter.name);
              
              // Если пользователь авторизован, сохраняем персонажа в Firestore
              if (currentUser && foundCharacter) {
                console.log("Синхронизируем персонажа с Firestore...");
                try {
                  foundCharacter.userId = currentUser.uid;
                  await characterService.saveCharacter(foundCharacter);
                  console.log("Персонаж синхронизирован с Firestore");
                } catch (syncError) {
                  console.error("Ошибка синхронизации с Firestore:", syncError);
                }
              }
            } else {
              console.log("Персонаж не найден в localStorage");
            }
          }
        }
        
        if (foundCharacter) {
          setCharacter(foundCharacter);
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
  }, [id, navigate, toast]);

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
