// Интегрированная боевая карта с реальным бестиарием из Supabase
// + новые функции: 3D модели через model-viewer, спавн кликом, диагностика
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMonstersStore } from '@/stores/monstersStore';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import type { Monster } from '@/types/monsters';
import SimpleTokenCreator from '@/components/battle/SimpleTokenCreator';

import { VideoChat } from '@/components/battle/VideoChat';
import BackgroundMusic from '@/components/battle/BackgroundMusic';
import MiniMap2D from '@/components/battle/minimap/MiniMap2D';
import CompactBattleUI from '@/components/battle/ui/CompactBattleUI';
import { getModelTypeFromTokenName } from '@/utils/tokenModelMapping';
import { getMonsterAvatar } from '@/data/monsterAvatarSystem';

// ==================== Типы ====================

type Vec2 = { x: number; y: number };

type TokenType = "PC" | "NPC";

type Token = {
  id: string;
  name: string;
  type: TokenType;
  hp: number;
  maxHp: number;
  ac: number;
  speed: number;
  color: string;
  position: Vec2;
  initiative: number;
  conditions: string[];
  modelUrl?: string; // GLB/GLTF
  modelScale?: number;
};

type FogCircle = { x: number; y: number; r: number };

type LogEntry = { id: string; ts: string; text: string };

// ==================== Константы ====================

const GRID = 64;
const MAP_W = 1600;
const MAP_H = 900;

// Внешний реестр моделей D&D персонажей
const MODEL_REGISTRY_URL = "/data/dnd-model-registry.json";

// ==================== Утилиты ====================

function uid(prefix = "id"): string { return `${prefix}_${Math.random().toString(36).slice(2, 9)}`; }
function now(): string { return new Date().toLocaleTimeString(); }
const snap = (v: number) => Math.round(v / GRID) * GRID;
function isClient(): boolean { return typeof window !== "undefined" && typeof document !== "undefined"; }
function isValidModelUrl(url?: string): boolean {
  if (!url) return false;
  try { const u = new URL(url, isClient()?window.location.href:"http://local"); const p = u.pathname.toLowerCase(); return p.endsWith(".glb") || p.endsWith(".gltf"); } catch { return false; }
}
const norm = (s: string) => s?.normalize("NFKD").toLowerCase().replace(/[^a-zа-я0-9 ]+/gi, "").trim();

