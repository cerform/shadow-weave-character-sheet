
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { Pencil, Trash2, FileText, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CharactersGrid from './CharactersGrid';

// Новый компонент, который использует улучшенное отображение персонажей
const CharactersList = () => {
  const { characters, getUserCharacters } = useCharacter();
  const [isCompactView, setIsCompactView] = React.useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        // Загружаем персонажей из localStorage
        await getUserCharacters('current-user');
        console.log('CharactersList: Персонажи загружены, всего:', characters.length);
      } catch (error) {
        console.error('Failed to load characters:', error);
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить список персонажей',
          variant: 'destructive'
        });
      }
    };
    
    loadCharacters();
  }, []);

  // Переключатель для компактного/расширенного вида
  const toggleView = () => {
    setIsCompactView(!isCompactView);
  };

  // Условное отображение: компактный вид или сетка
  return isCompactView ? (
    <>
      {characters.length === 0 ? (
        <div className="text-center p-4">
          <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            У вас пока нет персонажей
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[250px]">
          <div className="space-y-2">
            {characters.map((character: Character) => (
              <div
                key={character.id}
                className="flex justify-between items-center p-3 bg-card/60 border rounded-lg hover:bg-accent/10"
              >
                <div>
                  <h3 className="font-medium">{character.name || 'Без имени'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {character.race} {character.class || character.className}, уровень {character.level || 1}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/character/${character.id}`)}
                    title="Редактировать"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/join-session', { state: { characterId: character.id } })}
                    title="Присоединиться к сессии"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      <div className="flex justify-end mt-2">
        <Button variant="link" size="sm" onClick={toggleView}>
          Расширенный вид
        </Button>
      </div>
    </>
  ) : (
    <>
      <CharactersGrid />
      <div className="flex justify-end mt-2">
        <Button variant="link" size="sm" onClick={toggleView}>
          Компактный вид
        </Button>
      </div>
    </>
  );
};

export default CharactersList;
