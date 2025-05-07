
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { User, Swords, Shield, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { toast } from '@/components/ui/use-toast';
import LoadingState from '@/components/characters/LoadingState';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUserTheme } from '@/hooks/use-user-theme';

const CharactersList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { getUserCharacters, loading: contextLoading, refreshCharacters, deleteCharacter, characters } = useCharacter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { currentTheme } = useUserTheme();
  
  // Функция для загрузки персонажей с обработкой ошибок
  const loadCharacters = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('CharactersList: Загрузка персонажей');
      
      await getUserCharacters();
      setError(null);
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
      toast({
        title: "Список персонажей обновлен",
        variant: "default" // Изменен с "success" на "default"
      });
      setError(null);
    } catch (err) {
      console.error('CharactersList: Ошибка при обновлении персонажей', err);
      setError('Не удалось обновить список персонажей');
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить список персонажей",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для открытия персонажа
  const handleOpenCharacter = (id: string) => {
    navigate(`/character-sheet/${id}`);
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
      toast({
        title: "Персонаж удален",
        description: "Персонаж успешно удален",
        variant: "default"
      });
    } catch (err) {
      console.error('Ошибка при удалении персонажа:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить персонажа",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
      setCharacterToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Эффект для загрузки персонажей при монтировании и изменении статуса аутентификации
  useEffect(() => {
    loadCharacters();
    console.log('CharactersList: компонент смонтирован, isAuthenticated =', isAuthenticated);
  }, [isAuthenticated]);

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
    return (
      <Card className="shadow-lg border border-gray-800/30 bg-black/30 backdrop-blur-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-center">Загрузка персонажей...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
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
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!characters || characters.length === 0) {
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
            style={{
              borderColor: currentTheme ? `${currentTheme.accent}30` : undefined,
              backgroundColor: currentTheme ? `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.3)'}` : undefined
            }}
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
              <Button variant="outline" onClick={() => handleOpenCharacter(character.id!)}>
                Открыть
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => handleOpenCharacter(character.id!)}>
                  Играть
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => openDeleteDialog(character.id!)}
                  disabled={deletingId === character.id}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        <Card className="shadow-lg border border-dashed border-gray-700 bg-black/20 backdrop-blur-sm hover:border-purple-700/50 transition-all duration-300"
          style={{
            borderColor: currentTheme ? `${currentTheme.accent}30` : undefined
          }}
        >
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
