
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSessionStore } from '@/stores/sessionStore';
import { Character } from '@/types/session';
import { useTheme } from '@/hooks/use-theme';
import { ArrowLeft, Plus, Trash, Users, FileX, Loader2 } from 'lucide-react';
import NavigationButtons from '@/components/ui/NavigationButtons';
import { firebaseAuth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

const CharactersListPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { characters, fetchCharacters, deleteCharacter, clearAllCharacters } = useSessionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);
  const [clearInProgress, setClearInProgress] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        toast.warning("Для доступа к персонажам необходимо войти в аккаунт");
        navigate('/auth', { state: { returnPath: '/characters' } });
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Загружаем персонажей после проверки авторизации
    if (!isAuthChecking) {
      const loadCharacters = async () => {
        await fetchCharacters();
        setIsLoading(false);
      };
      
      loadCharacters();
    }
  }, [fetchCharacters, isAuthChecking]);

  const handleCreateCharacter = () => {
    navigate('/create-character');
  };

  const handleDeleteCharacter = async (characterId: string) => {
    setDeleteInProgress(characterId);
    try {
      await deleteCharacter(characterId);
    } finally {
      setDeleteInProgress(null);
    }
  };

  const handleDeleteAllCharacters = async () => {
    setClearInProgress(true);
    try {
      await clearAllCharacters();
    } finally {
      setClearInProgress(false);
    }
  };

  const handleViewCharacter = (characterId: string) => {
    navigate(`/character/${characterId}`);
  };

  if (isAuthChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Проверка авторизации...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 theme-${theme} bg-gradient-to-br from-background to-background/80`}>
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <NavigationButtons />
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ваши персонажи</h1>
            <p className="text-muted-foreground">
              Управляйте созданными персонажами и создавайте новых
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleCreateCharacter}>
              <Plus className="mr-2 h-4 w-4" />
              Создать персонажа
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={characters.length === 0 || clearInProgress}
                >
                  {clearInProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                  {clearInProgress ? "Удаление..." : "Удалить всех"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить всех персонажей?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы уверены, что хотите удалить всех персонажей? Это действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAllCharacters} 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={clearInProgress}
                  >
                    {clearInProgress ? "Удаление..." : "Удалить всех"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Separator className="my-6" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p>Загрузка персонажей...</p>
          </div>
        ) : characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <Card key={character.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{character.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Раса:</span>
                      <span>{character.race}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Класс:</span>
                      <span>{character.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Уровень:</span>
                      <span>{character.level}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => handleViewCharacter(character.id)}>
                    Просмотр
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" disabled={deleteInProgress === character.id}>
                        {deleteInProgress === character.id ? 
                          <Loader2 className="h-4 w-4 animate-spin" /> : 
                          <Trash className="h-4 w-4" />
                        }
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить персонажа?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Вы уверены, что хотите удалить персонажа {character.name}? Это действие нельзя отменить.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteCharacter(character.id)} 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deleteInProgress === character.id}
                        >
                          {deleteInProgress === character.id ? "Удаление..." : "Удалить"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted/20 p-8 rounded-full mb-4">
              <FileX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">У вас пока нет персонажей</h2>
            <p className="text-muted-foreground mb-6">
              Создайте своего первого персонажа, чтобы начать игру
            </p>
            <Button onClick={handleCreateCharacter}>
              <Plus className="mr-2 h-4 w-4" />
              Создать персонажа
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharactersListPage;
