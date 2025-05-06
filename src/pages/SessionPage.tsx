
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { subscribeToSession, getSessionById, removeParticipant } from '@/services/sessionService';
import { Session, Participant } from '@/types/session';
import { getCharacter } from '@/services/characterService';
import DiceRoller from '@/components/session/DiceRoller';
import SessionChat from '@/components/session/SessionChat';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ 
    id: string;
    sender: string;
    text: string;
    timestamp: Date;
    isMaster?: boolean;
  }>>([]);
  const [messageInput, setMessageInput] = useState('');
  const [userCharacter, setUserCharacter] = useState<any>(null);

  // Загрузка данных сессии
  useEffect(() => {
    if (!sessionId) {
      setError('Идентификатор сессии не указан');
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      try {
        // Сначала загружаем базовую информацию о сессии
        const sessionData = await getSessionById(sessionId);
        if (!sessionData) {
          setError('Сессия не найдена');
          setLoading(false);
          return;
        }
        
        setSession(sessionData);
        
        // Если пользователь авторизован, проверяем его участие в сессии
        if (user) {
          const participant = sessionData.participants.find(p => p.userId === user.uid);
          
          // Если пользователь участник, загружаем его персонажа
          if (participant) {
            try {
              const character = await getCharacter(participant.characterId);
              if (character) {
                setUserCharacter(character);
              }
            } catch (err) {
              console.error('Ошибка при загрузке персонажа:', err);
            }
          }
          // Если пользователь не участник и не мастер, перенаправляем на страницу присоединения
          else if (sessionData.hostId !== user.uid) {
            toast.info('Вы не являетесь участником этой сессии');
            navigate(`/join/${sessionId}`);
            return;
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке сессии:', err);
        setError('Ошибка при загрузке данных сессии');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
    
    // Подписываемся на обновления сессии в реальном времени
    const unsubscribe = subscribeToSession(sessionId, (updatedSession) => {
      setSession(updatedSession);
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId, user, navigate]);

  // Отправка сообщения в чат
  const handleSendMessage = () => {
    if (!messageInput.trim() || !user) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: user.displayName || 'Игрок',
      text: messageInput,
      timestamp: new Date(),
      isMaster: session?.hostId === user.uid
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
    
    // В реальном приложении здесь был бы код для отправки сообщения через сокеты
  };

  // Выход из сессии
  const handleLeaveSession = async () => {
    if (!session || !user) return;
    
    try {
      // Если пользователь является участником, удаляем его из списка участников
      const isParticipant = session.participants.some(p => p.userId === user.uid);
      if (isParticipant) {
        await removeParticipant(session.id, user.uid);
      }
      
      // Если пользователь является мастером, можно добавить дополнительную логику
      
      toast.success('Вы покинули сессию');
      navigate('/');
    } catch (err) {
      console.error('Ошибка при выходе из сессии:', err);
      toast.error('Не удалось выйти из сессии');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-black/50 backdrop-blur-sm">
          <CardContent className="py-12 flex justify-center">
            <p>Загрузка сессии...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-black/50 backdrop-blur-sm">
          <CardContent className="py-12">
            <h2 className="text-xl font-bold mb-4 text-center">Ошибка</h2>
            <p className="text-center mb-6">{error || 'Не удалось загрузить сессию'}</p>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/')}>На главную</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMaster = user?.uid === session.hostId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 bg-slate-800/80 p-4 rounded-lg">
          <div>
            <h1 className="text-2xl font-bold text-white">{session.name}</h1>
            <p className="text-gray-300">Код: {session.sessionKey}</p>
          </div>
          <div className="flex gap-2">
            {isMaster ? (
              <Button variant="outline" onClick={() => navigate(`/dm-session/${session.id}`)}>
                Панель Мастера
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/character-sheet')}>
                Лист персонажа
              </Button>
            )}
            <Button variant="destructive" onClick={handleLeaveSession}>
              Выйти из сессии
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Game Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/60 border-slate-700">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Игровая сессия</span>
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Список участников */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Участники:</h3>
                  <div className="bg-slate-700/60 p-4 rounded-lg">
                    <div className="space-y-2">
                      {/* Мастер */}
                      <div className="flex items-center justify-between border-b border-slate-600 pb-2">
                        <div className="font-bold text-amber-400">Мастер</div>
                        <div className="text-sm bg-amber-400/20 px-2 py-1 rounded text-amber-300">
                          {isMaster ? 'Вы' : 'Мастер игры'}
                        </div>
                      </div>
                      
                      {/* Игроки */}
                      {session.participants.map((participant) => (
                        <div key={participant.userId} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{participant.characterName}</span>
                            {participant.userId === user?.uid && (
                              <span className="ml-2 text-xs bg-blue-400/20 px-2 py-0.5 rounded text-blue-300">Вы</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            Присоединился в {new Date(participant.joinedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                      
                      {session.participants.length === 0 && (
                        <p className="text-gray-400 text-center py-2">В сессии пока нет игроков</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Dice Roller */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Броски кубиков:</h3>
                  <DiceRoller roomCode={session.sessionKey || session.id} />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Chat */}
          <div>
            <Card className="bg-slate-800/60 border-slate-700 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Чат сессии</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto p-4 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-grow flex items-center justify-center text-gray-400">
                    Сообщений пока нет
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`p-3 rounded-lg ${msg.isMaster ? 'bg-amber-100/10 text-amber-200' : 'bg-blue-100/10 text-blue-200'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold ${msg.isMaster ? 'text-amber-400' : 'text-blue-400'}`}>
                            {msg.sender} {msg.isMaster ? '(Мастер)' : ''}
                          </span>
                          <span className="text-xs text-gray-400">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t border-slate-700 flex">
                <Input 
                  placeholder="Введите сообщение..." 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-grow bg-slate-700/60 border-slate-600"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  className="ml-2" 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
