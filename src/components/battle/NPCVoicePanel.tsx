import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, VolumeX, Loader2, MessageSquare } from 'lucide-react';
import { socketService } from '@/services/socket';

interface NPCSpeech {
  id: string;
  npcName: string;
  text: string;
  voiceRole: string;
  audioData?: string;
  timestamp: string;
}

interface NPCVoicePanelProps {
  sessionId: string;
  isDM: boolean;
}

const VOICE_ROLES_RU: Record<string, string> = {
  narrator: '🎭 Рассказчик',
  villain: '👹 Злодей',
  elder: '🧙 Мудрец',
  merchant: '🛒 Торговец',
  mystic: '🔮 Мистик',
  warrior: '⚔️ Воин',
  tavern: '🍺 Таверна',
  default: '💬 NPC',
};

const NPC_PRESETS = [
  { name: 'Таvernkeeper Brom', situation: 'Greeting adventurers who enter the tavern' },
  { name: 'Dark Lord Malachar', situation: 'Taunting the heroes from his throne' },
  { name: 'Elder Whisperwind', situation: 'Giving cryptic prophecy to the party' },
  { name: 'Captain of the Guard', situation: 'Warning about danger in the city' },
];

export function NPCVoicePanel({ sessionId, isDM }: NPCVoicePanelProps) {
  const [speeches, setSpeeches] = useState<NPCSpeech[]>([]);
  const [npcName, setNpcName] = useState('');
  const [situation, setSituation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const socket = socketService.getSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNPCAudio = (data: { npcName: string; voiceRole: string; audioData: string }) => {
      setIsGenerating(false);
      const id = crypto.randomUUID();
      const speech: NPCSpeech = {
        id,
        npcName: data.npcName,
        text: '',
        voiceRole: data.voiceRole,
        audioData: data.audioData,
        timestamp: new Date().toISOString(),
      };
      setSpeeches(prev => [speech, ...prev].slice(0, 10));

      // Auto-play
      if (data.audioData) {
        const audio = new Audio(data.audioData);
        audioRefs.current.set(id, audio);
        audio.play().catch(() => {});
      }
    };

    const handleMessage = (msg: any) => {
      if (msg.type === 'npc') {
        setSpeeches(prev => {
          const updated = prev.map(s =>
            s.npcName === msg.sender_name && !s.text ? { ...s, text: msg.content } : s
          );
          // If no match, add text-only entry
          if (!updated.some(s => s.npcName === msg.sender_name && s.text === msg.content)) {
            const entry: NPCSpeech = {
              id: crypto.randomUUID(),
              npcName: msg.sender_name,
              text: msg.content,
              voiceRole: msg.npc_voice_role || 'default',
              timestamp: msg.created_at,
            };
            return [entry, ...updated].slice(0, 10);
          }
          return updated;
        });
      }
    };

    socket.on('ai:npc_audio', handleNPCAudio);
    socket.on('session:message', handleMessage);
    return () => {
      socket.off('ai:npc_audio', handleNPCAudio);
      socket.off('session:message', handleMessage);
    };
  }, [socket]);

  const handleSpeak = () => {
    if (!npcName.trim() || !situation.trim()) return;
    setIsGenerating(true);

    socket?.emit('ai:npc_speak', {
      sessionId,
      npcName: npcName.trim(),
      situation: situation.trim(),
    });

    setNpcName('');
    setSituation('');
  };

  const toggleMute = (id: string) => {
    const audio = audioRefs.current.get(id);
    if (audio) {
      if (mutedIds.has(id)) {
        audio.play().catch(() => {});
        setMutedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      } else {
        audio.pause();
        audio.currentTime = 0;
        setMutedIds(prev => new Set(prev).add(id));
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-purple-300/70 font-bold">
        <Mic className="h-3.5 w-3.5" />
        Голоса NPC
      </div>

      {/* DM Controls */}
      {isDM && (
        <div className="space-y-2">
          {/* Presets */}
          <div className="grid grid-cols-2 gap-1">
            {NPC_PRESETS.map(p => (
              <button
                key={p.name}
                onClick={() => { setNpcName(p.name); setSituation(p.situation); }}
                className="text-left px-2 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/30 hover:border-purple-500/30 transition text-xs text-slate-400 hover:text-white truncate"
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <input
            value={npcName}
            onChange={e => setNpcName(e.target.value)}
            placeholder="Имя NPC..."
            className="w-full bg-black/40 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/50"
          />
          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="Ситуация или что говорит NPC..."
            rows={2}
            className="w-full bg-black/40 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500/50 resize-none"
          />
          <button
            onClick={handleSpeak}
            disabled={isGenerating || !npcName.trim() || !situation.trim()}
            className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white text-xs font-medium flex items-center justify-center gap-2 transition"
          >
            {isGenerating ? (
              <><Loader2 className="h-3 w-3 animate-spin" />Генерирую речь...</>
            ) : (
              <><Mic className="h-3 w-3" />Заставить говорить</>
            )}
          </button>
        </div>
      )}

      {/* Speech log */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {speeches.map(speech => (
            <motion.div
              key={speech.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900/60 rounded-xl p-2.5 border border-purple-700/20"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-purple-300 font-medium text-xs">{speech.npcName}</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-600 text-[10px]">{VOICE_ROLES_RU[speech.voiceRole] || '💬'}</span>
                  {speech.audioData && (
                    <button onClick={() => toggleMute(speech.id)} className="text-slate-500 hover:text-white transition">
                      {mutedIds.has(speech.id)
                        ? <VolumeX className="h-3 w-3" />
                        : <Volume2 className="h-3 w-3" />
                      }
                    </button>
                  )}
                </div>
              </div>
              {speech.text && (
                <p className="text-slate-300 text-xs italic leading-relaxed">"{speech.text}"</p>
              )}
              {!speech.text && !speech.audioData && (
                <p className="text-slate-600 text-xs">Генерация...</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {speeches.length === 0 && (
          <div className="text-center py-4 text-slate-600 text-xs">
            <MessageSquare className="h-5 w-5 mx-auto mb-1 opacity-30" />
            Голоса NPC появятся здесь
          </div>
        )}
      </div>
    </div>
  );
}
