import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMonstersStore } from '@/stores/monstersStore';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import useBattleStore from '@/stores/battleStore';
import type { Monster } from '@/types/monsters';
import SimpleTokenCreator from '@/components/battle/SimpleTokenCreator';
import { VideoChat } from '@/components/battle/VideoChat';
import { PlayersList } from '@/components/battle/PlayersList';
import BackgroundMusic from '@/components/battle/BackgroundMusic';
import MiniMap2D from '@/components/battle/minimap/MiniMap2D';
import AssetUploader from '@/components/battle/ui/AssetUploader';
import VTTToolbar, { VTTTool } from '@/components/battle/vtt/VTTToolbar';
import LayerPanel, { Layer } from '@/components/battle/vtt/LayerPanel';
import ContextMenu from '@/components/battle/vtt/ContextMenu';
import FogOfWar from '@/components/battle/FogOfWar';
import { getModelTypeFromTokenName } from '@/utils/tokenModelMapping';
import { getMonsterAvatar } from '@/data/monsterAvatarSystem';
import { useBattleSession } from '@/hooks/useBattleSession';
import { useUserRole } from '@/hooks/use-auth';
import { useBattleTokensSync } from '@/hooks/useBattleTokensSync';
import { useBattleTokensToSupabase } from '@/hooks/useBattleTokensToSupabase';
import { useBattleMapSync } from '@/hooks/useBattleMapSync';
import { useToast } from '@/hooks/use-toast';
import { useFogSync } from '@/hooks/useFogSync';
import { useFogStore } from '@/stores/fogStore';
import { ArrowLeft, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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
  rotation?: number; // Поворот токена в градусах
  imageUrl?: string; // Пользовательское изображение токена
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

function TokenVisual({ token, use3D, modelReady, onModelError }: { token: Token; use3D: boolean; modelReady: boolean; onModelError: (id: string, msg: string)=>void; }): JSX.Element {
  // Проверяем, что model-viewer определен в customElements
  const isModelViewerDefined = typeof window !== 'undefined' && 
    window.customElements && 
    window.customElements.get('model-viewer');
  
  const can3D = use3D && modelReady && isValidModelUrl(token.modelUrl) && isModelViewerDefined;
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
    // Сначала проверяем пользовательское изображение
    if (token.imageUrl) {
      return (
        <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center overflow-hidden rounded`}>
          <img 
            src={token.imageUrl} 
            alt={token.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Если изображение не загрузилось, показываем эмодзи
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.textContent = getMonsterAvatar(token.name).emoji;
            }}
          />
        </div>
      );
    }
    
    // Затем используем систему аватаров по умолчанию
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
  
  // Fallback if model URL is invalid
  if (!token.modelUrl) {
    return (
      <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center text-lg select-none`}>
        ?
      </div>
    );
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

export default function BattleMapUI({ sessionId }: { sessionId?: string }) {
  // Навигация
  const navigate = useNavigate();
  
  // Проверяем sessionId
  if (!sessionId) {
    console.error('❌ BattleMapUI: sessionId is undefined');
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Некорректный ID сессии</p>
          <Button onClick={() => navigate('/dm')} className="mt-4">
            Вернуться к панели DM
          </Button>
        </div>
      </div>
    );
  }

  console.log('✅ BattleMapUI: Инициализация с sessionId:', sessionId);
  
  // Подключение к реальному бестиарию
  const { getAllMonsters, loadSupabaseMonsters, isLoadingSupabase } = useMonstersStore();
  
  // Получаем реальный DM статус из ролей пользователя
  const { isDM } = useUserRole();
  
  // Toast для уведомлений
  const { toast } = useToast();
  
  // Хук для работы с сессиями и автоматическим сохранением карт
  const { 
    session, 
    currentMap, 
    saveMapFromUrl, 
    saveMapToSession, 
    loading: sessionLoading 
  } = useBattleSession(sessionId);
  
  // СИНХРОНИЗАЦИЯ С SUPABASE
  // Синхронизируем токены: игроки получают из БД, мастер отправляет в БД
  useBattleTokensSync(sessionId || '');
  useBattleTokensToSupabase(sessionId || '', isDM);
  
  // Синхронизируем карту: игроки получают URL, мастер отправляет URL
  useBattleMapSync(sessionId || '', isDM);
  
  // Режим и панели
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [videoChatOpen, setVideoChatOpen] = useState(false);
  const [showBackgroundMusic, setShowBackgroundMusic] = useState(false);
  const [showAssetLibrary, setShowAssetLibrary] = useState(true);

  // Карта
  const [mapImage, setMapImage] = useState<string | null>(null);
  
  // Получаем URL карты из enhancedBattleStore (для игроков из real-time синхронизации)
  const { mapImageUrl: syncedMapUrl } = useEnhancedBattleStore();
  
  // Синхронизируем туман войны с Supabase
  const mapId = 'main-map'; // Всегда используем main-map для текущей активной карты
  useFogSync(sessionId || '', mapId);
  const fogMap = useFogStore(state => state.maps[mapId]);
  const fogSize = useFogStore(state => state.sizes[mapId] || { w: 0, h: 0 });
  const [mapDimensions, setMapDimensions] = useState<{ width: number; height: number } | null>(null);
  const [autoFitMap, setAutoFitMap] = useState(true);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загружаем сохраненную карту из сессии
  useEffect(() => {
    if (currentMap && currentMap.file_url) {
      console.log('🗺️ Загружаем сохраненную карту из сессии:', currentMap);
      setMapImage(currentMap.file_url);
      if (currentMap.width && currentMap.height) {
        setMapDimensions({
          width: currentMap.width,
          height: currentMap.height
        });
      }
    } else {
      // Очищаем карту если currentMap === null (новая сессия или нет карты)
      console.log('🗺️ Очищаем карту (нет currentMap для текущей сессии)');
      setMapImage(null);
      setMapDimensions(null);
    }
  }, [currentMap]);

  // При смене sessionId СРАЗУ очищаем состояние карты
  useEffect(() => {
    console.log('🗺️ Смена sessionId - очищаем карту:', sessionId);
    setMapImage(null);
    setMapDimensions(null);
  }, [sessionId]);
  
  // ДЛЯ ИГРОКОВ: синхронизируем карту из real-time подписки
  useEffect(() => {
    if (isDM) return; // Мастер управляет картой через currentMap
    
    if (syncedMapUrl) {
      console.log('🗺️ [PLAYER] Применяем карту из real-time синхронизации:', syncedMapUrl);
      setMapImage(syncedMapUrl);
    } else {
      console.log('🗺️ [PLAYER] Очищаем карту (нет syncedMapUrl)');
      setMapImage(null);
    }
  }, [syncedMapUrl, isDM]);
  
  // Вычисление оптимальных размеров карты
  const calculateMapDimensions = () => {
    if (!autoFitMap || !mapDimensions) {
      return { width: MAP_W, height: MAP_H };
    }

    // Получаем доступное пространство (учитываем панели и отступы)
    const availableWidth = window.innerWidth - (showAssetLibrary ? 256 : 0) - 32; // 256px для панели + отступы
    const availableHeight = window.innerHeight - 120; // отступ для тулбара

    // Вычисляем соотношение сторон изображения
    const aspectRatio = mapDimensions.width / mapDimensions.height;

    // Подгоняем размеры с сохранением пропорций
    let targetWidth = Math.min(availableWidth, mapDimensions.width);
    let targetHeight = targetWidth / aspectRatio;

    // Проверяем, не превышает ли высота доступное пространство
    if (targetHeight > availableHeight) {
      targetHeight = availableHeight;
      targetWidth = targetHeight * aspectRatio;
    }

    // Минимальные размеры
    const minWidth = 800;
    const minHeight = 600;

    return {
      width: Math.max(targetWidth, minWidth),
      height: Math.max(targetHeight, minHeight)
    };
  };

  const currentMapSize = calculateMapDimensions();

  // Обработчик загрузки изображения карты
  const handleMapImageLoad = async (img: HTMLImageElement) => {
    setMapDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    
    // Автоматически сохраняем карту в сессию при загрузке (если это blob URL)
    if (mapImage && session && isDM && mapImage.startsWith('blob:')) {
      const fileName = `battle-map-${Date.now()}.png`;
      const result = await saveMapFromUrl(mapImage, fileName, {
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      
      if (result?.file_url) {
        setMapImage(result.file_url);
        console.log('✅ Карта автоматически сохранена с публичным URL');
      }
    }
  };
  
  const onMapDrop = async (e: React.DragEvent | DragEvent) => { 
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
      
      // Очищаем старый туман войны при смене карты
      if (sessionId && isDM) {
        try {
          await supabase
            .from('fog_of_war')
            .delete()
            .eq('session_id', sessionId)
            .eq('map_id', 'main-map');
          console.log('🧹 Cleared old fog data for new map');
          
          // Открываем центральную область для начала
          const centerX = 12;
          const centerY = 8;
          const initialCells = [];
          for (let y = centerY - 2; y <= centerY + 2; y++) {
            for (let x = centerX - 2; x <= centerX + 2; x++) {
              initialCells.push({
                session_id: sessionId,
                map_id: 'main-map',
                grid_x: x,
                grid_y: y,
                is_revealed: true
              });
            }
          }
          await supabase.from('fog_of_war').upsert(initialCells);
          console.log('✨ Created initial revealed area');
        } catch (error) {
          console.error('❌ Error clearing/initializing fog:', error);
        }
      }
      
      // Автоматически сохраняем карту в сессию
      if (session && isDM) {
        const result = await saveMapToSession(file, file.name);
        // Обновляем на публичный URL после сохранения
        if (result?.file_url) {
          setMapImage(result.file_url);
          console.log('✅ Карта обновлена публичным URL:', result.file_url);
        }
      }
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

  // Обработчик выбора файла через input
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Неверный формат",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive"
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setMapImage(imageUrl);
    setLog(l => [{ 
      id: uid("log"), 
      ts: now(), 
      text: `Загружена карта: ${file.name}` 
    }, ...l]);

    // Очищаем старый туман войны при смене карты
    if (sessionId && isDM) {
      try {
        await supabase
          .from('fog_of_war')
          .delete()
          .eq('session_id', sessionId)
          .eq('map_id', 'main-map');
        console.log('🧹 Cleared old fog data for new map');
        
        // Открываем центральную область для начала
        const centerX = 12;
        const centerY = 8;
        const initialCells = [];
        for (let y = centerY - 2; y <= centerY + 2; y++) {
          for (let x = centerX - 2; x <= centerX + 2; x++) {
            initialCells.push({
              session_id: sessionId,
              map_id: 'main-map',
              grid_x: x,
              grid_y: y,
              is_revealed: true
            });
          }
        }
        await supabase.from('fog_of_war').upsert(initialCells);
        console.log('✨ Created initial revealed area');
      } catch (error) {
        console.error('❌ Error clearing/initializing fog:', error);
      }
    }

    // Автоматически сохраняем карту в сессию
    if (session && isDM) {
      const result = await saveMapToSession(file, file.name);
      if (result?.file_url) {
        setMapImage(result.file_url);
        console.log('✅ Карта обновлена публичным URL:', result.file_url);
        
        toast({
          title: "Карта загружена",
          description: "Карта успешно сохранена и синхронизирована с игроками",
        });
      }
    }
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

  // Туман войны - используем состояние из battleStore для revealedCells
  const battleStore = useBattleStore();
  const { revealedCells } = battleStore.mapSettings;
  const { revealCell } = battleStore;
  
  // Локальные состояния для UI
  const [fogEnabled, setFogEnabled] = useState(true);
  const [fogOpacity, setFogOpacity] = useState(0.8);
  const [fogRadius, setFogRadius] = useState(120);
  const [autoRevealAllies, setAutoRevealAllies] = useState(true);
  const [reveal, setReveal] = useState<FogCircle[]>([]);
  const [hideAreas, setHideAreas] = useState<FogCircle[]>([]);

  // VTT состояние
  const [vttTool, setVttTool] = useState<VTTTool>('select');
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

  const handleAssetUpload = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    if (file.name.toLowerCase().includes('map') || file.name.toLowerCase().includes('карта')) {
      setMapImage(imageUrl);
      setLog(l => [{ id: uid("log"), ts: now(), text: `Загружена карта: ${file.name}` }, ...l]);
      
      // Сохраняем в Supabase если это ДМ
      if (session && isDM) {
        const result = await saveMapToSession(file, file.name);
        if (result?.file_url) {
          setMapImage(result.file_url);
        }
      }
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
    // Если активен туман войны, не обрабатываем клик здесь - пусть FogOfWar компонент обрабатывает
    if (vttTool === 'fog-reveal' || vttTool === 'fog-hide') {
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;
    
    if (!isDM) return;
    
    // Обработка других инструментов VTT
    switch (vttTool) {
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

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Кнопка "Назад" */}
      {isDM && (
        <div className="absolute top-4 left-4 z-50">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dm')}
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>
      )}
      
      {/* VTT Toolbar */}
      <VTTToolbar
        activeTool={vttTool}
        onToolChange={(tool) => {
          setVttTool(tool);
          // Синхронизируем инструмент тумана
          if (tool === 'fog-reveal' || tool === 'fog-hide') {
            console.log('🌫️ Activating fog tool:', tool);
          }
        }}
        onUndo={() => {
          // Отменить последнее действие тумана
          if (reveal.length > 0) {
            setReveal(prev => prev.slice(0, -1));
          }
        }}
        onRedo={() => {
          // TODO: Реализовать redo функциональность
        }}
        onDelete={() => {
          if (selectedId) {
            setTokens(prev => prev.filter(t => t.id !== selectedId));
            setSelectedId(null);
          }
        }}
        onRotateLeft={() => {
          // Поворот выбранного токена влево
          if (selectedId) {
            setTokens(prev => prev.map(t => 
              t.id === selectedId ? { ...t, rotation: (t.rotation || 0) - 45 } : t
            ));
          }
        }}
        onRotateRight={() => {
          // Поворот выбранного токена вправо  
          if (selectedId) {
            setTokens(prev => prev.map(t => 
              t.id === selectedId ? { ...t, rotation: (t.rotation || 0) + 45 } : t
            ));
          }
        }}
        onCopy={() => {
          // Копировать выбранный токен
          if (selectedId) {
            const token = tokens.find(t => t.id === selectedId);
            if (token) {
              const newToken = { 
                ...token, 
                id: uid("token"), 
                position: { x: token.position.x + GRID, y: token.position.y + GRID }
              };
              setTokens(prev => [...prev, newToken]);
            }
          }
        }}
        onSettings={() => setShowLayerPanel(!showLayerPanel)}
        canUndo={reveal.length > 0}
        canRedo={false}
        hasSelection={!!selectedId}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Левая панель - Видео чат и загрузка ассетов */}
        {showAssetLibrary && (
          <div className="w-64 border-r border-border flex flex-col">
            {/* Код сессии для DM */}
            {isDM && session && (
              <div className="p-3 border-b border-border bg-primary/5">
                <div className="text-xs text-muted-foreground mb-1">Код сессии:</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2 py-1 bg-background rounded text-sm font-mono font-bold text-primary">
                    {session.session_code || session.id.slice(0, 8).toUpperCase()}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(session.session_code || session.id);
                      toast({
                        title: "Скопировано!",
                        description: "Код сессии скопирован в буфер обмена",
                      });
                    }}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Копировать
                  </button>
                </div>
                
                {/* Кнопка загрузки карты */}
                <div className="mt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <MapIcon className="h-4 w-4" />
                    Загрузить карту
                  </button>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    или перетащите на карту
                  </p>
                </div>
              </div>
            )}
            
            {/* Видео чат */}
            <div className="border-b border-border">
              <VideoChat 
                isDM={isDM}
                sessionId={sessionId}
                playerName={isDM ? "ДМ" : "Игрок"}
                onClose={() => setVideoChatOpen(false)}
              />
            </div>
            
            {/* Список игроков - показываем и ДМ и игрокам */}
            {sessionId && (
              <PlayersList 
                sessionId={sessionId} 
                isDM={isDM}
              />
            )}
            
            {/* Загрузка ассетов - только для ДМ */}
            {isDM && (
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
                    conditions: [],
                    imageUrl: url // Сохраняем URL изображения
                  };
                  setTokens(prev => [...prev, newToken]);
                  setLog(l => [{ 
                    id: uid("log"), 
                    ts: now(), 
                    text: `✨ Добавлен токен: ${name}` 
                  }, ...l]);
                }}
                onMapAdd={async (url) => {
                  setMapImage(url);
                  setLog(l => [{ 
                    id: uid("log"), 
                    ts: now(), 
                    text: `🗺️ Загружена карта по ссылке` 
                  }, ...l]);
                  
                  // Сохраняем в Supabase если это ДМ
                  if (session && isDM) {
                    const result = await saveMapFromUrl(url, 'Карта по ссылке');
                    if (result?.file_url) {
                      setMapImage(result.file_url);
                    }
                  }
                }}
              />
              </div>
            )}
            
            {/* Информация для игроков */}
            {!isDM && (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div className="p-3 bg-card rounded-lg border border-border">
                    <h3 className="text-sm font-semibold mb-2 text-foreground">Игровая сессия</h3>
                    <p className="text-xs text-muted-foreground">
                      Вы подключены к боевой карте. Следите за действиями DM и своим персонажем на карте.
                    </p>
                  </div>
                  
                  {session && (
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="text-xs text-muted-foreground mb-1">Код сессии:</div>
                      <code className="text-sm font-mono font-bold text-primary">
                        {session.session_code || session.id.slice(0, 8).toUpperCase()}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Центральная область карты */}
        <div className="flex-1 flex flex-col">
          {/* Карта */}
          <div 
            className={`flex-1 relative bg-background transition-all duration-200 flex items-center justify-center ${isDragOver ? 'bg-primary/10 ring-2 ring-primary' : ''}`} 
            onDrop={onMapDrop} 
            onDragOver={onMapDragOver}
            onDragLeave={onMapDragLeave}
          >
            <div className="w-full h-full flex items-center justify-center p-4">
              <div 
                className={`relative rounded-xl shadow-xl bg-secondary overflow-hidden transition-all duration-200 ${isDragOver ? 'ring-2 ring-primary bg-primary/5' : ''}`} 
                style={{ width: currentMapSize.width, height: currentMapSize.height }} 
                onClick={onMapClick} 
                ref={mapRef}
              >
                  {/* Фон карты */}
                  {layers.find(l => l.id === 'map')?.visible && mapImage ? (
                    <img 
                      src={mapImage} 
                      alt="Карта" 
                      className="absolute inset-0 w-full h-full object-cover" 
                      onLoad={(e) => handleMapImageLoad(e.currentTarget)}
                    />
                  ) : (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center text-muted-foreground transition-all duration-200 ${isDragOver ? 'bg-primary/20 text-primary scale-105' : ''}`}>
                      <div className={`text-center p-8 rounded-2xl border-2 border-dashed transition-all duration-200 ${isDragOver ? 'border-primary bg-primary/10 scale-110' : 'border-border'}`}>
                        <div className={`text-6xl mb-4 transition-transform duration-200 ${isDragOver ? 'scale-125' : ''}`}>
                          {isDragOver ? '📥' : '🗺️'}
                        </div>
                        <div className="font-semibold text-lg mb-2">
                          {isDragOver ? 'Отпустите для загрузки' : 'Карта не загружена'}
                        </div>
                        <div className="text-sm opacity-70">
                          {isDragOver ? 'Файл будет загружен на карту' : (
                            <>
                              Перетащите изображение сюда<br />
                              или используйте кнопку "Загрузить карту"
                            </>
                          )}
                        </div>
                        {isDM && !isDragOver && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <MapIcon className="h-4 w-4 mr-2" />
                            Выбрать файл
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Сетка */}
                  <svg className="absolute inset-0 pointer-events-none" width={currentMapSize.width} height={currentMapSize.height}>
                    {Array.from({ length: Math.floor(currentMapSize.width / GRID) + 1 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * GRID} y1={0} x2={i * GRID} y2={currentMapSize.height} stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    ))}
                    {Array.from({ length: Math.floor(currentMapSize.height / GRID) + 1 }).map((_, i) => (
                      <line key={`h${i}`} x1={0} y1={i * GRID} x2={currentMapSize.width} y2={i * GRID} stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    ))}
                  </svg>

                  {/* Токены */}
                  {layers.find(l => l.id === 'tokens')?.visible && Array.isArray(tokens) ? tokens.filter(t => t && t.position).map((t) => (
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
                  )) : null}

                  {/* Туман войны */}
                  {fogEnabled && layers.find(l => l.id === 'fog')?.visible && (
                    <FogOfWar
                      gridSize={{ rows: Math.floor(currentMapSize.height / GRID), cols: Math.floor(currentMapSize.width / GRID) }}
                      revealedCells={fogMap ? (() => {
                        const revealed: { [key: string]: boolean } = {};
                        for (let y = 0; y < fogSize.h; y++) {
                          for (let x = 0; x < fogSize.w; x++) {
                            const idx = y * fogSize.w + x;
                            if (fogMap[idx] === 1) {
                              revealed[`${y}-${x}`] = true;
                            }
                          }
                        }
                        return revealed;
                      })() : {}}
                      onRevealCell={async (row: number, col: number) => {
                        if (!isDM) return; // Только DM может открывать туман
                        
                        const mode = vttTool === 'fog-reveal' ? 'reveal' : 'hide';
                        const isRevealing = mode === 'reveal';
                        
                        // Обновляем в Supabase
                        try {
                          await supabase
                            .from('fog_of_war')
                            .upsert({
                              session_id: sessionId,
                              map_id: mapId,
                              grid_x: col,
                              grid_y: row,
                              is_revealed: isRevealing
                            }, {
                              onConflict: 'session_id,map_id,grid_x,grid_y'
                            });
                          
                          console.log(`✅ Fog cell updated: (${col}, ${row}) = ${isRevealing ? 'revealed' : 'hidden'}`);
                        } catch (error) {
                          console.error('❌ Error updating fog cell:', error);
                        }
                      }}
                       active={vttTool === 'fog-reveal' || vttTool === 'fog-hide'}
                       isDM={isDM}
                       imageSize={{ width: currentMapSize.width, height: currentMapSize.height }}
                       showFullFogForPlayers={false}
                       tokenPositions={Array.isArray(tokens) ? tokens.map(t => ({
                        id: parseInt(t.id.replace(/\D/g, '') || '0'),
                        x: t.position?.x || 0,
                        y: t.position?.y || 0,
                        visible: true,
                        type: t.type || 'NPC'
                      })) : []}
                    />
                  )}

                   {/* Контролы масштабирования */}
                   <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-card/95 backdrop-blur-sm border-2 border-border rounded-lg p-2 shadow-lg z-10">
                     <button
                       className="w-10 h-10 bg-primary text-primary-foreground border border-border rounded-md flex items-center justify-center hover:bg-primary/90 transition-colors text-lg font-bold shadow-sm"
                       onClick={() => {
                         const container = mapRef.current?.parentElement;
                         if (container) {
                           const currentWidth = currentMapSize.width;
                           const newWidth = Math.min(currentWidth * 1.2, 2400);
                           const newScale = newWidth / currentMapSize.width;
                           if (mapRef.current) {
                             mapRef.current.style.transform = `scale(${newScale})`;
                             mapRef.current.style.transformOrigin = 'center center';
                           }
                         }
                       }}
                       title="Увеличить масштаб"
                     >
                       +
                     </button>
                     <div className="text-sm text-center text-foreground px-1 font-mono bg-background/50 rounded border border-border/50 py-1">
                       {Math.round((parseFloat(mapRef.current?.style.transform?.match(/scale\(([\d.]+)\)/)?.[1] || '1') * 100))}%
                     </div>
                     <button
                       className="w-10 h-10 bg-primary text-primary-foreground border border-border rounded-md flex items-center justify-center hover:bg-primary/90 transition-colors text-lg font-bold shadow-sm"
                       onClick={() => {
                         const container = mapRef.current?.parentElement;
                         if (container) {
                           const currentWidth = currentMapSize.width;
                           const newWidth = Math.max(currentWidth / 1.2, 400);
                           const newScale = newWidth / currentMapSize.width;
                           if (mapRef.current) {
                             mapRef.current.style.transform = `scale(${newScale})`;
                             mapRef.current.style.transformOrigin = 'center center';
                           }
                         }
                       }}
                       title="Уменьшить масштаб"
                     >
                       -
                     </button>
                     <button
                       className="w-10 h-10 bg-secondary text-secondary-foreground border border-border rounded-md flex items-center justify-center hover:bg-secondary/90 transition-colors text-xs font-semibold shadow-sm"
                       onClick={() => {
                         if (mapRef.current) {
                           mapRef.current.style.transform = 'scale(1)';
                           mapRef.current.style.transformOrigin = 'center center';
                         }
                       }}
                       title="Сброс масштаба"
                     >
                       1:1
                     </button>
                     <button
                       className="w-10 h-10 bg-secondary text-secondary-foreground border border-border rounded-md flex items-center justify-center hover:bg-secondary/90 transition-colors text-xs font-semibold shadow-sm"
                       onClick={() => {
                         if (mapRef.current) {
                           mapRef.current.style.transform = 'scale(0.7)';
                           mapRef.current.style.transformOrigin = 'center center';
                         }
                       }}
                       title="Подогнать карту"
                     >
                       Fit
                     </button>
                   </div>

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
              
              // Применяем изменения видимости
              if (layerId === 'fog') {
                setFogEnabled(prev => !prev);
              }
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

      {/* Видео чат */}
      {videoChatOpen && sessionId && (
        <div className="fixed top-4 right-4 z-50">
          <VideoChat sessionId={sessionId} playerName="Player" />
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