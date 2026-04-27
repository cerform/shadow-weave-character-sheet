import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, User, Play, RefreshCw, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserCharacters } from '@/services/supabaseCharacterService';
import { useCharacterOperations } from '@/hooks/useCharacterOperations';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const CharactersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteCharacter } = useCharacterOperations();
  const { toast } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadCharacters = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Загружаем персонажей пользователя через Supabase');
      const userCharacters = await getUserCharacters();
      console.log('✅ Получено персонажей:', userCharacters.length);
      setCharacters(userCharacters);
    } catch (err) {
      console.error('❌ Ошибка загрузки персонажей:', err);
      setError('Ошибка загрузки персонажей');
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить персонажей",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId: string, characterName: string) => {
    setDeleting(characterId);
    try {
      await deleteCharacter(characterId);
      toast({
        title: "Персонаж удален",
        description: `Персонаж ${characterName} был успешно удален.`,
      });
      // Обновляем список персонажей
      setCharacters(prev => prev.filter(char => char.id !== characterId));
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить персонажа.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    if (user) {
      loadCharacters();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Card className="magic-card max-w-md">
          <CardContent className="p-6 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-fantasy-heading mb-2">Войдите в систему</h3>
            <p className="text-muted-foreground font-fantasy-body mb-4">
              Войдите в систему, чтобы просматривать ваших персонажей
            </p>
            <Button onClick={() => navigate('/auth')}>
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-2xl sm:text-3xl font-fantasy-title text-glow">
              👥 Управление персонажами
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadCharacters}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => navigate('/character-creation')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Создать персонажа
            </Button>
          </div>
        </div>

        {/* Characters Content */}
        <Card className="magic-card">
          <CardHeader>
            <CardTitle className="font-fantasy-heading">
              Ваши персонажи
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Загрузка персонажей...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadCharacters} variant="outline">
                  Попробовать снова
                </Button>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {/* Create Character Card */}
                <Card 
                  className="border-2 border-dashed border-primary/30 hover:border-primary/50 cursor-pointer transition-colors group"
                  onClick={() => navigate('/character-creation')}
                >
                  <CardContent className="p-6 text-center">
                    <UserPlus className="mx-auto h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-fantasy-heading text-primary">Создать персонажа</h4>
                    <p className="text-sm text-muted-foreground font-fantasy-body">
                      Создайте нового персонажа для приключений
                    </p>
                  </CardContent>
                </Card>

                {/* Characters List */}
                {characters.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-fantasy-heading mb-2">Нет персонажей</h4>
                    <p className="text-muted-foreground font-fantasy-body">
                      Создайте своего первого персонажа, чтобы начать приключение!
                    </p>
                  </div>
                ) : (
                  characters.map((character) => (
                    <Card key={character.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-fantasy-heading text-lg">{character.name || 'Безымянный'}</h4>
                              <Badge variant="secondary">
                                Уровень {character.level || 1}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-fantasy-body">
                              {character.race} {character.class}
                              {character.subrace && ` (${character.subrace})`}
                            </p>
                            {character.background && (
                              <p className="text-xs text-muted-foreground font-fantasy-body mt-1">
                                Предыстория: {character.background}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/character-creation?edit=${character.id}`)}
                              title="Редактировать персонажа"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={deleting === character.id}
                                  title="Удалить персонажа"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Удалить персонажа?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Это действие нельзя отменить. Персонаж {character.name || 'без имени'} будет удален навсегда.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteCharacter(character.id, character.name || 'без имени')}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={deleting === character.id}
                                  >
                                    {deleting === character.id ? 'Удаление...' : 'Удалить'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => navigate(`/character-sheet/${character.id}`)}
                              title="Открыть персонажа"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CharactersListPage;