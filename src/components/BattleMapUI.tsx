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
import AssetLibrary from '@/components/battle/vtt/AssetLibrary';
import VTTToolbar, { VTTTool } from '@/components/battle/vtt/VTTToolbar';
import LayerPanel, { Layer } from '@/components/battle/vtt/LayerPanel';
import ContextMenu from '@/components/battle/vtt/ContextMenu';
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

  // ===== Полный интерфейс VTT =====
  
  return (
    <div className="w-full h-screen bg-background text-foreground overflow-hidden">
      <div className="flex h-full w-full relative">
        {/* VTT Toolbar - только для режима VTT */}
        {!useCompactUI && (
          <VTTToolbar
            activeTool={vttTool}
            onToolChange={setVttTool}
            hasSelection={selectedId !== null}
            onUndo={() => setLog(l => [{ id: uid("log"), ts: now(), text: "↶ Отмена последнего действия" }, ...l])}
            onRedo={() => setLog(l => [{ id: uid("log"), ts: now(), text: "↷ Повтор действия" }, ...l])}
            onRotateLeft={() => {
              if (selectedId) {
                setLog(l => [{ id: uid("log"), ts: now(), text: "↺ Поворот влево" }, ...l]);
              }
            }}
            onRotateRight={() => {
              if (selectedId) {
                setLog(l => [{ id: uid("log"), ts: now(), text: "↻ Поворот вправо" }, ...l]);
              }
            }}
            onCopy={() => {
              if (selectedId) {
                const token = tokens.find(t => t.id === selectedId);
                if (token) {
                  const newToken = { ...token, id: uid("token"), position: { x: token.position.x + 32, y: token.position.y + 32 } };
                  setTokens(prev => [...prev, newToken]);
                  setLog(l => [{ id: uid("log"), ts: now(), text: `📋 Скопирован токен: ${token.name}` }, ...l]);
                }
              }
            }}
            onDelete={() => {
              if (selectedId) {
                const token = tokens.find(t => t.id === selectedId);
                if (token) {
                  setTokens(prev => prev.filter(t => t.id !== selectedId));
                  setSelectedId(null);
                  setLog(l => [{ id: uid("log"), ts: now(), text: `🗑️ Удален токен: ${token.name}` }, ...l]);
                }
              }
            }}
            onSettings={() => setShowLayerPanel(!showLayerPanel)}
          />
        )}

        <div className="flex flex-1 relative">
          {/* Asset Library - только для режима VTT */}
          {!useCompactUI && showAssetLibrary && (
            <div className="w-72">
              <AssetLibrary
                onAssetSelect={handleAssetSelect}
                onAssetUpload={handleAssetUpload}
              />
            </div>
          )}

          {/* Главная область карты */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={mapRef}
              className="w-full h-full relative bg-slate-800 cursor-crosshair overflow-hidden"
              style={{
                backgroundImage: mapImage
                  ? `url(${mapImage})`
                  : "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.1) 2px, transparent 0)",
                backgroundSize: mapImage ? "cover" : "50px 50px",
                backgroundPosition: mapImage ? "center" : "0 0, 25px 25px",
                backgroundRepeat: mapImage ? "no-repeat" : "repeat"
              }}
              onDrop={onMapDrop}
              onDragOver={onMapDragOver}
              onDragLeave={onMapDragLeave}
              onClick={(e) => {
                // Обработка инструментов тумана и измерения для обоих режимов
                const currentTool = useCompactUI ? dmTool : vttTool;
                
                if (currentTool === 'fog-reveal' || currentTool === 'fog-hide') {
                  const rect = mapRef.current?.getBoundingClientRect();
                  if (rect) {
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    if (currentTool === 'fog-reveal') {
                      setReveal(prev => [...prev, { x, y, r: fogRadius }]);
                      setLog(l => [{ id: uid("log"), ts: now(), text: "👁️ Туман рассеян" }, ...l]);
                    } else if (currentTool === 'fog-hide') {
                      setHideAreas(prev => [...prev, { x, y, r: fogRadius }]);
                      setLog(l => [{ id: uid("log"), ts: now(), text: "🌫️ Туман скрыт" }, ...l]);
                    }
                  }
                } else if (currentTool === 'measure') {
                  setLog(l => [{ id: uid("log"), ts: now(), text: "📏 Измерение расстояния" }, ...l]);
                }
              }}
            >
              {/* Индикатор перетаскивания карты */}
              {isDragOver && (
                <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary flex items-center justify-center z-50">
                  <div className="text-primary font-semibold text-xl">Отпустите для загрузки карты</div>
                </div>
              )}

              {/* Туман войны - должен быть виден только для DM или если включен */}
              {fogEnabled && (layers.find(l => l.id === 'fog')?.visible !== false) && (
                <div className="absolute inset-0 pointer-events-none" style={{ opacity: layers.find(l => l.id === 'fog')?.opacity || 1 }}>
                  <svg className="w-full h-full">
                    <defs>
                      <mask id="fogMask">
                        <rect width="100%" height="100%" fill="white" />
                        {/* Области открытого тумана */}
                        {reveal.map((circle, i) => (
                          <circle
                            key={`reveal-${i}`}
                            cx={circle.x}
                            cy={circle.y}
                            r={circle.r}
                            fill="black"
                          />
                        ))}
                        {/* Автоматическое раскрытие для союзников */}
                        {autoRevealAllies && tokens
                          .filter(t => t.type === "PC")
                          .map((token, i) => (
                            <circle
                              key={`auto-${i}`}
                              cx={token.position.x + GRID/2}
                              cy={token.position.y + GRID/2}
                              r={fogRadius}
                              fill="black"
                            />
                          ))}
                        {/* Области скрытого тумана */}
                        {hideAreas.map((circle, i) => (
                          <circle
                            key={`hide-${i}`}
                            cx={circle.x}
                            cy={circle.y}
                            r={circle.r}
                            fill="white"
                          />
                        ))}
                      </mask>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="black"
                      mask="url(#fogMask)"
                      opacity={fogOpacity}
                    />
                  </svg>
                </div>
              )}

              {/* Токены */}
              {(layers.find(l => l.id === 'tokens')?.visible !== false) && (
                <div 
                  className="absolute inset-0" 
                  style={{ opacity: layers.find(l => l.id === 'tokens')?.opacity || 1 }}
                >
                  {tokens.map((token) => (
                    <div
                      key={token.id}
                      className={`absolute border-2 rounded cursor-pointer transition-all duration-200 ${
                        selectedId === token.id
                          ? "border-yellow-400 shadow-lg z-20"
                          : "border-gray-300 hover:border-gray-400 z-10"
                      } ${
                        activeToken?.id === token.id
                          ? "ring-2 ring-green-400 ring-opacity-75"
                          : ""
                      }`}
                      style={{
                        left: token.position.x,
                        top: token.position.y,
                        width: GRID,
                        height: GRID,
                        transform: dragId === token.id ? "scale(1.1)" : "scale(1)",
                      }}
                      onMouseDown={(e) => {
                        const rect = mapRef.current?.getBoundingClientRect();
                        if (rect) {
                          dragOffset.current = {
                            x: e.clientX - rect.left - token.position.x,
                            y: e.clientY - rect.top - token.position.y,
                          };
                          setDragId(token.id);
                          setSelectedId(token.id);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        const rect = mapRef.current?.getBoundingClientRect();
                        if (rect) {
                          setContextMenu({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                            tokenId: token.id,
                          });
                        }
                      }}
                    >
                      {/* Содержимое токена */}
                      <TokenVisual 
                        token={token} 
                        use3D={use3D} 
                        modelReady={modelReady} 
                        onModelError={handleModelError} 
                      />
                      
                      {/* HP бар */}
                      <div className="absolute -bottom-2 left-0 right-0">
                        <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              token.hp / token.maxHp > 0.5
                                ? "bg-green-500"
                                : token.hp / token.maxHp > 0.25
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${(token.hp / token.maxHp) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Инициатива */}
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {token.initiative}
                      </div>

                      {/* Условия */}
                      {token.conditions.length > 0 && (
                        <div className="absolute -top-2 -left-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full" title={token.conditions.join(", ")} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Детали выбранного токена */}
              {selectedId && (() => {
                const t = tokens.find(x => x.id === selectedId);
                if (!t) return null;
                return (
                  <div className="absolute bottom-4 left-4 p-3 bg-background border rounded-lg min-w-[300px]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{t.name}</div>
                      <button 
                        className="text-muted-foreground hover:text-foreground" 
                        onClick={() => setSelectedId(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
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
                );
              })()}

              {/* Кнопка переключения в компактный режим */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setUseCompactUI(true)}
                  className="px-3 py-2 bg-background/90 backdrop-blur-sm border rounded-lg text-sm hover:bg-background"
                >
                  Компактный режим
                </button>
              </div>
            </div>
          </div>

          {/* Layer Panel - только для режима VTT */}
          {!useCompactUI && showLayerPanel && (
            <LayerPanel
              layers={layers}
              activeLayerId={activeLayerId}
              onLayerSelect={setActiveLayerId}
              onLayerToggleVisible={handleLayerToggleVisible}
              onLayerToggleLock={handleLayerToggleLock}
              onLayerOpacityChange={handleLayerOpacityChange}
              onLayerAdd={handleLayerAdd}
              onLayerDelete={handleLayerDelete}
              onLayerRename={handleLayerRename}
            />
          )}
        </div>

        {/* Правая боковая панель с видео чатом и музыкой */}
        <div className="w-80 bg-background border-l border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold mb-4">Панель управления</h3>
            
            {/* Видео чат */}
            <div className="mb-4">
              <VideoChat 
                sessionId="unified-battle" 
                playerName="Player" 
                isDM={isDM}
                onClose={() => setVideoChatOpen(false)} 
              />
            </div>
            
            {/* Фоновая музыка */}
            <div className="mb-4">
              <BackgroundMusic />
            </div>
            
            {/* Инструменты мастера */}
            {isDM && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Инструменты Мастера</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVttTool(vttTool === "fog-reveal" ? "select" : "fog-reveal")}
                    className={`px-3 py-2 text-xs rounded border transition-colors ${
                      vttTool === "fog-reveal"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    👁️ Рассеять туман
                  </button>
                  <button
                    onClick={() => setVttTool(vttTool === "fog-hide" ? "select" : "fog-hide")}
                    className={`px-3 py-2 text-xs rounded border transition-colors ${
                      vttTool === "fog-hide"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    🌫️ Скрыть туман
                  </button>
                  <button
                    onClick={() => setVttTool(vttTool === "measure" ? "select" : "measure")}
                    className={`px-3 py-2 text-xs rounded border transition-colors ${
                      vttTool === "measure"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    📏 Измерить
                  </button>
                  <button
                    onClick={() => {
                      setReveal([]);
                      setHideAreas([]);
                      setLog(l => [{ id: uid("log"), ts: now(), text: "🌫️ Туман сброшен" }, ...l]);
                    }}
                    className="px-3 py-2 text-xs rounded border bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Сбросить туман
                  </button>
                </div>
              </div>
            )}

            {/* Журнал событий */}
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Журнал событий</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {log.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="text-xs p-2 bg-secondary rounded">
                    <span className="text-muted-foreground">{entry.ts}</span> {entry.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Контекстное меню */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRotateLeft={() => {
            setLog(l => [{ id: uid("log"), ts: now(), text: "↺ Токен повернут влево" }, ...l]);
            setContextMenu(null);
          }}
          onRotateRight={() => {
            setLog(l => [{ id: uid("log"), ts: now(), text: "↻ Токен повернут вправо" }, ...l]);
            setContextMenu(null);
          }}
          onCopy={() => {
            const token = tokens.find(t => t.id === contextMenu.tokenId);
            if (token) {
              const newToken = { 
                ...token, 
                id: uid("token"), 
                position: { x: token.position.x + 32, y: token.position.y + 32 } 
              };
              setTokens(prev => [...prev, newToken]);
              setLog(l => [{ id: uid("log"), ts: now(), text: `📋 Скопирован: ${token.name}` }, ...l]);
            }
            setContextMenu(null);
          }}
          onDelete={() => {
            const token = tokens.find(t => t.id === contextMenu.tokenId);
            if (token) {
              setTokens(prev => prev.filter(t => t.id !== contextMenu.tokenId));
              setLog(l => [{ id: uid("log"), ts: now(), text: `🗑️ Удален: ${token.name}` }, ...l]);
            }
            setContextMenu(null);
          }}
          onHeal={() => {
            setTokens(prev => prev.map(t => 
              t.id === contextMenu.tokenId 
                ? { ...t, hp: Math.min(t.maxHp, t.hp + Math.ceil(t.maxHp * 0.25)) }
                : t
            ));
            setLog(l => [{ id: uid("log"), ts: now(), text: "💚 Исцеление 25%" }, ...l]);
            setContextMenu(null);
          }}
          onDamage={() => {
            setTokens(prev => prev.map(t => 
              t.id === contextMenu.tokenId 
                ? { ...t, hp: Math.max(0, t.hp - Math.ceil(t.maxHp * 0.25)) }
                : t
            ));
            setLog(l => [{ id: uid("log"), ts: now(), text: "❤️ Урон 25%" }, ...l]);
            setContextMenu(null);
          }}
          onEdit={() => {
            setSelectedId(contextMenu.tokenId);
            setContextMenu(null);
          }}
          onToggleVisible={() => {
            setLog(l => [{ id: uid("log"), ts: now(), text: "👁️ Видимость изменена" }, ...l]);
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
}