// Интегрированная боевая карта с реальным бестиарием из Supabase
// + новые функции: 3D модели через model-viewer, спавн кликом, диагностика
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMonstersStore } from '@/stores/monstersStore';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import type { Monster } from '@/types/monsters';
import SimpleTokenCreator from '@/components/battle/SimpleTokenCreator';
import CompactVideoChat from '@/components/battle/ui/CompactVideoChat';
import { VideoChat } from '@/components/battle/VideoChat';
import BackgroundMusic from '@/components/battle/BackgroundMusic';
import MiniMap2D from '@/components/battle/minimap/MiniMap2D';
import CompactBattleUI from '@/components/battle/ui/CompactBattleUI';
import AssetUploader from '@/components/battle/ui/AssetUploader';
import VTTToolbar, { VTTTool } from '@/components/battle/vtt/VTTToolbar';
import LayerPanel, { Layer } from '@/components/battle/vtt/LayerPanel';
import ContextMenu from '@/components/battle/vtt/ContextMenu';
import FogOfWar from '@/components/battle/FogOfWar';
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
  const [showBackgroundMusic, setShowBackgroundMusic] = useState(false);

  // Карта
  const [mapImage, setMapImage] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const onMapDrop = (e: React.DragEvent | DragEvent) => { 
    e.preventDefault(); 
    e.stopPropagation();
    setIsDragOver(false);
    const files = (e as DragEvent).dataTransfer?.files || (e as React.DragEvent).dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith("image/")) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setMapImage(imageUrl);
      setLog(l => [{ 
        id: uid("log"), 
        ts: now(), 
        text: `Загружена карта: ${file.name}` 
      }, ...l]);
    }
  };
  
  const onMapDragOver = (e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  
  const onMapDragLeave = (e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Проверяем, что мы действительно покидаем контейнер
    const target = e.currentTarget as Element;
    const related = e.relatedTarget as Element;
    if (target && related && target.contains(related)) {
      return;
    }
    setIsDragOver(false);
  };

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

  // VTT состояние
  const [vttTool, setVttTool] = useState<VTTTool>('select');
  const [showAssetLibrary, setShowAssetLibrary] = useState(true);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'background', name: 'Фон', visible: true, locked: false, opacity: 1, type: 'background' },
    { id: 'map', name: 'Карта', visible: true, locked: false, opacity: 1, type: 'map' },
    { id: 'tokens', name: 'Токены', visible: true, locked: false, opacity: 1, type: 'tokens' },
    { id: 'fog', name: 'Туман войны', visible: true, locked: false, opacity: 1, type: 'fog' },
  ]);
  const [activeLayerId, setActiveLayerId] = useState('tokens');

  // Контекстное меню
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tokenId: string;
  } | null>(null);

  // VTT Actions
  const handleAssetSelect = (asset: any) => {
    if (asset.type === 'token') {
      // Создаем новый токен в центре карты
      const newToken: Token = {
        id: uid("token"),
        name: asset.name,
        type: "NPC",
        hp: 10,
        maxHp: 10,
        ac: 10,
        speed: 30,
        color: "bg-red-500",
        position: { x: MAP_W / 2, y: MAP_H / 2 },
        initiative: 0,
        conditions: []
      };
      setTokens(prev => [...prev, newToken]);
      setLog(l => [{ id: uid("log"), ts: now(), text: `Добавлен токен: ${asset.name}` }, ...l]);
    } else if (asset.type === 'map') {
      setMapImage(asset.url);
      setLog(l => [{ id: uid("log"), ts: now(), text: `Загружена карта: ${asset.name}` }, ...l]);
    }
  };

  const handleAssetUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    if (file.name.toLowerCase().includes('map') || file.name.toLowerCase().includes('карта')) {
      setMapImage(imageUrl);
      setLog(l => [{ id: uid("log"), ts: now(), text: `Загружена карта: ${file.name}` }, ...l]);
    } else {
      // Создаем токен из загруженного изображения
      const newToken: Token = {
        id: uid("token"),
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: "NPC",
        hp: 10,
        maxHp: 10,
        ac: 10,
        speed: 30,
        color: "bg-blue-500",
        position: { x: MAP_W / 2, y: MAP_H / 2 },
        initiative: 0,
        conditions: []
      };
      setTokens(prev => [...prev, newToken]);
      setLog(l => [{ id: uid("log"), ts: now(), text: `Добавлен токен: ${newToken.name}` }, ...l]);
    }
  };

  // Layer management
  const handleLayerAdd = (type: Layer['type']) => {
    const newLayer: Layer = {
      id: uid("layer"),
      name: `Новый ${type}`,
      visible: true,
      locked: false,
      opacity: 1,
      type
    };
    setLayers(prev => [...prev, newLayer]);
  };

  const handleLayerToggleVisible = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleLayerToggleLock = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  const handleLayerOpacityChange = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  const handleLayerDelete = (layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
  };

  const handleLayerRename = (layerId: string, name: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, name } : layer
    ));
  };

  // Журнал и кубы
  const [log, setLog] = useState<LogEntry[]>([{ id: uid("log"), ts: now(), text: "Бой начался. Бросьте инициативу!" }]);
  const roll = (sides: number) => { const value = 1 + Math.floor(Math.random()*sides); setLog((l)=>[{ id: uid("log"), ts: now(), text: `🎲 d${sides} → ${value}` }, ...l]); };
  const nextTurn = () => setTurnIndex((i) => (initOrder.length ? (i + 1) % initOrder.length : 0));

  // Инструменты Мастера - обновляем для совместимости с VTT
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

  // Предотвращение стандартного поведения браузера для drag and drop
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        const hasImage = Array.from(e.dataTransfer.items).some(item => item.type.startsWith('image/'));
        if (hasImage) {
          setIsDragOver(true);
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Проверяем, покидает ли курсор окно браузера
      if (e.clientX <= 0 || e.clientY <= 0 || 
          e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onMapDrop(e);
    };

    // Добавляем обработчики на весь документ
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

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

  // Клик по карте — обработка инструментов VTT
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;
    
    if (!isDM) return;
    
    // Обработка инструментов VTT
    switch (vttTool) {
      case 'fog-reveal':
        setReveal((prev) => [...prev, { x, y, r: fogRadius }]);
        setLog((l) => [{ id: uid("log"), ts: now(), text: `ДМ открыл туман в точке (${Math.round(x)}, ${Math.round(y)})` }, ...l]);
        break;
      case 'fog-hide':
        setHideAreas((prev) => [...prev, { x, y, r: fogRadius }]);
        setLog((l) => [{ id: uid("log"), ts: now(), text: `ДМ скрыл область в точке (${Math.round(x)}, ${Math.round(y)})` }, ...l]);
        break;
      case 'measure':
        // TODO: Добавить измерения
        setLog((l) => [{ id: uid("log"), ts: now(), text: `Измерение в точке (${Math.round(x)}, ${Math.round(y)})` }, ...l]);
        break;
      default:
        // select, move и другие инструменты
        break;
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
          onCreateToken={(tokenData) => {
            const newToken: Token = {
              id: uid("token"),
              name: tokenData.name,
              type: "NPC" as TokenType,
              hp: 100,
              maxHp: 100,
              ac: 12,
              speed: 30,
              color: 'bg-blue-600',
              position: { x: 100, y: 100 },
              initiative: 10,
              conditions: []
            };
            setTokens(prev => [...prev, newToken]);
            setLog(l => [{ 
              id: uid("log"), 
              ts: now(), 
              text: `✨ Создан токен: ${tokenData.name}` 
            }, ...l]);
          }}
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
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* VTT Toolbar */}
      <VTTToolbar
        activeTool={vttTool}
        onToolChange={setVttTool}
        onUndo={() => {}}
        onRedo={() => {}}
        onRotateLeft={() => {}}
        onRotateRight={() => {}}
        onDelete={() => {
          if (selectedId) {
            setTokens(prev => prev.filter(t => t.id !== selectedId));
            setSelectedId(null);
          }
        }}
        onCopy={() => {}}
        onSettings={() => setShowLayerPanel(!showLayerPanel)}
        canUndo={false}
        canRedo={false}
        hasSelection={!!selectedId}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Левая панель - Видео чат и загрузка ассетов */}
        {showAssetLibrary && (
          <div className="w-64 border-r border-border flex flex-col">
            {/* Видео чат */}
            <div className="border-b border-border">
              <VideoChat 
                isDM={isDM}
                sessionId="unified-battle-session"
                playerName={isDM ? "ДМ" : "Игрок"}
                onClose={() => setVideoChatOpen(false)}
              />
            </div>
            
            {/* Загрузка ассетов */}
            <div className="flex-1 overflow-y-auto">
              <AssetUploader
                onAssetAdd={(name, url) => {
                  // Создаем токен из URL
                  const newToken: Token = {
                    id: uid("token"),
                    name: name,
                    type: "NPC" as TokenType,
                    hp: 100,
                    maxHp: 100,
                    ac: 12,
                    speed: 30,
                    color: 'bg-blue-600',
                    position: { x: 100, y: 100 },
                    initiative: 10,
                    conditions: []
                  };
                  setTokens(prev => [...prev, newToken]);
                  setLog(l => [{ 
                    id: uid("log"), 
                    ts: now(), 
                    text: `✨ Добавлен токен: ${name}` 
                  }, ...l]);
                }}
                onMapAdd={(url) => {
                  setMapImage(url);
                  setLog(l => [{ 
                    id: uid("log"), 
                    ts: now(), 
                    text: `🗺️ Загружена карта по ссылке` 
                  }, ...l]);
                }}
              />
            </div>
          </div>
        )}

        {/* Центральная область карты */}
        <div className="flex-1 flex flex-col">
          {/* Карта */}
          <div 
            className={`flex-1 relative bg-background transition-all duration-200 ${isDragOver ? 'bg-primary/10 ring-2 ring-primary' : ''}`} 
            onDrop={onMapDrop} 
            onDragOver={onMapDragOver}
            onDragLeave={onMapDragLeave}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center p-4">
                <div 
                  className={`relative rounded-xl shadow-xl bg-secondary overflow-hidden transition-all duration-200 ${isDragOver ? 'ring-2 ring-primary bg-primary/5' : ''}`} 
                  style={{ width: MAP_W, height: MAP_H }} 
                  onClick={onMapClick} 
                  ref={mapRef}
                >
                  {/* Фон карты */}
                  {mapImage ? (
                    <img src={mapImage} alt="Карта" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-sm transition-all duration-200 ${isDragOver ? 'text-primary' : ''}`}>
                      <div className="text-center">
                        <div className="text-lg mb-2">📍</div>
                        <div className="font-medium">Загрузите карту</div>
                        <div className="text-xs mt-1">Перетащите изображение сюда</div>
                      </div>
                    </div>
                  )}

                  {/* Сетка */}
                  <svg className="absolute inset-0 pointer-events-none" width={MAP_W} height={MAP_H}>
                    {Array.from({ length: Math.floor(MAP_W / GRID) + 1 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * GRID} y1={0} x2={i * GRID} y2={MAP_H} stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    ))}
                    {Array.from({ length: Math.floor(MAP_H / GRID) + 1 }).map((_, i) => (
                      <line key={`h${i}`} x1={0} y1={i * GRID} x2={MAP_W} y2={i * GRID} stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    ))}
                  </svg>

                  {/* Токены */}
                  {tokens.filter(t => t && t.position).map((t) => (
                    <div 
                      key={t.id} 
                      style={{ left: t.position.x, top: t.position.y, width: GRID, height: GRID }} 
                      className={`absolute rounded-lg border-2 ${selectedId === t.id ? "border-primary" : "border-border"} cursor-move`}
                      onMouseDown={(e) => {
                        if (e.button !== 0) return; // Только левый клик
                        if (!mapRef.current) return;
                        const rect = mapRef.current.getBoundingClientRect();
                        dragOffset.current = { 
                          x: e.clientX - rect.left - t.position.x, 
                          y: e.clientY - rect.top - t.position.y 
                        };
                        setDragId(t.id);
                        setSelectedId(t.id);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          tokenId: t.id
                        });
                        setSelectedId(t.id);
                      }}
                      title={`${t.name} (${t.hp}/${t.maxHp})`}
                    >
                      <TokenVisual token={t} use3D={use3D} modelReady={modelReady && !brokenModels[t.id]} onModelError={handleModelError} />
                      <div className="absolute -bottom-1 left-0 right-0 h-2 bg-background/70 rounded-b-lg overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(t.hp / t.maxHp) * 100}%` }} />
                      </div>
                    </div>
                  ))}

                  {/* Туман войны */}
                  {fogEnabled && (
                    <FogOfWar
                      gridSize={{ rows: Math.floor(MAP_H / GRID), cols: Math.floor(MAP_W / GRID) }}
                      revealedCells={reveal.reduce((acc, r) => {
                        const key = `${Math.floor(r.x / GRID)}-${Math.floor(r.y / GRID)}`;
                        acc[key] = true;
                        return acc;
                      }, {} as { [key: string]: boolean })}
                      onRevealCell={(row, col) => {
                        if (dmTool === "fog-reveal") {
                          const newReveal = {
                            x: col * GRID + GRID/2,
                            y: row * GRID + GRID/2,
                            r: fogRadius
                          };
                          setReveal(prev => [...prev, newReveal]);
                        } else if (dmTool === "fog-hide") {
                          // Удаляем области рядом с этой клеткой
                          setReveal(prev => prev.filter(r => {
                            const distance = Math.sqrt(
                              Math.pow(r.x - (col * GRID + GRID/2), 2) + 
                              Math.pow(r.y - (row * GRID + GRID/2), 2)
                            );
                            return distance > fogRadius;
                          }));
                        }
                      }}
                      active={dmTool === "fog-reveal" || dmTool === "fog-hide"}
                      isDM={isDM}
                      imageSize={{ width: MAP_W, height: MAP_H }}
                      tokenPositions={tokens.map(t => ({
                        id: parseInt(t.id.replace(/\D/g, '') || '0'),
                        x: t.position?.x || 0,
                        y: t.position?.y || 0,
                        visible: true,
                        type: t.type || 'NPC'
                      }))}
                    />
                  )}

                  {/* Панель выбранного токена */}
                  {selectedId && (() => {
                    const t = tokens.find(x => x.id === selectedId);
                    if (!t || !t.position) return null;
                    const left = Math.min(MAP_W - 260, Math.max(0, t.position.x + GRID + 8));
                    const top = Math.min(MAP_H - 170, Math.max(0, t.position.y - 8));
                    return (
                      <div className="absolute z-10" style={{ left, top }}>
                        <div className="w-64 rounded-xl border bg-card p-3 space-y-2 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{t.name}</div>
                            <button 
                              className="text-muted-foreground hover:text-foreground" 
                              onClick={() => setSelectedId(null)}
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 rounded bg-secondary text-xs">
                              HP: {t.hp}/{t.maxHp}
                            </div>
                            <div className="px-2 py-1 rounded bg-secondary text-xs">
                              AC: {t.ac}
                            </div>
                            <div className="px-2 py-1 rounded bg-secondary text-xs">
                              Init: {t.initiative}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <button 
                              className="px-2 py-1 rounded border hover:bg-secondary"
                              onClick={() => setTokens(prev => prev.map(x => x.id === t.id ? {
                                ...x, 
                                hp: Math.min(x.maxHp, x.hp + Math.ceil(x.maxHp * 0.25))
                              } : x))}
                            >
                              Лечить 25%
                            </button>
                            <button 
                              className="px-2 py-1 rounded border hover:bg-secondary"
                              onClick={() => setTokens(prev => prev.map(x => x.id === t.id ? {
                                ...x, 
                                hp: Math.max(0, x.hp - Math.ceil(x.maxHp * 0.25))
                              } : x))}
                            >
                              Урон 25%
                            </button>
                            <button 
                              className="ml-auto px-2 py-1 rounded border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => {
                                setTokens(prev => prev.filter(x => x.id !== t.id));
                                setSelectedId(null);
                              }}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer Panel */}
        {showLayerPanel && (
          <LayerPanel
            layers={layers}
            activeLayerId={activeLayerId}
            onLayerSelect={setActiveLayerId}
            onLayerToggleVisible={(layerId) => {
              setLayers(prev => prev.map(layer => 
                layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
              ));
            }}
            onLayerToggleLock={(layerId) => {
              setLayers(prev => prev.map(layer => 
                layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
              ));
            }}
            onLayerOpacityChange={(layerId, opacity) => {
              setLayers(prev => prev.map(layer => 
                layer.id === layerId ? { ...layer, opacity } : layer
              ));
            }}
            onLayerAdd={(type) => {
              const newLayer: Layer = {
                id: uid('layer'),
                name: `Новый ${type}`,
                visible: true,
                locked: false,
                opacity: 1,
                type
              };
              setLayers(prev => [...prev, newLayer]);
            }}
            onLayerDelete={(layerId) => {
              setLayers(prev => prev.filter(layer => layer.id !== layerId));
            }}
            onLayerRename={(layerId, name) => {
              setLayers(prev => prev.map(layer => 
                layer.id === layerId ? { ...layer, name } : layer
              ));
            }}
          />
        )}
      </div>

      {/* Статус бар */}
      <div className="h-8 bg-secondary border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Инструмент: {vttTool}</span>
          <span>Токенов: {tokens.length}</span>
          {activeToken && <span>Активный: {activeToken.name}</span>}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAssetLibrary(!showAssetLibrary)}
            className="hover:text-foreground"
          >
            {showAssetLibrary ? 'Скрыть' : 'Показать'} панель
          </button>
          <button
            onClick={() => setShowBackgroundMusic(!showBackgroundMusic)}
            className="hover:text-foreground"
          >
            {showBackgroundMusic ? 'Скрыть' : 'Показать'} музыку
          </button>
          <button
            onClick={() => setVideoChatOpen(!videoChatOpen)}
            className="hover:text-foreground"
          >
            {videoChatOpen ? 'Скрыть' : 'Показать'} видео чат
          </button>
          <button
            onClick={() => setUseCompactUI(true)}
            className="hover:text-foreground"
          >
            Компактный режим
          </button>
        </div>
      </div>

      {/* Контекстное меню */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRotateLeft={() => {
            // TODO: Реализовать поворот токена
            setLog(l => [{ id: uid("log"), ts: now(), text: `Токен повернут влево` }, ...l]);
          }}
          onRotateRight={() => {
            // TODO: Реализовать поворот токена
            setLog(l => [{ id: uid("log"), ts: now(), text: `Токен повернут вправо` }, ...l]);
          }}
          onCopy={() => {
            const token = tokens.find(t => t.id === contextMenu.tokenId);
            if (token) {
              const newToken = { 
                ...token, 
                id: uid("token"), 
                position: { x: token.position.x + GRID, y: token.position.y + GRID }
              };
              setTokens(prev => [...prev, newToken]);
              setLog(l => [{ id: uid("log"), ts: now(), text: `Токен ${token.name} скопирован` }, ...l]);
            }
          }}
          onDelete={() => {
            setTokens(prev => prev.filter(t => t.id !== contextMenu.tokenId));
            if (selectedId === contextMenu.tokenId) setSelectedId(null);
            setLog(l => [{ id: uid("log"), ts: now(), text: `Токен удален` }, ...l]);
          }}
          onHeal={() => {
            setTokens(prev => prev.map(t => t.id === contextMenu.tokenId ? {
              ...t,
              hp: Math.min(t.maxHp, t.hp + Math.ceil(t.maxHp * 0.25))
            } : t));
            setLog(l => [{ id: uid("log"), ts: now(), text: `Токен вылечен на 25%` }, ...l]);
          }}
          onDamage={() => {
            setTokens(prev => prev.map(t => t.id === contextMenu.tokenId ? {
              ...t,
              hp: Math.max(0, t.hp - Math.ceil(t.maxHp * 0.25))
            } : t));
            setLog(l => [{ id: uid("log"), ts: now(), text: `Токен получил урон 25%` }, ...l]);
          }}
          onEdit={() => {
            // TODO: Открыть диалог редактирования токена
            setLog(l => [{ id: uid("log"), ts: now(), text: `Редактирование токена` }, ...l]);
          }}
          onToggleVisible={() => {
            // TODO: Скрыть/показать токен
            setLog(l => [{ id: uid("log"), ts: now(), text: `Видимость токена изменена` }, ...l]);
          }}
        />
      )}

      {/* Компактный видео чат */}
      {videoChatOpen && (
        <div className="fixed top-4 right-4 z-50">
          <CompactVideoChat
            isConnected={false}
            participantsCount={2}
            onToggleVideo={() => console.log('Toggle video')}
            onToggleAudio={() => console.log('Toggle audio')}
            onConnect={() => console.log('Connect video chat')}
            onDisconnect={() => console.log('Disconnect video chat')}
          />
        </div>
      )}

      {/* Фоновая музыка */}
      {showBackgroundMusic && (
        <div className="fixed bottom-4 left-4 z-50">
          <BackgroundMusic isDM={isDM} />
        </div>
      )}
    </div>
  );
}