
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, UserPlus, LayoutGrid, LayoutList, FileJson } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { getCharactersByUserId, deleteCharacter } from '@/services/characterService';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { getCurrentUserIdExtended } from '@/utils/authHelpers';
import { getAuth } from 'firebase/auth';
import CharacterNavigation from '@/components/characters/CharacterNavigation';
import LoadingState from '@/components/characters/LoadingState';
import ErrorDisplay from '@/components/characters/ErrorDisplay';
import CharactersTable from '@/components/characters/CharactersTable';
import CharacterCards from '@/components/characters/CharacterCards';
import CharactersHeader from '@/components/characters/CharactersHeader';
import { testLoadCharacters } from '@/services/firebase/firestore-test';

// Интерфейс для отладочной информации с нужными полями
interface DebugInfo {
  userId: string;
  authCurrentUser: {
    uid: any;
    email: any;
    isAnonymous: any;
    emailVerified: any;
  } | null;
  query: {
    collection: string;
    filter: string;
    whereClause: string;
  };
  snapshotSize?: number;
  snapshotEmpty?: boolean;
  charactersCount?: number;
  firstCharacter?: {
    id: string;
    name: string;
    userId: string;
  } | null;
}

const CharactersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'table' | 'cards' | 'raw' | 'test'>('cards');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Загрузка персонажей при монтировании компонента
  useEffect(() => {
    console.log('CharactersListPage: Компонент загружен');
    
    if (isAuthenticated && user) {
      console.log('CharactersListPage: Пользователь авторизован:', user);
      loadCharacters();
    } else {
      console.log('CharactersListPage: Пользователь не авторизован');
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Функция загрузки персонажей
  const loadCharacters = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setError(null);
      
      // Получаем ID пользователя
      const userId = user?.uid || user?.id || getCurrentUserIdExtended();
      console.log('CharactersListPage: Загрузка персонажей для пользователя:', userId);
      
      if (!userId) {
        console.error('CharactersListPage: ID пользователя отсутствует');
        setError('ID пользователя отсутствует');
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      // Получаем Firebase Auth
      const firebaseAuth = getAuth();
      
      // Создаём отладочную информацию
      const debug: DebugInfo = {
        userId,
        authCurrentUser: firebaseAuth.currentUser ? { 
          uid: firebaseAuth.currentUser.uid,
          email: firebaseAuth.currentUser.email,
          isAnonymous: firebaseAuth.currentUser.isAnonymous,
          emailVerified: firebaseAuth.currentUser.emailVerified
        } : null,
        query: {
          collection: "characters",
          filter: `userId == ${userId}`,
          whereClause: `where("userId", "==", "${userId}")`
        }
      };
      
      console.log('CharactersListPage: Отправляем запрос в Firestore с userId:', userId);
      
      try {
        const fetchedCharacters = await getCharactersByUserId(userId);
        console.log('CharactersListPage: Получено персонажей:', fetchedCharacters.length);
        
        // Добавляем дополнительные проверки на корректность данных
        const validCharacters = fetchedCharacters.filter(char => {
          if (!char || !char.id) {
            console.warn('Некорректный персонаж в результате запроса:', char);
            return false;
          }
          return true;
        });
        
        // Обновляем отладочную информацию
        debug.snapshotSize = fetchedCharacters.length;
        debug.snapshotEmpty = fetchedCharacters.length === 0;
        debug.charactersCount = validCharacters.length;
        debug.firstCharacter = validCharacters.length > 0 ? {
          id: validCharacters[0].id,
          name: validCharacters[0].name || 'Без имени',
          userId: validCharacters[0].userId || userId
        } : null;
        
        setDebugInfo(debug);
        
        // Добавляем отладочной информации в консоль
        if (validCharacters.length > 0) {
          console.log('CharactersListPage: Первый персонаж:', validCharacters[0]);
        } else {
          console.log('CharactersListPage: Персонажи не найдены или некорректны');
        }
        
        setCharacters(validCharacters);
        toast.success(`Загружено персонажей: ${validCharacters.length}`);
      } catch (fetchError) {
        console.error('CharactersListPage: Ошибка при загрузке персонажей из Firestore:', fetchError);
        setError(`Не удалось загрузить персонажей: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        
        // Добавляем больше информации в отладочные данные
        debug.snapshotEmpty = true;
        debug.charactersCount = 0;
        debug.firstCharacter = null;
        setDebugInfo(debug);
      }
    } catch (err) {
      console.error('CharactersListPage: Общая ошибка при загрузке персонажей:', err);
      setError(`Не удалось загрузить персонажей: ${err instanceof Error ? err.message : String(err)}`);
      toast.error('Ошибка при загрузке персонажей');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Функция для запуска тестовой загрузки персонажей
  const runTestLoad = async () => {
    try {
      setLoading(true);
      setError(null);
      setDisplayMode('test');
      
      console.log('CharactersListPage: Запускаем тестовую загрузку персонажей...');
      const result = await testLoadCharacters();
      
      setTestResults(result);
      
      if (result.success && result.characters.length > 0) {
        // Проверяем каждого персонажа на корректность
        const validCharacters = result.characters.filter(char => {
          if (!char || !char.id) {
            console.warn('Некорректный персонаж в результатах теста:', char);
            return false;
          }
          return true;
        });
        
        setCharacters(validCharacters);
        toast.success(`Тестовая загрузка успешна: ${validCharacters.length} персонажей`);
      } else {
        toast.error(result.message || 'Ошибка при тестовой загрузке');
      }
    } catch (err) {
      console.error('CharactersListPage: Ошибка при тестовой загрузке:', err);
      setError(`Ошибка при тестовой загрузке: ${err instanceof Error ? err.message : String(err)}`);
      toast.error('Ошибка при тестовой загрузке');
    } finally {
      setLoading(false);
    }
  };

  // Функция удаления персонажа
  const handleDeleteCharacter = async (id: string) => {
    try {
      console.log('CharactersListPage: Удаляем персонажа с ID:', id);
      await deleteCharacter(id);
      
      // Обновляем список персонажей
      setCharacters(prevChars => prevChars.filter(char => char.id !== id));
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
  
  // Новая функция принудительного обновления с дополнительной диагностикой
  const forceRefresh = () => {
    toast.info('Обновляем список персонажей...');
    console.log('CharactersListPage: Принудительное обновление списка персонажей');
    console.log('CharactersListPage: Текущий пользователь:', user);
    console.log('CharactersListPage: Firebase auth currentUser:', getAuth().currentUser);
    
    loadCharacters();
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
                onClick={runTestLoad}
                size="sm"
                className="gap-2"
                variant="secondary"
              >
                Тестовая загрузка
              </Button>
              
              <Button
                onClick={forceRefresh}
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={isRefreshing}
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                Обновить
              </Button>
            </div>
          </div>
          
          {/* Загрузка */}
          {loading && <LoadingState />}
          
          {/* Ошибка */}
          {error && !loading && (
            <ErrorDisplay 
              errorMessage={error}
              onRetry={loadCharacters}
            />
          )}
          
          {/* Показ данных или таблица */}
          {!loading && !error && (
            <>
              {displayMode === 'raw' ? (
                <div className="p-4 bg-black/20 rounded-lg">
                  <h2 className="text-lg font-bold mb-4">Данные персонажей:</h2>
                  <pre className="whitespace-pre-wrap overflow-auto max-h-96 p-4 bg-gray-800 text-white rounded">
                    {JSON.stringify(characters, null, 2)}
                  </pre>
                  
                  {debugInfo && (
                    <div className="mt-4">
                      <h3 className="text-md font-bold mb-2">Отладочная информация:</h3>
                      <pre className="whitespace-pre-wrap overflow-auto max-h-96 p-4 bg-gray-800 text-white rounded text-xs">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : displayMode === 'test' ? (
                <div className="p-4 bg-black/20 rounded-lg">
                  <h2 className="text-lg font-bold mb-4">Результаты тестовой загрузки:</h2>
                  
                  {testResults && (
                    <pre className="whitespace-pre-wrap overflow-auto max-h-96 p-4 bg-gray-800 text-white rounded">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  )}
                  
                  {characters && characters.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-bold mb-2">Загруженные персонажи:</h3>
                      <CharacterCards
                        characters={characters}
                        onDelete={handleDeleteCharacter}
                      />
                    </div>
                  )}
                </div>
              ) : displayMode === 'cards' ? (
                <CharacterCards
                  characters={characters}
                  onDelete={handleDeleteCharacter}
                />
              ) : (
                <CharactersTable 
                  characters={characters}
                  onDelete={handleDeleteCharacter}
                />
              )}
              
              {/* Показываем информацию о количестве загруженных персонажей */}
              {!loading && !error && characters && characters.length > 0 && (
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
