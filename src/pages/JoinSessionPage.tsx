
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { getSessionByKey, addParticipant, getSessionById } from '@/services/sessionService';
import { getCharactersByUserId } from '@/services/characterService';
import { Character } from '@/types/character';
import { Session } from '@/types/session';
import OBSLayout from '@/components/OBSLayout';

const JoinSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const sessionKey = searchParams.get('key') || '';
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState(sessionKey);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          setError('Необходимо авторизоваться для присоединения к сессии');
          return;
        }

        // Если есть sessionId, пытаемся загрузить сессию напрямую
        if (sessionId) {
          const fetchedSession = await getSessionById(sessionId);
          
          // Если есть ключ, проверяем его
          if (sessionKey && fetchedSession) {
            if (fetchedSession.sessionKey !== sessionKey) {
              setError('Неверный ключ сессии');
              setSession(null);
              return;
            }
          }
          
          if (fetchedSession) {
            setSession(fetchedSession);
          } else {
            setError('Сессия не найдена');
            return;
          }
        }
        // Если есть только ключ, ищем сессию по ключу
        else if (sessionKey) {
          const fetchedSession = await getSessionByKey(sessionKey);
          if (fetchedSession) {
            setSession(fetchedSession);
            // Обновляем URL, чтобы включить ID сессии
            navigate(`/join/${fetchedSession.id}?key=${sessionKey}`, { replace: true });
          } else {
            setError('Сессия не найдена по указанному ключу');
            return;
          }
        }

        // Загружаем персонажей пользователя
        const userCharacters = await getCharactersByUserId(user.uid);
        setCharacters(userCharacters);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId, sessionKey, user, navigate]);

  const handleJoinWithKey = async () => {
    if (!manualKey.trim()) {
      toast.error('Пожалуйста, введите код сессии');
      return;
    }

    try {
      setLoading(true);
      const fetchedSession = await getSessionByKey(manualKey);
      if (fetchedSession) {
        setSession(fetchedSession);
        navigate(`/join/${fetchedSession.id}?key=${manualKey}`, { replace: true });
      } else {
        setError('Сессия не найдена по указанному ключу');
      }
    } catch (err) {
      console.error('Ошибка при поиске сессии:', err);
      setError('Не удалось найти сессию. Попробуйте другой код.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (characterId: string, characterName: string) => {
    if (!session || !user) {
      toast.error('Ошибка при присоединении к сессии');
      return;
    }

    try {
      await addParticipant(session.id, user.uid, characterId, characterName);
      toast.success(`Вы присоединились к сессии "${session.name}"`);
      navigate(`/session/${session.id}`);
    } catch (err) {
      console.error('Ошибка при присоединении к сессии:', err);
      toast.error('Не удалось присоединиться к сессии');
    }
  };

  if (!user) {
    return (
      <OBSLayout>
        <div className="container mx-auto p-6 max-w-xl">
          <Card className="bg-black/50 backdrop-blur-sm">
            <CardContent className="pt-6 flex flex-col items-center">
              <p className="mb-4 text-center">Необходимо войти в аккаунт для присоединения к сессии</p>
              <Button onClick={() => navigate('/auth', { state: { returnPath: location.pathname + location.search } })}>
                Войти в аккаунт
              </Button>
            </CardContent>
          </Card>
        </div>
      </OBSLayout>
    );
  }

  return (
    <OBSLayout>
      <div className="container mx-auto p-6 max-w-xl">
        <Card className="bg-black/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Присоединиться к сессии</CardTitle>
            {session && (
              <CardDescription>Сессия: {session.name}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center p-4">
                <p>Загрузка данных...</p>
              </div>
            ) : error ? (
              <>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                </div>
                <div className="space-y-4">
                  <p>Введите код сессии вручную:</p>
                  <div className="flex gap-2">
                    <Input 
                      value={manualKey} 
                      onChange={(e) => setManualKey(e.target.value)}
                      placeholder="Код сессии"
                    />
                    <Button onClick={handleJoinWithKey}>Найти</Button>
                  </div>
                </div>
              </>
            ) : !session ? (
              <div className="space-y-4">
                <p>Введите код сессии вручную:</p>
                <div className="flex gap-2">
                  <Input 
                    value={manualKey} 
                    onChange={(e) => setManualKey(e.target.value)}
                    placeholder="Код сессии"
                  />
                  <Button onClick={handleJoinWithKey}>Найти</Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-2">Выберите персонажа для сессии:</h3>
                  {characters.length === 0 ? (
                    <div className="text-center p-6 border border-dashed rounded-md">
                      <p className="mb-4">У вас нет созданных персонажей</p>
                      <Button onClick={() => navigate('/character-creation')}>
                        Создать персонажа
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {characters.map((character) => (
                        <Card key={character.id} className="overflow-hidden hover:bg-accent/20 cursor-pointer transition-all" onClick={() => handleJoinSession(character.id, character.name || 'Безымянный герой')}>
                          <div className="p-4 flex justify-between items-center">
                            <div>
                              <h4 className="font-bold">{character.name || 'Безымянный герой'}</h4>
                              <p className="text-sm text-gray-400">{character.race} {character.class}, Ур. {character.level || 1}</p>
                            </div>
                            <Button size="sm">Выбрать</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pt-4 flex justify-between">
                  <Button variant="ghost" onClick={() => navigate('/')}>
                    Отмена
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </OBSLayout>
  );
};

export default JoinSessionPage;
