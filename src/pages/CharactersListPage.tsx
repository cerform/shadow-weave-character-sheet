
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { getCharactersByUserId, deleteCharacter } from '@/services/characterService';
import { Character } from '@/types/character';
import { toast } from 'sonner';

// Import our components
import LoadingState from '@/components/characters/LoadingState';
import ErrorDisplay from '@/components/characters/ErrorDisplay';
import EmptyState from '@/components/characters/EmptyState';
import CharactersTable from '@/components/characters/CharactersTable';
import CharactersHeader from '@/components/characters/CharactersHeader';

const CharactersListPage: React.FC = () => {
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
    console.log('CharactersListPage: Проверка авторизации пользователя');
    
    if (isAuthenticated && user) {
      console.log('CharactersListPage: Пользователь авторизован, загружаем персонажей');
      console.log('User ID:', user.uid || user.id);
      loadCharacters();
    } else {
      console.log('CharactersListPage: Пользователь не авторизован');
    }
  }, [isAuthenticated, user]);

  // Функция загрузки персонажей
  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = user?.uid || user?.id;
      console.log('CharactersListPage: Загрузка персонажей для пользователя:', userId);
      
      if (!userId) {
        console.error('CharactersListPage: ID пользователя отсутствует');
        setError('ID пользователя отсутствует');
        return;
      }
      
      const fetchedCharacters = await getCharactersByUserId(userId);
      console.log('CharactersListPage: Получено персонажей:', fetchedCharacters.length);
      console.log('Данные персонажей:', fetchedCharacters);
      
      // Проверка полей у полученных персонажей
      if (fetchedCharacters.length > 0) {
        console.log('Поля первого персонажа:', Object.keys(fetchedCharacters[0]));
      }
      
      setCharacters(fetchedCharacters);
      
      console.log('CharactersListPage: Персонажи загружены успешно');
    } catch (err) {
      console.error('CharactersListPage: Ошибка при загрузке персонажей:', err);
      setError(`Не удалось загрузить персонажей: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Функция удаления персонажа
  const handleDeleteCharacter = async (id: string) => {
    try {
      await deleteCharacter(id);
      toast.success('Персонаж успешно удален');
      
      // Обновляем список персонажей
      setCharacters(prevChars => prevChars.filter(char => char.id !== id));
    } catch (err) {
      console.error('Ошибка при удалении персонажа:', err);
      throw err;
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
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid grid-cols-1 gap-6">
          {/* Верхняя панель - заголовок с кнопкой создания */}
          <CharactersHeader username={user?.displayName || user?.username || ""} />

          {/* Загрузка */}
          {loading && <LoadingState />}
          
          {/* Ошибка */}
          {error && !loading && (
            <ErrorDisplay 
              errorMessage={error}
              onRetry={loadCharacters}
            />
          )}
          
          {/* Список персонажей */}
          {!loading && !error && characters.length > 0 && (
            <CharactersTable 
              characters={characters}
              onDelete={handleDeleteCharacter}
            />
          )}

          {/* Пустое состояние */}
          {!loading && !error && characters.length === 0 && <EmptyState />}
        </div>
      </div>
    </OBSLayout>
  );
};

export default CharactersListPage;
