import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { socketService } from '@/services/socket';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useVTT } from '@/vtt/hooks/useVTT';
import { VTTLayout } from '@/components/vtt/VTTLayout';
import { FogTools } from '@/vtt/ui/FogTools';
import { AIGenerator } from '@/components/battle/BattleMapUI/sidebars/AIGenerator';
import { NPCVoicePanel } from '@/components/battle/NPCVoicePanel';
import { TokenRadialMenu } from '@/components/battle/TokenRadialMenu';
import {
  Loader2, Crown, Users, Dice6, Sword, Map,
  Mic, MicOff, Settings, ArrowLeft, Copy, Share2,
  ChevronLeft, ChevronRight, Bot, User, Wand2
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface SessionInfo {
  id: string;
  name: string;
  session_code: string;
  dm_id: string;
  is_active: boolean;
  is_ai_dm: boolean;
  current_map_url?: string;
}

interface PlayerInfo {
  id: string;
  player_name: string;
  is_dm: boolean;
  is_online: boolean;
  character_data?: any;
}

interface DiceResult {
  id: string;
  playerName: string;
  diceType: string;
  total: number;
  rolls: number[];
  timestamp: string;
  isCritical?: boolean;
}

interface ChatMessage {
  id: string;
  sender_name: string;
  content: string;
  type: 'chat' | 'dice' | 'system' | 'npc' | 'ai';
  created_at: string;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function VTTBattlePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [diceResults, setDiceResults] = useState<DiceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDM, setIsDM] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [radialMenu, setRadialMenu] = useState<{ visible: boolean; x: number; y: number; tokenId: string; tokenName: string }>({
    visible: false, x: 0, y: 0, tokenId: '', tokenName: ''
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ─── VTT Engine ─────────────────────────────────────────────────────────
  const { canvasRef, core, state: vttState, fog } = useVTT({
    sessionId: sessionId || '',
    isDM,
    gridSize: 50,
    mapUrl: session?.current_map_url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=80'
  });

  // ─── Load Session ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      const { data: sess } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!sess) {
        toast({ title: 'Сессия не найдена', variant: 'destructive' });
        navigate('/dm');
        return;
      }
      setSession(sess);
      setIsDM(sess.dm_id === user?.id);

      // Load players
      const { data: pl } = await supabase
        .from('session_players')
        .select('*')
        .eq('session_id', sessionId);
      setPlayers(pl || []);

      setLoading(false);
    };
    load();
  }, [sessionId, user?.id]);

  // ─── Supabase Realtime (primary sync for production) ────────────────────
  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to player changes
    const playerSub = supabase
      .channel(`vtt-players-${sessionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'session_players',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlayers(prev => [...prev, payload.new as PlayerInfo]);
        } else if (payload.eventType === 'UPDATE') {
          setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new as PlayerInfo : p));
        } else if (payload.eventType === 'DELETE') {
          setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    // Subscribe to messages
    const msgSub = supabase
      .channel(`vtt-messages-${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'session_messages',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        setMessages(prev => [...prev, msg].slice(-100));
      })
      .subscribe();

    // Subscribe to session changes (map updates, etc.)
    const sessionSub = supabase
      .channel(`vtt-session-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'game_sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        setSession(prev => prev ? { ...prev, ...payload.new } : null);
        // If map URL changed, update VTT
        if (payload.new.current_map_url && core) {
          core.loadMap(payload.new.current_map_url);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(playerSub);
      supabase.removeChannel(msgSub);
      supabase.removeChannel(sessionSub);
    };
  }, [sessionId, core]);

  // ─── Socket Events (if backend available) ────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    const sock = socketService.getSocket();
    if (!sock) return;

    // Map generated by AI
    sock.on('session:map_generated', ({ imageUrl }: { imageUrl: string }) => {
      if (core) core.loadMap(imageUrl);
      setSession(prev => prev ? { ...prev, current_map_url: imageUrl } : null);
      toast({ title: '🗺️ Карта обновлена', description: 'AI сгенерировал новую карту' });
    });

    // AI commentary → appears in chat
    sock.on('session:message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, { ...msg, id: msg.id || crypto.randomUUID() }].slice(-100));
    });

    // Dice result from another player
    sock.on('session:dice_result', (data: DiceResult) => {
      setDiceResults(prev => [data, ...prev].slice(0, 20));
    });

    return () => {
      sock.off('session:map_generated');
      sock.off('session:message');
      sock.off('session:dice_result');
    };
  }, [sessionId, core]);

  // ─── Auto-scroll chat ─────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!chatInput.trim() || !sessionId || !user) return;
    const content = chatInput.trim();
    setChatInput('');

    await supabase.from('session_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      sender_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
      message_type: 'chat',
      content,
    });
  }, [chatInput, sessionId, user]);

  const rollDice = useCallback((diceType: string) => {
    const sides = parseInt(diceType.slice(1));
    const roll = Math.floor(Math.random() * sides) + 1;
    const isCritical = sides === 20 && (roll === 20 || roll === 1);
    
    const result: DiceResult = {
      id: crypto.randomUUID(),
      playerName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player',
      diceType,
      total: roll,
      rolls: [roll],
      timestamp: new Date().toISOString(),
      isCritical,
    };

    setDiceResults(prev => [result, ...prev].slice(0, 20));

    // Broadcast via socket
    socketService.rollDice(diceType);

    // Save to DB
    if (sessionId && user) {
      supabase.from('session_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        sender_name: result.playerName,
        message_type: 'dice',
        content: `Бросил ${diceType} → ${roll}${isCritical ? (roll === 20 ? ' 🎯 КРИТ!' : ' 💀 ПРОВАЛ!') : ''}`,
        dice_roll_data: result,
      });
    }

    if (isCritical) {
      toast({
        title: roll === 20 ? '🎯 Критический успех!' : '💀 Критический провал!',
        description: `${diceType}: ${roll}`,
      });
    }
  }, [user, sessionId, toast]);

  const copyInviteLink = () => {
    if (!session) return;
    const url = `${window.location.origin}/join?code=${session.session_code}`;
    navigator.clipboard.writeText(url);
    toast({ title: '🔗 Ссылка скопирована', description: url });
  };

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="text-5xl"
          >
            ⚔️
          </motion.div>
          <div className="text-white/60 text-sm">Входим в Нексус...</div>
        </div>
      </div>
    );
  }

  const onlinePlayers = players.filter(p => p.is_online);
  const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

  return (
    <div className="fixed inset-0 bg-[#050508] text-slate-100 flex overflow-hidden select-none">

      {/* ══ LEFT SIDEBAR ══ */}
      <AnimatePresence>
        {leftOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-30 w-80 flex-shrink-0 bg-slate-950/90 backdrop-blur-xl border-r border-white/5 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {isDM ? <Crown className="h-4 w-4 text-amber-400" /> : <User className="h-4 w-4 text-blue-400" />}
                  <span className="font-bold text-sm text-white truncate">{session?.name}</span>
                </div>
                <button onClick={copyInviteLink} title="Копировать ссылку" className="text-slate-500 hover:text-white transition p-1">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-600">Код:</span>
                <span className="font-mono text-amber-400 text-xs font-bold">{session?.session_code}</span>
                {session?.is_ai_dm && <span className="text-[10px] bg-purple-900/40 text-purple-300 border border-purple-700/30 px-1.5 py-0.5 rounded-full">AI DM</span>}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Players list */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-2 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Партия ({onlinePlayers.length}/{players.length})
                </div>
                <div className="space-y-1">
                  {players.map(p => (
                    <div key={p.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${p.is_online ? 'bg-slate-800/60' : 'opacity-40'}`}>
                      <div className={`w-2 h-2 rounded-full ${p.is_online ? 'bg-green-400' : 'bg-slate-600'}`} />
                      {p.is_dm ? <Crown className="h-3 w-3 text-amber-400 flex-shrink-0" /> : <User className="h-3 w-3 text-blue-400 flex-shrink-0" />}
                      <span className="text-xs text-slate-300 truncate">{p.player_name}</span>
                    </div>
                  ))}
                  {players.length === 0 && (
                    <div className="text-slate-600 text-xs text-center py-2">Ждём игроков...</div>
                  )}
                </div>
              </div>

              {/* AI Generator (DM only) */}
              {isDM && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mb-2 flex items-center gap-1">
                    <Wand2 className="h-3 w-3" /> AI Nexus
                  </div>
                  <AIGenerator sessionId={sessionId || ''} />
                </div>
              )}

              {/* NPC Voices */}
              <div>
                <NPCVoicePanel sessionId={sessionId || ''} isDM={isDM} />
              </div>
            </div>

            {/* Invite section (DM only) */}
            {isDM && (
              <div className="p-3 border-t border-white/5">
                <button
                  onClick={copyInviteLink}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/20 text-amber-400 text-xs font-medium transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Пригласить игроков
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle left sidebar */}
      <button
        onClick={() => setLeftOpen(v => !v)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900 border border-white/10 rounded-r-xl p-1.5 hover:bg-slate-800 transition"
        style={{ left: leftOpen ? '320px' : '0px' }}
      >
        {leftOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {/* ══ MAP CANVAS ══ */}
      <div className="relative flex-1 overflow-hidden">
        {/* WebGL Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: 'crosshair' }}
        />

        {/* VTT Loading overlay */}
        {vttState.loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
              <p className="text-sm text-slate-400">Загрузка карты...</p>
            </div>
          </div>
        )}

        {/* VTT Error */}
        {vttState.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center">
              <Map className="h-12 w-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-2">VTT временно недоступен</p>
              <p className="text-slate-700 text-xs">{vttState.error}</p>
            </div>
          </div>
        )}

        {/* DM: Fog Tools */}
        {isDM && vttState.initialized && (
          <div className="absolute top-4 left-4 z-20">
            <FogTools
              brush={fog.brush}
              onBrushChange={fog.setBrush}
              onRevealAll={() => core?.revealAllFog()}
              onHideAll={() => core?.hideAllFog()}
              visible={fog.enabled}
            />
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(isDM ? '/dm' : '/')}
          className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Выйти
        </button>

        {/* ── DICE BAR (center bottom) ── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-3 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          {DICE_TYPES.map(d => {
            const lastResult = diceResults.find(r => r.diceType === d);
            return (
              <button
                key={d}
                onClick={() => rollDice(d)}
                className="relative flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-amber-500/10 hover:text-amber-400 text-slate-400 transition-all active:scale-90 group"
              >
                <Dice6 className="h-5 w-5 opacity-50 group-hover:opacity-100" />
                <span className="text-[9px] font-bold absolute bottom-1">{d}</span>
                {lastResult && (
                  <motion.div
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`absolute -top-6 text-xs font-black ${lastResult.isCritical ? (lastResult.total === parseInt(d.slice(1)) ? 'text-green-400' : 'text-red-400') : 'text-white'}`}
                  >
                    {lastResult.total}
                  </motion.div>
                )}
              </button>
            );
          })}
          
          {/* Recent roll display */}
          {diceResults[0] && (
            <motion.div
              key={diceResults[0].id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`ml-3 pl-3 border-l border-white/10 flex items-center gap-2 ${diceResults[0].isCritical ? (diceResults[0].total === parseInt(diceResults[0].diceType.slice(1)) ? 'text-green-400' : 'text-red-400') : 'text-white'}`}
            >
              <span className="text-2xl font-black">{diceResults[0].total}</span>
              <div className="text-[10px] text-slate-500 leading-tight">
                <div>{diceResults[0].diceType}</div>
                <div>{diceResults[0].playerName}</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Token Radial Menu */}
        <TokenRadialMenu
          isOpen={radialMenu.visible}
          onClose={() => setRadialMenu(m => ({ ...m, visible: false }))}
          position={{ x: radialMenu.x, y: radialMenu.y }}
          tokenName={radialMenu.tokenName}
          onAction={(action) => {
            console.log('Token action:', action, radialMenu.tokenId);
            setRadialMenu(m => ({ ...m, visible: false }));
          }}
        />
      </div>

      {/* Toggle right sidebar */}
      <button
        onClick={() => setRightOpen(v => !v)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900 border border-white/10 rounded-l-xl p-1.5 hover:bg-slate-800 transition"
        style={{ right: rightOpen ? '320px' : '0px' }}
      >
        {rightOpen ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* ══ RIGHT SIDEBAR — GAME LOG & CHAT ══ */}
      <AnimatePresence>
        {rightOpen && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-30 w-80 flex-shrink-0 bg-slate-950/90 backdrop-blur-xl border-l border-white/5 flex flex-col overflow-hidden"
          >
            {/* Chat header */}
            <div className="p-3 border-b border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Журнал приключений</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <div className="text-center py-8 text-slate-700 text-xs">
                  <Sword className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  История пуста. Начните приключение!
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`text-xs rounded-xl p-2.5 ${
                  msg.type === 'ai' || msg.sender_name === 'AI Dungeon Master'
                    ? 'bg-purple-950/40 border border-purple-700/20'
                    : msg.type === 'dice'
                    ? 'bg-amber-950/30 border border-amber-700/20'
                    : msg.type === 'system'
                    ? 'bg-slate-900/60 border border-white/5 text-slate-500'
                    : msg.type === 'npc'
                    ? 'bg-teal-950/30 border border-teal-700/20'
                    : 'bg-slate-900/40'
                }`}>
                  <div className="flex items-center gap-1 mb-1">
                    {(msg.type === 'ai' || msg.sender_name === 'AI Dungeon Master') && <Bot className="h-3 w-3 text-purple-400" />}
                    {msg.type === 'npc' && <Mic className="h-3 w-3 text-teal-400" />}
                    <span className={`font-semibold text-[10px] ${
                      msg.sender_name === 'AI Dungeon Master' ? 'text-purple-400' :
                      msg.type === 'npc' ? 'text-teal-400' :
                      msg.type === 'dice' ? 'text-amber-400' :
                      'text-slate-400'
                    }`}>
                      {msg.sender_name}
                    </span>
                    <span className="text-slate-700 text-[9px] ml-auto">
                      {new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`leading-relaxed ${
                    msg.sender_name === 'AI Dungeon Master' ? 'text-purple-100 italic' :
                    msg.type === 'npc' ? 'text-teal-100 italic' :
                    'text-slate-300'
                  }`}>
                    {msg.content}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Что делает ваш герой?.."
                  className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim()}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 rounded-xl text-white text-xs transition"
                >
                  →
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
