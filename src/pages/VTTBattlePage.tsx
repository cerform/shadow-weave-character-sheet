import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DiceService } from '@/services/diceService';
import { supabase } from '@/integrations/supabase/client';
import { socketService } from '@/services/socket';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useVTT } from '@/vtt/hooks/useVTT';
import { VTTLayout } from '@/components/vtt/VTTLayout';
import { FogTools } from '@/vtt/ui/FogTools';
import { AIGenerator } from '@/components/battle/BattleMapUI/sidebars/AIGenerator';
import { AIDMService } from '@/services/ai/AIDMService';
import { NPCVoicePanel } from '@/components/battle/NPCVoicePanel';
import { TokenRadialMenu } from '@/components/battle/TokenRadialMenu';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useBattleTokensSync } from '@/hooks/useBattleTokensSync';
import { DiceRollModal } from '@/components/dice/DiceRollModal';
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
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [radialMenu, setRadialMenu] = useState<{ visible: boolean; x: number; y: number; tokenId: string; tokenName: string }>({
    visible: false, x: 0, y: 0, tokenId: '', tokenName: ''
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync VTT tokens to the Store via battle_tokens subscription hook
  useBattleTokensSync(sessionId || '');

  // ─── VTT Engine ─────────────────────────────────────────────────────────
  const { canvasRef, core, state: vttState, fog } = useVTT({
    sessionId: sessionId || '',
    isDM,
    gridSize: 50,
    mapUrl: session?.current_map_url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=80'
  }, {
    onTokenMove: async (tokenId, newX, newY) => {
      // Find the token in the store/state to check ownership
      const playerTokenList = useEnhancedBattleStore.getState().tokens;
      const t = playerTokenList.find(t => t.id === tokenId);
      if (!t) return;

      // Ensure permission
      const canMove = isDM || t.character_id === user?.id;
      if (!canMove) {
        toast({ title: 'Отказано в доступе', description: 'Вы не можете перемещать чужой токен', variant: 'destructive' });
        // It will snap back because Zustand hasn't changed and hook will sync on next render
        return;
      }

      await supabase.from('battle_tokens').update({
        position_x: newX,
        position_y: newY
      }).eq('id', tokenId);
    },
    onTokenClick: (tokenId, event) => {
      const playerTokenList = useEnhancedBattleStore.getState().tokens;
      const t = playerTokenList.find(t => t.id === tokenId);
      if (!t) return;
      setRadialMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        tokenId: t.id,
        tokenName: t.name
      });
    },
    onTokenContextMenu: (tokenId, event) => {
      // same behavior as click for now
      const playerTokenList = useEnhancedBattleStore.getState().tokens;
      const t = playerTokenList.find(t => t.id === tokenId);
      if (!t) return;
      setRadialMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        tokenId: t.id,
        tokenName: t.name
      });
    }
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

      // Load initial chat messages
      const { data: msgs } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(50);
      if (msgs) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMsgs = (msgs as ChatMessage[]).filter(m => !existingIds.has(m.id));
          return [...prev, ...newMsgs].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ).slice(-100);
        });
      }

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

    const playerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player';

    await supabase.from('session_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      sender_name: playerName,
      message_type: 'chat',
      content,
    });

    // If AI DM session, process the player action through the orchestrator
    if (session?.is_ai_dm) {
      setAiThinking(true);
      try {
        const response = await AIDMService.processAction(
          {
            sessionId,
            playerId: user.id,
            characterName: playerName,
            actionType: 'speech',
            content,
          },
          sessionId
        );

        // Insert AI response into session_messages
        await supabase.from('session_messages').insert({
          session_id: sessionId,
          user_id: user.id, // Must be current user ID for RLS
          sender_name: 'AI Dungeon Master',
          message_type: 'ai',
          content: response.narration,
        });
      } catch (err: any) {
        console.error('[VTT] AI DM response failed:', err);
        // Insert a fallback response so the player knows AI heard them
        await supabase.from('session_messages').insert({
          session_id: sessionId,
          user_id: user.id,
          sender_name: 'AI Dungeon Master',
          message_type: 'ai',
          content: '⚠️ Мастер обдумывает ситуацию... (AI временно недоступен)',
        });
      } finally {
        setAiThinking(false);
      }
    }
  }, [chatInput, sessionId, user, session?.is_ai_dm]);

  const rollDice = useCallback(async (diceType: string) => {
    if (!sessionId || !user) return;
    const playerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player';
    const { total, rolls } = DiceService.roll(diceType);
    const isCritical = diceType.toLowerCase().includes('d20') && rolls.includes(20);
    
    const result: DiceResult = {
      formula: diceType,
      playerName,
      total,
      rolls,
      timestamp: new Date().toISOString(),
      isCritical,
    };

    setDiceResults(prev => [result, ...prev].slice(0, 20));

    await supabase.from('session_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      sender_name: playerName,
      message_type: 'dice',
      content: `Бросок ${diceType} → **${total}**${isCritical ? ' 🎯 КРИТ!' : ''}`,
      dice_roll_data: result,
    });
  }, [user, sessionId]);

  const handle3DDiceRoll = useCallback(async (formula: string, reason: string, playerName: string, resultTotal: number) => {
    if (!sessionId || !user) return;
    const isCritical = formula.toLowerCase().includes('d20') && resultTotal >= 20;
    
    const result: DiceResult = {
      formula,
      playerName,
      reason,
      total: resultTotal,
      rolls: [resultTotal],
      timestamp: new Date().toISOString(),
      isCritical,
    };

    setDiceResults(prev => [result, ...prev].slice(0, 20));
    
    await supabase.from('session_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      sender_name: playerName,
      message_type: 'dice',
      content: `Бросок ${formula} ${reason ? '(' + reason + ')' : ''} → **${resultTotal}**${isCritical ? ' 🎯 КРИТ!' : ''}`,
      dice_roll_data: result,
    });
  }, [user, sessionId]);

  const copyInviteLink = () => {
    if (!session) return;
    const url = `${window.location.origin}/join?code=${session.session_code}`;
    navigator.clipboard.writeText(url);
    toast({ title: '🔗 Ссылка скопирована', description: url });
  };

  const onlinePlayers = players.filter(p => p.is_online);
  const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

  return (
    <div className="fixed inset-0 bg-[#050508] text-slate-100 flex overflow-hidden select-none">
      {/* ─── Loading screen Overlay ────────────────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-[#050508] flex items-center justify-center">
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
      )}

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
        {(vttState.loading || vttState.error) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              {vttState.loading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                  <p className="text-sm text-slate-400">Загрузка карты...</p>
                </>
              ) : (
                <>
                  <div className="text-red-500 text-3xl mb-2">⚠️</div>
                  <p className="text-sm text-red-400 font-medium">Ошибка инициализации</p>
                  <p className="text-xs text-red-500/70 max-w-xs text-center">{vttState.error}</p>
                  <Button variant="outline" size="sm" className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => window.location.reload()}>
                    Перезагрузить
                  </Button>
                </>
              )}
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



        {/* Token Radial Menu */}
        <TokenRadialMenu
          isOpen={radialMenu.visible}
          onClose={() => setRadialMenu(m => ({ ...m, visible: false }))}
          position={{ x: radialMenu.x, y: radialMenu.y }}
          tokenName={radialMenu.tokenName}
          onAction={async (action) => {
            const tokenId = radialMenu.tokenId;
            setRadialMenu(m => ({ ...m, visible: false }));

            if (!tokenId || !sessionId) return;

            const playerTokenList = useEnhancedBattleStore.getState().tokens;
            const token = playerTokenList.find(t => t.id === tokenId);
            
            // Permission check: DM can do all; player can only act on their own token
            if (!isDM && (!token || token.owner_id !== user?.id)) return;

            if (action === 'delete') {
              if (!isDM) return;
              await supabase.from('battle_tokens').delete().eq('id', tokenId);
              toast({ title: "Токен удален", description: `${token?.name} покинул поле боя` });
            } else if (action === 'hide') {
              if (!isDM) return;
              await supabase.from('battle_tokens').update({ is_hidden_from_players: true }).eq('id', tokenId);
            } else if (action === 'show') {
              if (!isDM) return;
              await supabase.from('battle_tokens').update({ is_hidden_from_players: false }).eq('id', tokenId);
            } else if (action === 'ping') {
              if (sessionId && user) {
                await supabase.from('session_messages').insert({
                  session_id: sessionId,
                  user_id: user.id,
                  sender_name: 'System',
                  message_type: 'system',
                  content: `📍 ${radialMenu.tokenName} отмечен на карте`,
                });
              }
            } else if (action === 'attack') {
              const rollResult = Math.floor(Math.random() * 20) + 1;
              if (sessionId && user) {
                await supabase.from('session_messages').insert({
                  session_id: sessionId,
                  user_id: user.id,
                  sender_name: token?.name || 'Unknown',
                  message_type: 'dice',
                  content: `⚔️ **Атака** от ${token?.name || 'неизвестного'}: Бросок d20 → **${rollResult}**`,
                  dice_roll_data: { diceType: 'd20', total: rollResult, rolls: [rollResult], playerName: token?.name }
                });
              }
              toast({ title: "Атака", description: `${token?.name} атакует! Бросок: ${rollResult}` });
            } else if (action === 'heal') {
              const healAmount = Math.floor(Math.random() * 8) + 2; 
              if (token) {
                const newHp = Math.min(token.maxHp, token.hp + healAmount);
                await supabase.from('battle_tokens').update({ hp: newHp }).eq('id', tokenId);
                
                if (sessionId && user) {
                  await supabase.from('session_messages').insert({
                    session_id: sessionId,
                    user_id: user.id,
                    sender_name: 'System',
                    message_type: 'system',
                    content: `💚 ${token.name} восстановил **${healAmount}** хитов.`,
                  });
                }
                toast({ title: "Лечение", description: `${token.name} восстановил ${healAmount} хитов` });
              }
            } else if (action === 'defend') {
              if (sessionId && user) {
                await supabase.from('session_messages').insert({
                  session_id: sessionId,
                  user_id: user.id,
                  sender_name: token?.name || 'Unknown',
                  message_type: 'system',
                  content: `🛡️ ${token?.name} встает в защитную стойку.`,
                });
              }
              toast({ title: "Защита", description: `${token?.name} защищается` });
            } else if (action === 'target') {
               toast({ title: "Цель", description: `${token?.name} выбран целью` });
            }
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

              {/* AI thinking indicator */}
              {aiThinking && (
                <div className="text-xs rounded-xl p-2.5 bg-purple-950/40 border border-purple-700/20 animate-pulse">
                  <div className="flex items-center gap-1.5">
                    <Bot className="h-3 w-3 text-purple-400" />
                    <span className="text-purple-400 font-semibold text-[10px]">AI Dungeon Master</span>
                  </div>
                  <p className="text-purple-200 italic mt-1 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Мастер обдумывает ответ...
                  </p>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !aiThinking && sendMessage()}
                  placeholder={aiThinking ? "AI обрабатывает..." : "Что делает ваш герой?.."}
                  disabled={aiThinking}
                  className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 disabled:opacity-40"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || aiThinking}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 rounded-xl text-white text-xs transition"
                >
                  →
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <DiceRollModal
        open={isDiceModalOpen}
        onClose={() => setIsDiceModalOpen(false)}
        onRoll={handle3DDiceRoll}
        playerName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
      />
    </div>
  );
}
