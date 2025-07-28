import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Shield,
  Sword,
  Eye,
  EyeOff,
  Users,
  Plus,
  Trash2,
  Settings,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  Map,
  Grid,
  Zap,
  Move,
  MousePointer,
  Circle,
  Square,
  Triangle,
  Ruler,
  Upload,
  Dice6,
  MessageCircle,
  Clock,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdvancedBattleMap from './AdvancedBattleMap';

interface DMDashboardProps {
  sessionId?: string;
}

interface BattleToken {
  id: string;
  name: string;
  token_type: string;
  position_x: number;
  position_y: number;
  size: number;
  color: string;
  image_url?: string;
  max_hp?: number;
  current_hp?: number;
  armor_class?: number;
  is_hidden_from_players: boolean;
  conditions: any[];
  notes?: string;
}

interface InitiativeEntry {
  id: string;
  character_name: string;
  initiative_roll: number;
  turn_order: number;
  is_current_turn: boolean;
  has_acted_this_turn: boolean;
  token_id?: string;
}

interface BattleLog {
  id: string;
  round_number: number;
  action_type: string;
  description: string;
  damage_dealt: number;
  created_at: string;
}

const DMDashboard: React.FC<DMDashboardProps> = ({ sessionId }) => {
  const [tokens, setTokens] = useState<BattleToken[]>([]);
  const [initiative, setInitiative] = useState<InitiativeEntry[]>([]);
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [selectedTool, setSelectedTool] = useState('select');
  const [mapName, setMapName] = useState('Крипта Грома');
  const [dmNotes, setDmNotes] = useState('');
  const [gridSize, setGridSize] = useState([30]);
  const [fogOfWar, setFogOfWar] = useState(false);
  const [newTokenForm, setNewTokenForm] = useState({
    name: '',
    type: 'monster' as 'player' | 'npc' | 'monster',
    hp: 30,
    ac: 13
  });

  // Загрузка данных при монтировании
  useEffect(() => {
    if (sessionId) {
      loadBattleData();
      loadInitiative();
      loadBattleLog();
    }
  }, [sessionId]);

  // Realtime подписки
  useEffect(() => {
    if (!sessionId) return;

    const tokenChannel = supabase
      .channel('battle_tokens_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'battle_tokens', filter: `session_id=eq.${sessionId}` },
        () => loadBattleData()
      )
      .subscribe();

    const initiativeChannel = supabase
      .channel('initiative_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'initiative_tracker', filter: `session_id=eq.${sessionId}` },
        () => loadInitiative()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tokenChannel);
      supabase.removeChannel(initiativeChannel);
    };
  }, [sessionId]);

  const loadBattleData = async () => {
    if (!sessionId) return;
    
    const { data } = await supabase
      .from('battle_tokens')
      .select('*')
      .eq('session_id', sessionId);
    
    if (data) {
      const mappedTokens = data.map(token => ({
        ...token,
        conditions: Array.isArray(token.conditions) ? token.conditions : []
      }));
      setTokens(mappedTokens);
    }
  };

  const loadInitiative = async () => {
    if (!sessionId) return;
    
    const { data } = await supabase
      .from('initiative_tracker')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_order', { ascending: false });
    
    if (data) setInitiative(data);
  };

  const loadBattleLog = async () => {
    if (!sessionId) return;
    
    const { data } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .eq('message_type', 'combat_action')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      setBattleLog(data.map(msg => ({
        id: msg.id,
        round_number: 1,
        action_type: 'attack',
        description: msg.content,
        damage_dealt: 0,
        created_at: msg.created_at
      })));
    }
  };

  const addToken = async () => {
    if (!sessionId || !newTokenForm.name) return;

    const tokenData = {
      session_id: sessionId,
      name: newTokenForm.name,
      token_type: newTokenForm.type,
      position_x: Math.random() * 400 + 200,
      position_y: Math.random() * 300 + 150,
      size: 1,
      color: newTokenForm.type === 'player' ? '#3b82f6' : '#ef4444',
      max_hp: newTokenForm.hp,
      current_hp: newTokenForm.hp,
      armor_class: newTokenForm.ac,
      is_hidden_from_players: false,
      conditions: []
    };

    await supabase.from('battle_tokens').insert(tokenData);
    setNewTokenForm({ name: '', type: 'monster', hp: 30, ac: 13 });
  };

  const rollInitiative = async () => {
    if (!sessionId) return;

    // Очищаем старую инициативу
    await supabase.from('initiative_tracker').delete().eq('session_id', sessionId);

    const initiatives = tokens.map(token => ({
      session_id: sessionId,
      character_name: token.name,
      initiative_roll: Math.floor(Math.random() * 20) + 1,
      initiative_modifier: 0,
      turn_order: 0,
      token_id: token.id,
      is_current_turn: false,
      has_acted_this_turn: false
    }));

    // Сортируем по инициативе и назначаем порядок
    initiatives.sort((a, b) => b.initiative_roll - a.initiative_roll);
    initiatives.forEach((init, index) => {
      init.turn_order = initiatives.length - index;
      init.is_current_turn = index === 0;
    });

    await supabase.from('initiative_tracker').insert(initiatives);
    setIsBattleActive(true);
  };

  const nextTurn = async () => {
    if (!initiative.length) return;

    const currentIndex = initiative.findIndex(i => i.is_current_turn);
    const nextIndex = (currentIndex + 1) % initiative.length;
    
    if (nextIndex === 0) {
      setCurrentRound(prev => prev + 1);
    }

    // Обновляем инициативу
    const updates = initiative.map((init, index) => ({
      ...init,
      is_current_turn: index === nextIndex,
      has_acted_this_turn: index === currentIndex ? true : init.has_acted_this_turn
    }));

    await Promise.all(
      updates.map(update => 
        supabase.from('initiative_tracker').update(update).eq('id', update.id)
      )
    );
  };

  const endBattle = async () => {
    if (!sessionId) return;

    await supabase.from('initiative_tracker').delete().eq('session_id', sessionId);
    setIsBattleActive(false);
    setCurrentRound(1);
  };

  const updateTokenHP = async (tokenId: string, newHP: number) => {
    await supabase
      .from('battle_tokens')
      .update({ current_hp: Math.max(0, newHP) })
      .eq('id', tokenId);
  };

  const logAction = async (description: string, damage = 0) => {
    if (!sessionId) return;

    await supabase.from('session_messages').insert({
      session_id: sessionId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      sender_name: 'DM',
      message_type: 'combat_action',
      content: description
    });
  };

  const getHPColor = (current: number, max: number) => {
    const percent = (current / max) * 100;
    if (percent > 75) return 'text-green-600';
    if (percent > 50) return 'text-yellow-600';
    if (percent > 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHPEmoji = (current: number, max: number) => {
    const percent = (current / max) * 100;
    if (percent > 75) return '🟢';
    if (percent > 50) return '🟡';
    if (percent > 25) return '🟠';
    return '🔴';
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Левая панель - Управление */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold">🧙 Панель DM</h1>
            <Badge variant={isBattleActive ? 'destructive' : 'outline'}>
              {isBattleActive ? 'Бой' : 'Подготовка'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Карта: {mapName}</p>
        </div>

        <Tabs defaultValue="battle" className="h-full">
          <TabsList className="grid w-full grid-cols-4 m-2">
            <TabsTrigger value="battle">⚔️</TabsTrigger>
            <TabsTrigger value="tokens">👥</TabsTrigger>
            <TabsTrigger value="tools">🛠️</TabsTrigger>
            <TabsTrigger value="notes">📝</TabsTrigger>
          </TabsList>

          {/* Вкладка боя */}
          <TabsContent value="battle" className="space-y-4 p-4">
            {/* Управление боем */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Управление боем</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!isBattleActive ? (
                  <Button onClick={rollInitiative} className="w-full" variant="destructive">
                    <Dice6 className="h-4 w-4 mr-2" />
                    Начать бой
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Раунд: {currentRound}</span>
                      <Badge variant="outline">Ход {initiative.findIndex(i => i.is_current_turn) + 1}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={nextTurn} size="sm" className="flex-1">
                        <SkipForward className="h-4 w-4 mr-1" />
                        Следующий
                      </Button>
                      <Button onClick={endBattle} size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Инициатива */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">🧠 Инициатива</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  {initiative.map((init, index) => (
                    <div
                      key={init.id}
                      className={`flex items-center justify-between p-2 rounded mb-1 ${
                        init.is_current_turn ? 'bg-primary/20 border border-primary' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {init.is_current_turn && <Target className="h-3 w-3 text-primary" />}
                        <span className="text-sm font-medium">{init.character_name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {init.initiative_roll}
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Лог боя */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">📚 Лог боя</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-24">
                  {battleLog.map(log => (
                    <div key={log.id} className="text-xs p-1 border-b last:border-b-0">
                      <span className="text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString()}:
                      </span>
                      <span className="ml-1">{log.description}</span>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка токенов */}
          <TabsContent value="tokens" className="space-y-4 p-4">
            {/* Добавление токена */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Добавить токен</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Имя токена"
                  value={newTokenForm.name}
                  onChange={(e) => setNewTokenForm({...newTokenForm, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="HP"
                    value={newTokenForm.hp}
                    onChange={(e) => setNewTokenForm({...newTokenForm, hp: parseInt(e.target.value)})}
                  />
                  <Input
                    type="number"
                    placeholder="AC"
                    value={newTokenForm.ac}
                    onChange={(e) => setNewTokenForm({...newTokenForm, ac: parseInt(e.target.value)})}
                  />
                </div>
                <Button onClick={addToken} className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </CardContent>
            </Card>

            {/* Список токенов */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">📌 Токены на карте</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {tokens.map(token => (
                    <div key={token.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: token.color }}
                        />
                        <div>
                          <div className="text-sm font-medium">{token.name}</div>
                          {token.max_hp && (
                            <div className="text-xs text-muted-foreground">
                              {getHPEmoji(token.current_hp || 0, token.max_hp)} 
                              {token.current_hp}/{token.max_hp} HP
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {token.armor_class && (
                          <Badge variant="outline" className="text-xs">
                            AC {token.armor_class}
                          </Badge>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            if (token.current_hp && token.current_hp > 0) {
                              updateTokenHP(token.id, (token.current_hp || 0) - 5);
                            }
                          }}
                        >
                          <Heart className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка инструментов */}
          <TabsContent value="tools" className="space-y-4 p-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">⚒️ Инструменты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'select', icon: MousePointer, label: 'Выбрать' },
                    { id: 'move', icon: Move, label: 'Переместить' },
                    { id: 'fog', icon: Eye, label: 'Туман' },
                    { id: 'ruler', icon: Ruler, label: 'Линейка' },
                    { id: 'circle', icon: Circle, label: 'Область' },
                    { id: 'grid', icon: Grid, label: 'Сетка' }
                  ].map(tool => (
                    <Button
                      key={tool.id}
                      size="sm"
                      variant={selectedTool === tool.id ? 'default' : 'outline'}
                      onClick={() => setSelectedTool(tool.id)}
                      className="text-xs"
                    >
                      <tool.icon className="h-3 w-3 mr-1" />
                      {tool.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">⚙️ Настройки карты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Туман войны</Label>
                  <Switch checked={fogOfWar} onCheckedChange={setFogOfWar} />
                </div>
                <div>
                  <Label className="text-sm">Размер сетки: {gridSize[0]}px</Label>
                  <Slider
                    value={gridSize}
                    onValueChange={setGridSize}
                    max={50}
                    min={10}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка заметок */}
          <TabsContent value="notes" className="space-y-4 p-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">💬 Заметки DM</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Секретные заметки мастера..."
                  value={dmNotes}
                  onChange={(e) => setDmNotes(e.target.value)}
                  className="min-h-[200px] text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Основная область - Карта */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">🗺️ {mapName}</h2>
              <Badge variant="outline">Сетка: {gridSize[0]}px</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Загрузить карту
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  // Очистить карту
                  if (sessionId) {
                    supabase.from('battle_tokens').delete().eq('session_id', sessionId);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <AdvancedBattleMap
            isDM={true}
            onMapUpload={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default DMDashboard;