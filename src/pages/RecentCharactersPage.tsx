import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { getCharactersByUserId } from '@/services/characterService';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { auth } from '@/services/firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import CharacterNavigation from '@/components/characters/CharacterNavigation';

// Интерфейс для отображения карточек персонажей
interface CharacterCardProps {
  character: Character;
  themeKey: keyof typeof themes;
  onClick: () => void;
}

// Компонент карточки персонажа
const CharacterCard: React.FC<CharacterCardProps> = ({ character, themeKey, onClick }) => {
  const currentTheme = themes[themeKey] || themes.default;
  
  // Функция для получения относительной даты
  const getRelativeDate = (dateString?: string) => {
    if (!dateString) return 'Нет даты';
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ru
      });
    } catch (e) {
      return 'Некорректная дата';
    }
  };

  return (
    <Card 
      className="overflow-hidden transform transition-all duration-200 hover:scale-105 cursor-pointer"
      style={{
        backgroundColor: `${currentTheme.cardBg || '#2a2a2a'}`,
        borderColor: `${currentTheme.accent}30`,
        boxShadow: `0 4px 12px ${currentTheme.accent}10`
      }}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle 
          className="text-xl font-bold truncate"
          style={{ color: currentTheme.accent }}
        >
          {character.name || 'Безымянный герой'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">
            {character.className || character.class || 'Нет класса'}
          </span>
          <span className="text-muted-foreground">
            Уровень {character.level || '1'}
          </span>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground gap-1 mt-2">
          <Clock size={14} />
          <span>
            {getRelativeDate(character.updatedAt || character.createdAt)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 border-t border-border/30 flex justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText size={14} />
          <span>
            {character.race || 'Нет расы'}
          </span>
        </div>
        
        <span 
          className="text-xs rounded-full px-2 py-0.5" 
          style={{
            backgroundColor: `${currentTheme.accent}30`,
            color: currentTheme.accent
          }}
        >
          {character.alignment || '—'}
        </span>
      </CardFooter>
    </Card>
  );
};

// Компонент плейсхолдера карточки во время загрузки
const CardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-3 w-1/2" />
    </CardContent>
    <CardFooter className="pt-2 pb-3 border-t border-border/30 flex justify-between">
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-3 w-1/5" />
    </CardFooter>
  </Card>
);

// Главный компонент страницы
const RecentCharactersPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Загрузка персонажей при монтировании компонента
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCharacters();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);
  
  // Функция загрузки персонажей
  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = user?.uid || user?.id;
      
      if (!userId) {
        console.error('ID пользователя отсутствует');
        setError('ID пользователя отсутствует');
        return;
      }
      
      const fetchedCharacters = await getCharactersByUserId(userId);
      
      // Сортировка по дате обновления/создания (сначала новые)
      const sortedCharacters = fetchedCharacters.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      // Берём только 6 последних персонажей
      setCharacters(sortedCharacters.slice(0, 6));
    } catch (err) {
      console.error('Ошибка при загрузке персонажей:', err);
      setError(`Не удалось загрузить персонажей: ${err}`);
    } finally {
      setLoading(false);
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
        {/* Добавляем навигацию по страницам персонажей */}
        <CharacterNavigation />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: currentTheme.accent }}>
            Недавно обновленные
          </h2>
        </div>

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
          <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
            <p className="text-destructive font-medium">{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={loadCharacters}
            >
              Попробовать снова
            </Button>
          </div>
        )}
        
        {/* Персонажи */}
        {!loading && !error && characters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map(character => (
              <CharacterCard 
                key={character.id}
                character={character}
                themeKey={themeKey}
                onClick={() => navigate(`/character/${character.id}`)}
              />
            ))}
          </div>
        )}
        
        {/* Пустое состояние */}
        {!loading && !error && characters.length === 0 && (
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
  );
};

export default RecentCharactersPage;
