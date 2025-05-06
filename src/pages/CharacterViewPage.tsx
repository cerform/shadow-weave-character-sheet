
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { toast } from 'sonner';
import { convertToCharacter } from '@/utils/characterConverter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import InfoMessage from '@/components/ui/InfoMessage';

const CharacterViewPage = () => {
  const { character, setCharacter, getCharacterById } = useCharacter();
  const [processedCharacter, setProcessedCharacter] = useState<Character | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка персонажа при монтировании компонента или изменении ID
  useEffect(() => {
    const loadCharacter = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (id) {
          console.log('CharacterViewPage: Загрузка персонажа по ID:', id);
          
          // Пытаемся загрузить персонажа через контекст
          const loadedCharacter = await getCharacterById(id);
          
          if (loadedCharacter) {
            console.log('CharacterViewPage: Персонаж найден:', loadedCharacter.name);
            // Преобразуем загруженные данные через конвертер
            const convertedCharacter = convertToCharacter(loadedCharacter);
            setCharacter(convertedCharacter);
            setProcessedCharacter(convertedCharacter);
            
            // Сохраняем последнего загруженного персонажа
            localStorage.setItem('last-selected-character', id);
          } else {
            console.log('CharacterViewPage: Персонаж с ID не найден:', id);
            
            // Проверяем локальное хранилище
            const storedCharacter = localStorage.getItem(`character_${id}`);
            
            if (storedCharacter) {
              console.log('CharacterViewPage: Персонаж найден в localStorage');
              const localCharacter = JSON.parse(storedCharacter);
              const convertedCharacter = convertToCharacter(localCharacter);
              setCharacter(convertedCharacter);
              setProcessedCharacter(convertedCharacter);
              localStorage.setItem('last-selected-character', id);
            } else {
              console.error('CharacterViewPage: Персонаж не найден нигде');
              setError(`Персонаж с ID ${id} не найден.`);
              toast.error(`Персонаж с ID ${id} не найден.`);
            }
          }
        } else if (character) {
          // Если персонаж уже загружен в контекст, применяем конвертер
          setProcessedCharacter(convertToCharacter(character));
        } else {
          // Проверяем, есть ли сохраненный последний персонаж
          const lastCharacterId = localStorage.getItem('last-selected-character');
          
          if (lastCharacterId) {
            console.log('CharacterViewPage: Загрузка последнего выбранного персонажа:', lastCharacterId);
            // Перенаправляем на страницу с конкретным ID
            navigate(`/character/${lastCharacterId}`);
            return;
          } else {
            setError("Персонаж не выбран.");
            toast.error("Персонаж не выбран.");
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке персонажа:', err);
        setError("Ошибка при загрузке персонажа.");
        toast.error("Ошибка при загрузке персонажа.");
      } finally {
        setLoading(false);
      }
    };
    
    loadCharacter();
  }, [id, navigate, getCharacterById, setCharacter, character]);

  // Обработчик обновления персонажа
  const handleUpdateCharacter = (updates: Partial<Character>) => {
    if (!processedCharacter) return;
    
    const updatedCharacter = { ...processedCharacter, ...updates };
    
    // Обновляем состояние
    setProcessedCharacter(updatedCharacter);
    setCharacter(updatedCharacter);
    
    // Сохраняем обновленные данные в localStorage как резервную копию
    if (updatedCharacter.id) {
      localStorage.setItem(`character_${updatedCharacter.id}`, JSON.stringify(updatedCharacter));
      localStorage.setItem('last-selected-character', updatedCharacter.id);
    }
    
    toast.success('Изменения сохранены локально');
  };

  // Функция повторной загрузки персонажа
  const reloadCharacter = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const refreshedCharacter = await getCharacterById(id);
      
      if (refreshedCharacter) {
        const convertedCharacter = convertToCharacter(refreshedCharacter);
        setCharacter(convertedCharacter);
        setProcessedCharacter(convertedCharacter);
        toast.success('Персонаж успешно обновлен');
      } else {
        toast.error('Не удалось найти персонажа');
      }
    } catch (err) {
      console.error('Ошибка при обновлении персонажа:', err);
      toast.error('Ошибка при обновлении персонажа');
    } finally {
      setLoading(false);
    }
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
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/characters')}
            >
              Вернуться к списку персонажей
            </Button>
            <Button 
              variant="default"
              onClick={() => navigate('/character-creation')}
            >
              Создать персонажа
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!processedCharacter) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Персонаж не выбран</h2>
        <Button 
          className="mr-2"
          onClick={() => navigate('/characters')}
        >
          Перейти к списку персонажей
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/character-creation')}
        >
          Создать персонажа
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen py-4"
        style={{
          background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`,
          color: currentTheme.textColor
        }}
      >
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/characters')}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              К списку персонажей
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reloadCharacter}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Обновить данные
            </Button>
          </div>
          
          {processedCharacter.id && (
            <InfoMessage
              variant="info"
              message={`ID персонажа: ${processedCharacter.id}`}
              className="mb-4"
            />
          )}
          
          <CharacterSheet 
            character={processedCharacter} 
            onUpdate={handleUpdateCharacter}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CharacterViewPage;
