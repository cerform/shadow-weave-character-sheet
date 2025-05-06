
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { toast } from 'sonner';

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

  // Функция для отображения класса персонажа с учетом различных форм хранения
  const getCharacterClass = (character: Character): string => {
    if (!character) return '—';
    
    // Проверяем все возможные места хранения класса
    if (character.className && typeof character.className === 'string') 
      return character.className;
    
    if (character.class && typeof character.class === 'string') 
      return character.class;
    
    // Если не найдено
    return '—';
  };

  // Функция для форматирования уровня персонажа
  const getCharacterLevel = (character: Character): string => {
    if (!character) return '1';
    
    const level = character.level;
    // Проверяем edge cases для уровня
    if (level === undefined || level === null) return '1';
    if (level === 0) return '0';
    
    return String(level);
  };

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

  // Для отладки - выводим объект characters в консоль
  console.log('CharacterCards: Получено персонажей:', characters?.length || 0);
  if (characters?.length > 0) {
    console.log('CharacterCards: Первый персонаж:', characters[0]);
  } else {
    console.log('CharacterCards: Нет персонажей для отображения');
  }
  
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
    return (
      <div className="text-center p-10 bg-black/20 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle size={24} className="text-amber-400" />
          <p className="text-muted-foreground">У вас нет персонажей. Создайте новый персонаж!</p>
          <Button 
            onClick={() => navigate('/character-creation')}
            variant="outline" 
            size="sm"
            className="mt-2"
          >
            Создать персонажа
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map((character) => {
        if (!character || !character.id) {
          console.warn('CharacterCards: Некорректный персонаж:', character);
          return null;
        }
        
        const characterName = character.name || 'Безымянный герой';
        
        return (
          <Card key={character.id} className="overflow-hidden bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <span className="text-primary truncate" title={characterName}>
                  {characterName}
                </span>
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
                {character.userId && (
                  <div className="flex justify-between text-xs text-muted-foreground/70">
                    <span>ID:</span>
                    <span className="truncate max-w-[160px]" title={character.userId}>
                      {character.userId.substring(0, 8)}...
                    </span>
                  </div>
                )}
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
        );
      })}
    </div>
  );
};

export default CharacterCards;
