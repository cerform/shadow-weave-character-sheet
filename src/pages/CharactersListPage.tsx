import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { getCharactersByUserId, deleteCharacter } from '@/services/characterService';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { getCurrentUserIdExtended } from '@/utils/authHelpers';
import { auth } from '@/services/firebase/auth';
import CharacterNavigation from '@/components/characters/CharacterNavigation';
import LoadingState from '@/components/characters/LoadingState';
import ErrorDisplay from '@/components/characters/ErrorDisplay';
import CharactersTable from '@/components/characters/CharactersTable';
import EmptyState from '@/components/characters/EmptyState';
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
  const [displayMode, setDisplayMode] = useState<'table' | 'raw' | 'test'>('table');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  
  // Загрузка персонажей при монтировании компонента
  useEffect(() => {
    console.log('CharactersListPage: Проверка авторизации пользователя');
    
    if (isAuthenticated && user) {
      console.log('CharactersListPage: Пользователь авторизован, загружаем персонажей');
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
      setError(null);
      
      // Используем расширенный метод получения userId
      const userId = user?.uid || user?.id || getCurrentUserIdExtended();
      console.log('CharactersListPage: Загрузка персонажей для пользователя:', userId);
      
      if (!userId) {
        console.error('CharactersListPage: ID пользователя отсутствует');
        setError('ID пользователя отсутствует');
        return;
      }
      
      // Создаём отладочную информацию
      const debug: DebugInfo = {
        userId,
        authCurrentUser: auth.currentUser ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          isAnonymous: auth.currentUser.isAnonymous,
          emailVerified: auth.currentUser.emailVerified
        } : null,
        query: {
          collection: "characters",
          filter: `userId == ${userId}`,
          whereClause: `where("userId", "==", "${userId}")`
        }
      };
      
      // Добавляем console.log перед запросом для отладки
      console.log('CharactersListPage: Отправляем запрос в Firestore с userId:', userId);
      
      const fetchedCharacters = await getCharactersByUserId(userId);
      console.log('CharactersListPage: Получено персонажей:', fetchedCharacters.length);
      
      // Обновляем отладочную информацию
      debug.snapshotSize = fetchedCharacters.length;
      debug.snapshotEmpty = fetchedCharacters.length === 0;
      debug.charactersCount = fetchedCharacters.length;
      debug.firstCharacter = fetchedCharacters.length > 0 ? {
        id: fetchedCharacters[0].id,
        name: fetchedCharacters[0].name,
        userId: fetchedCharacters[0].userId
      } : null;
      
      setDebugInfo(debug);
      
      // Добавляем немного отладочной информации
      if (fetchedCharacters.length > 0) {
        console.log('CharactersListPage: Первый персонаж:', fetchedCharacters[0]);
      } else {
        console.log('CharactersListPage: Персонажи не найдены');
      }
      
      setCharacters(fetchedCharacters);
      toast.success(`Загружено персонажей: ${fetchedCharacters.length}`);
    } catch (err) {
      console.error('CharactersListPage: Ошибка при загрузке персонажей:', err);
      setError(`Не удалось загрузить персонажей: ${err}`);
      toast.error('Ошибка при загрузке персонажей');
    } finally {
      setLoading(false);
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
        setCharacters(result.characters);
        toast.success(`Тестовая загрузка успешна: ${result.characters.length} персонажей`);
      } else {
        toast.error(result.message || 'Ошибка при тестовой загрузке');
      }
    } catch (err) {
      console.error('CharactersListPage: Ошибка при тестовой загрузке:', err);
      setError(`Ошибка при тестовой загрузке: ${err}`);
      toast.error('Ошибка при тестовой загрузке');
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

  // Переключатель режимов отображения
  const toggleDisplayMode = () => {
    setDisplayMode(mode => (mode === 'table' ? 'raw' : 'table'));
  };
  
  // Новая функция принудительного обновления с дополнительной диагностикой
  const forceRefresh = () => {
    toast.info('Обновляем список персонажей...');
    console.log('CharactersListPage: Принудительное обновление списка персонажей');
    console.log('CharactersListPage: Текущий пользователь:', user);
    console.log('CharactersListPage: Firebase auth currentUser:', auth.currentUser);
    
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
          
          {/* Панель управления отображением */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setDisplayMode(mode => mode === 'raw' ? 'table' : 'raw')}
              size="sm"
            >
              {displayMode === 'raw' ? "Показать таблицу" : "Показать сырые данные"}
            </Button>
            
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
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Обновить
            </Button>
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
          {!loading && !error && characters.length > 0 && (
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
                </div>
              ) : (
                <CharactersTable 
                  characters={characters}
                  onDelete={deleteCharacter}
                />
              )}
            </>
          )}

          {/* Пустое состояние */}
          {!loading && !error && characters.length === 0 && <EmptyState />}
        </div>
      </div>
    </OBSLayout>
  );
};

export default CharactersListPage;
