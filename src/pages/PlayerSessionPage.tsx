
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCharacter } from '@/contexts/CharacterContext';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import DicePanel from '@/components/character-sheet/DicePanel';
import SessionChat from '@/components/session/SessionChat';
import { createDefaultCharacter } from '@/utils/characterUtils';

const PlayerSessionPage = () => {
  const navigate = useNavigate();
  const { character, setCharacter } = useCharacter();
  const { toast } = useToast();
  const { connected, lastUpdate } = useSocket();
  const [dice, setDice] = useState('d20');
  const [modifier, setModifier] = useState(0);
  const [lastRoll, setLastRoll] = useState({ dice: '', result: 0, total: 0 });
  const [sessionInfo, setSessionInfo] = useState<{ sessionCode: string; playerName: string; } | null>(null);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; timestamp: string }>>([]);

  // Загружаем информацию о текущей сессии из localStorage при инициализации
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('active-session');
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        setSessionInfo(parsedSession);
      } else {
        // Если информации о сессии нет, перенаправляем на страницу входа
        navigate('/join-session');
      }

      // Загружаем персонажа, если его нет
      if (!character) {
        const lastCharacterId = localStorage.getItem('last-selected-character');
        if (lastCharacterId) {
          const savedCharacter = localStorage.getItem(`character_${lastCharacterId}`);
          if (savedCharacter) {
            setCharacter(JSON.parse(savedCharacter));
          } else {
            setCharacter(createDefaultCharacter());
          }
        } else {
          setCharacter(createDefaultCharacter());
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных сессии:", error);
    }
  }, [navigate, character, setCharacter]);

  // Отображаем обновления от других игроков
  useEffect(() => {
    if (lastUpdate && lastUpdate.character && lastUpdate.character.id !== character?.id) {
      toast({
        title: `Обновление от игрока`,
        description: `${lastUpdate.character.name} обновил своего персонажа.`,
      });
    }
  }, [lastUpdate, character, toast]);

  // Обработка обновления персонажа
  const handleUpdateCharacter = (updates: any) => {
    if (!character) return;
    
    const updatedCharacter = { ...character, ...updates };
    setCharacter(updatedCharacter);
    
    // Сохраняем обновленного персонажа локально
    localStorage.setItem(`character_${character.id}`, JSON.stringify(updatedCharacter));
  };

  // Отправка сообщения в чат
  const sendMessage = (text: string) => {
    if (!sessionInfo || !text.trim()) return;
    
    const newMessage = {
      sender: sessionInfo.playerName,
      text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Здесь была бы отправка через сокет в реальном приложении
    console.log("Отправка сообщения:", newMessage);
  };

  // Выход из сессии
  const leaveSession = () => {
    localStorage.removeItem('active-session');
    navigate('/');
    
    toast({
      title: "Выход из сессии",
      description: "Вы покинули игровую сессию."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Игровая сессия</h1>
            {sessionInfo && (
              <p className="text-gray-300">Код: {sessionInfo.sessionCode}, Игрок: {sessionInfo.playerName}</p>
            )}
          </div>
          <Button onClick={leaveSession} variant="destructive">Выйти из сессии</Button>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Character Info */}
          <div className="lg:col-span-2 space-y-6">
            {character && (
              <>
                <Card className="bg-slate-800/60 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>{character.name || 'Безымянный герой'}</span>
                      <span>{character.race} {character.class}, Ур. {character.level}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-700/60 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">Здоровье</p>
                        <p className="text-xl font-bold">{character.currentHp}/{character.maxHp}</p>
                      </div>
                      <div className="bg-slate-700/60 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">Класс доспеха</p>
                        <p className="text-xl font-bold">{character.armorClass}</p>
                      </div>
                      <div className="bg-slate-700/60 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">Инициатива</p>
                        <p className="text-xl font-bold">{character.initiative}</p>
                      </div>
                      
                      <div className="bg-slate-700/60 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">СИЛ</p>
                        <p className="text-xl font-bold">{character.strength}</p>
                      </div>
                      <div className="bg-slate-700/60 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">ЛОВ</p>
                        <p className="text-xl font-bold">{character.dexterity}</p>
                      </div>
                      <div className="bg-slate-700/60 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">ТЕЛ</p>
                        <p className="text-xl font-bold">{character.constitution}</p>
                      </div>
                      
                      <div className="bg-slate-700/60 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">ИНТ</p>
                        <p className="text-xl font-bold">{character.intelligence}</p>
                      </div>
                      <div className="bg-slate-700/60 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">МДР</p>
                        <p className="text-xl font-bold">{character.wisdom}</p>
                      </div>
                      <div className="bg-slate-700/60 p-3 rounded-lg text-center">
                        <p className="text-gray-400 text-sm">ХАР</p>
                        <p className="text-xl font-bold">{character.charisma}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        onClick={() => navigate('/character-sheet')}
                        variant="secondary" 
                        className="w-full"
                      >
                        Открыть полный лист персонажа
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div>
                  {character && <DicePanel character={character} onUpdate={handleUpdateCharacter} />}
                </div>
              </>
            )}
          </div>
          
          {/* Right Column - Chat */}
          <div>
            <SessionChat 
              messages={messages}
              onSendMessage={sendMessage}
              sessionCode={sessionInfo?.sessionCode || ''}
              playerName={sessionInfo?.playerName || ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSessionPage;
