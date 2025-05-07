
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { Pencil, Trash2, UserPlus, FileText } from 'lucide-react';
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        // Загружаем персонажей из localStorage
        const storedCharacters = await getUserCharacters('current-user');
        console.log('Loaded characters:', storedCharacters);
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

  const handleRefresh = async () => {
    try {
      await refreshCharacters();
      toast({
        title: 'Список обновлен',
        description: 'Список персонажей был успешно обновлен'
      });
    } catch (error) {
      console.error('Failed to refresh characters:', error);
      toast({
        title: 'Ошибка обновления',
        description: 'Не удалось обновить список персонажей',
        variant: 'destructive'
      });
    }
  };

  const handleCreateCharacter = () => {
    navigate('/character-creation');
  };

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

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Мои персонажи</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            Обновить
          </Button>
          <Button onClick={handleCreateCharacter}>
            <UserPlus className="h-4 w-4 mr-2" />
            Создать персонажа
          </Button>
        </div>
      </div>

      <Card className="flex-1">
        <ScrollArea className="h-[calc(100vh-200px)]">
          {characters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Нет персонажей</h3>
              <p className="text-muted-foreground text-center mb-4">
                Вы еще не создали ни одного персонажа. Создайте своего первого персонажа, чтобы начать.
              </p>
              <Button onClick={handleCreateCharacter}>
                <UserPlus className="h-4 w-4 mr-2" />
                Создать персонажа
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-2">
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
                      onClick={() => handleEditCharacter(character.id || '')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCharacter(character.id || '')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

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
    </div>
  );
};

export default CharactersList;
