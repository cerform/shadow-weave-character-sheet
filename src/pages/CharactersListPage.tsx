
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, UserPlus, LayoutGrid, LayoutList, FileJson, Bug, AlertCircle } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { getCharactersByUserId, deleteCharacter, getAllCharacters } from '@/services/characterService';
import { Character } from '@/types/character';
import { toast } from 'sonner';
import { getCurrentUserIdExtended, getCurrentUid } from '@/utils/authHelpers';
import { getAuth } from 'firebase/auth';
import CharacterNavigation from '@/components/characters/CharacterNavigation';
import LoadingState from '@/components/characters/LoadingState';
import ErrorDisplay from '@/components/characters/ErrorDisplay';
import CharactersTable from '@/components/characters/CharactersTable';
import CharacterCards from '@/components/characters/CharacterCards';
import CharactersHeader from '@/components/characters/CharactersHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; 
import EmptyState from '@/components/characters/EmptyState';

// Интерфейс для диагностической информации
interface DiagnosticInfo {
  userId: string | null;
  currentAuth: {
    uid: string | null;
    email: string | null;
    isAuthenticated: boolean;
  };
  userState: {
    uid?: string | null;
    id?: string | null;
    email?: string | null;
    displayName?: string | null;
  };
  localStorage: {
    authUser: any;
    lastSelectedCharacter: string | null;
  };
}

const CharactersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, currentUser } = useAuth();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'table' | 'cards' | 'raw' | 'debug'>('cards');
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Загрузка персонажей при монтировании компонента
  useEffect(() => {
    console.log('CharactersListPage: Компонент загружен');
    
    // Собираем диагностическую информацию
    collectDiagnosticInfo();
    
    if (isAuthenticated) {
      console.log('CharactersListPage: Пользователь авторизован:', user);
      loadCharacters();
    } else {
      console.log('CharactersListPage: Пользователь не авторизован');
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Функция для сбора диагностической информации
  const collectDiagnosticInfo = () => {
    try {
      // Получаем Firebase Auth
      const firebaseAuth = getAuth();
      
      // Локальное хранилище
      let localStorageAuth = null;
      let lastSelectedCharacter = null;
      try {
        const authUserStr = localStorage.getItem('authUser');
        if (authUserStr) {
          localStorageAuth = JSON.parse(authUserStr);
        }
        lastSelectedCharacter = localStorage.getItem('last-selected-character');
      } catch (e) {
        console.error('Ошибка при чтении из localStorage:', e);
      }
      
      const diagnostic: DiagnosticInfo = {
        userId: getCurrentUid() || getCurrentUserIdExtended(),
        currentAuth: {
          uid: firebaseAuth.currentUser?.uid || null,
          email: firebaseAuth.currentUser?.email || null,
          isAuthenticated: !!firebaseAuth.currentUser
        },
        userState: {
          uid: user?.uid || null,
          id: user?.id || null,
          email: user?.email || null,
          displayName: user?.displayName || null
        },
        localStorage: {
          authUser: localStorageAuth,
          lastSelectedCharacter
        }
      };
      
      setDiagnosticInfo(diagnostic);
      console.log('CharactersListPage: Диагностика:', diagnostic);
      
    } catch (err) {
      console.error('Ошибка при сборе диагностической информации:', err);
    }
  };

  // Функция загрузки персонажей
  const loadCharacters = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      setError(null);
      
      // Получаем ID пользователя несколькими способами для надежности
      const userId = user?.uid || user?.id || getCurrentUserIdExtended();
      console.log('CharactersListPage: Загрузка персонажей для пользователя:', userId);
      
      if (!userId) {
        console.error('CharactersListPage: ID пользователя отсутствует');
        setError('ID пользователя отсутствует');
        setLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      try {
        // Используем обе функции для загрузки персонажей
        console.log('CharactersListPage: Пробуем загрузить напрямую через getCharactersByUserId');
        const fetchedCharacters = await getCharactersByUserId(userId);
        
        // Если первый метод не вернул персонажей, используем запасной
        if (!fetchedCharacters || fetchedCharacters.length === 0) {
          console.log('CharactersListPage: Персонажи не найдены, пробуем через getAllCharacters');
          // Попытка загрузить через getAllCharacters
          const allCharacters = await getAllCharacters();
          
          if (allCharacters && allCharacters.length > 0) {
            console.log('CharactersListPage: Найдены персонажи через getAllCharacters:', allCharacters.length);
            setCharacters(allCharacters);
            toast.success(`Загружено персонажей: ${allCharacters.length}`);
          } else {
            console.log('CharactersListPage: Персонажи не найдены обоими методами');
            setCharacters([]);
          }
        } else {
          console.log('CharactersListPage: Получено персонажей через getCharactersByUserId:', fetchedCharacters.length);
          
          // Фильтруем некорректные данные
          const validCharacters = fetchedCharacters.filter(char => {
            if (!char || !char.id) {
              console.warn('Некорректный персонаж в результате запроса:', char);
              return false;
            }
            return true;
          });
          
          setCharacters(validCharacters);
          toast.success(`Загружено персонажей: ${validCharacters.length}`);
        }
      } catch (fetchError) {
        console.error('CharactersListPage: Ошибка при загрузке персонажей:', fetchError);
        setError(`Не удалось загрузить персонажей: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
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
    else if (displayMode === 'raw') setDisplayMode('debug');
    else setDisplayMode('table');
  };
  
  // Принудительное обновление с дополнительной диагностикой
  const forceRefresh = () => {
    toast.info('Обновляем список персонажей...');
    console.log('CharactersListPage: Принудительное обновление списка персонажей');
    
    // Обновляем диагностическую информацию
    collectDiagnosticInfo();
    
    // Загружаем персонажей
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
                <Button
                  onClick={() => setDisplayMode('debug')}
                  size="sm"
                  variant={displayMode === 'debug' ? "default" : "ghost"}
                  className={`rounded-none ${displayMode === 'debug' ? "" : "bg-transparent"}`}
                  title="Диагностика"
                >
                  <Bug size={16} />
                </Button>
              </div>
              
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
          
          {/* Информационное сообщение для отладки */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Информация о пользователе</AlertTitle>
            <AlertDescription>
              User ID: {user?.uid || user?.id || '<нет>'} | 
              Auth: {isAuthenticated ? 'Да' : 'Нет'} | 
              Метод: getCharactersByUserId с where фильтром
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
          
          {/* Пустое состояние */}
          {!loading && !error && characters.length === 0 && (
            <EmptyState />
          )}
          
          {/* Показ данных в выбранном режиме */}
          {!loading && !error && characters.length > 0 && (
            <>
              {displayMode === 'raw' ? (
                <div className="p-4 bg-black/20 rounded-lg">
                  <h2 className="text-lg font-bold mb-4">Данные персонажей:</h2>
                  <pre className="whitespace-pre-wrap overflow-auto max-h-96 p-4 bg-gray-800 text-white rounded">
                    {JSON.stringify(characters, null, 2)}
                  </pre>
                </div>
              ) : displayMode === 'debug' ? (
                <div className="p-4 bg-black/20 rounded-lg">
                  <h2 className="text-lg font-bold mb-4">Диагностическая информация:</h2>
                  
                  <div className="space-y-4">
                    {/* Информация о пользователе */}
                    <div>
                      <h3 className="text-md font-semibold mb-2">Пользователь:</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/30 p-2 rounded">
                          <strong>user?.uid:</strong> {user?.uid || '<нет>'}
                        </div>
                        <div className="bg-black/30 p-2 rounded">
                          <strong>user?.id:</strong> {user?.id || '<нет>'}
                        </div>
                        <div className="bg-black/30 p-2 rounded">
                          <strong>getCurrentUid():</strong> {getCurrentUid() || '<нет>'}
                        </div>
                        <div className="bg-black/30 p-2 rounded">
                          <strong>getCurrentUserIdExtended():</strong> {getCurrentUserIdExtended() || '<нет>'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Детальная информация */}
                    {diagnosticInfo && (
                      <div>
                        <h3 className="text-md font-semibold mb-2">Полная диагностика:</h3>
                        <pre className="whitespace-pre-wrap overflow-auto max-h-96 p-4 bg-gray-800 text-white rounded text-xs">
                          {JSON.stringify(diagnosticInfo, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
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
