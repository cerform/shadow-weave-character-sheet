import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sword, Shield, Eye, EyeOff, Users, Dice6, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface InitiativeEntry {
  id: string;
  character_name: string;
  initiative_roll: number;
  initiative_modifier: number;
  is_current_turn: boolean;
  turn_order: number;
  has_acted_this_turn: boolean;
  token_id?: string;
}

interface BattleToken {
  id: string;
  name: string;
  position_x: number;
  position_y: number;
  current_hp?: number;
  max_hp?: number;
  armor_class?: number;
  is_visible: boolean;
  is_hidden_from_players: boolean;
  token_type: string;
}

interface FogCell {
  id: string;
  grid_x: number;
  grid_y: number;
  is_revealed: boolean;
}

interface BattleSystemProps {
  sessionId: string;
  mapId?: string;
  isDM: boolean;
  onTokenVisibilityChange?: (tokenId: string, visible: boolean) => void;
  onInitiativeChange?: (currentTurn: string) => void;
}

export const BattleSystem: React.FC<BattleSystemProps> = ({
  sessionId,
  mapId,
  isDM,
  onTokenVisibilityChange,
  onInitiativeChange
}) => {
  const { user } = useAuth();
  const [initiative, setInitiative] = useState<InitiativeEntry[]>([]);
  const [tokens, setTokens] = useState<BattleToken[]>([]);
  const [fogCells, setFogCells] = useState<FogCell[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [showInitiativeDialog, setShowInitiativeDialog] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newInitiativeRoll, setNewInitiativeRoll] = useState(10);
  const [newInitiativeModifier, setNewInitiativeModifier] = useState(0);
  const [fogEnabled, setFogEnabled] = useState(true);
  const [battleStarted, setBattleStarted] = useState(false);
  const [brushSize, setBrushSize] = useState(3);

  // Load battle data
  useEffect(() => {
    if (!sessionId) return;
    
    loadInitiative();
    loadTokens();
    if (mapId) loadFogOfWar();
    
    // Subscribe to real-time updates
    const initiativeChannel = supabase
      .channel(`initiative_${sessionId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'initiative_tracker', filter: `session_id=eq.${sessionId}` },
        () => loadInitiative()
      )
      .subscribe();

    const tokensChannel = supabase
      .channel(`tokens_${sessionId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'battle_tokens', filter: `session_id=eq.${sessionId}` },
        () => loadTokens()
      )
      .subscribe();

    const fogChannel = mapId ? supabase
      .channel(`fog_${mapId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'fog_of_war', filter: `map_id=eq.${mapId}` },
        () => loadFogOfWar()
      )
      .subscribe() : null;

    return () => {
      initiativeChannel.unsubscribe();
      tokensChannel.unsubscribe();
      if (fogChannel) fogChannel.unsubscribe();
    };
  }, [sessionId, mapId]);

  const loadInitiative = async () => {
    try {
      const { data, error } = await supabase
        .from('initiative_tracker')
        .select('*')
        .eq('session_id', sessionId)
        .order('turn_order');

      if (error) throw error;
      setInitiative(data || []);
      
      const currentTurn = data?.find(entry => entry.is_current_turn);
      if (currentTurn) {
        onInitiativeChange?.(currentTurn.id);
      }
    } catch (error) {
      console.error('Error loading initiative:', error);
    }
  };

  const loadTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('battle_tokens')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const loadFogOfWar = async () => {
    if (!mapId) return;
    
    try {
      const { data, error } = await supabase
        .from('fog_of_war')
        .select('*')
        .eq('map_id', mapId);

      if (error) throw error;
      setFogCells(data || []);
    } catch (error) {
      console.error('Error loading fog of war:', error);
    }
  };

  const addToInitiative = async () => {
    if (!newCharacterName.trim()) return;

    try {
      const nextOrder = Math.max(...initiative.map(i => i.turn_order), 0) + 1;
      
      const { error } = await supabase
        .from('initiative_tracker')
        .insert({
          session_id: sessionId,
          character_name: newCharacterName,
          initiative_roll: newInitiativeRoll,
          initiative_modifier: newInitiativeModifier,
          turn_order: nextOrder,
          is_current_turn: initiative.length === 0
        });

      if (error) throw error;
      
      setNewCharacterName('');
      setNewInitiativeRoll(10);
      setNewInitiativeModifier(0);
      setShowInitiativeDialog(false);
      toast.success('Персонаж добавлен в инициативу');
    } catch (error) {
      console.error('Error adding to initiative:', error);
      toast.error('Ошибка добавления в инициативу');
    }
  };

  const nextTurn = async () => {
    if (initiative.length === 0) return;

    try {
      const currentIndex = initiative.findIndex(entry => entry.is_current_turn);
      const nextIndex = (currentIndex + 1) % initiative.length;
      const nextRound = nextIndex === 0 ? currentRound + 1 : currentRound;

      // Update current turn
      await supabase
        .from('initiative_tracker')
        .update({ is_current_turn: false, has_acted_this_turn: true })
        .eq('session_id', sessionId)
        .eq('is_current_turn', true);

      await supabase
        .from('initiative_tracker')
        .update({ 
          is_current_turn: true, 
          has_acted_this_turn: false,
          round_number: nextRound 
        })
        .eq('id', initiative[nextIndex].id);

      if (nextIndex === 0) {
        setCurrentRound(nextRound);
        // Reset all has_acted_this_turn flags at start of new round
        await supabase
          .from('initiative_tracker')
          .update({ has_acted_this_turn: false })
          .eq('session_id', sessionId);
      }

      toast.success(`Ход: ${initiative[nextIndex].character_name}`);
    } catch (error) {
      console.error('Error advancing turn:', error);
      toast.error('Ошибка смены хода');
    }
  };

  const resetInitiative = async () => {
    try {
      await supabase
        .from('initiative_tracker')
        .delete()
        .eq('session_id', sessionId);
      
      setCurrentRound(1);
      setBattleStarted(false);
      toast.success('Инициатива сброшена');
    } catch (error) {
      console.error('Error resetting initiative:', error);
      toast.error('Ошибка сброса инициативы');
    }
  };

  const toggleTokenVisibility = async (tokenId: string) => {
    if (!isDM) return;

    try {
      const token = tokens.find(t => t.id === tokenId);
      if (!token) return;

      const { error } = await supabase
        .from('battle_tokens')
        .update({ is_hidden_from_players: !token.is_hidden_from_players })
        .eq('id', tokenId);

      if (error) throw error;
      
      onTokenVisibilityChange?.(tokenId, !token.is_hidden_from_players);
      toast.success(`Токен ${!token.is_hidden_from_players ? 'скрыт' : 'показан'} игрокам`);
    } catch (error) {
      console.error('Error toggling token visibility:', error);
      toast.error('Ошибка изменения видимости токена');
    }
  };

  const revealFogArea = async (centerX: number, centerY: number) => {
    if (!isDM || !mapId) return;

    try {
      const cellsToReveal = [];
      
      for (let x = centerX - brushSize; x <= centerX + brushSize; x++) {
        for (let y = centerY - brushSize; y <= centerY + brushSize; y++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (distance <= brushSize) {
            cellsToReveal.push({ 
              session_id: sessionId,
              map_id: mapId,
              grid_x: x, 
              grid_y: y, 
              is_revealed: true,
              revealed_at: new Date().toISOString(),
              revealed_by_user_id: user?.id
            });
          }
        }
      }

      const { error } = await supabase
        .from('fog_of_war')
        .upsert(cellsToReveal, { onConflict: 'session_id,map_id,grid_x,grid_y' });

      if (error) throw error;
    } catch (error) {
      console.error('Error revealing fog area:', error);
    }
  };

  const hideFogArea = async (centerX: number, centerY: number) => {
    if (!isDM || !mapId) return;

    try {
      const cellsToHide = [];
      
      for (let x = centerX - brushSize; x <= centerX + brushSize; x++) {
        for (let y = centerY - brushSize; y <= centerY + brushSize; y++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (distance <= brushSize) {
            cellsToHide.push({ 
              session_id: sessionId,
              map_id: mapId,
              grid_x: x, 
              grid_y: y, 
              is_revealed: false,
              revealed_at: null,
              revealed_by_user_id: null
            });
          }
        }
      }

      const { error } = await supabase
        .from('fog_of_war')
        .upsert(cellsToHide, { onConflict: 'session_id,map_id,grid_x,grid_y' });

      if (error) throw error;
    } catch (error) {
      console.error('Error hiding fog area:', error);
    }
  };

  const rollInitiative = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    setNewInitiativeRoll(roll);
  };

  if (!isDM) {
    // Player view - simplified
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sword className="h-5 w-5" />
              Инициатива - Раунд {currentRound}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              {initiative.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    entry.is_current_turn ? 'bg-primary/20' : 'bg-secondary/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.is_current_turn ? 'default' : 'secondary'}>
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{entry.character_name}</span>
                  </div>
                  <Badge variant="outline">
                    {entry.initiative_roll + entry.initiative_modifier}
                  </Badge>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Initiative Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sword className="h-5 w-5" />
              Инициатива - Раунд {currentRound}
            </div>
            <div className="flex gap-2">
              <Dialog open={showInitiativeDialog} onOpenChange={setShowInitiativeDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Users className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить в инициативу</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="character-name">Имя персонажа</Label>
                      <Input
                        id="character-name"
                        value={newCharacterName}
                        onChange={(e) => setNewCharacterName(e.target.value)}
                        placeholder="Введите имя"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="initiative-roll">Бросок инициативы</Label>
                        <div className="flex gap-2">
                          <Input
                            id="initiative-roll"
                            type="number"
                            min="1"
                            max="20"
                            value={newInitiativeRoll}
                            onChange={(e) => setNewInitiativeRoll(parseInt(e.target.value) || 1)}
                          />
                          <Button size="sm" onClick={rollInitiative}>
                            <Dice6 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="initiative-modifier">Модификатор</Label>
                        <Input
                          id="initiative-modifier"
                          type="number"
                          value={newInitiativeModifier}
                          onChange={(e) => setNewInitiativeModifier(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addToInitiative} className="flex-1">
                        Добавить
                      </Button>
                      <Button variant="outline" onClick={() => setShowInitiativeDialog(false)}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" onClick={nextTurn} disabled={initiative.length === 0}>
                Следующий ход
              </Button>
              <Button size="sm" variant="destructive" onClick={resetInitiative}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {initiative.map((entry, index) => (
              <div 
                key={entry.id}
                className={`flex items-center justify-between p-2 rounded mb-1 ${
                  entry.is_current_turn ? 'bg-primary/20' : 'bg-secondary/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant={entry.is_current_turn ? 'default' : 'secondary'}>
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{entry.character_name}</span>
                  {entry.has_acted_this_turn && (
                    <Badge variant="outline" className="text-xs">
                      Действовал
                    </Badge>
                  )}
                </div>
                <Badge variant="outline">
                  {entry.initiative_roll + entry.initiative_modifier}
                </Badge>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Token Visibility Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Управление видимостью токенов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            {tokens.map((token) => (
              <div key={token.id} className="flex items-center justify-between p-2 border-b">
                <span className="text-sm">{String(token.name || 'Token')}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleTokenVisibility(token.id)}
                >
                  {token.is_hidden_from_players ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Fog of War Controls */}
      {mapId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Туман войны
              </div>
              <Switch
                checked={fogEnabled}
                onCheckedChange={setFogEnabled}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Размер кисти: {brushSize}</Label>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Клик + Shift = Открыть область<br/>
              Клик + Alt = Скрыть область
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};