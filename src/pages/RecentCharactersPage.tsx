import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCharacter } from '@/contexts/CharacterContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { getCurrentUid } from '@/utils/authHelpers';
import CharacterNavigation from '@/components/characters/CharacterNavigation';

const RecentCharactersPage: React.FC = () => {
  const { characters, loading, error, getUserCharacters, deleteCharacter } = useCharacter();

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
    return <div className="text-center text-foreground">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive">{error}</div>;
  }

  // Показываем только 5 последних персонажей
  const recentCharacters = characters.slice(0, 5);

  return (
    <div className="container mx-auto p-4">
      <CharacterNavigation />
      
      <h1 className="text-2xl font-bold mb-4 text-foreground">
        Недавние персонажи
      </h1>
      
      <ScrollArea className="rounded-md border border-border w-full">
        <div className="flex flex-col space-y-2 p-4">
          {recentCharacters.length > 0 ? (
            recentCharacters.map((character) => (
              <Card key={character.id} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">{character.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
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
            <div className="text-center text-muted-foreground">
              Нет доступных персонажей.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentCharactersPage;