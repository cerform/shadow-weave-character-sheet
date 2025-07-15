import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, User, Play, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserCharacters } from '@/services/firebase/firestore';
import { toast } from 'sonner';

const CharactersList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharacters = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Загружаем персонажей для пользователя:', user.uid);
      const userCharacters = await getUserCharacters(user.uid);
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadCharacters}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
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
                          onClick={() => navigate(`/character-sheet/${character.id}`)}
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
  );
};

export default CharactersList;