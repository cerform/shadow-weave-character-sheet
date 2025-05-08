
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import CharacterCard from './CharacterCard';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const CharactersGrid = () => {
  const navigate = useNavigate();
  const { characters, getUserCharacters, deleteCharacter, createCharacter } = useCharacter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);

  // Загружаем персонажей при первом рендере
  useEffect(() => {
    loadCharacters();
  }, []);

  // Функция загрузки персонажей
  const loadCharacters = async () => {
    try {
      setLoading(true);
      console.log('CharactersGrid: Загружаем персонажей...');
      
      const userChars = await getUserCharacters('current-user');
      console.log(`CharactersGrid: Получено ${userChars?.length || 0} персонажей`);
      
      // Если персонажей нет, создаем тестового персонажа для демонстрации
      if (userChars?.length === 0) {
        // Функционал создания демо-персонажа может быть включен при необходимости
        // createDemoCharacter();
      }
    } catch (error) {
      console.error('CharactersGrid: Ошибка при загрузке персонажей', error);
    } finally {
      setLoading(false);
    }
  };

  // Создание демо-персонажа для тестирования
  const createDemoCharacter = () => {
    console.log('CharactersGrid: Создаем демо-персонажа');
    createCharacter({
      name: 'Гарет Фаерфорг',
      race: 'Дварф',
      class: 'Воин',
      level: 3,
      background: 'Кузнец',
      userId: 'current-user'
    });
  };

  // Обновление списка персонажей
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadCharacters();
      toast.success('Список персонажей обновлен');
    } catch (err) {
      toast.error('Не удалось обновить список персонажей');
    } finally {
      setRefreshing(false);
    }
  };

  // Редактирование персонажа
  const handleEdit = (id: string) => {
    navigate(`/character/${id}`);
  };

  // Удаление персонажа
  const handleDelete = (id: string) => {
    setCharacterToDelete(id);
    setIsDialogOpen(true);
  };

  // Подтверждение удаления персонажа
  const confirmDelete = async () => {
    if (characterToDelete) {
      try {
        await deleteCharacter(characterToDelete);
        toast.success('Персонаж удален');
      } catch (err) {
        toast.error('Ошибка при удалении персонажа');
      } finally {
        setCharacterToDelete(null);
        setIsDialogOpen(false);
      }
    }
  };

  // Переход к сессии с выбранным персонажем
  const handleJoinSession = (id: string) => {
    navigate('/join-session', { state: { characterId: id } });
  };

  // Переход к созданию персонажа
  const handleCreateCharacter = () => {
    navigate('/character-creation');
  };

  // Отображаем состояние загрузки
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-muted-foreground">Загрузка персонажей...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Ваши персонажи</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin mr-1" : "mr-1"} />
              Обновить
            </Button>
            
            <Button size="sm" onClick={handleCreateCharacter}>
              <Plus size={16} className="mr-1" />
              Создать
            </Button>
          </div>
        </div>

        {characters.length === 0 ? (
          <div className="text-center p-6 border rounded-lg bg-card/50">
            <p className="mb-4 text-muted-foreground">У вас пока нет персонажей</p>
            <Button onClick={handleCreateCharacter}>
              <Plus size={16} className="mr-1" />
              Создать персонажа
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character: Character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onJoinSession={handleJoinSession}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить этого персонажа? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CharactersGrid;
