
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { toast } from 'sonner';

interface CharacterCardsProps {
  characters: Character[];
  onDelete: (id: string) => Promise<void>;
}

const CharacterCards: React.FC<CharacterCardsProps> = ({ characters, onDelete }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Функция для отображения класса персонажа
  const getCharacterClass = (character: Character): string => {
    if (character.className && typeof character.className === 'string') 
      return character.className;
    
    if (character.class && typeof character.class === 'string') 
      return character.class;
      
    return '—';
  };

  // Функция для форматирования уровня персонажа
  const getCharacterLevel = (character: Character): string => {
    const level = character.level;
    if (!level && level !== 0) return '1';
    return String(level);
  };

  // Функция открытия персонажа
  const handleViewCharacter = (id: string) => {
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
      console.error('Ошибка при удалении персонажа:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => (
        <Card key={character.id} className="overflow-hidden bg-black/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <span className="text-primary truncate">{character.name || 'Без имени'}</span>
              <span className="text-xs bg-primary/20 px-2 py-1 rounded-full">
                Ур. {getCharacterLevel(character)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-col space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Класс:</span>
                <span>{getCharacterClass(character)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Раса:</span>
                <span>{character.race || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Архетип:</span>
                <span>{character.subclass || '—'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleViewCharacter(character.id!)}
              title="Открыть"
            >
              <Eye size={16} className="mr-1" />
              Открыть
            </Button>
            <div className="space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/character/${character.id}`)}
                title="Редактировать"
              >
                <Edit size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDelete(character.id!)}
                disabled={deletingId === character.id}
                className="text-red-500 hover:text-red-700"
                title="Удалить"
              >
                {deletingId === character.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CharacterCards;
