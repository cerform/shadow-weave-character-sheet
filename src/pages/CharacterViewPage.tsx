import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CharacterSheet from '@/components/character-sheet/CharacterSheet';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/utils/characterImports';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';

const CharacterViewPage = () => {
  const { character, setCharacter, loading, error } = useCharacter();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      // Load character by ID
      const storedCharacters = localStorage.getItem('dnd-characters');
      if (storedCharacters) {
        try {
          const characters: Character[] = JSON.parse(storedCharacters);
          const foundCharacter = characters.find(char => char.id === id);
          if (foundCharacter) {
            setCharacter(foundCharacter);
          } else {
            toast({
              title: "Персонаж не найден",
              description: "Не удалось найти персонажа с указанным ID.",
              variant: "destructive",
            });
            navigate('/characters');
          }
        } catch (e) {
          console.error('Ошибка при парсинге персонажей:', e);
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить персонажа.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Персонаж не найден",
          description: "Список персонажей пуст.",
          variant: "destructive",
        });
        navigate('/characters');
      }
    }
  }, [id, setCharacter, navigate, toast]);

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center">Ошибка: {error}</div>;
  }

  if (!character) {
    return <div className="text-center">Персонаж не выбран.</div>;
  }

  return (
    <div
      className="min-h-screen py-4"
      style={{
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`,
        color: currentTheme.textColor
      }}
    >
      <CharacterSheet character={character} />
    </div>
  );
};

export default CharacterViewPage;
