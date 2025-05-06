
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Info, Database, User, Shield, CheckCircle, AlertCircle, FileText, Users, RefreshCw } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase'; // Используем централизованный импорт
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUid } from '@/utils/authHelpers';
import { Character } from '@/types/character';
import { testLoadCharacters, getCurrentUserDetails } from '@/services/firebase/firestore-test';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { SelectionCard } from '@/components/ui/selection-card';
import { Badge } from "@/components/ui/badge";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import CharactersPageDebugger from '@/components/debug/CharactersPageDebugger';
import { useCharacter } from '@/contexts/CharacterContext';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import OBSLayout from '@/components/OBSLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  // Явно используем хук useAuth для проверки авторизации
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{[key: string]: any}>({});
  const [characters, setCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('characters');
  const [testCollection, setTestCollection] = useState<any>(null);
  const { getUserCharacters: refreshCharactersContext, deleteCharacter } = useCharacter();
  
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Загружаем персонажей при монтировании компонента
  // Добавляем зависимость от authLoading, чтобы запускать загрузку, когда завершится проверка аутентификации
  useEffect(() => {
    // Если процесс проверки авторизации все еще идет, не запускаем загрузку персонажей
    if (authLoading) {
      console.log('TestPage: Ждем завершения проверки авторизации');
      return;
    }
    
    // Загружаем персонажей только для авторизованных пользователей
    if (isAuthenticated) {
      console.log('TestPage: Пользователь авторизован, загружаем персонажей');
      testCharacters();
    } else {
      console.log('TestPage: Пользователь не авторизован');
    }
  }, [isAuthenticated, authLoading]);
  
  // Тест аутентификации
  const testAuth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Проверяем текущую авторизацию
      const userDetails = getCurrentUserDetails();
      const currentAuth = { 
        isAuthenticated, 
        uid: userDetails.uid, 
        user: user ? {
          id: user.id || user.uid,
          email: user.email,
          displayName: user.displayName,
        } : null 
      };
      
      setResults(prev => ({ ...prev, auth: currentAuth }));
    } catch (err) {
      console.error('Ошибка получения данных аутентификации:', err);
      setError(`Ошибка получения данных аутентификации: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка персонажей через тестовый сервис
  const testCharacters = async () => {
    setLoading(true);
    setError(null);
    setCharacters([]);
    
    try {
      setResults(prev => ({ ...prev, characters: 'Загрузка персонажей...' }));
      
      // Используем новую утилиту для тестирования
      const result = await testLoadCharacters();
      
      // Обновляем состояние на основе результата
      if (result.success) {
        setCharacters(result.characters);
        setResults(prev => ({ 
          ...prev, 
          characters: result.message,
          charactersData: result.characters.map(char => ({
            id: char.id,
            name: char.name,
            className: char.className || char.class,
            userId: char.userId
          })),
          debug: result.debug
        }));
      } else {
        setError(result.message);
        setResults(prev => ({ 
          ...prev, 
          characters: `ОШИБКА: ${result.message}`,
          debug: result.debug
        }));
      }
    } catch (err) {
      console.error('Ошибка загрузки персонажей:', err);
      setError(`Ошибка загрузки персонажей: ${err}`);
      setResults(prev => ({ ...prev, characters: `ОШИБКА: ${err}` }));
    } finally {
      setLoading(false);
    }
  };
  
  // Обновление персонажей через контекст
  const handleRefreshCharacters = async () => {
    if (refreshCharactersContext) {
      setLoading(true);
      try {
        await refreshCharactersContext();
        testCharacters(); // Обновляем список через тестовый сервис тоже
      } catch (error) {
        console.error("Ошибка при обновлении персонажей:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Удаление персонажа
  const handleDeleteCharacter = async (id: string) => {
    if (!deleteCharacter) return;
    
    const confirmDelete = window.confirm("Вы действительно хотите удалить этого персонажа?");
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      await deleteCharacter(id);
      // Обновляем список персонажей после удаления
      testCharacters();
    } catch (error) {
      console.error("Ошибка при удалении персонажа:", error);
      setError(`Ошибка при удалении персонажа: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Если пользователь не авторизован, и проверка авторизации завершена, предлагаем авторизоваться
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-background to-background/80">
        <div className="max-w-md text-center p-6">
          <h1 className="text-3xl font-bold mb-6">Требуется авторизация</h1>
          <p className="mb-8">Для доступа к персонажам необходимо войти в систему</p>
          <Button 
            onClick={() => navigate('/auth', { state: { returnPath: '/test-characters' } })}
            className="w-full"
          >
            Войти
          </Button>
        </div>
      </div>
    );
  }

  // Показываем загрузку, пока проверяется авторизация
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Проверка авторизации...</p>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <OBSLayout
        topPanelContent={
          <div className="flex justify-between items-center p-3">
            <h1 className="text-xl font-bold" style={{ color: currentTheme.textColor }}>
              Персонажи (Альт. версия)
            </h1>
            <IconOnlyNavigation includeThemeSelector />
          </div>
        }
      >
        <div className="container mx-auto p-6">
          {/* Отладчик страницы персонажей */}
          <CharactersPageDebugger />
          
          <Card className="bg-gradient-to-br from-gray-800/60 to-black/80 border-primary/20 backdrop-blur-md mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-white">
                  <Users className="inline-block mr-2" />
                  Список персонажей
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshCharacters}
                    disabled={loading}
                    className="border-white/20 hover:bg-white/10"
                  >
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Обновить
                  </Button>
                  <Button
                    onClick={() => navigate('/character-creation')}
                    size="sm"
                  >
                    Создать персонажа
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">Альтернативный список ваших персонажей</p>
              
              {/* Показываем индикатор загрузки, если данные загружаются */}
              {loading && (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 w-full justify-start bg-black/20">
                  <TabsTrigger value="characters" className="data-[state=active]:bg-primary/30">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Персонажи
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="auth" className="data-[state=active]:bg-primary/30">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Аутентификация
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="debug" className="data-[state=active]:bg-primary/30">
                    <div className="flex items-center gap-2">
                      <Database size={16} />
                      Отладка
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="characters">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Ошибка</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {characters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {characters.map(char => (
                        <SelectionCard
                          key={char.id}
                          title={char.name || 'Без имени'}
                          description={`${char.className || char.class || 'Без класса'} - ${char.race || 'Раса не указана'}`}
                          selected={false}
                          className="cursor-default hover:scale-[1.02] transition"
                          badges={
                            <>
                              <Badge variant="secondary" className="bg-primary/20">
                                Уровень {char.level || 1}
                              </Badge>
                            </>
                          }
                          actionButtons={
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => navigate(`/character/${char.id}`)}
                                title="Открыть персонажа"
                              >
                                <Info size={18} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteCharacter(char.id)}
                                title="Удалить персонажа"
                                className="text-destructive hover:text-destructive/80"
                              >
                                <AlertCircle size={18} />
                              </Button>
                            </div>
                          }
                          onClick={() => navigate(`/character/${char.id}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="bg-card/20 border-dashed border-primary/20">
                      <CardContent className="text-center py-12">
                        {loading ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Загрузка персонажей...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">Персонажи не найдены</p>
                            <Button 
                              onClick={testCharacters}
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              Попробовать загрузить
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="auth">
                  <Card className="overflow-hidden border-primary/20 bg-card/30 backdrop-blur-sm">
                    <CardHeader className="bg-primary/10 pb-3">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <User size={18} />
                        Статус аутентификации
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {results.auth ? (
                        <div>
                          <div className="mb-3 flex items-center">
                            <Badge variant={results.auth.isAuthenticated ? "success" : "destructive"} className="mr-2">
                              {results.auth.isAuthenticated ? "Авторизован" : "Не авторизован"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              ID: {results.auth.uid || 'Отсутствует'}
                            </span>
                          </div>
                          <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-96 p-3 bg-black/40 rounded border border-primary/10">
                            {JSON.stringify(results.auth, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Info className="mx-auto h-10 w-10 mb-3 opacity-50" />
                          <p>Запустите тест для просмотра данных</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="bg-primary/5 flex justify-end pt-3 border-t border-primary/10">
                      <Button 
                        onClick={testAuth} 
                        disabled={loading} 
                        variant="secondary"
                        className="gap-2"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User size={16} />}
                        Проверить аутентификацию
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="debug">
                  <Card className="overflow-hidden border-primary/20 bg-card/30 backdrop-blur-sm mb-4">
                    <CardHeader className="bg-primary/10 pb-2">
                      <CardTitle className="flex items-center gap-2 text-primary text-sm">
                        <Database size={16} />
                        Данные персонажей
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-80 p-3 bg-black/40 rounded border border-primary/10">
                        {JSON.stringify(results.charactersData || [], null, 2)}
                      </pre>
                    </CardContent>
                  </Card>

                  {results.debug && (
                    <Card className="overflow-hidden border-primary/20 bg-card/30 backdrop-blur-sm">
                      <CardHeader className="bg-primary/10 pb-2">
                        <CardTitle className="flex items-center gap-2 text-primary text-sm">
                          <AlertCircle size={16} />
                          Отладочная информация
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-3">
                        <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-80 p-3 bg-black/40 rounded border border-primary/10">
                          {JSON.stringify(results.debug, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 bg-card/30 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-primary/10 pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                Документация по новым правилам Firestore
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="bg-black/20 p-4 rounded mb-4 border border-primary/20">
                <h3 className="font-medium mb-2 text-lg">Текущие правила:</h3>
                <pre className="whitespace-pre-wrap text-xs bg-black/40 p-3 rounded border border-primary/10">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ⚔️ Персонажи: доступ только к своим персонажам
    match /characters/{characterId} {
      // 📥 Читать документ (get): только свои
      allow get: if request.auth != null
              && resource.data.userId == request.auth.uid;

      // 📋 Получить список документов (list): только авторизованным (фильтрация в коде)
      allow list: if request.auth != null;

      // ✍️ Создание: только от своего имени
      allow create: if request.auth != null
                  && request.auth.uid == request.resource.data.userId;
    }
  }
}`}
                </pre>
              </div>
              
              <div className="space-y-3">
                <div className="bg-green-900/20 p-3 rounded border border-green-700/30">
                  <h4 className="font-medium flex items-center gap-2 mb-1">
                    <CheckCircle size={18} className="text-green-400" />
                    Работающий доступ
                  </h4>
                  <p className="text-sm">
                    Авторизованные пользователи теперь имеют доступ к получению списка всех персонажей (list),
                    но фильтрация по userId должна выполняться на стороне клиента.
                  </p>
                </div>
                
                <div className="bg-amber-900/20 p-3 rounded border border-amber-700/30">
                  <h4 className="font-medium flex items-center gap-2 mb-1">
                    <AlertCircle size={18} className="text-amber-400" />
                    Важно для разработки
                  </h4>
                  <p className="text-sm">
                    В коде должна выполняться проверка, чтобы пользователь видел только своих персонажей.
                    Не полагайтесь на правила безопасности Firestore для фильтрации данных.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5 border-t border-primary/10 flex justify-between">
              <Button variant="ghost" onClick={() => navigate('/characters')}>
                Стандартная страница персонажей
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                На главную
              </Button>
            </CardFooter>
          </Card>
        </div>
      </OBSLayout>
    </ErrorBoundary>
  );
};

export default TestPage;

