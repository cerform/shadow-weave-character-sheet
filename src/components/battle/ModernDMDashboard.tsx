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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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
  Target,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Monitor,
  Home,
  Archive,
  FileText,
  Image,
  Camera,
  Layers,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';

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

const DMDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [tokens, setTokens] = useState<BattleToken[]>([]);
  const [initiative, setInitiative] = useState<InitiativeEntry[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [selectedTool, setSelectedTool] = useState('select');
  const [mapName, setMapName] = useState('Battle Map');
  const [dmNotes, setDmNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showInitiative, setShowInitiative] = useState(true);
  const [showTokens, setShowTokens] = useState(true);
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

  const getHPColor = (current: number, max: number) => {
    const percent = (current / max) * 100;
    if (percent > 75) return 'bg-green-500';
    if (percent > 50) return 'bg-yellow-500';
    if (percent > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'move', icon: Move, label: 'Move' },
    { id: 'ruler', icon: Ruler, label: 'Measure' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'square', icon: Square, label: 'Square' },
    { id: 'triangle', icon: Triangle, label: 'Cone' },
    { id: 'fog', icon: Eye, label: 'Fog of War' },
    { id: 'grid', icon: Grid, label: 'Grid' }
  ];

  return (
    <div className="h-screen bg-slate-800 text-white flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-12 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="text-slate-300 hover:text-white"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">{mapName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className={showChat ? 'bg-slate-700' : ''}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Tools */}
        <div className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col items-center py-4 gap-2">
          {tools.map(tool => (
            <Button
              key={tool.id}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTool(tool.id)}
              className={`w-10 h-10 p-0 ${
                selectedTool === tool.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
            </Button>
          ))}
          
          <Separator className="my-2 w-8" />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                title="Add Token"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Token</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Name</Label>
                  <Input
                    value={newTokenForm.name}
                    onChange={(e) => setNewTokenForm({...newTokenForm, name: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-slate-300">HP</Label>
                    <Input
                      type="number"
                      value={newTokenForm.hp}
                      onChange={(e) => setNewTokenForm({...newTokenForm, hp: parseInt(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">AC</Label>
                    <Input
                      type="number"
                      value={newTokenForm.ac}
                      onChange={(e) => setNewTokenForm({...newTokenForm, ac: parseInt(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Button onClick={addToken} className="w-full bg-blue-600 hover:bg-blue-700">
                  Add Token
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 bg-slate-700 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-slate-700 to-blue-900/20">
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
              }}
            />
            
            {/* Map Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Battle Map</p>
                <p className="text-sm">Click "Upload Map" to load a battle map</p>
              </div>
            </div>

            {/* Tokens Layer */}
            {tokens.map(token => (
              <div
                key={token.id}
                className="absolute w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform"
                style={{
                  backgroundColor: token.color,
                  left: `${token.position_x}px`,
                  top: `${token.position_y}px`
                }}
                title={`${token.name} (${token.current_hp}/${token.max_hp} HP)`}
              >
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/50 px-1 rounded">
                  {token.name}
                </div>
              </div>
            ))}
          </div>

          {/* Map Controls - Bottom Center */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload Map
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm" className="text-white">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panels */}
        <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
          {/* Initiative Panel */}
          {showInitiative && (
            <div className="border-b border-slate-700">
              <div className="p-3 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-400" />
                    Initiative
                  </h3>
                  <div className="flex items-center gap-2">
                    {isBattleActive && (
                      <Badge variant="destructive" className="text-xs">
                        Round {currentRound}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInitiative(false)}
                    >
                      <Minimize2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                {!isBattleActive ? (
                  <Button onClick={rollInitiative} className="w-full bg-red-600 hover:bg-red-700">
                    <Dice6 className="h-4 w-4 mr-2" />
                    Roll Initiative
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={nextTurn} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      <SkipForward className="h-4 w-4 mr-1" />
                      Next
                    </Button>
                    <Button onClick={endBattle} size="sm" variant="outline">
                      <Pause className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <ScrollArea className="h-32">
                  {initiative.map((init) => (
                    <div
                      key={init.id}
                      className={`flex items-center justify-between p-2 rounded mb-1 ${
                        init.is_current_turn 
                          ? 'bg-red-600/20 border border-red-500' 
                          : 'bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {init.is_current_turn && <Target className="h-3 w-3 text-red-400" />}
                        <span className="text-sm text-white">{init.character_name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {init.initiative_roll}
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Tokens Panel */}
          {showTokens && (
            <div className="flex-1">
              <div className="p-3 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    Tokens ({tokens.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTokens(false)}
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-3">
                {tokens.map(token => (
                  <div key={token.id} className="bg-slate-800/50 rounded p-2 mb-2 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: token.color }}
                        />
                        <span className="text-sm font-medium text-white">{token.name}</span>
                      </div>
                      {token.armor_class && (
                        <Badge variant="outline" className="text-xs">
                          AC {token.armor_class}
                        </Badge>
                      )}
                    </div>
                    
                    {token.max_hp && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>HP: {token.current_hp}/{token.max_hp}</span>
                          <span>{Math.round((token.current_hp || 0) / token.max_hp * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getHPColor(token.current_hp || 0, token.max_hp)}`}
                            style={{ width: `${(token.current_hp || 0) / token.max_hp * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Chat Panel */}
          {showChat && (
            <div className="h-64 border-t border-slate-700">
              <div className="p-3 border-b border-slate-700 bg-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-400" />
                  Chat
                </h3>
              </div>
              
              <div className="flex-1 p-3">
                <ScrollArea className="h-32 mb-2">
                  <div className="text-xs text-slate-400">
                    Chat messages will appear here...
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type message..." 
                    className="bg-slate-800 border-slate-600 text-white text-sm"
                  />
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DMDashboard;