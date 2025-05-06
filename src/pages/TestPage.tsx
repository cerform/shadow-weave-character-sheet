
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Info, Database, User, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebase';
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

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{[key: string]: any}>({});
  const [characters, setCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTest, setActiveTest] = useState<string>('auth');
  const [testCollection, setTestCollection] = useState<any>(null);
  
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Тест соединения с Firebase - тестирует коллекцию tests
  const testFirebaseConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => ({ ...prev, connection: 'Тестирование соединения...' }));
      
      // Сначала проверяем с коллекцией tests, которая должна быть доступна для чтения
      const testCollectionRef = collection(db, 'tests');
      const testQuery = query(testCollectionRef, limit(1));
      
      try {
        const testSnap = await getDocs(testQuery);
        setTestCollection({
          exists: !testSnap.empty,
          count: testSnap.size,
          data: testSnap.empty ? null : testSnap.docs[0].data()
        });
        
        setResults(prev => ({ 
          ...prev, 
          connection: `Соединение работает! Collection 'tests': ${testSnap.size} документов`
        }));
      } catch (testError) {
        console.error('Ошибка при чтении коллекции tests:', testError);
        
        // Если tests недоступна, пробуем spells (которая должна быть доступна для чтения всем)
        try {
          const spellsRef = collection(db, 'spells');
          const spellsQuery = query(spellsRef, limit(1));
          const spellsSnap = await getDocs(spellsQuery);
          
          setResults(prev => ({ 
            ...prev, 
            connection: `Соединение работает! Collection 'spells': ${spellsSnap.size} документов`
          }));
        } catch (spellsError) {
          throw new Error(`Не удалось прочитать ни 'tests', ни 'spells': ${spellsError}`);
        }
      }
    } catch (err) {
      console.error('Ошибка соединения с Firebase:', err);
      setError(`Ошибка соединения с Firebase: ${err}`);
      setResults(prev => ({ ...prev, connection: 'ОШИБКА: Не удалось соединиться с Firebase' }));
    } finally {
      setLoading(false);
    }
  };
  
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

  // Тест загрузки персонажей с новыми правилами безопасности
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

  // Запускаем тест автоматически при открытии страницы
  useEffect(() => {
    testAuth();
  }, [isAuthenticated, user]);
  
  // Отображение результатов в зависимости от выбранной вкладки
  const renderResults = () => {
    switch(activeTest) {
      case 'auth':
        return (
          <div className="space-y-4">
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
          </div>
        );
        
      case 'characters':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Персонажи пользователя</h3>
              <Button 
                onClick={testCharacters} 
                disabled={loading} 
                variant="secondary"
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle size={16} />}
                Загрузить персонажей
              </Button>
            </div>

            {results.characters && (
              <Alert variant={results.characters.includes('ОШИБКА') ? 'destructive' : 'default'} className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Результат</AlertTitle>
                <AlertDescription>
                  {results.characters}
                </AlertDescription>
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

            {results.charactersData && (
              <Card className="overflow-hidden border-primary/20 bg-card/30 backdrop-blur-sm">
                <CardHeader className="bg-primary/10 pb-2">
                  <CardTitle className="flex items-center gap-2 text-primary text-sm">
                    <Database size={16} />
                    Данные персонажей
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-80 p-3 bg-black/40 rounded border border-primary/10">
                    {JSON.stringify(results.charactersData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

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
          </div>
        );
        
      case 'connection':
        return (
          <div className="space-y-4">
            <Card className="overflow-hidden border-primary/20 bg-card/30 backdrop-blur-sm">
              <CardHeader className="bg-primary/10 pb-3">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Database size={18} />
                  Статус соединения
                </CardTitle>
                <CardDescription>
                  Проверка соединения с базой данных Firebase
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {results.connection ? (
                  <Alert variant={results.connection.includes('ОШИБКА') ? 'destructive' : 'default'}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Результат</AlertTitle>
                    <AlertDescription>
                      {results.connection}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="mx-auto h-10 w-10 mb-3 opacity-50" />
                    <p>Запустите тест для проверки соединения</p>
                  </div>
                )}

                {testCollection && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Тестовая коллекция:</h4>
                    <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-80 p-3 bg-black/40 rounded border border-primary/10">
                      {JSON.stringify(testCollection, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-primary/5 flex justify-end pt-3 border-t border-primary/10">
                <Button 
                  onClick={testFirebaseConnection} 
                  disabled={loading} 
                  variant="secondary"
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database size={16} />}
                  Проверить соединение с Firebase
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <Card className="bg-gradient-to-br from-gray-800/60 to-black/80 border-primary/20 backdrop-blur-md mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-white">
              Тест загрузки персонажей
            </CardTitle>
            <Button variant="outline" onClick={() => navigate('/')} className="border-white/20 hover:bg-white/10">
              Назад на главную
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">Инструмент для отладки и тестирования функций приложения</p>
        </CardContent>
      </Card>

      {!isAuthenticated && (
        <Alert variant="destructive" className="mb-6 bg-red-900/30 border border-red-700/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Вы не авторизованы</AlertTitle>
          <AlertDescription className="flex flex-wrap gap-2 items-center">
            Для работы с персонажами необходимо авторизоваться.
            <Button variant="secondary" onClick={() => navigate('/auth')} className="ml-auto">
              Авторизоваться
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-6 border-primary/20 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-primary/10 pb-3">
          <CardTitle>Панель тестов</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={activeTest} onValueChange={setActiveTest} className="w-full">
            <TabsList className="mb-6 w-full justify-start bg-black/20">
              <TabsTrigger value="auth" className="data-[state=active]:bg-primary/30">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  Аутентификация
                </div>
              </TabsTrigger>
              <TabsTrigger value="characters" className="data-[state=active]:bg-primary/30">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  Персонажи
                </div>
              </TabsTrigger>
              <TabsTrigger value="connection" className="data-[state=active]:bg-primary/30">
                <div className="flex items-center gap-2">
                  <Database size={16} />
                  Соединение
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTest}>
              {renderResults()}
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded">
              <strong className="flex items-center gap-2">
                <AlertCircle size={16} />
                Ошибка:
              </strong> 
              <p className="mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-primary/20 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-primary/10 pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            Советы по отладке Firestore Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3 list-disc pl-5">
            <li className="text-white/90">Убедитесь, что вы авторизованы в системе</li>
            <li className="text-white/90">Проверьте, что у вас есть персонажи в коллекции 'characters'</li>
            <li className="text-white/90">Проверьте, что у персонажей правильно указан userId, совпадающий с вашим id</li>
            <li className="text-white/90">
              <strong>Firestore Rules для списка документов:</strong><br/>
              <code className="bg-black/30 p-1 rounded inline-block mt-1 text-green-400 border border-green-900/30">
                allow list: if request.auth != null && request.query.where('userId', '==', request.auth.uid);
              </code>
            </li>
            <li className="text-white/90">
              <strong>Это значит:</strong> для запросов списка персонажей (list) 
              нужен явный фильтр where('userId', '==', userId)
            </li>
            <li className="text-white/90">Проверьте в консоли, что запрос содержит этот фильтр</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;
