import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { sessionService } from '@/services/sessionService';
import { useCharacter } from '@/contexts/CharacterContext';
import {
  Crown, Brain, Users, Scroll, Sword, Plus, Trash2,
  ChevronRight, ChevronLeft, Sparkles, User, Bot,
  Shield, Wand2, Loader2, Check, Globe
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface PartyMember {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
}

interface SessionConfig {
  name: string;
  description: string;
  dmType: 'human' | 'ai';
  party: PartyMember[];
  aiPersonality: 'epic' | 'merciless' | 'rules' | 'dark';
  generateCampaign: boolean;
}

const RACES = ['Человек', 'Эльф', 'Дварф', 'Полурослик', 'Гном', 'Драконорождённый', 'Тифлинг', 'Полуэльф', 'Полуорк'];
const CLASSES = ['Воин', 'Маг', 'Жрец', 'Плут', 'Бард', 'Следопыт', 'Паладин', 'Варвар', 'Монах', 'Чародей', 'Колдун', 'Друид'];
const DM_TYPES = [
  {
    id: 'human' as const,
    icon: User,
    title: 'Я — Мастер',
    desc: 'Веду кампанию сам. ИИ — только помощник',
    color: 'from-amber-600 to-amber-800',
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/20',
  },
  {
    id: 'ai' as const,
    icon: Bot,
    title: 'AI Данжен Мастер',
    desc: 'Llama 3.1 генерирует мир, карты и события',
    color: 'from-purple-600 to-purple-900',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/20',
  },
];

const AI_PERSONALITIES = [
  { id: 'epic' as const, label: 'Эпос', icon: Scroll, desc: 'Высокое фэнтези, героика', color: 'text-amber-400' },
  { id: 'dark' as const, label: 'Мрак', icon: Globe, desc: 'Ужас, психологический хоррор', color: 'text-slate-400' },
  { id: 'merciless' as const, label: 'Жёсткий', icon: Sword, desc: 'Хардкор, высокая цена ошибки', color: 'text-red-400' },
  { id: 'rules' as const, label: 'Законник', icon: Shield, desc: 'Точная механика 5e', color: 'text-blue-400' },
];

// ─── Step Components ─────────────────────────────────────────────────────────
const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateSessionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { characters } = useCharacter();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [creating, setCreating] = useState(false);

  const [config, setConfig] = useState<SessionConfig>({
    name: '',
    description: '',
    dmType: 'human',
    party: [],
    aiPersonality: 'epic',
    generateCampaign: true,
  });

  // New party member form
  const [newMember, setNewMember] = useState<Omit<PartyMember, 'id'>>({
    name: '', race: 'Человек', class: 'Воин', level: 1
  });

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goPrev = () => { setDir(-1); setStep(s => s - 1); };

  const addMember = () => {
    if (!newMember.name.trim()) return;
    setConfig(c => ({
      ...c,
      party: [...c.party, { ...newMember, id: crypto.randomUUID() }]
    }));
    setNewMember({ name: '', race: 'Человек', class: 'Воин', level: 1 });
  };

  const removeMember = (id: string) => {
    setConfig(c => ({ ...c, party: c.party.filter(m => m.id !== id) }));
  };

  // Auto-add characters the user already has
  useEffect(() => {
    if (characters.length > 0 && config.party.length === 0) {
      const fromChars: PartyMember[] = characters.slice(0, 4).map(ch => ({
        id: ch.id,
        name: ch.name,
        race: ch.race || 'Человек',
        class: ch.class || 'Воин',
        level: ch.level || 1,
      }));
      setConfig(c => ({ ...c, party: fromChars }));
    }
  }, [characters]);

  const handleCreate = async () => {
    if (!config.name.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название сессии', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const session = await sessionService.createSession(config.name, config.description || undefined);
      toast({ title: 'Сессия создана!', description: `Код: ${session.session_code}` });
      navigate(`/dm-session/${session.id}`);
    } catch (err: any) {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  // ─── Steps ────────────────────────────────────────────────────────────────
  const steps = [
    {
      title: 'Название мира',
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-amber-300/70 font-bold">Название кампании</label>
            <input
              autoFocus
              value={config.name}
              onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
              placeholder="Проклятье Страда, Тьма над Эльтергаастом..."
              onKeyDown={e => e.key === 'Enter' && config.name && goNext()}
              className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-amber-300/70 font-bold">Описание (необязательно)</label>
            <textarea
              value={config.description}
              onChange={e => setConfig(c => ({ ...c, description: e.target.value }))}
              placeholder="Краткая синопсис кампании для игроков..."
              rows={3}
              className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 transition resize-none"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Кто ведёт игру?',
      content: (
        <div className="grid gap-4">
          {DM_TYPES.map(dt => (
            <motion.button
              key={dt.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setConfig(c => ({ ...c, dmType: dt.id }))}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                config.dmType === dt.id
                  ? `bg-gradient-to-br ${dt.color} ${dt.border} shadow-xl ${dt.glow}`
                  : 'bg-slate-900/60 border-slate-700/30 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/10`}>
                  <dt.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-lg">{dt.title}</div>
                  <div className="text-white/60 text-sm">{dt.desc}</div>
                </div>
                {config.dmType === dt.id && (
                  <div className="ml-auto">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            </motion.button>
          ))}

          {config.dmType === 'ai' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-2 gap-2 pt-2"
            >
              {AI_PERSONALITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setConfig(c => ({ ...c, aiPersonality: p.id }))}
                  className={`p-3 rounded-xl border text-left transition ${
                    config.aiPersonality === p.id
                      ? 'bg-white/10 border-white/30'
                      : 'bg-black/30 border-slate-700/30 hover:border-slate-600'
                  }`}
                >
                  <p.icon className={`h-4 w-4 ${p.color} mb-1`} />
                  <div className="text-white font-medium text-sm">{p.label}</div>
                  <div className="text-white/40 text-xs">{p.desc}</div>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      )
    },
    {
      title: 'Состав партии',
      content: (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            {config.dmType === 'ai'
              ? 'ИИ создаст кампанию специально под этих героев'
              : 'Укажите игроков для настройки токенов'}
          </p>

          {/* Existing party */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <AnimatePresence>
              {config.party.map(m => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-2.5 border border-slate-700/30"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                    {m.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">{m.name}</div>
                    <div className="text-slate-400 text-xs">{m.race} {m.class} • {m.level} ур.</div>
                  </div>
                  <button onClick={() => removeMember(m.id)} className="text-slate-600 hover:text-red-400 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add member */}
          <div className="border border-slate-700/40 rounded-2xl p-4 space-y-3 bg-slate-900/40">
            <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Добавить героя</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={newMember.name}
                onChange={e => setNewMember(m => ({ ...m, name: e.target.value }))}
                placeholder="Имя персонажа"
                onKeyDown={e => e.key === 'Enter' && addMember()}
                className="col-span-2 bg-black/40 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
              />
              <select
                value={newMember.race}
                onChange={e => setNewMember(m => ({ ...m, race: e.target.value }))}
                className="bg-black/40 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
              >
                {RACES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                value={newMember.class}
                onChange={e => setNewMember(m => ({ ...m, class: e.target.value }))}
                className="bg-black/40 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">Уровень</span>
                <input
                  type="number" min={1} max={20}
                  value={newMember.level}
                  onChange={e => setNewMember(m => ({ ...m, level: Number(e.target.value) }))}
                  className="w-16 bg-black/40 border border-slate-700 rounded-xl px-2 py-2 text-white text-sm focus:outline-none text-center"
                />
              </div>
              <button
                onClick={addMember}
                disabled={!newMember.name.trim()}
                className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white rounded-xl px-3 py-2 text-sm font-medium transition"
              >
                <Plus className="h-4 w-4" />
                Добавить
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Всё готово',
      content: (
        <div className="space-y-6">
          {/* Summary */}
          <div className="space-y-3">
            <SummaryRow icon={Scroll} label="Кампания" value={config.name || '—'} />
            <SummaryRow
              icon={config.dmType === 'ai' ? Bot : User}
              label="Ведущий"
              value={config.dmType === 'ai' ? `AI DM (${config.aiPersonality})` : 'Человек-Мастер'}
            />
            <SummaryRow icon={Users} label="Игроков" value={`${config.party.length} героев`} />
          </div>

          {config.dmType === 'ai' && config.party.length > 0 && (
            <div className="bg-purple-950/40 border border-purple-700/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-purple-300 font-medium text-sm">AI сгенерирует</span>
              </div>
              <ul className="text-purple-200/60 text-xs space-y-1">
                <li>• Уникальную кампанию под вашу партию</li>
                <li>• Стартовую боевую карту</li>
                <li>• Открывающую сцену с именами героев</li>
                <li>• Главного злодея с личной связью к партии</li>
              </ul>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !config.name.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-amber-900/30 transition"
          >
            {creating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Создаём мир...
              </>
            ) : (
              <>
                <Crown className="h-5 w-5" />
                Начать историю
              </>
            )}
          </button>
        </div>
      )
    }
  ];

  const totalSteps = steps.length;

  return (
    <div className="min-h-screen bg-[#040406] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
            <Crown className="h-4 w-4 text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold uppercase tracking-widest">Создание сессии</span>
          </div>
          <h1 className="text-4xl font-serif text-white">Shadow Weave</h1>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
        >
          {/* Progress bar */}
          <div className="h-1 bg-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200 }}
            />
          </div>

          <div className="p-8">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-slate-500 uppercase tracking-widest">
                Шаг {step + 1} / {totalSteps}
              </span>
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i <= step ? 'bg-amber-400 w-6' : 'bg-slate-700 w-3'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step title */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={`title-${step}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-2xl font-bold text-white mb-6"
              >
                {steps[step].title}
              </motion.h2>
            </AnimatePresence>

            {/* Step content */}
            <div className="min-h-[280px]">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {steps[step].content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            {step < totalSteps - 1 && (
              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={goPrev}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Назад
                  </button>
                )}
                <button
                  onClick={goNext}
                  disabled={step === 0 && !config.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-white font-medium transition"
                >
                  Далее
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step > 0 && step === totalSteps - 1 && (
              <button onClick={goPrev} className="mt-4 text-slate-500 hover:text-white text-sm flex items-center gap-1 transition">
                <ChevronLeft className="h-3 w-3" /> Изменить настройки
              </button>
            )}
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <button onClick={() => navigate('/dm')} className="text-slate-600 hover:text-slate-400 text-sm transition">
            ← Вернуться в панель Мастера
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800/60">
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <span className="text-slate-500 text-sm flex-1">{label}</span>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  );
}
