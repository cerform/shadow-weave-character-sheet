
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUid } from '@/utils/authHelpers';
import { Character } from '@/types/character';

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{[key: string]: any}>({});
  const [characters, setCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTest, setActiveTest] = useState<string>('auth');
  
  // Тест соединения с Firebase
  const testFirebaseConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      setResults(prev => ({ ...prev, connection: 'Тестирование соединения...' }));
      
      // Проверяем, можем ли получить хотя бы один документ из любой коллекции
      const testCollectionRef = collection(db, 'tests');
      const testQuery = await getDocs(testCollectionRef);
      
      setResults(prev => ({ 
        ...prev, 
        connection: `Соединение работает! Получено документов: ${testQuery.size}` 
      }));
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
      const uid = getCurrentUid();
      const currentAuth = { 
        isAuthenticated, 
        uid, 
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

  // Тест загрузки персонажей напрямую из Firestore
  const testCharacters = async () => {
    setLoading(true);
    setError(null);
    setCharacters([]);
    
    try {
      setResults(prev => ({ ...prev, characters: 'Загрузка персонажей...' }));
      
      // Получаем ID пользователя
      const userId = user?.uid || user?.id;
      
      if (!userId) {
        throw new Error('ID пользователя отсутствует');
      }
      
      // Получаем персонажей
      const charactersCollection = collection(db, 'characters');
      const charactersQuery = query(charactersCollection, where('userId', '==', userId));
      
      console.log('Тестовый запрос персонажей для пользователя:', userId);
      
      const snapshot = await getDocs(charactersQuery);
      
      console.log(`Получено документов: ${snapshot.size}`);
      
      const loadedCharacters = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Character[];
      
      setCharacters(loadedCharacters);
      
      setResults(prev => ({ 
        ...prev, 
        characters: `Персонажей загружено: ${loadedCharacters.length}`,
        charactersData: loadedCharacters.map(char => ({
          id: char.id,
          name: char.name,
          className: char.className || char.class,
          userId: char.userId
        }))
      }));
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
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Тест загрузки персонажей</h1>
        <Button variant="outline" onClick={() => navigate('/')}>Назад на главную</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Панель тестов</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTest} onValueChange={setActiveTest} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="auth">Аутентификация</TabsTrigger>
              <TabsTrigger value="characters">Персонажи</TabsTrigger>
              <TabsTrigger value="connection">Соединение</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auth">
              <div className="space-y-4">
                <Button onClick={testAuth} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Проверить аутентификацию
                </Button>
                
                <div className="p-4 bg-black/20 rounded-lg">
                  <h3 className="font-medium mb-2">Статус аутентификации:</h3>
                  <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-96 p-2 bg-black/40 rounded">
                    {results.auth ? JSON.stringify(results.auth, null, 2) : 'Нет данных'}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="characters">
              <div className="space-y-4">
                <Button onClick={testCharacters} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Загрузить персонажей
                </Button>
                
                <div className="p-4 bg-black/20 rounded-lg">
                  <h3 className="font-medium mb-2">Результат загрузки:</h3>
                  <p>{results.characters || 'Нет данных'}</p>
                  
                  {characters.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Список персонажей:</h4>
                      <div className="grid gap-2">
                        {characters.map(char => (
                          <div key={char.id} className="p-2 bg-black/30 rounded">
                            {char.name || 'Без имени'} ({char.className || char.class || 'Без класса'})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.charactersData && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Данные персонажей:</h4>
                      <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-96 p-2 bg-black/40 rounded">
                        {JSON.stringify(results.charactersData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="connection">
              <div className="space-y-4">
                <Button onClick={testFirebaseConnection} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Проверить соединение с Firebase
                </Button>
                
                <div className="p-4 bg-black/20 rounded-lg">
                  <h3 className="font-medium mb-2">Статус соединения:</h3>
                  <p>{results.connection || 'Нет данных'}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded">
              <strong>Ошибка:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Советы по отладке</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Убедитесь, что вы авторизованы в системе</li>
            <li>Проверьте, что у вас есть персонажи в коллекции 'characters'</li>
            <li>Проверьте, что у персонажей правильно указан userId, совпадающий с вашим id</li>
            <li>Если персонажи не загружаются, проверьте правила безопасности Firestore</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;
