
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/contexts/CharacterContext';
import CharactersTable from "@/components/characters/CharactersTable";
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import CharacterNavigation from '@/components/characters/CharacterNavigation';
import CharactersPageDebugger from '@/components/debug/CharactersPageDebugger';
import ConsoleErrorCatcher from '@/components/debug/ConsoleErrorCatcher';

const CharactersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { characters, loading, error, deleteCharacter, getUserCharacters } = useCharacter();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // При монтировании компонента обновляем список персонажей
  useEffect(() => {
    if (isAuthenticated) {
      refreshCharacters();
    }
  }, [isAuthenticated]);
  
  // Отладочная информация
  useEffect(() => {
    console.log('CharactersListPage: Монтирование компонента');
    console.log('CharactersListPage: isAuthenticated =', isAuthenticated);
    console.log('CharactersListPage: Количество персонажей =', characters?.length || 0);
    
    return () => {
      console.log('CharactersListPage: Размонтирование компонента');
    };
  }, []);
  
  // При изменении списка персонажей выводим отладочную информацию
  useEffect(() => {
    console.log('CharactersListPage: Обновление списка персонажей, количество:', characters?.length || 0);
    if (error) {
      console.error('CharactersListPage: Ошибка:', error);
    }
  }, [characters, error]);
  
  const refreshCharacters = async () => {
    try {
      setIsRefreshing(true);
      console.log('CharactersListPage: Начинаем обновление списка персонажей');
      await getUserCharacters();
      console.log('CharactersListPage: Список персонажей обновлен успешно');
    } catch (error) {
      console.error('CharactersListPage: Ошибка при обновлении списка персонажей:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Если пользователь не авторизован, предлагаем авторизоваться
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-background to-background/80">
        <div className="max-w-md text-center p-6">
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
            <h1 className="text-xl font-bold" style={{ color: currentTheme.textColor }}>
              Персонажи
            </h1>
            <IconOnlyNavigation includeThemeSelector />
          </div>
        }
      >
        <div className="container mx-auto p-6 max-w-5xl">
          {/* Добавляем компоненты отладки */}
          <ConsoleErrorCatcher />
          <CharactersPageDebugger />
          
          {/* Навигация по страницам персонажей */}
          <CharacterNavigation />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: currentTheme.accent }}>
              Список персонажей
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCharacters}
                disabled={isRefreshing || loading}
              >
                <RefreshCw size={16} className={`mr-2 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <Button
                onClick={() => navigate('/character-creation')}
              >
                <Plus size={16} className="mr-2" />
                Создать персонажа
              </Button>
            </div>
          </div>
          
          <CharactersTable
            characters={characters || []}
            onDelete={deleteCharacter}
          />
        </div>
      </OBSLayout>
    </ErrorBoundary>
  );
};

export default CharactersListPage;