// Мини‑реестр моделей по шаблонам (regex). Расширяется через JSON.
const LOCAL_MODEL_REGISTRY: Array<{ match: RegExp; url: string; scale?: number }> = [
  { match: /goblin/i,              url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf",                                   scale: 0.02 },
  { match: /dragon/i,              url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",   scale: 18 },
  { match: /skeleton|undead/i,     url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb", scale: 3 },
  { match: /orc/i,                 url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BarramundiFish/glTF/BarramundiFish.gltf",            scale: 8 },
  { match: /troll/i,               url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF/BrainStem.gltf",                      scale: 15 },
];

// Родовой маппинг по семействам (примерные модели GLB/GLTF)
const FAMILY_MODEL_MAP: Array<{ match: RegExp; url: string; scale?: number }> = [
  { match: new RegExp("(?:adult|ancient|young)?\\s*.*dragon\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb", scale: 12 },
  { match: new RegExp("\\b(demon|devil|fiend|balor|pit fiend|erinyes|barbed devil|bearded devil)\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb", scale: 10 },
  { match: new RegExp("\\b(skeleton|zombie|wraith|specter|spectre|ghost|lich|vampire|ghoul|undead)\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb", scale: 1 },
  { match: new RegExp("\\b(hill|stone|frost|fire|cloud|storm)\\s+giant\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BrainStem/glTF/BrainStem.gltf", scale: 6 },
  { match: new RegExp("\\b(wolf|bear|boar|lion|tiger|panther|ape|elk|horse)\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf", scale: 0.02 },
  { match: new RegExp("\\b(ooze|gelatinous cube|black pudding|ochre jelly|slime)\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb", scale: 8 },
  { match: new RegExp("\\b(beholder|mind flayer|illithid|aboleth|gibbering mouther)\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb", scale: 6 },
  { match: new RegExp("\\b(golem|construct|animated armor|helmed horror)\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb", scale: 10 },
  { match: new RegExp("\\b(goblin|orc|kobold|bandit|cultist|acolyte|guard|thug)\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf", scale: 2 },
  { match: new RegExp("\\b(fire|air|earth|water)\\s+elemental\\b","i"),
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf", scale: 6 },
];

// ==================== TSX типы для <model-viewer> ====================

declare global { namespace JSX { interface IntrinsicElements { "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src?: string; style?: React.CSSProperties; "camera-controls"?: boolean|""; "disable-zoom"?: boolean|""; autoplay?: boolean|""; exposure?: string|number; "ar-modes"?: string; "shadow-intensity"?: string|number; "interaction-prompt"?: string; scale?: string; }; } } }

// ==================== Загрузчик model-viewer ====================

function useModelViewerLoader(enabled: boolean) {
  const [ready, setReady]   = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [status, setStatus] = useState<"idle"|"loading"|"ready"|"error">("idle");

  useEffect(() => {
    if (!enabled || !isClient()) { setReady(false); setStatus("idle"); setError(null); return; }
    if ((window as any).customElements?.get("model-viewer")) { setReady(true); setStatus("ready"); return; }

    setStatus("loading"); setError(null);
    const ensureReady = () => (window as any).customElements?.whenDefined?.("model-viewer")?.then?.(()=>{ setReady(true); setStatus("ready"); });
    const mid = "model-viewer-module"; const lid = "model-viewer-legacy";

    let timeout = window.setTimeout(()=>{ if(!(window as any).customElements?.get("model-viewer")) { setError("Таймаут загрузки model-viewer"); setStatus("error"); } }, 15000);

    let mod = document.getElementById(mid) as HTMLScriptElement | null;
    if (!mod) { mod = document.createElement("script"); mod.id = mid; mod.type = "module"; mod.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"; mod.onload = ensureReady; mod.onerror = ()=>{ setError("Ошибка загрузки module-скрипта model-viewer"); setStatus("error"); }; document.head.appendChild(mod); } else { ensureReady(); }

    let leg = document.getElementById(lid) as HTMLScriptElement | null;
    if (!leg) { leg = document.createElement("script"); (leg as any).noModule = true; leg.id = lid; leg.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer-legacy.js"; leg.onload = ensureReady; document.head.appendChild(leg); }

    return () => { window.clearTimeout(timeout); };
  }, [enabled]);

  return { ready, error, status } as const;
}

// ==================== Подбор модели по имени ====================

function pickModelFor(
  name: string,
  registry: Array<{ match: RegExp; url: string; scale?: number }>,
  family?: Array<{ match: RegExp; url: string; scale?: number }>
): { url?: string; scale?: number } {
  const n = norm(name);
  for (const r of registry) { if (r.match.test(n)) return { url: r.url, scale: r.scale }; }
  if (family) { for (const r of family) { if (r.match.test(n)) return { url: r.url, scale: r.scale }; } }
  return {};
}

// ==================== Компонент отображения токена ====================

function TokenVisual({ token, use3D, modelReady, onModelError }: { token: Token; use3D: boolean; modelReady: boolean; onModelError: (id: string, msg: string)=>void; }) {
  const can3D = use3D && modelReady && isValidModelUrl(token.modelUrl);
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!can3D || !ref.current) return;
    const el = ref.current as unknown as HTMLElement & { addEventListener: any; removeEventListener: any };
    const onErr = () => onModelError(token.id, "Ошибка загрузки модели (model-viewer)");
    const onLoad = () => {};
    el.addEventListener("error", onErr); el.addEventListener("load", onLoad);
    return () => { el.removeEventListener("error", onErr); el.removeEventListener("load", onLoad); };
  }, [can3D, token.id, onModelError]);

  if (!can3D) {
    // Получаем данные аватара из новой системы
    const avatarData = getMonsterAvatar(token.name);
    const image = avatarData.image || avatarData.emoji;
    
    if (avatarData.image) {
      // Отображаем изображение
      return (
        <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center overflow-hidden rounded`}>
          <img 
            src={avatarData.image} 
            alt={token.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      // Отображаем эмодзи
      return (
        <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center text-lg select-none`}>
          {avatarData.emoji}
        </div>
      );
    }
  }
  
  return (
    <model-viewer
      ref={ref as any}
      src={token.modelUrl}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      autoplay
      exposure={0.9}
      shadow-intensity={0.8}
      interaction-prompt="none"
      camera-controls
      disable-zoom
      ar-modes="webxr scene-viewer quick-look"
      scale={`${token.modelScale ?? 1} ${token.modelScale ?? 1} ${token.modelScale ?? 1}`}
    />
  );
}

// ==================== Основной компонент ====================

export default function BattleMapUI() {
  // Подключение к реальному бестиарию
  const { getAllMonsters, loadSupabaseMonsters, isLoadingSupabase } = useMonstersStore();
  const { isDM } = useUnifiedBattleStore();
  
  // Режим и панели
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [videoChatOpen, setVideoChatOpen] = useState(false);
  const [useCompactUI, setUseCompactUI] = useState(true);

  // Карта
  const [mapImage, setMapImage] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const onMapDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith("image/")) setMapImage(URL.createObjectURL(f)); };
  const onMapDragOver = (e: React.DragEvent) => e.preventDefault();

  // Токены/инициатива
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const initOrder = useMemo(() => [...tokens].sort((a, b) => b.initiative - a.initiative), [tokens]);
  const activeToken = initOrder.length ? initOrder[turnIndex % initOrder.length] : undefined;

  // Перетаскивание
  const [dragId, setDragId] = useState<string | null>(null);
  const dragOffset = useRef<Vec2>({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragId || !mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.current.x;
      const y = e.clientY - rect.top - dragOffset.current.y;
      const clampedX = Math.max(0, Math.min(MAP_W - GRID, x));
      const clampedY = Math.max(0, Math.min(MAP_H - GRID, y));
      setTokens((prev) => prev.map((t) => (t.id === dragId ? { ...t, position: { x: snap(clampedX), y: snap(clampedY) } } : t)));
    };
    const onUp = () => setDragId(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragId]);

  // Туман войны
  const [fogEnabled, setFogEnabled] = useState(true);
  const [fogOpacity, setFogOpacity] = useState(0.8);
  const [fogRadius, setFogRadius] = useState(120);
  const [autoRevealAllies, setAutoRevealAllies] = useState(true);
  const [reveal, setReveal] = useState<FogCircle[]>([]);
  const [hideAreas, setHideAreas] = useState<FogCircle[]>([]);

  // Журнал и кубы
  const [log, setLog] = useState<LogEntry[]>([{ id: uid("log"), ts: now(), text: "Бой начался. Бросьте инициативу!" }]);
  const roll = (sides: number) => { const value = 1 + Math.floor(Math.random()*sides); setLog((l)=>[{ id: uid("log"), ts: now(), text: `🎲 d${sides} → ${value}` }, ...l]); };
  const nextTurn = () => setTurnIndex((i) => (initOrder.length ? (i + 1) % initOrder.length : 0));

  // Инструменты Мастера - убрали add-npc
  type DMTool = "select" | "fog-reveal" | "fog-hide" | "measure";
  const [dmTool, setDmTool] = useState<DMTool>("select");

  // Реестр 3D моделей
  const [modelRegistry, setModelRegistry] = useState<Array<{ match: RegExp; url: string; scale?: number }>>(LOCAL_MODEL_REGISTRY);
  const [useFamilyMap, setUseFamilyMap] = useState(true);

  // Удалили фильтрацию бестиария - она использовалась только для спавна

  // Загрузка реального бестиария при инициализации
  useEffect(() => {
    loadSupabaseMonsters();
  }, [loadSupabaseMonsters]);

  // Загрузка внешнего реестра моделей
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(MODEL_REGISTRY_URL, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json)) {
          const rules = json.filter((r: any)=>r && r.match && r.url).map((r: any)=>({ match: new RegExp(r.match, "i"), url: String(r.url), scale: r.scale?Number(r.scale):undefined }));
          if (rules.length) setModelRegistry([...LOCAL_MODEL_REGISTRY, ...rules]);
        }
      } catch {/* ignore */}
    })();
  }, []);

  // Получаем все монстры из реального бестиария
  const bestiary = getAllMonsters();

  // Убрали 3D функциональность

  // Упрощённый бестиарий без 3D
  const enrichedBestiary = useMemo(() => {
    return bestiary; // Просто возвращаем исходный бестиарий
  }, [bestiary]);

  // Функция для получения числового значения CR
  const getCRValue = (cr: string): number => {
    if (cr === '1/8') return 0.125;
    if (cr === '1/4') return 0.25;
    if (cr === '1/2') return 0.5;
    return parseFloat(cr);
  };

  // Удалили функции фильтрации - они использовались только для спавна

  // 3D загрузчик
  const [use3D, setUse3D] = useState(true);
  const { ready: modelReady, error: modelErr, status: modelStatus } = useModelViewerLoader(use3D);
  const [brokenModels, setBrokenModels] = useState<Record<string, string>>({});
  const handleModelError = (id: string, msg: string) => { setBrokenModels(s=>({ ...s, [id]: msg })); const tok = tokens.find(t=>t.id===id); if (tok) setLog((l)=>[{ id: uid("log"), ts: now(), text: `Модель ${tok.name}: ${msg}. Переход на 2D.` }, ...l]); };

  // Удалили систему спавна монстров кликом

  // Клик по карте — только туман (убрали спавн)
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    if (!isDM) return;
    if (dmTool === "fog-reveal") {
      setReveal((prev) => [...prev, { x, y, r: fogRadius }]);
      setLog((l) => [{ id: uid("log"), ts: now(), text: `ДМ открыл туман в точке (${Math.round(x)}, ${Math.round(y)})` }, ...l]);
    } else if (dmTool === "fog-hide") {
      setHideAreas((prev) => [...prev, { x, y, r: fogRadius }]);
      setLog((l) => [{ id: uid("log"), ts: now(), text: `ДМ скрыл область в точке (${Math.round(x)}, ${Math.round(y)})` }, ...l]);
    }
  };

  // ==================== Рендер ====================

  const Title = ({ children }: { children: React.ReactNode }) => (<div className="text-yellow-400 font-semibold tracking-wide uppercase text-xs">{children}</div>);
  const StatBadge = ({ label, value }: { label: string; value: React.ReactNode }) => (<div className="px-2 py-0.5 rounded-md text-[11px] text-white bg-neutral-800 border border-neutral-700"><span className="opacity-70 mr-1">{label}</span><span className="font-semibold">{value}</span></div>);

  if (useCompactUI) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
        <BackgroundMusic />
        
        {/* 3D карта полноэкранно */}
        <div className="w-full h-full relative">
          {mapImage ? (
            <img 
              src={mapImage} 
              alt="Battle Map" 
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <div className="text-xl mb-2">Загрузите карту</div>
                <div className="text-sm text-slate-400">Перетащите изображение сюда</div>
              </div>
            </div>
          )}
        </div>

        {/* Компактный интерфейс */}
        <CompactBattleUI
          isDM={isDM}
          fogEnabled={fogEnabled}
          onFogToggle={() => setFogEnabled(!fogEnabled)}
          fogOpacity={fogOpacity}
          onFogOpacityChange={setFogOpacity}
          brushSize={fogRadius / 10}
          onBrushSizeChange={(size) => setFogRadius(size * 10)}
          paintMode={dmTool === 'fog-reveal' ? 'reveal' : 'hide'}
          onPaintModeChange={(mode) => setDmTool(mode === 'reveal' ? 'fog-reveal' : 'fog-hide')}
          musicEnabled={true}
          onMusicToggle={() => {}}
          turnIndex={turnIndex}
          tokensCount={tokens.length}
          onNextTurn={nextTurn}
          onRollDice={roll}
        />

        {/* Кнопка переключения на полный интерфейс */}
        <div className="absolute top-4 right-4 z-60">
          <button
            onClick={() => setUseCompactUI(false)}
            className="px-3 py-2 bg-background/90 backdrop-blur-sm border rounded-lg text-sm hover:bg-background"
          >
            Полный интерфейс
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Верхняя панель */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="text-yellow-400 font-bold">Shadow Weave • Боевая карта</div>
          {activeToken && <StatBadge label="Активный" value={activeToken.name} />}
          {isLoadingSupabase && <div className="text-xs opacity-70">Загрузка бестиария...</div>}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`px-3 py-1 rounded-md border text-xs ${isDM ? "border-emerald-400 text-emerald-400" : "border-neutral-700 text-neutral-300"}`}>
            {isDM ? "Режим ДМ" : "Режим игрока"}
          </div>
          <label className="flex items-center gap-1"><input type="checkbox" checked={use3D} onChange={(e)=>setUse3D(e.target.checked)} /> 3D модели</label>
          <span className="px-2 py-0.5 rounded-md border border-neutral-700">3D: {modelStatus === "loading" && "загрузка…"}{modelStatus === "ready" && "готово"}{modelStatus === "error" && (modelErr || "ошибка")}{modelStatus === "idle" && "выкл."}</span>
          <StatBadge label="Токенов" value={tokens.length} />
          <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) setMapImage(URL.createObjectURL(f)); }} />
          <button className="px-3 py-1 rounded-md border border-neutral-700 text-xs" onClick={() => setLeftOpen((v) => !v)}>
            {leftOpen ? "Скрыть инструменты" : "Показать инструменты"}
          </button>
          <button className="px-3 py-1 rounded-md border border-neutral-700 text-xs" onClick={() => setRightOpen((v) => !v)}>
            {rightOpen ? "Скрыть журнал" : "Показать журнал"}
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-3rem)] grid" style={{ gridTemplateColumns: `${leftOpen && isDM ? "320px" : "0px"} 1fr ${rightOpen ? "360px" : "0px"}` }}>
        {/* Левая панель */}
        <div className={`border-r border-neutral-800 bg-neutral-900/60 overflow-y-auto ${leftOpen && isDM ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="p-3 space-y-4">
            <Title>Инструменты ДМ</Title>
            <div className="grid grid-cols-2 gap-2">
              {(["select","fog-reveal","fog-hide","measure"] as const).map((tool)=>(
                <button key={tool} onClick={()=>setDmTool(tool)} className={`px-2 py-2 rounded-md border text-sm ${dmTool===tool?"border-emerald-400 text-emerald-400":"border-neutral-700 text-neutral-300"}`}>
                  {tool === "select" && "Выбор"}
                  {tool === "fog-reveal" && "Открыть туман"}
                  {tool === "fog-hide" && "Скрыть туман"}
                  {tool === "measure" && "Измерить"}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Title>Туман войны</Title>
              <div className="flex items-center gap-2"><input id="fog" type="checkbox" checked={fogEnabled} onChange={(e)=>setFogEnabled(e.target.checked)} /><label htmlFor="fog" className="text-sm">Включить</label></div>
              <div className="flex items-center gap-2 text-sm"><span className="opacity-70 w-24">Прозрачность</span><input type="range" min={0.2} max={0.95} step={0.05} value={fogOpacity} onChange={(e)=>setFogOpacity(parseFloat(e.target.value))} className="w-full" /><span className="w-12 text-right">{Math.round(fogOpacity*100)}%</span></div>
              <div className="flex items-center gap-2 text-sm"><span className="opacity-70 w-24">Радиус</span><input type="range" min={60} max={260} step={10} value={fogRadius} onChange={(e)=>setFogRadius(parseInt(e.target.value))} className="w-full" /><span className="w-12 text-right">{fogRadius}</span></div>
              <div className="flex items-center gap-2"><input id="autoAlly" type="checkbox" checked={autoRevealAllies} onChange={(e)=>setAutoRevealAllies(e.target.checked)} /><label htmlFor="autoAlly" className="text-sm">Автосвет вокруг союзников</label></div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-sm" onClick={()=>{setReveal([]); setHideAreas([]); setLog((l)=>[{ id: uid("log"), ts: now(), text: "ДМ очистил весь туман" }, ...l]);}}>Очистить</button>
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-sm" onClick={()=>{setReveal(r=>r.slice(0,-1)); setLog((l)=>[{ id: uid("log"), ts: now(), text: "ДМ отменил последнее открытие" }, ...l]);}}>Отменить открытие</button>
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-sm" onClick={()=>{setHideAreas(h=>h.slice(0,-1)); setLog((l)=>[{ id: uid("log"), ts: now(), text: "ДМ отменил последнее скрытие" }, ...l]);}}>Отменить скрытие</button>
              </div>
              <div className="text-sm opacity-70 text-center py-4">
                Выберите инструмент и кликните на карту
              </div>
            </div>

            <div className="space-y-2">
              <Title>Система создания токенов</Title>
              
              {/* Настройки 3D */}
              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-2">
                  <input id="familyMap" type="checkbox" checked={useFamilyMap} onChange={(e)=>setUseFamilyMap(e.target.checked)} />
                  <label htmlFor="familyMap" className="text-sm">Родовой 3D-маппинг</label>
                </div>
              </div>

              {/* Убрали бестиарий - он использовался только для спавна */}

              {/* Диагностика - убрали диагностику спавна */}
              <div className="space-y-2">
                <Title>Диагностика</Title>
                <ul className="text-xs list-disc ml-5 space-y-1">
                  <li>model-viewer → {modelReady?"✅ Готов":modelStatus==="error"?"❌ Ошибка":"⏳ Загрузка"}</li>
                  <li>валидность 3D URL → {enrichedBestiary.filter(b=>b.modelUrl).every(b=>isValidModelUrl(b.modelUrl))?"✅ ОК":"⚠️ Есть некорректные"}</li>
                  <li>реестр моделей → {modelRegistry.length} правил</li>
                  <li>монстров с 3D → {enrichedBestiary.filter(m=>isValidModelUrl(m.modelUrl)).length}</li>
                </ul>
                <div className="flex gap-2">
                  <button className="px-2 py-1 rounded-md border border-neutral-700 text-xs" onClick={()=>{ const sample = enrichedBestiary.find(m=>m.name.toLowerCase().includes('dragon')); if (sample) { const mk = pickModelFor(sample.name, modelRegistry, useFamilyMap ? FAMILY_MODEL_MAP : undefined); setLog((l)=>[{ id: uid("log"), ts: now(), text: `Тест автопривязки для "${sample.name}": ${mk.url?"нашёл 3D":"нет 3D"} ${useFamilyMap?"(с родовым)":"(без родового)"}` }, ...l]); } }}>Тест автопривязки</button>
                </div>
                
                {/* Статистика CR */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-yellow-400">СТАТИСТИКА</div>
                  <div className="text-xs opacity-70">
                    3D моделей: {enrichedBestiary.filter(m => isValidModelUrl(m.modelUrl)).length}/{enrichedBestiary.length}
                  </div>
                  <div className="text-xs opacity-70">
                    Токенов на карте: {tokens.length}
                  </div>
                </div>
              </div>

              {/* Создание токенов и генерация изображений */}
              <div className="mt-4 space-y-4">
                <div>
                  <Title>Создание токенов</Title>
                  <SimpleTokenCreator 
                    onCreateToken={(tokenData) => {
                      const tok: Token = {
                        id: uid("token"),
                        name: tokenData.name,
                        type: tokenData.type as TokenType,
                        hp: tokenData.hp,
                        maxHp: tokenData.maxHp,
                        ac: tokenData.ac,
                        speed: tokenData.speed,
                        color: tokenData.type === 'PC' ? 'bg-emerald-600' : 'bg-red-600',
                        conditions: [],
                        position: { x: MAP_W/2 - GRID/2, y: MAP_H/2 - GRID/2 },
                        initiative: Math.floor(Math.random()*20)+1,
                        modelUrl: undefined
                      };
                      setTokens((prev) => [...prev, tok]);
                      setLog((l) => [{ id: uid("log"), ts: now(), text: `Создан токен: ${tokenData.name}` }, ...l]);
                    }}
                  />
                </div>


                <div>
                  <Title>Видеочат</Title>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVideoChatOpen(!videoChatOpen)}
                      className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors ${
                        videoChatOpen 
                          ? 'border-emerald-400 text-emerald-400 bg-emerald-900/20' 
                          : 'border-neutral-700 hover:border-neutral-600'
                      }`}
                    >
                      {videoChatOpen ? 'Скрыть' : 'Показать'} видеочат
                    </button>
                  </div>
                </div>

                <div>
                  <BackgroundMusic isDM={isDM} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Центр: Карта и токены */}
        <div className="relative bg-neutral-900" onDrop={onMapDrop} onDragOver={onMapDragOver}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="relative rounded-xl shadow-xl bg-neutral-800 overflow-hidden" style={{ width: MAP_W, height: MAP_H }} onClick={onMapClick} ref={mapRef}>
                {/* Фон карты */}
                {mapImage ? (<img src={mapImage} alt="Карта" className="absolute inset-0 w-full h-full object-cover" />) : (<div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">Перетащите изображение карты или выберите файл сверху</div>)}

                {/* Сетка */}
                <svg className="absolute inset-0 pointer-events-none" width={MAP_W} height={MAP_H}>
                  {Array.from({ length: Math.floor(MAP_W / GRID) + 1 }).map((_, i) => (<line key={`v${i}`} x1={i * GRID} y1={0} x2={i * GRID} y2={MAP_H} stroke="rgba(255,255,255,0.08)" />))}
                  {Array.from({ length: Math.floor(MAP_H / GRID) + 1 }).map((_, i) => (<line key={`h${i}`} x1={0} y1={i * GRID} x2={MAP_W} y2={i * GRID} stroke="rgba(255,255,255,0.08)" />))}
                </svg>

                {/* Токены */}
                {tokens.filter(t => t && t.position).map((t) => (
                  <div key={t.id} style={{ left: t.position.x, top: t.position.y, width: GRID, height: GRID }} className={`absolute rounded-lg border ${selectedId === t.id ? "border-yellow-400" : "border-neutral-700"}`} onMouseDown={(e)=>{ if (!mapRef.current) return; const rect = mapRef.current.getBoundingClientRect(); dragOffset.current = { x: e.clientX - rect.left - t.position.x, y: e.clientY - rect.top - t.position.y }; setDragId(t.id); setSelectedId(t.id); }} title={`${t.name} (${t.hp}/${t.maxHp})`}>
                    <TokenVisual token={t} use3D={use3D} modelReady={modelReady && !brokenModels[t.id]} onModelError={handleModelError} />
                    <div className="absolute -bottom-1 left-0 right-0 h-2 bg-neutral-900/70 rounded-b-lg overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(t.hp / t.maxHp) * 100}%` }} /></div>
                  </div>
                ))}

                {/* Туман войны */}
                {fogEnabled && (
                  <svg className="absolute inset-0 pointer-events-none" width={MAP_W} height={MAP_H}>
                    <defs>
                      <mask id="fogMask">
                        <rect width="100%" height="100%" fill="white" />
                        {/* Открытые области (черные в маске = прозрачные) */}
                        {[...reveal, ...(autoRevealAllies?tokens.filter(t=>t.type==="PC" && t.position).map(t=>({x:t.position.x+GRID/2,y:t.position.y+GRID/2,r:fogRadius})):[])].map((c,i)=>(<circle key={`reveal-${i}`} cx={c.x} cy={c.y} r={c.r} fill="black" />))}
                        {/* Скрытые области (белые в маске = туман поверх) */}
                        {hideAreas.map((c,i)=>(<circle key={`hide-${i}`} cx={c.x} cy={c.y} r={c.r} fill="white" />))}
                      </mask>
                    </defs>
                    <rect width="100%" height="100%" fill={`rgba(0,0,0,${fogOpacity})`} mask="url(#fogMask)" />
                    {/* Дополнительные скрытые области поверх */}
                    {hideAreas.map((c,i)=>(<circle key={`hide-overlay-${i}`} cx={c.x} cy={c.y} r={c.r} fill={`rgba(0,0,0,${fogOpacity * 1.2})`} />))}
                  </svg>
                )}

                {/* Панель выбранного токена */}
                {selectedId && (() => { const t = tokens.find((x)=>x.id===selectedId); if (!t || !t.position) return null; const left = Math.min(MAP_W - 260, Math.max(0, t.position.x + GRID + 8)); const top = Math.min(MAP_H - 170, Math.max(0, t.position.y - 8)); return (
                  <div className="absolute z-10" style={{ left, top }}>
                    <div className="w-64 rounded-xl border border-neutral-700 bg-neutral-900/95 backdrop-blur p-3 space-y-2 shadow-xl">
                      <div className="flex items-center justify-between"><div className="font-semibold">{t.name}</div><button className="text-neutral-400 hover:text-white" onClick={()=>setSelectedId(null)}>✕</button></div>
                      <div className="flex items-center gap-2"><StatBadge label="HP" value={`${t.hp}/${t.maxHp}`} /><StatBadge label="AC" value={t.ac} /><StatBadge label="Init" value={t.initiative} /></div>
                      <div className="flex items-center gap-2 text-sm">
                        <button className="px-2 py-1 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" onClick={()=>setTokens(prev=>prev.map(x=>x.id===t.id?{...x, hp: Math.min(x.maxHp, x.hp + Math.ceil(x.maxHp*0.25))}:x))}>Лечить 25%</button>
                        <button className="px-2 py-1 rounded-md border border-neutral-700 hover:border-rose-400 hover:text-rose-400" onClick={()=>setTokens(prev=>prev.map(x=>x.id===t.id?{...x, hp: Math.max(0, x.hp - Math.ceil(x.maxHp*0.25))}:x))}>Урон 25%</button>
                        <button className="ml-auto px-2 py-1 rounded-md border border-neutral-700 hover:border-rose-400 hover:text-rose-400" onClick={()=>{setTokens(prev=>prev.filter(x=>x.id!==t.id)); setSelectedId(null);}}>Удалить</button>
                      </div>
                    </div>
                  </div>
                ); })()}
              </div>
            </div>
          </div>

          {/* Нижняя панель действий */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur px-3 py-2 shadow-2xl">
              <div className="flex items-center gap-2 justify-center flex-wrap text-sm">
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400">Движение</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Атака</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Заклинание</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Предмет</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" onClick={nextTurn}>Закончить ход</button>
                <div className="ml-2 flex items-center gap-1 text-xs"><span className="opacity-70">Кости:</span>{[20,12,10,8,6,4].map((s)=>(<button key={s} className="px-2 py-1 rounded-md border border-neutral-700 hover:border-neutral-400" onClick={()=>roll(s)}>d{s}</button>))}</div>
                <button
                  onClick={() => setUseCompactUI(true)}
                  className="ml-4 px-3 py-2 rounded-md border border-neutral-700 hover:border-blue-400 hover:text-blue-400 text-xs"
                >
                  Компактный режим
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Правая панель: Инициатива + Журнал */}
        <div className={`border-l border-neutral-800 bg-neutral-900/60 overflow-y-auto ${rightOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="p-3 space-y-4">
            <Title>Инициатива</Title>
            <div className="space-y-2">
              {initOrder.map((t, idx) => (
                <div key={t.id} className={`flex items-center justify-between rounded-lg border px-2 py-2 ${idx === (turnIndex % (initOrder.length||1)) ? "border-emerald-400 bg-emerald-900/20" : "border-neutral-700 bg-neutral-900/60"}`}>
                  <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${t.type === "PC" ? "bg-emerald-400" : "bg-rose-400"}`} /><div className="font-medium">{t.name}</div></div>
                  <div className="flex items-center gap-2 text-xs"><StatBadge label="Init" value={t.initiative} /><StatBadge label="HP" value={`${t.hp}/${t.maxHp}`} /></div>
                </div>
              ))}
            </div>

            <Title>Журнал боя</Title>
            <div className="space-y-2">
              {log.map((e) => (
                <div key={e.id} className="rounded-lg border border-neutral-700 bg-neutral-900/70 p-2 text-sm"><div className="text-xs opacity-60">{e.ts}</div><div>{e.text}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Видеочат */}
      {videoChatOpen && (
        <div className="absolute top-4 right-4 w-80 h-96 z-20">
          <VideoChat
            sessionId="test-session"
            playerName="Test Player"
            isDM={isDM}
            onClose={() => setVideoChatOpen(false)}
          />
        </div>
      )}
      
      {/* Мини-карта */}
      <MiniMap2D
        tokens={tokens}
        selectedId={selectedId}
        activeToken={activeToken}
        mapImage={mapImage}
        isDM={isDM}
      />
    </div>
  );
}