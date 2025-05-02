import React, { useState, useContext, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharacterHeader } from './CharacterHeader';
import { StatsPanel } from './StatsPanel';
import { ResourcePanel } from './ResourcePanel';
import { CharacterTabs } from './CharacterTabs';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSelector } from './ThemeSelector';
import { Save, Printer, Book, User2, AlertTriangle, Sword, MapPin, Shield, Map, Grid3X3, ZoomIn, ZoomOut, Move, Users } from 'lucide-react';
import { SpellPanel } from './SpellPanel';
import { CharacterContext } from '@/contexts/CharacterContext';
import { useToast } from "@/hooks/use-toast";
import { RestPanel } from './RestPanel';
import { Progress } from "@/components/ui/progress";
import { useSocket } from '@/contexts/SocketContext';
import { useSession } from '@/contexts/SessionContext';
import { useSessionStore } from '@/stores/sessionStore';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface CharacterSheetProps {
  character?: any;
}

const CharacterSheet = ({ character: propCharacter }: CharacterSheetProps) => {
  const { theme } = useTheme();
  const { character: contextCharacter, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const { isConnected, sessionData, sendChatMessage, sendRoll } = useSocket();
  const { currentSession } = useSession();
  const sessionStore = useSessionStore();
  const navigate = useNavigate();
  
  // Диалог подключения к сессии
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Используем персонажа из пропсов, если он передан, иначе из контекста
  const character = propCharacter || contextCharacter;
  
  const [currentHp, setCurrentHp] = useState(character?.currentHp || character?.maxHp || 20);
  const [maxHp, setMaxHp] = useState(character?.maxHp || 20);
  const [characterName, setCharacterName] = useState(character?.name || 'Новый персонаж');
  const [characterClass, setCharacterClass] = useState(character?.className || 'Выберите класс');
  const [activeTab, setActiveTab] = useState('abilities');
  const [battleMapVisible, setBattleMapVisible] = useState(false);
  
  // Состояния для поля боя
  const [mapZoom, setMapZoom] = useState(1);
  const [gridVisible, setGridVisible] = useState(true);
  const [gridSize, setGridSize] = useState(30); // размер клетки в пикселях
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [battleInProgress, setBattleInProgress] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [initiative, setInitiative] = useState<{id: number, name: string, initiative: number}[]>([]);
  
  // Функция для обработки подключения к сессии по коду
  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код сессии",
        variant: "destructive"
      });
      return;
    }
    
    if (!playerName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ваше имя",
        variant: "destructive"
      });
      return;
    }
    
    setIsJoining(true);
    
    // Присоединение к сессии через sessionStore
    const joined = sessionStore.joinSession(sessionCode, playerName);
    
    if (joined) {
      toast({
        title: "Успешно",
        description: `Вы присоединились к сессии`
      });
      
      // Сохраняем выбранного персонажа как последнего выбранного
      if (character?.id) {
        localStorage.setItem('last-selected-character', character.id);
      }
      
      // Переходим на страницу игровой сессии
      navigate('/player-session');
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к сессии. Проверьте код сессии.",
        variant: "destructive"
      });
      setIsJoining(false);
    }
  };
  
  // Функции для управления сеткой и масштабированием
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleResetZoom = () => {
    setMapZoom(1);
  };
  
  // Функция для перемещения карты
  const handleMoveMap = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 50; // шаг перемещения в пикселях
    
    switch (direction) {
      case 'up':
        setMapPosition(prev => ({ ...prev, y: prev.y + step }));
        break;
      case 'down':
        setMapPosition(prev => ({ ...prev, y: prev.y - step }));
        break;
      case 'left':
        setMapPosition(prev => ({ ...prev, x: prev.x + step }));
        break;
      case 'right':
        setMapPosition(prev => ({ ...prev, x: prev.x - step }));
        break;
    }
  };

  // Функции для боевой системы
  const startBattle = () => {
    if (!battleInProgress) {
      // Определяем инициативу для всех персонажей
      const battleInitiative = tokens.map(token => ({
        id: token.id,
        name: token.name,
        initiative: Math.floor(Math.random() * 20) + 1 + (token.dexModifier || 0)
      })).sort((a, b) => b.initiative - a.initiative);
      
      setInitiative(battleInitiative);
      setCurrentTurn(0);
      setBattleInProgress(true);
      
      toast({
        title: "Бой начался",
        description: `Первым ходит: ${battleInitiative[0]?.name || 'Никто'}`,
      });
      
      // Отправляем сообщение в чат сессии, если подключены
      if (isConnected && sessionData) {
        sendChatMessage("Бой начался!");
      }
    }
  };
  
  const nextTurn = () => {
    if (battleInProgress && initiative.length > 0) {
      const nextTurnIndex = (currentTurn + 1) % initiative.length;
      setCurrentTurn(nextTurnIndex);
      
      toast({
        title: "Следующий ход",
        description: `Ход игрока: ${initiative[nextTurnIndex]?.name}`,
      });
      
      // Отправляем сообщение в чат сессии, если подключены
      if (isConnected && sessionData) {
        sendChatMessage(`Ход переходит к ${initiative[nextTurnIndex]?.name}`);
      }
    }
  };
  
  const endBattle = () => {
    if (battleInProgress) {
      setBattleInProgress(false);
      setInitiative([]);
      
      toast({
        title: "��ой окончен",
        description: "Битва завершилась",
      });
      
      // Отправляем сообщение в чат сессии, если подключены
      if (isConnected && sessionData) {
        sendChatMessage("Бой завершен!");
      }
    }
  };
  
  // Функция добавления персонажа на поле боя
  const addToken = (type: 'player' | 'enemy' | 'npc') => {
    const newToken = {
      id: Date.now(),
      type,
      name: type === 'player' ? character?.name || 'Игрок' : type === 'enemy' ? 'Враг' : 'NPC',
      x: 150 + Math.random() * 100,
      y: 150 + Math.random() * 100,
      hp: type === 'player' ? (character?.currentHp || 20) : 10,
      maxHp: type === 'player' ? (character?.maxHp || 20) : 10,
      dexModifier: type === 'player' ? Math.floor((character?.abilities?.DEX || 10) - 10) / 2 : 0,
      color: type === 'player' ? '#3b82f6' : type === 'enemy' ? '#ef4444' : '#10b981'
    };
    
    setTokens(prev => [...prev, newToken]);
    
    toast({
      title: "Токен добавлен",
      description: `${newToken.name} (${type}) добавлен на поле боя`,
    });
  };
  
  // Функция для удаления токена
  const removeToken = (id: number) => {
    setTokens(prev => prev.filter(token => token.id !== id));
    if (selectedToken === id) {
      setSelectedToken(null);
    }
  };
  
  // Обновляет HP персонажа в контексте при изменении в UI
  const handleHpChange = (newHp: number) => {
    setCurrentHp(newHp);
    
    if (contextCharacter) {
      updateCharacter({ currentHp: newHp });
    }
  };

  // Сохранение персонажа и сессии
  const handleSaveCharacter = () => {
    if (!contextCharacter) {
      toast({
        title: "Ошибка",
        description: "Нет персонажа для сохранения",
        variant: "destructive"
      });
      return;
    }
    
    // Сохраняем персонажа в локальное хранилище
    const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '[]');
    const characterExists = savedCharacters.findIndex((c: any) => c.id === character.id);
    
    if (characterExists >= 0) {
      savedCharacters[characterExists] = character;
    } else {
      savedCharacters.push({
        ...character,
        id: character.id || Date.now().toString(),
        createdAt: character.createdAt || new Date().toISOString()
      });
    }
    
    localStorage.setItem('dnd-characters', JSON.stringify(savedCharacters));
    localStorage.setItem('last-selected-character', character.id);
    
    // Обновляем информацию в сессии, если подключены
    if (isConnected && sessionData) {
      // Обновляем персонажа в сессии
      sendChatMessage(`Персонаж ${character.name} обновлен`);
    }
    
    toast({
      title: "Персонаж сохранен",
      description: `${character.name} успешно сохранен`,
    });
  };

  const handlePrint = () => {
    window.print();
  };
  
  const toggleBattleMap = () => {
    setBattleMapVisible(!battleMapVisible);
  };

  // Функция для расчета опыта до следующего уровня
  const calculateLevelProgress = () => {
    const currentLevel = character?.level || 1;
    
    // Таблица опыта по уровням D&D 5e
    const xpTable = [
      0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
      85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
    ];
    
    // Если персонаж максимального уровня, возвращаем 100%
    if (currentLevel >= 20) {
      return 100;
    }
    
    // Считаем, что у персонажа сейчас ровно минимальный опыт для текущего уровня
    const currentXP = character?.xp || xpTable[currentLevel - 1];
    
    // Расчет прогресса до следующего уровня
    const xpForCurrentLevel = xpTable[currentLevel - 1];
    const xpForNextLevel = xpTable[currentLevel];
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const currentProgress = currentXP - xpForCurrentLevel;
    
    return Math.min(100, Math.max(0, Math.floor((currentProgress / xpNeeded) * 100)));
  };
  
  // Проверка и создание сессии при монтировании компонента
  useEffect(() => {
    // Проверяем, есть ли текущая сессия
    const checkAndUpdateSession = () => {
      // Если нет активной сессии, но есть сохраненные сессии, загружаем последнюю
      if (!sessionStore.currentSession && sessionStore.sessions.length > 0) {
        const lastSession = sessionStore.sessions[sessionStore.sessions.length - 1];
        // Устанавливаем последнюю сессию как текущую
        if (lastSession) {
          const currentUser = lastSession.users.find(u => u.isDM);
          if (currentUser) {
            sessionStore.setCurrentUser(currentUser);
            // Обновляем состояние currentSession
            const updatedSession = { ...lastSession, lastActive: new Date().toISOString() };
            sessionStore.updateCurrentSession(updatedSession);
          }
        }
      }
    };
    
    checkAndUpdateSession();
  }, [sessionStore]);

  if (!character) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Персонаж не выбран</h3>
          <p className="text-muted-foreground mb-4">Создайте нового персонажа или выберите существующего</p>
          <Button onClick={() => navigate("/character-creation")}>Создать персонажа</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-4 flex flex-col md:flex-row justify-between items-center bg-card/30 backdrop-blur-sm border-primary/20 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-primary">{character.name} — {character.className}</h1>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Button onClick={() => setJoinDialogOpen(true)} variant="outline" className="gap-2">
              <Users className="size-4" />
              {isConnected ? 'Подключено' : 'Подключиться к сессии'}
            </Button>
            <Button onClick={handleSaveCharacter} variant="outline" className="gap-2">
              <Save className="size-4" />
              Сохранить
            </Button>
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="size-4" />
              Печать
            </Button>
            <ThemeSelector />
          </div>
        </header>
        
        {/* Главный блок "Магия Теней" - увеличенный */}
        <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-3xl font-bold text-primary">Магия Теней</div>
            <div className="flex gap-2">
              <Button onClick={toggleBattleMap} variant="outline" size="sm" className="gap-1">
                <MapPin className="size-4" />
                {battleMapVisible ? "Скрыть карту" : "Показать карту"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={battleInProgress ? endBattle : startBattle}
              >
                <Sword className="size-4" />
                {battleInProgress ? "Завершить бой" : "Начать бой"}
              </Button>
              {battleInProgress && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-1"
                  onClick={nextTurn}
                >
                  Следующий ход
                </Button>
              )}
            </div>
          </div>
          
          {/* Область для боевой карты - увеличенная */}
          <div className={`transition-all duration-300 ${battleMapVisible ? 'h-[500px]' : 'h-[300px]'} bg-black/30 rounded-lg mb-4 relative overflow-hidden`}>
            {!battleMapVisible ? (
              <div className="text-center text-primary/80 p-6">
                <div className="text-2xl font-semibold mb-3">Область визуализации</div>
                <p className="max-w-2xl mx-auto">
                  Здесь будет отображаться карта боя, визуализация заклинаний и ключевых сцен.
                  Мастер подземелий управляет содержимым этой области.
                </p>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="mx-2"
                    onClick={() => {
                      setBattleMapVisible(true);
                      addToken('player');
                    }}
                  >
                    Мой персонаж
                  </Button>
                  <Button 
                    variant="outline" 
                    className="mx-2"
                    onClick={() => {
                      setBattleMapVisible(true);
                      toast({
                        title: "Ожидание DM",
                        description: "Ожидание действий Мастера подземелий...",
                      });
                    }}
                  >
                    Присоединиться к бою
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Боевая карта с сеткой */}
                <div 
                  className="absolute inset-0"
                  style={{
                    transform: `scale(${mapZoom}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                    transformOrigin: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  {/* Фон карты */}
                  <div className="absolute inset-0 bg-[url('/assets/battlemap-background.jpg')] bg-cover bg-center opacity-40"></div>
                  
                  {/* Сетка */}
                  {gridVisible && (
                    <div className="absolute inset-0 grid grid-cols-[repeat(30,1fr)] grid-rows-[repeat(20,1fr)] opacity-30">
                      {Array.from({ length: 600 }).map((_, i) => (
                        <div key={i} className="border border-primary/50"></div>
                      ))}
                    </div>
                  )}
                  
                  {/* Токены на поле боя */}
                  {tokens.map(token => (
                    <div 
                      key={token.id}
                      className={`absolute rounded-full flex items-center justify-center cursor-pointer
                                ${selectedToken === token.id ? 'ring-4 ring-yellow-400' : ''}`}
                      style={{
                        left: token.x,
                        top: token.y,
                        width: 40,
                        height: 40,
                        backgroundColor: token.color,
                        transform: `translate(-50%, -50%)`,
                        zIndex: selectedToken === token.id ? 10 : 1,
                      }}
                      onClick={() => setSelectedToken(token.id)}
                    >
                      <span className="text-white font-bold text-sm">{token.name.substring(0, 2)}</span>
                      
                      {/* Индикатор HP */}
                      <div className="absolute -bottom-6 left-0 w-full h-1 bg-gray-700 rounded-full">
                        <div 
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${(token.hp / token.maxHp) * 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Индикатор текущего хода */}
                      {battleInProgress && initiative[currentTurn]?.id === token.id && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-500 animate-bounce"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Элементы управления картой */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <Button size="icon" variant="outline" onClick={handleZoomIn}>
                    <ZoomIn className="size-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleZoomOut}>
                    <ZoomOut className="size-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleResetZoom}>
                    <Map className="size-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => setGridVisible(!gridVisible)}>
                    <Grid3X3 className="size-4" />
                  </Button>
                </div>
                
                {/* Кнопки перемещения карты */}
                <div className="absolute bottom-4 left-4 grid grid-cols-3 gap-1">
                  <div></div>
                  <Button size="icon" variant="outline" onClick={() => handleMoveMap('up')}>
                    <Move className="size-4 rotate-0" />
                  </Button>
                  <div></div>
                  <Button size="icon" variant="outline" onClick={() => handleMoveMap('left')}>
                    <Move className="size-4 -rotate-90" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleResetZoom}>
                    <Map className="size-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => handleMoveMap('right')}>
                    <Move className="size-4 rotate-90" />
                  </Button>
                  <div></div>
                  <Button size="icon" variant="outline" onClick={() => handleMoveMap('down')}>
                    <Move className="size-4 rotate-180" />
                  </Button>
                  <div></div>
                </div>
                
                {/* Панель добавления токенов */}
                <div className="absolute top-4 left-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => addToken('player')}>
                      + Игрок
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addToken('enemy')}>
                      + Враг
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addToken('npc')}>
                      + NPC
                    </Button>
                    {selectedToken !== null && (
                      <Button size="sm" variant="destructive" onClick={() => removeToken(selectedToken)}>
                        Удалить
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Информация о выбранном токене */}
                {selectedToken !== null && (
                  <div className="absolute top-4 right-4 bg-background/80 p-2 rounded-lg">
                    <h4 className="font-bold">{tokens.find(t => t.id === selectedToken)?.name}</h4>
                    <p>HP: {tokens.find(t => t.id === selectedToken)?.hp}/{tokens.find(t => t.id === selectedToken)?.maxHp}</p>
                  </div>
                )}
                
                {/* Информация об инициативе */}
                {battleInProgress && initiative.length > 0 && (
                  <div className="absolute top-16 right-4 bg-background/80 p-2 rounded-lg">
                    <h4 className="font-bold">Инициатива</h4>
                    <ul className="text-sm">
                      {initiative.map((item, index) => (
                        <li key={item.id} className={index === currentTurn ? 'font-bold text-yellow-400' : ''}>
                          {item.name}: {item.initiative}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Панель быстрого доступа к действиям */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              <Sword className="size-4" /> Атака
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              <Shield className="size-4" /> Защита
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center justify-center gap-1"
              onClick={() => {
                if (isConnected) {
                  sendRoll("1d20", "Проверка на заклинание");
                  toast({
                    title: "Бросок кубика",
                    description: "Кубик брошен для проверки заклинания",
                  });
                } else {
                  toast({
                    title: "Нет подключения",
                    description: "Вы не подключены к сессии",
                    variant: "destructive"
                  });
                }
              }}
            >
              Заклинание
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              Движение
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              Предмет
            </Button>
            <Button variant="outline" size="sm" className="flex items-center justify-center gap-1">
              Бонусное
            </Button>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
          {/* Left sidebar */}
          <div className="space-y-4">
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <div className="aspect-square bg-muted rounded-lg mb-4"></div>
              <Button className="w-full">Изменить аватар</Button>
            </Card>
            
            <ResourcePanel 
              currentHp={currentHp}
              maxHp={maxHp}
              onHpChange={handleHpChange}
            />
            
            {/* Блок с прогрессом персонажа */}
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Прогресс</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-primary/70">Уровень {character.level}</span>
                    <span className="text-sm text-primary/70">Уровень {Math.min(20, character.level + 1)}</span>
                  </div>
                  <Progress value={calculateLevelProgress()} className="h-2" />
                  <div className="mt-1 text-xs text-center text-primary/60">
                    {calculateLevelProgress()}% до следующего уровня
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-primary/10">
                  <span className="text-primary/80 flex items-center gap-1">
                    <User2 className="h-4 w-4" /> Класс
                  </span>
                  <span className="font-medium text-primary">
                    {character.className} {character.subclass ? `(${character.subclass})` : ''}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-primary/10">
                  <span className="text-primary/80 flex items-center gap-1">
                    <Book className="h-4 w-4" /> Предыстория
                  </span>
                  <span className="font-medium text-primary">
                    {character.background || 'Не указано'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-primary/10">
                  <span className="text-primary/80 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> Мировоззрение
                  </span>
                  <span className="font-medium text-primary">
                    {character.alignment || 'Нейтральный'}
                  </span>
                </div>
              </div>
            </Card>
            
            <RestPanel />
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Инвентарь</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {character.equipment && character.equipment.length > 0 ? (
                  character.equipment.map((item: string, idx: number) => (
                    <div key={idx} className="p-1.5 rounded bg-primary/5 hover:bg-primary/10 text-primary">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="italic text-muted-foreground">Нет предметов</p>
                )}
              </div>
            </Card>
          </div>
          
          {/* Center content */}
          <div className="flex flex-col space-y-4">
            <CharacterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {activeTab === 'spells' && (
              <SpellPanel />
            )}
            
            {activeTab === 'combat' && (
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Боевые характеристики</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                      <div className="text-sm text-primary/70 mb-1">КЗ</div>
                      <div className="text-2xl font-bold text-primary">{character.ac || 10}</div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                      <div className="text-sm text-primary/70 mb-1">Инициатива</div>
                      <div className="text-2xl font-bold text-primary">+{character.initiative || 0}</div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                      <div className="text-sm text-primary/70 mb-1">Скорость</div>
                      <div className="text-2xl font-bold text-primary">{character.speed || 30} футов</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-primary mt-4">Оружие и атаки</h3>
                  <div className="space-y-3">
                    {character.weapons ? (
                      character.weapons.map((weapon: any, idx: number) => (
                        <div key={idx} className="p-3 bg-primary/5 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-primary">{weapon.name}</span>
                            <span className="text-primary">+{weapon.attackBonus} к атаке</span>
                          </div>
                          <div className="text-sm text-primary/70 mt-1">
                            Урон: {weapon.damage} ({weapon.damageType})
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-primary/50">
                        <p>Нет доступного оружия</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
            
            {activeTab === 'background' && (
              <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20 flex-1">
                <h3 className="text-lg font-semibold text-primary mb-4">Предыстория</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-primary/90">{character.background || 'У этого персонажа пока нет предыстории.'}</p>
                </div>
              </Card>
            )}
          </div>
          
          {/* Right sidebar */}
          <div className="space-y-4">
            <StatsPanel character={character} />
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Навыки</h3>
              <div className="space-y-2">
                {character.abilities && Object.entries(character.abilities).map(([ability, score]: [string, any]) => {
                  const mod = Math.floor((Number(score) - 10) / 2);
                  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                  
                  return (
                    <div key={ability} className="flex justify-between">
                      <span className="text-primary">{getAbilityName(ability)}</span>
                      <span className="text-primary">{score} ({modStr})</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Особенности</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {character.proficiencies && character.proficiencies.length > 0 ? (
                  character.proficiencies.map((prof: string, idx: number) => (
                    <div key={idx} className="p-1.5 rounded bg-primary/5 hover:bg-primary/10 text-primary">
                      {prof}
                    </div>
                  ))
                ) : (
                  <p className="italic text-muted-foreground">Нет особенностей</p>
                )}
              </div>
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Языки</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {character.languages && character.languages.length > 0 ? (
                  character.languages.map((lang: string, idx: number) => (
                    <div key={idx} className="p-1.5 rounded bg-primary/5 hover:bg-primary/10 text-primary">
                      {lang}
                    </div>
                  ))
                ) : (
                  <p className="italic text-muted-foreground">Общий</p>
                )}
              </div>
            </Card>
            
            <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
              <h3 className="text-lg font-semibold mb-2 text-primary">Информация</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-primary/80">Раса:</span>
                  <span className="text-primary">{character.race} {character.subrace ? `(${character.subrace})` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/80">Класс:</span>
                  <span className="text-primary">{character.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/80">Уровень:</span>
                  <span className="text-primary">{character.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/80">Мировоззрение:</span>
                  <span className="text-primary">{character.alignment || 'Нейтральный'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Диалог подключения к сессии */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Подключение к игровой сессии</DialogTitle>
            <DialogDescription>
              Введите код сессии, который вам предоставил Мастер Подземелий.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sessionCode">Код сессии</Label>
              <Input 
                id="sessionCode" 
                placeholder="Например: AB12CD"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="playerName">Ваше ��мя</Label>
              <Input 
                id="playerName" 
                placeholder="Как вас будут видеть другие игроки"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleJoinSession} disabled={isJoining}>
              {isJoining ? 'Подключение...' : 'Подключиться'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Функция для получения названия характеристики
const getAbilityName = (abilityCode: string): string => {
  const names: Record<string, string> = {
    STR: 'Сила',
    DEX: 'Ловкость',
    CON: 'Телосложение',
    INT: 'Интеллект',
    WIS: 'Мудрость',
    CHA: 'Харизма'
  };
  
  return names[abilityCode] || abilityCode;
};

export default CharacterSheet;
