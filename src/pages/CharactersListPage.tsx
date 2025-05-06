
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, UserPlus, LayoutGrid, LayoutList, FileJson, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { useCharacter } from '@/contexts/CharacterContext';
import CharacterNavigation from '@/components/characters/CharacterNavigation';
import LoadingState from '@/components/characters/LoadingState';
import ErrorDisplay from '@/components/characters/ErrorDisplay';
import CharactersTable from '@/components/characters/CharactersTable';
import CharacterCards from '@/components/characters/CharacterCards';
import CharactersHeader from '@/components/characters/CharactersHeader';

const CharactersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Используем контекст персонажей
  const { 
    characters, 
    loading, 
    error, 
    getUserCharacters, 
    deleteCharacter,
    refreshCharacters
  } = useCharacter();
  
  const [displayMode, setDisplayMode] = useState<'table' | 'cards' | 'raw'>('cards');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Загрузка персонажей при монтировании компонента
  useEffect(() => {
    console.log('CharactersListPage: Компонент загружен');
    
    if (isAuthenticated) {
      console.log('CharactersListPage: Пользователь авторизован:', user);
      loadCharacters();
    } else {
      console.log('CharactersListPage: Пользователь не авторизован');
    }
  }, [isAuthenticated, user]);

  // Функция загрузки персонажей
  const loadCharacters = async () => {
    try {
      console.log('CharactersListPage: Начинаем загрузку персонажей');
      setIsRefreshing(true);
      
      if (!isAuthenticated) {
        console.log('CharactersListPage: Пользователь не авторизован, прерываем загрузку');
        return;
      }
      
      await refreshCharacters();
      toast.success(`Персонажи успешно загружены`);
    } catch (err) {
      console.error('CharactersListPage: Ошибка при загрузке персонажей:', err);
      toast.error('Ошибка при загрузке персонажей');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Функция удаления персонажа
  const handleDeleteCharacter = async (id: string) => {
    try {
      console.log('CharactersListPage: Удаляем персонажа с ID:', id);
      await deleteCharacter(id);
      toast.success('Персонаж успешно удален');
      return Promise.resolve();
    } catch (err) {
      console.error('Ошибка при удалении персонажа:', err);
      toast.error('Не удалось удалить персонажа');
      return Promise.reject(err);
    }
  };

  // Переключатель режимов отображения
  const cycleDisplayMode = () => {
    if (displayMode === 'table') setDisplayMode('cards');
    else if (displayMode === 'cards') setDisplayMode('raw');
    else setDisplayMode('table');
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
          <CharactersHeader 
            username={user?.displayName || user?.username || ""} 
            characterCount={characters.length}
          />
          
          {/* Добавляем навигацию по страницам персонажей */}
          <CharacterNavigation />
          
          {/* Панель управления отображением и создания персонажа */}
          <div className="flex flex-wrap justify-between gap-3">
            {/* Кнопка создания нового персонажа */}
            <Button
              onClick={() => navigate('/character-creation')}
              className="gap-2"
              variant="default"
            >
              <UserPlus size={16} />
              Создать нового персонажа
            </Button>
            
            <div className="flex gap-2">
              {/* Кнопки переключения режима */}
              <div className="flex rounded-md overflow-hidden border">
                <Button
                  onClick={() => setDisplayMode('cards')}
                  size="sm"
                  variant={displayMode === 'cards' ? "default" : "ghost"}
                  className={`rounded-none ${displayMode === 'cards' ? "" : "bg-transparent"}`}
                  title="Режим карточек"
                >
                  <LayoutGrid size={16} />
                </Button>
                <Button
                  onClick={() => setDisplayMode('table')}
                  size="sm"
                  variant={displayMode === 'table' ? "default" : "ghost"}
                  className={`rounded-none ${displayMode === 'table' ? "" : "bg-transparent"}`}
                  title="Режим таблицы"
                >
                  <LayoutList size={16} />
                </Button>
                <Button
                  onClick={() => setDisplayMode('raw')}
                  size="sm"
                  variant={displayMode === 'raw' ? "default" : "ghost"}
                  className={`rounded-none ${displayMode === 'raw' ? "" : "bg-transparent"}`}
                  title="JSON данные"
                >
                  <FileJson size={16} />
                </Button>
              </div>
              
              <Button
                onClick={loadCharacters}
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

          {/* Информационная панель для отладки */}
          <Alert variant="outline" className="bg-blue-900/20 border-blue-500/50">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-200">Статус загрузки персонажей</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              <div>Загрузка: {loading ? "Да" : "Нет"}</div>
              <div>Обновление: {isRefreshing ? "Да" : "Нет"}</div>
              <div>Загружено персонажей: {characters.length}</div>
              {error && <div className="text-red-400">Ошибка: {error}</div>}
            </AlertDescription>
          </Alert>

          {/* Загрузка */}
          {loading && <LoadingState />}
          
          {/* Ошибка */}
          {error && !loading && (
            <ErrorDisplay 
              errorMessage={error}
              onRetry={loadCharacters}
            />
          )}
          
          {/* Показ данных в выбранном режиме */}
          {!loading && (
            <>
              {displayMode === 'raw' ? (
                <div className="p-4 bg-black/20 rounded-lg">
                  <h2 className="text-lg font-bold mb-4">Данные персонажей:</h2>
                  <pre className="whitespace-pre-wrap overflow-auto max-h-96 p-4 bg-gray-800 text-white rounded">
                    {JSON.stringify(characters, null, 2)}
                  </pre>
                </div>
              ) : displayMode === 'table' ? (
                <CharactersTable 
                  characters={characters}
                  onDelete={handleDeleteCharacter}
                />
              ) : (
                <div className="bg-transparent">
                  <CharacterCards
                    characters={characters}
                    onDelete={handleDeleteCharacter}
                  />
                </div>
              )}
              
              {/* Показываем информацию о количестве загруженных персонажей */}
              {!loading && characters.length > 0 && (
                <div className="mt-2 text-center text-muted-foreground text-sm">
                  Загружено персонажей: {characters.length}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </OBSLayout>
  );
};

export default CharactersListPage;
