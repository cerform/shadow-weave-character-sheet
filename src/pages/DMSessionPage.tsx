import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { DMSession, TokenData, Initiative } from '@/types/session.types';
import { InitiativeTrackerPanel } from '@/components/session/InitiativeTrackerPanel';

// Исправляем импорт свойств в интерфейсе DMSession
const DMSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<DMSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  // Загружаем данные сессии
  useEffect(() => {
    if (socket && sessionId) {
      socket.emit('joinDmSession', { sessionId }, (response: any) => {
        if (response.success && response.session) {
          setSession(response.session);
          
          // Предполагаем, что chat может не существовать в DMSession
          if (response.session.chat) {
            setMessages(response.session.chat);
          }
          
          setLoading(false);
        } else {
          console.error('Failed to join DM session:', response.error);
          setLoading(false);
        }
      });

      // Обработчик обновления сессии
      socket.on('sessionUpdated', (updatedSession: DMSession) => {
        setSession(updatedSession);
        
        // Предполагаем, что chat может не существовать в DMSession
        if (updatedSession.chat) {
          setMessages(updatedSession.chat);
        }
      });

      return () => {
        socket.off('sessionUpdated');
      };
    }
  }, [socket, sessionId]);

  // Обработчик переключения режима боя
  const handleToggleBattle = () => {
    if (!socket || !session) return;
    
    const updatedSession = {
      ...session,
      battleActive: !session.battleActive
    };
    
    // При необходимости создаем timestamp
    const timestamp = new Date().toISOString();
    
    socket.emit('updateSession', {
      sessionId,
      updates: {
        battleActive: !session.battleActive,
        // Удаляем обновление updatedAt, так как оно не существует в типе
      }
    });
  };

  // Обработчик для следующего хода
  const handleNextTurn = () => {
    if (!socket || !session || !session.initiative || session.initiative.length === 0) return;
    
    const currentIndex = session.initiative.findIndex(init => init.isActive);
    const nextIndex = (currentIndex + 1) % session.initiative.length;
    
    const updatedInitiative = session.initiative.map((init, index) => ({
      ...init,
      isActive: index === nextIndex
    }));
    
    socket.emit('updateSession', {
      sessionId,
      updates: {
        initiative: updatedInitiative,
        // Удаляем обновление updatedAt, так как оно не существует в типе
      }
    });
  };

  // Обработчик обновления списка инициативы
  const handleUpdateInitiative = (newInitiative: Initiative[]) => {
    if (!socket || !session) return;
    
    socket.emit('updateSession', {
      sessionId,
      updates: {
        initiative: newInitiative,
        // Удаляем обновление updatedAt, так как оно не существует в типе
      }
    });
  };

  // Обработчик обновления токенов
  const handleUpdateTokens = (newTokens: TokenData[]) => {
    if (!socket || !session) return;
    
    socket.emit('updateSession', {
      sessionId,
      updates: {
        tokens: newTokens,
        // Удаляем обновление updatedAt, так как оно не существует в типе
      }
    });
  };

  // Отправка сообщения в чат
  const handleSendMessage = (content: string) => {
    if (!socket || !session || !content.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'dm',
      senderName: 'DM',
      content,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    const updatedMessages = [...(messages || []), newMessage];
    setMessages(updatedMessages);
    
    socket.emit('updateSession', {
      sessionId,
      updates: {
        // Используем свойство chat как опциональное, если оно существует в типе
        chat: updatedMessages,
        // Удаляем обновление updatedAt, так как оно не существует в типе
      }
    });
    
    // Если sendMessage существует в socket
    if (socket.emit) {
      socket.emit('sendMessage', {
        sessionId,
        message: newMessage
      });
    }
  };

  // Проверка загрузки
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Загрузка...</div>;
  }

  // Проверка наличия сессии
  if (!session) {
    return <div className="flex items-center justify-center h-screen">Сессия не найдена</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-2/3">
          <Card className="mb-4">
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-2">{session.name}</h1>
              <div className="flex gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/battle/${session.id}`}
                >
                  Открыть боевую карту
                </Button>
              </div>
              <p className="text-muted-foreground">{session.description}</p>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Используем приведение типов для токенов */}
            <Card className="overflow-hidden">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">Активные токены</h2>
                <div className="grid grid-cols-2 gap-2">
                  {session.tokens?.map((token) => (
                    <div 
                      key={String(token.id)} 
                      className="flex items-center gap-2 p-2 border rounded-md"
                    >
                      {token.img && (
                        <img 
                          src={token.img} 
                          alt={token.name} 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span>{token.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* Трекер инициативы */}
            <InitiativeTrackerPanel
              initiatives={session.initiative || []}
              tokens={session.tokens || []}
              battleActive={!!session.battleActive}
              sessionId={session.id}
              onUpdateInitiatives={handleUpdateInitiative}
              onToggleBattle={handleToggleBattle}
              onNextTurn={handleNextTurn}
            />
          </div>
        </div>
        
        <div className="w-full lg:w-1/3">
          {/* Список игроков */}
          <Card className="mb-4">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Игроки</h2>
              <div className="space-y-2">
                {session.players.map((player) => (
                  <div 
                    key={player.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${player.connected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span>{player.name || player.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          {/* Блок для чата или других компонентов */}
        </div>
      </div>
    </div>
  );
};

export default DMSessionPage;
