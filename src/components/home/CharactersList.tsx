import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserPlus, User, Play, Trash2, RefreshCw } from 'lucide-react';
import { useAuth, useProtectedRoute } from '@/hooks/use-auth';
import { getUserCharacters } from '@/services/supabaseCharacterService';
import { toast } from 'sonner';

const CharactersList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isDM } = useProtectedRoute();
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      toast.error('Не удалось загрузить персонажей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCharacters();
    }
  }, [user]);

  if (!user) {
    return (
      <Card className="magic-card">
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
    );
  }

  return (
    <Card className="magic-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-fantasy-heading">
            👥 Ваши персонажи
          </h3>
          <div className="flex items-center gap-2">
            {/* Интегрированная панель профиля */}
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
              <Avatar className="h-8 w-8 border border-primary/30">
                <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username || user.email}`} />
                <AvatarFallback className="text-xs bg-primary/20">
                  {(user.username || user.email || "").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user.username || user.displayName || user.email || "Искатель приключений"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isAdmin ? "👑 Администратор" : isDM ? "🎩 Мастер" : "🎲 Игрок"}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadCharacters}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
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
          <div className="space-y-6">
            {/* Компактная сетка персонажей */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Create Character Card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card 
                      className="aspect-square border-2 border-dashed border-primary/30 hover:border-primary/50 cursor-pointer transition-all group flex items-center justify-center"
                      onClick={() => navigate('/character-creation')}
                    >
                      <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                        <UserPlus className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-primary">Создать</span>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Создать нового персонажа</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Characters */}
              {characters.map((character) => (
                <TooltipProvider key={character.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card 
                        className="aspect-square hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                        onClick={() => navigate(`/character-sheet/${character.id}`)}
                      >
                        <CardContent className="p-3 h-full flex flex-col items-center justify-center text-center">
                          {/* Аватар */}
                          <Avatar className="h-12 w-12 mb-2 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                            <AvatarImage src={character.avatar || ''} alt={character.name} />
                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                              {(character.name || 'Н').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Имя */}
                          <h4 className="font-semibold text-sm leading-tight truncate w-full mb-1">
                            {character.name || 'Безымянный'}
                          </h4>
                          
                          {/* Уровень */}
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            {character.level || 1} ур.
                          </Badge>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-64">
                      <div className="space-y-1">
                        <p className="font-semibold">{character.name || 'Безымянный'}</p>
                        <p className="text-sm">
                          {character.race || 'Неизвестная раса'} {character.class || 'Неизвестный класс'}
                        </p>
                        <p className="text-sm">Уровень: {character.level || 1}</p>
                        {character.background && (
                          <p className="text-sm">Предыстория: {character.background}</p>
                        )}
                        {character.hitPoints && (
                          <p className="text-sm">
                            HP: {character.hitPoints.current}/{character.hitPoints.maximum}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Сообщение если нет персонажей */}
            {characters.length === 0 && (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold mb-2">Нет персонажей</h4>
                <p className="text-muted-foreground">
                  Создайте своего первого персонажа, чтобы начать приключение!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CharactersList;