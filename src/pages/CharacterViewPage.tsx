
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';
import { convertToCharacter } from '@/utils/characterConverter';
import { getCharacter } from '@/services/characterService';

const CharacterViewPage = () => {
  const { character, setCharacter } = useCharacter();
  const [processedCharacter, setProcessedCharacter] = useState<Character | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCharacter = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (id) {
          // Пытаемся загрузить персонажа из Firestore
          const loadedCharacter = await getCharacter(id);
          
          if (loadedCharacter) {
            // Преобразуем загруженные данные через конвертер
            const convertedCharacter = convertToCharacter(loadedCharacter);
            setCharacter(convertedCharacter);
            setProcessedCharacter(convertedCharacter);
            
            // Сохраняем последнего загруженного персонажа
            localStorage.setItem('last-selected-character', id);
          } else {
            // Если не нашли в Firestore, пробуем в localStorage
            const storedCharacter = localStorage.getItem(`character_${id}`);
            
            if (storedCharacter) {
              const localCharacter = JSON.parse(storedCharacter);
              const convertedCharacter = convertToCharacter(localCharacter);
              setCharacter(convertedCharacter);
              setProcessedCharacter(convertedCharacter);
              localStorage.setItem('last-selected-character', id);
            } else {
              setError(`Персонаж с ID ${id} не найден.`);
              navigate('/characters');
            }
          }
        } else if (character) {
          // Если персонаж уже загружен в контекст, применяем конвертер
          setProcessedCharacter(convertToCharacter(character));
        } else {
          // Проверяем, есть ли сохраненный последний персонаж
          const lastCharacterId = localStorage.getItem('last-selected-character');
          
          if (lastCharacterId) {
            // Пытаемся загрузить из Firestore
            const lastCharacter = await getCharacter(lastCharacterId);
            
            if (lastCharacter) {
              const convertedCharacter = convertToCharacter(lastCharacter);
              setCharacter(convertedCharacter);
              setProcessedCharacter(convertedCharacter);
            } else {
              // Если не нашли, пробуем в localStorage
              const storedCharacter = localStorage.getItem(`character_${lastCharacterId}`);
              
              if (storedCharacter) {
                const loadedCharacter = JSON.parse(storedCharacter);
                const convertedCharacter = convertToCharacter(loadedCharacter);
                setCharacter(convertedCharacter);
                setProcessedCharacter(convertedCharacter);
              } else {
                setError("Последний выбранный персонаж не найден.");
                navigate('/characters');
              }
            }
          } else {
            setError("Персонаж не выбран.");
            navigate('/characters');
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке персонажа:', err);
        setError("Ошибка при загрузке персонажа.");
        navigate('/characters');
      } finally {
        setLoading(false);
      }
    };
    
    loadCharacter();
  }, [id, character, setCharacter, navigate, toast]);

  // Обработчик обновления персонажа
  const handleUpdateCharacter = (updates: Partial<Character>) => {
    if (!processedCharacter) return;
    
    const updatedCharacter = { ...processedCharacter, ...updates };
    
    // Обновляем состояние
    setProcessedCharacter(updatedCharacter);
    setCharacter(updatedCharacter);
    
    // Сохраняем обновленные данные в localStorage
    localStorage.setItem(`character_${updatedCharacter.id}`, JSON.stringify(updatedCharacter));
    localStorage.setItem('last-selected-character', updatedCharacter.id);
    
    toast({
      title: "Персонаж обновлен",
      description: "Изменения успешно сохранены",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Загрузка персонажа...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 max-w-md bg-black/80 rounded-lg border border-red-500">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Ошибка</h2>
          <p className="mb-6">{error}</p>
          <button 
            className="px-4 py-2 bg-primary rounded-md shadow-md"
            onClick={() => navigate('/characters')}
          >
            Вернуться к списку персонажей
          </button>
        </div>
      </div>
    );
  }

  if (!processedCharacter) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Персонаж не выбран</h2>
        <button 
          className="px-4 py-2 bg-primary rounded-md shadow-md"
          onClick={() => navigate('/characters')}
        >
          Перейти к списку персонажей
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-4"
      style={{
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`,
        color: currentTheme.textColor
      }}
    >
      <CharacterSheet 
        character={processedCharacter} 
        onUpdate={handleUpdateCharacter}
      />
    </div>
  );
};

export default CharacterViewPage;
