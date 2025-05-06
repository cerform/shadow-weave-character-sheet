
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Refresh } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { useCharacter } from '@/contexts/CharacterContext';
import { Skeleton } from '@/components/ui/skeleton';
import CharacterNavigation from '@/components/characters/CharacterNavigation';
import ErrorDisplay from '@/components/characters/ErrorDisplay';
import InfoMessage from '@/components/ui/InfoMessage';
import ErrorBoundary from '@/components/ErrorBoundary';
import CharacterCard from '@/components/character/CharacterCard';

// Компонент плейсхолдера карточки во время загрузки
const CardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="p-4 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex justify-between pt-4">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-3 w-1/5" />
      </div>
    </div>
  </Card>
);

// Главный компонент страницы
const RecentCharactersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const { characters, loading, error, refreshCharacters } = useCharacter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentCharacters, setRecentCharacters] = useState<Character[]>([]);
  
  useEffect(() => {
    console.log('RecentCharactersPage: Компонент загружен');
    
    if (isAuthenticated) {
      console.log('RecentCharactersPage: Пользователь авторизован, загружаем персонажей');
      loadCharacters();
    } else {
      console.log('RecentCharactersPage: Пользователь не авторизован');
    }
  }, [isAuthenticated]);
  
  // При изменении списка персонажей обновляем недавних
  useEffect(() => {
    if (characters.length > 0) {
      // Сортировка по дате обновления/создания (сначала новые)
      const sortedCharacters = [...characters].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      // Берём только 6 последних персонажей
      setRecentCharacters(sortedCharacters.slice(0, 6));
      console.log(`RecentCharactersPage: Получено ${sortedCharacters.length} персонажей, отображаем ${recentCharacters.length}`);
    } else {
      setRecentCharacters([]);
    }
  }, [characters]);
  
  // Функция загрузки персонажей
  const loadCharacters = async () => {
    try {
      setIsRefreshing(true);
      console.log('RecentCharactersPage: Загружаем персонажей');
      
      await refreshCharacters();
      toast.success('Персонажи успешно загружены');
      
    } catch (err) {
      console.error('RecentCharactersPage: Ошибка при загрузке персонажей:', err);
      toast.error('Не удалось загрузить персонажей');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Если пользователь не авторизован, предлагаем войти
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-6 flex flex-col justify-center items-center bg-gradient-to-br from-background to-background/80">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-6">Требуется авторизация</h1>
          <p className="mb-8">Для доступа к персонажам необходимо войти в систему</p>
          <Button 
            onClick={() => navigate('/auth', { state: { returnPath: '/recent-characters' } })}
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
              Недавние персонажи
            </h1>
            
            <IconOnlyNavigation includeThemeSelector />
          </div>
        }
      >
        <div className="container mx-auto p-6 max-w-6xl">
          {/* Навигация по страницам персонажей */}
          <CharacterNavigation />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: currentTheme.accent }}>
              Недавно обновленные
            </h2>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadCharacters}
              disabled={loading || isRefreshing}
              className="gap-2"
            >
              <Refresh size={16} className={loading || isRefreshing ? "animate-spin" : ""} />
              Обновить
            </Button>
          </div>

          {/* Информационная панель */}
          {isAuthenticated && !error && !loading && characters.length === 0 && (
            <InfoMessage
              variant="info"
              title="Информация о загрузке"
              message="В системе не найдено персонажей. Создайте нового персонажа, чтобы он появился здесь."
              className="mb-6"
            />
          )}

          {/* Загрузка */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}
          
          {/* Ошибка */}
          {error && !loading && (
            <ErrorDisplay 
              errorMessage={error}
              onRetry={loadCharacters}
            />
          )}
          
          {/* Персонажи */}
          {!loading && !error && recentCharacters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCharacters.map(character => {
                if (!character || !character.id) return null;
                
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
          
          {/* Пустое состояние */}
          {!loading && !error && recentCharacters.length === 0 && (
            <div className="text-center p-8 border border-border/50 rounded-lg bg-card/20">
              <h3 className="text-xl font-medium mb-2">У вас пока нет персонажей</h3>
              <p className="text-muted-foreground mb-4">
                Создайте своего первого персонажа, чтобы начать приключение
              </p>
              <Button onClick={() => navigate('/character-creation')}>
                Создать персонажа
              </Button>
            </div>
          )}
        </div>
      </OBSLayout>
    </ErrorBoundary>
  );
};

export default RecentCharactersPage;
