
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, UserPlus, LayoutGrid, LayoutList } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { toast } from 'sonner';
import { useCharacter } from '@/contexts/CharacterContext';
import CharacterNavigation from '@/components/characters/CharacterNavigation';
import CharacterCard from '@/components/character/CharacterCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from "@/components/ui/alert";
import ErrorBoundary from '@/components/ErrorBoundary';

const CharactersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Используем контекст персонажей напрямую
  const { characters, loading, error, refreshCharacters } = useCharacter();
  
  // State для управления UI
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  
  // Добавляем эффект для логирования состояния
  useEffect(() => {
    console.log('CharactersListPage: Текущий список персонажей:', characters);
    console.log('CharactersListPage: Состояние loading:', loading);
    console.log('CharactersListPage: Состояние error:', error);
    console.log('CharactersListPage: Пользователь авторизован?', isAuthenticated);
    console.log('CharactersListPage: Данные пользователя:', user);
  }, [characters, loading, error, isAuthenticated, user]);

  // Функция загрузки персонажей
  const handleRefresh = async () => {
    try {
      console.log('CharactersListPage: Начинаем обновление персонажей...');
      setIsRefreshing(true);
      await refreshCharacters();
      console.log('CharactersListPage: Персонажи обновлены успешно');
      toast.success('Персонажи обновлены');
    } catch (err) {
      console.error('Ошибка при обновлении персонажей:', err);
      toast.error('Не удалось обновить список персонажей');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Принудительно загружаем персонажей при монтировании компонента
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      console.log('CharactersListPage: Инициализация загрузки персонажей. UserId:', user.uid);
      refreshCharacters().then(() => {
        console.log('CharactersListPage: Первичная загрузка персонажей завершена');
      }).catch(err => {
        console.error('CharactersListPage: Ошибка при первичной загрузке персонажей', err);
      });
    }
  }, [isAuthenticated, user?.uid]);

  // Если пользователь не авторизован, предлагаем войти
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-6 flex flex-col justify-center items-center bg-gradient-to-br from-background to-background/80">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-6">Требуется авторизация</h1>
          <p className="mb-8">Для доступа к персонажам необходимо войти в систему</p>
          <Button 
            onClick={() => navigate('/auth', { state: { returnPath: '/characters' } })}
            className="w-full"
          >
            Войти
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <OBSLayout
        topPanelContent={
          <div className="flex justify-between items-center p-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              На главную
            </Button>
            
            <h1 
              className="text-xl font-bold"
              style={{ color: currentTheme.textColor }}
            >
              Мои персонажи
            </h1>
            
            <IconOnlyNavigation includeThemeSelector />
          </div>
        }
      >
        <div className="container mx-auto p-6 max-w-6xl">
          {/* Верхняя панель */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.accent }}>
              Персонажи пользователя {user?.displayName || user?.username || ""}
            </h1>
            <p className="text-muted-foreground">
              {characters && characters.length > 0 
                ? `Всего персонажей: ${characters.length}` 
                : "У вас пока нет персонажей"}
            </p>
          </div>
          
          {/* Навигация по страницам персонажей */}
          <CharacterNavigation />
          
          {/* Отладочная информация */}
          <div className="mb-6 p-4 border border-blue-500/30 bg-blue-900/20 rounded-md">
            <h3 className="font-medium text-blue-200 mb-2">Отладочная информация</h3>
            <div className="text-sm text-muted-foreground">
              <div>Авторизован: {isAuthenticated ? "Да" : "Нет"}</div>
              <div>ID пользователя: {user?.uid || "Не определен"}</div>
              <div>Загрузка: {loading ? "Да" : "Нет"}</div>
              <div>Персонажей: {characters ? characters.length : 0}</div>
              {error && <div className="text-red-400">Ошибка: {error}</div>}
            </div>
          </div>
          
          {/* Панель управления */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <Button
              onClick={() => navigate('/character-creation')}
              className="gap-2"
            >
              <UserPlus size={16} />
              Создать персонажа
            </Button>
            
            <div className="flex gap-2">
              <div className="flex rounded-md overflow-hidden border">
                <Button
                  onClick={() => setDisplayMode('grid')}
                  size="sm"
                  variant={displayMode === 'grid' ? "default" : "ghost"}
                  className={`rounded-none ${displayMode === 'grid' ? "" : "bg-transparent"}`}
                >
                  <LayoutGrid size={16} />
                </Button>
                <Button
                  onClick={() => setDisplayMode('list')}
                  size="sm"
                  variant={displayMode === 'list' ? "default" : "ghost"}
                  className={`rounded-none ${displayMode === 'list' ? "" : "bg-transparent"}`}
                >
                  <LayoutList size={16} />
                </Button>
              </div>
              
              <Button
                onClick={handleRefresh}
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={isRefreshing || loading}
              >
                <RefreshCw size={16} className={isRefreshing || loading ? "animate-spin" : ""} />
                Обновить
              </Button>
            </div>
          </div>

          {/* Состояние загрузки */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-[240px] w-full rounded-lg" />
                </div>
              ))}
            </div>
          )}
          
          {/* Показ ошибки */}
          {error && !loading && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="ml-4"
                >
                  Повторить
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Отображение персонажей */}
          {!loading && !error && (
            <>
              {/* Если нет персонажей */}
              {(!characters || characters.length === 0) && (
                <div className="text-center p-10 border border-dashed rounded-lg">
                  <h3 className="text-xl font-medium mb-2">У вас пока нет персонажей</h3>
                  <p className="text-muted-foreground mb-6">
                    Создайте своего первого персонажа, чтобы начать приключение
                  </p>
                  <Button onClick={() => navigate('/character-creation')}>
                    Создать персонажа
                  </Button>
                </div>
              )}
              
              {/* Сетка персонажей */}
              {characters && characters.length > 0 && displayMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {characters.map((character) => {
                    if (!character || !character.id) {
                      console.warn('Обнаружен недействительный персонаж:', character);
                      return null;
                    }
                    
                    return (
                      <CharacterCard 
                        key={character.id}
                        character={character}
                        onClick={() => navigate(`/character/${character.id}`)}
                      />
                    );
                  })}
                </div>
              )}
              
              {/* Список персонажей */}
              {characters && characters.length > 0 && displayMode === 'list' && (
                <div className="space-y-3">
                  {characters.map((character) => {
                    if (!character || !character.id) return null;
                    
                    return (
                      <div 
                        key={character.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-card/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/character/${character.id}`)}
                      >
                        <div>
                          <h3 className="text-lg font-medium text-primary">{character.name || "Безымянный"}</h3>
                          <div className="text-sm text-muted-foreground">
                            {character.race || ''} {character.class || character.className || ''}
                            {character.level ? ` (${character.level} уровень)` : ''}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/character/${character.id}`);
                        }}>
                          Открыть
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Дополнительная метка при отсутствии персонажей */}
              {(!characters || characters.length === 0) && (
                <p className="text-center text-muted-foreground text-sm mt-8">
                  В вашей коллекции пока нет ни одного персонажа
                </p>
              )}
            </>
          )}
        </div>
      </OBSLayout>
    </ErrorBoundary>
  );
};

export default CharactersListPage;
