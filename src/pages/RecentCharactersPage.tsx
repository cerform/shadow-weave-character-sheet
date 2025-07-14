import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCharacter } from '@/contexts/CharacterContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { toast } from 'sonner';
import { getCurrentUid } from '@/utils/authHelpers';

const RecentCharactersPage: React.FC = () => {
  const { theme } = useTheme();
  const { characters, loading, error, getUserCharacters, deleteCharacter } = useCharacter();
  
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const uid = getCurrentUid();
        if (uid) {
          await getUserCharacters();
        }
      } catch (err) {
        console.error('Ошибка загрузки персонажей:', err);
      }
    };

    loadCharacters();
  }, [getUserCharacters]);

  const handleDeleteCharacter = async (id: string) => {
    try {
      await deleteCharacter(id);
      toast.success("Персонаж успешно удален");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Ошибка при удалении персонажа: ${errorMessage}`);
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
