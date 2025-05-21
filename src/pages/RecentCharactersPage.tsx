import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { deleteCharacter } from '@/services/characterService';
import { toast } from 'sonner';
import { getCurrentUid } from '@/utils/authHelpers';

const RecentCharactersPage: React.FC = () => {
  const { theme } = useTheme();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getUserCharacters } = useCharacter();
  
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    const loadCharacters = async () => {
      setLoading(true);
      setError(null);
      try {
        const uid = getCurrentUid();
        if (uid) {
          await getUserCharacters();
        } else {
          setError("Пожалуйста, войдите для просмотра ваших персонажей.");
        }
      } catch (err) {
        setError("Не удалось загрузить персонажей. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, [getUserCharacters]);

  useEffect(() => {
    // Update local state when characters from context change
    // This ensures the component re-renders when the character list is updated elsewhere
    const { characters: contextCharacters } = useCharacter();
    setCharacters(contextCharacters);
  }, [useCharacter]);

  const handleDeleteCharacter = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCharacter(id);
      toast.success("Персонаж успешно удален");
      // Refresh character list after deletion
      await getUserCharacters();
    } catch (err) {
      // Исправляем преобразование error для отображения
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast.error(`Ошибка при удалении персонажа: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: currentTheme.textColor }}>
        Недавние персонажи
      </h1>
      <ScrollArea className="rounded-md border w-full">
        <div className="flex flex-col space-y-2 p-4">
          {characters.length > 0 ? (
            characters.map((character) => (
              <Card key={character.id} style={{ backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.borderColor }}>
                <CardHeader>
                  <CardTitle style={{ color: currentTheme.textColor }}>{character.name}</CardTitle>
                  <CardDescription style={{ color: currentTheme.mutedTextColor }}>
                    {character.race} {character.class} {character.level} уровень
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div>
                    <Link to={`/character/${character.id}`}>
                      <Button variant="secondary">Просмотреть</Button>
                    </Link>
                  </div>
                  <Button variant="destructive" onClick={() => handleDeleteCharacter(character.id)}>
                    Удалить
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center" style={{ color: currentTheme.mutedTextColor }}>
              Нет доступных персонажей.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentCharactersPage;
