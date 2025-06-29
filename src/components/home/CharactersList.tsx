import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { User, Swords, Shield, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import LoadingState from '@/components/characters/LoadingState';
import { diagnoseCharacterLoading } from '@/utils/characterLoadingDebug';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const CharactersList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { getUserCharacters, loading: contextLoading, refreshCharacters, deleteCharacter } = useCharacter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Функция для загрузки персонажей с обработкой ошибок и повторных попыток
  const loadCharacters = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('CharactersList: Загрузка персонажей (попытка ' + (loadAttempts + 1) + ')');
      
      await getUserCharacters();
      
      // Получаем персонажи из контекста
      const userCharacters: Character[] = [];
      
      console.log(`CharactersList: Получено ${userCharacters.length} персонажей`);
      setCharacters(userCharacters);
      setError(null);
      
      // Если персонажи не загрузились и попыток было мало, повторить
      if (userCharacters.length === 0 && loadAttempts < 2) {
        console.log('CharactersList: Нет персонажей, будет предпринята повторная попытка');
        setLoadAttempts(prev => prev + 1);
      }
    } catch (err) {
      console.error('CharactersList: Ошибка при загрузке персонажей', err);
      setError('Не удалось загрузить персонажей');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик ручного обновления списка персонажей
  const handleRefresh = async () => {
    try {
      setLoading(true);
      console.log('CharactersList: Принудительное обновление списка персонажей');
      await refreshCharacters();
      await getUserCharacters();
      const userCharacters: Character[] = [];
      setCharacters(userCharacters);
      toast.success('Список персонажей обновлен');
      setError(null);
    } catch (err) {
      console.error('CharactersList: Ошибка при обновлении персонажей', err);
      setError('Не удалось обновить список персонажей');
      toast.error('Не удалось обновить список персонажей');
    } finally {
      setLoading(false);
    }
  };

  // Запуск диагностики загрузки персонажей
  const runDiagnostics = async () => {
    try {
      const result = await diagnoseCharacterLoading();
      console.log('Результаты диагностики:', result);
      if (result.success) {
        toast.success(result.message || 'Диагностика успешна');
        handleRefresh();
      } else {
        toast.error(result.error || 'Ошибка диагностики');
      }
    } catch (error) {
      console.error('Ошибка при запуске диагностики:', error);
      toast.error('Не удалось выполнить диагностику');
    }
  };
  
  // Функция для открытия персонажа
  const handleOpenCharacter = (id: string) => {
    navigate(`/character/${id}`);
  };

  // Функция для удаления персонажа
  const openDeleteDialog = (id: string) => {
    setCharacterToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCharacter = async () => {
    if (!characterToDelete) return;
    
    try {
      setDeletingId(characterToDelete);
      await deleteCharacter(characterToDelete);
      toast.success('Персонаж успешно удален');
      // Обновляем список персонажей после удаления
      const updatedCharacters = characters.filter(char => char.id !== characterToDelete);
      setCharacters(updatedCharacters);
    } catch (err) {
      console.error('Ошибка при удалении персонажа:', err);
      toast.error('Не удалось удалить персонажа');
    } finally {
      setDeletingId(null);
      setCharacterToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Эффект для загрузки персонажей при монтировании и изменении статуса аутентификации
  useEffect(() => {
    loadCharacters();
  }, [isAuthenticated]);

  // Эффект для повторной попытки, если есть необходимость
  useEffect(() => {
    if (loadAttempts > 0 && loadAttempts < 3 && characters.length === 0 && !loading) {
      const timer = setTimeout(loadCharacters, 1500);
      return () => clearTimeout(timer);
    }
  }, [loadAttempts, characters.length, loading]);

  if (!isAuthenticated) {
    return (
      <Card className="shadow-lg border border-gray-800/30 bg-black/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-center">Персонажи</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>Войдите в систему, чтобы увидеть своих персонажей</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/auth"><User className="mr-2 h-4 w-4" /> Войти</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (loading || contextLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card className="shadow-lg border border-red-800/30 bg-black/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-center text-red-500">Ошибка загрузки персонажей</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="mb-4">{error}</p>
          <div className="flex justify-center flex-wrap gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" /> Обновить
            </Button>
            <Button variant="secondary" onClick={runDiagnostics}>
              Запустить диагностику
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (characters.length === 0) {
    return (
      <Card className="shadow-lg border border-gray-800/30 bg-black/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-center">Персонажи</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>У вас пока нет персонажей</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/character-creation"><Swords className="mr-2 h-4 w-4" /> Создать персонажа</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-philosopher">Ваши персонажи</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" /> Обновить
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <Card 
            key={character.id} 
            className="shadow-lg border border-purple-700/30 bg-black/30 backdrop-blur-sm hover:shadow-purple-700/10 hover:border-purple-700/50 transition-all duration-300 relative"
          >
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-2 text-purple-500" />
                <CardTitle className="text-lg">{character.name || 'Безымянный герой'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Уровень: {character.level || 1}</p>
              <p>Класс: {character.class || '—'}</p>
              <p>Раса: {character.race || '—'}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleOpenCharacter(character.id)}>
                Открыть
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => handleOpenCharacter(character.id)}>
                  Играть
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => openDeleteDialog(character.id)}
                  disabled={deletingId === character.id}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        <Card className="shadow-lg border border-dashed border-gray-700 bg-black/20 backdrop-blur-sm hover:border-purple-700/50 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center h-full py-10">
            <Swords className="h-12 w-12 mb-4 text-gray-500" />
            <p className="text-center mb-4">Создать нового персонажа</p>
            <Button asChild>
              <Link to="/character-creation">Создать</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление персонажа</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить персонажа? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCharacter}
              className="bg-destructive hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CharactersList;
