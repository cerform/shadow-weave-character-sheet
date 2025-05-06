
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Character } from '@/types/character';
import { toast } from 'sonner';
import CharacterCard from '@/components/character/CharacterCard';
import EmptyState from './EmptyState';
import InfoMessage from '@/components/ui/InfoMessage';

interface CharacterCardsProps {
  characters: Character[];
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

const CharacterCards: React.FC<CharacterCardsProps> = ({ characters, onDelete, loading = false }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [validCharacters, setValidCharacters] = useState<Character[]>([]);
  
  // При получении новых персонажей, фильтруем их
  useEffect(() => {
    if (!characters) {
      console.error('CharacterCards: characters is undefined or null');
      setValidCharacters([]);
      return;
    }
    
    if (!Array.isArray(characters)) {
      console.error('CharacterCards: characters is not an array, type:', typeof characters);
      setValidCharacters([]);
      return;
    }
    
    // Фильтруем персонажей, оставляя только с валидными ID
    const filtered = characters.filter(char => char && char.id);
    console.log(`CharacterCards: Отфильтровано ${filtered.length} персонажей из ${characters.length}`);
    
    setValidCharacters(filtered);
  }, [characters]);
  
  // Функция открытия персонажа
  const handleViewCharacter = (id: string) => {
    console.log('CharacterCards: Открываю персонажа с ID:', id);
    localStorage.setItem('last-selected-character', id);
    navigate(`/character/${id}`);
  };

  // Функция удаления персонажа
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
      toast.success('Персонаж удален успешно');
    } catch (err) {
      toast.error('Не удалось удалить персонажа');
      console.error('CharacterCards: Ошибка при удалении персонажа:', err);
    } finally {
      setDeletingId(null);
    }
  };
  
  // Показываем плейсхолдер при загрузке
  if (loading) {
    return (
      <div className="text-center p-10 bg-black/20 rounded-lg animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Загрузка персонажей...</p>
      </div>
    );
  }

  // Проверяем наличие данных персонажей
  if (!characters) {
    console.error('CharacterCards: Получен null или undefined вместо массива персонажей');
    return (
      <InfoMessage
        variant="error"
        title="Ошибка при загрузке"
        message="Не удалось загрузить данные персонажей"
      />
    );
  }
  
  // Если не массив
  if (!Array.isArray(characters)) {
    console.error('CharacterCards: Получен не массив:', typeof characters);
    return (
      <InfoMessage
        variant="error"
        title="Ошибка данных"
        message="Неверный формат данных персонажей"
      />
    );
  }

  // Если нет персонажей, показываем соответствующее сообщение
  if (characters.length === 0) {
    return <EmptyState />;
  }
  
  // Если нет валидных персонажей
  if (validCharacters.length === 0) {
    return (
      <div className="p-6 bg-black/20 rounded-lg text-center">
        <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Нет персонажей для отображения</h3>
        <p className="text-muted-foreground mb-4">
          Найдено {characters.length} персонажей, но они не содержат корректных данных.
        </p>
        <Button onClick={() => navigate('/character-creation')}>
          Создать нового персонажа
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {validCharacters.map((character) => {
        if (!character || !character.id) {
          console.warn('CharacterCards: Некорректный персонаж:', character);
          return null;
        }
        
        return (
          <CharacterCard 
            key={character.id} 
            character={character} 
            onClick={() => handleViewCharacter(character.id!)} 
          />
        );
      })}
    </div>
  );
};

export default CharacterCards;
