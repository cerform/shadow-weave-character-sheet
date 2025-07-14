import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import CharactersTable from "@/components/characters/CharactersTable";
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import CharacterNavigation from '@/components/characters/CharacterNavigation';
import ErrorDisplay from '@/components/characters/ErrorDisplay';
import LoadingState from '@/components/characters/LoadingState';
import { toast } from 'sonner';
import { diagnoseCharacterLoading } from '@/utils/characterLoadingDebug';
import { debugCharacterLoading, inspectLocalStorage } from '@/utils/localStorageDebug';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const CharactersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { characters, loading, error, deleteCharacter, getUserCharacters } = useCharacter();
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  
  // Мемоизированные функции для предотвращения перерендеров
  const refreshCharacters = useCallback(async () => {
    try {
      setIsRefreshing(true);
      console.log('CharactersListPage: Начинаем обновление списка персонажей');
      await getUserCharacters();
      console.log('CharactersListPage: Список персонажей обновлен успешно');
    } catch (err) {
      console.error('CharactersListPage: Ошибка при обновлении списка персонажей:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      toast.error(`Ошибка при обновлении списка персонажей: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [getUserCharacters]);

  const debugLocalStorage = useCallback(async () => {
    try {
      console.log('CharactersListPage: Запуск отладки localStorage');
      inspectLocalStorage();
      
      if (user?.uid) {
        const debugResults = await debugCharacterLoading(user.uid);
        console.log('Результаты отладки:', debugResults);
        toast.success(`Найдено ${debugResults.userCharacters} персонажей пользователя (${debugResults.validCharacters} валидных)`);
      }
    } catch (error) {
      console.error('Ошибка отладки localStorage:', error);
      toast.error('Ошибка отладки localStorage');
    }
  }, [user?.uid]);

  const runDiagnostics = useCallback(async () => {
    try {
      console.log('CharactersListPage: Запуск диагностики');
      const results = await diagnoseCharacterLoading();
      console.log('CharactersListPage: Результаты диагностики:', results);
      setDiagnosticResults(results);
      
      if (!results.success) {
        toast.error('Диагностика выявила проблемы с загрузкой данных');
      }
    } catch (e) {
      console.error('CharactersListPage: Ошибка диагностики:', e);
    }
  }, []);

  // При монтировании компонента обновляем список персонажей
  useEffect(() => {
    let mounted = true;
    
    const loadCharacters = async () => {
      if (isAuthenticated && mounted) {
        console.log('CharactersListPage: Вызываем getUserCharacters напрямую в useEffect');
        try {
          setIsRefreshing(true);
          await getUserCharacters();
        } catch (err) {
          console.error('CharactersListPage: Ошибка при загрузке персонажей:', err);
          const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
          toast.error(`Ошибка при загрузке персонажей: ${errorMessage}`);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    loadCharacters();
    
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, getUserCharacters]);
  
  // Запускаем диагностику при возникновении ошибки с debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (error) {
      timeoutId = setTimeout(() => {
        runDiagnostics();
      }, 300);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [error, runDiagnostics]);
  
  const handleDeleteCharacter = useCallback(async (id: string) => {
    try {
      await deleteCharacter(id);
      console.log('CharactersListPage: Персонаж удален успешно');
    } catch (err) {
      console.error('CharactersListPage: Ошибка при удалении персонажа:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      toast.error(`Ошибка при удалении персонажа: ${errorMessage}`);
    }
  }, [deleteCharacter]);

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
            <h1 className="text-xl font-bold text-foreground">
              Персонажи
            </h1>
            <IconOnlyNavigation includeThemeSelector />
          </div>
        }
      >
        <div className="container mx-auto p-6 max-w-5xl">
          {/* Отладочная информация - миграция на Realtime Database */}
          <div className="mb-4 p-3 bg-green-900/20 border border-green-600/30 rounded-lg text-sm">
            <p className="text-green-400 font-bold">✅ Переключение на Realtime Database</p>
            <p><strong>Состояние загрузки:</strong> {loading ? 'Загружается...' : 'Завершено'}</p>
            <p><strong>Есть ошибка:</strong> {error ? 'Да' : 'Нет'}</p>
            <p><strong>Количество персонажей:</strong> {characters?.length || 0}</p>
            <p><strong>Авторизован:</strong> {isAuthenticated ? 'Да' : 'Нет'}</p>
            <p><strong>User ID:</strong> {user?.uid || 'Отсутствует'}</p>
            <p><strong>База данных:</strong> Realtime Database (https://shadow-char-default-rtdb.europe-west1.firebasedatabase.app/)</p>
            {error && <p><strong>Ошибка:</strong> {typeof error === 'string' ? error : (error as Error).message}</p>}
          </div>
          
          {/* Навигация по страницам персонажей */}
          <CharacterNavigation />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-accent">
              Список персонажей
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={debugLocalStorage}
              >
                🔍 Debug localStorage
              </Button>
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
          
          {/* Обработка состояния загрузки */}
          {loading && <LoadingState />}
          
          {/* Обработка ошибок */}
          {error && !loading && (
            <ErrorDisplay 
              errorMessage={typeof error === 'string' ? error : (error as Error).message} 
              onRetry={refreshCharacters} 
              technicalDetails={diagnosticResults}
            />
          )}
          
          {/* Отображение данных после загрузки */}
          {!loading && !error && (
            <>
              {/* Если есть результаты диагностики и они содержат ошибки */}
              {diagnosticResults && !diagnosticResults.success && (
                <Card className="mb-6 bg-muted border-muted-foreground/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <AlertTriangle size={18} />
                      Проблемы с загрузкой данных
                    </CardTitle>
                    <CardDescription>
                      Обнаружены потенциальные проблемы с доступом к данным
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{diagnosticResults.error}</p>
                    <pre className="whitespace-pre-wrap text-xs bg-muted/50 p-3 rounded max-h-40 overflow-auto">
                      {JSON.stringify(diagnosticResults.debug, null, 2)}
                    </pre>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" onClick={runDiagnostics}>
                      Повторить диагностику
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              <CharactersTable
                characters={characters || []}
                onDelete={handleDeleteCharacter}
              />
            </>
          )}
        </div>
      </OBSLayout>
    </ErrorBoundary>
  );
};

export default CharactersListPage;