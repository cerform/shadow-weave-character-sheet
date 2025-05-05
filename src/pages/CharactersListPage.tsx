
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import useSessionStore from '@/stores/sessionStore';
import { CharacterSheet } from '@/utils/characterImports';
import { getAllCharacters, deleteCharacter } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const CharactersListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionStore = useSessionStore();
  const { currentUser } = useAuth();
  const [characters, setCharacters] = useState<CharacterSheet[]>([]);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  useEffect(() => {
    const fetchCharacters = async () => {
      if (currentUser) {
        try {
          const fetchedCharacters = await getAllCharacters(currentUser.id); // Use id instead of uid
          setCharacters(fetchedCharacters);
        } catch (error) {
          console.error("Failed to fetch characters:", error);
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить список персонажей.",
            variant: "destructive"
          });
        }
      }
    };

    fetchCharacters();
  }, [currentUser, toast]);

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      await deleteCharacter(characterId);
      setCharacters(characters.filter(char => char.id !== characterId));
      toast({
        title: "Персонаж удален",
        description: "Персонаж успешно удален.",
      });
    } catch (error) {
      console.error("Failed to delete character:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить персонажа.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ваши персонажи</h1>
        <Link to="/character-creation">
          <Button style={{ backgroundColor: currentTheme.accent, color: currentTheme.buttonText }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать персонажа
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <Card key={character.id} className="bg-white shadow-md rounded-md overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{character.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Раса: {character.race}</p>
              <p className="text-gray-600">Класс: {character.class}</p>
              <p className="text-gray-600">Уровень: {character.level}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => navigate(`/character/${character.id}`)}
                style={{ backgroundColor: currentTheme.primary, color: currentTheme.buttonText }}
              >
                Просмотреть
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteCharacter(character.id || '')}
                style={{ backgroundColor: currentTheme.accent, color: currentTheme.buttonText }}
              >
                Удалить
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CharactersListPage;
