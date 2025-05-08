
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { Pencil, Trash2, FileText } from 'lucide-react';
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

const CharactersList = () => {
  const { characters, getUserCharacters, refreshCharacters, deleteCharacter } = useCharacter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [characterToDelete, setCharacterToDelete] = React.useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        // Загружаем персонажей из localStorage
        await getUserCharacters('current-user');
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

  const handleEditCharacter = (characterId: string) => {
    navigate(`/character/${characterId}`);
  };

  const handleConfirmDelete = () => {
    if (characterToDelete) {
      deleteCharacter(characterToDelete);
      setCharacterToDelete(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Персонаж удален',
        description: 'Персонаж был успешно удален'
      });
    }
  };

  const handleDeleteCharacter = (characterId: string) => {
    setCharacterToDelete(characterId);
    setIsDeleteDialogOpen(true);
  };

  if (characters.length === 0) {
    return (
      <div className="text-center p-4">
        <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">
          У вас пока нет персонажей
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[250px]">
        <div className="space-y-2">
          {characters.map((character: Character) => (
            <div
              key={character.id}
              className="flex justify-between items-center p-3 bg-card/60 border rounded-lg hover:bg-accent/10"
            >
              <div>
                <h3 className="font-medium">{character.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {character.race} {character.class}, уровень {character.level}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditCharacter(character.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCharacter(character.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Персонаж будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CharactersList;
