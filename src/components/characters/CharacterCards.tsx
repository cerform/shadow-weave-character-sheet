
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { toast } from 'sonner';
import CharacterCard from '@/components/character/CharacterCard';
import EmptyState from './EmptyState';

interface CharacterCardsProps {
  characters: Character[];
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

const CharacterCards: React.FC<CharacterCardsProps> = ({ characters, onDelete, loading = false }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

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
        <p className="text-muted-foreground">Загрузка персонажей...</p>
      </div>
    );
  }

  // Если нет персонажей, показываем соответствующее сообщение
  if (!characters || !Array.isArray(characters) || characters.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => {
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
