// Интегрированная боевая карта с реальным бестиарием из Supabase
// + новые функции: 3D модели через model-viewer, спавн кликом, диагностика
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMonstersStore } from '@/stores/monstersStore';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import type { Monster } from '@/types/monsters';
import MeshyModelLoader from '@/components/MeshyModelLoader';
import { meshyService } from '@/services/MeshyService';
import { FogOfWarCanvas } from '@/components/battle/FogOfWarCanvas';
import { FogOfWarControls } from '@/components/battle/FogOfWarControls';

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
  isEnemy?: boolean; // Добавлено для различения врагов и игроков
  modelUrl?: string; // GLB/GLTF
  modelScale?: number;
};

type LogEntry = { id: string; ts: string; text: string };

// ==================== Константы ====================

const GRID = 64;
const MAP_W = 1600;
const MAP_H = 900;

// Убрано: используем только Meshy.ai

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

// Убрано: используем только Meshy.ai для 3D моделей

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

// Убрано: функция подбора моделей не нужна, используем только Meshy.ai

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
    return <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center text-[11px] font-semibold text-white select-none`}>{token.name.slice(0, 2).toUpperCase()}</div>;
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
  const { isDM, mapEditMode, setMapEditMode, tokens: unifiedTokens, updateToken } = useUnifiedBattleStore();
  const { updatePlayerVision, getCellAtPosition, spawnPoints } = useFogOfWarStore();
  
  // Режим и панели
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // Карта
  const [mapImage, setMapImage] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const onMapDrop = (e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith("image/")) setMapImage(URL.createObjectURL(f)); };
  const onMapDragOver = (e: React.DragEvent) => e.preventDefault();

  // Интерактивность карты
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const mapContainer = useRef<HTMLDivElement | null>(null);

  // Обработчики интерактивности карты
  useEffect(() => {
    const container = mapContainer.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(3, Math.max(0.3, mapScale * delta));
      
      if (newScale !== mapScale) {
        const scaleDiff = newScale / mapScale;
        setMapOffset(prev => ({
          x: mouseX - (mouseX - prev.x) * scaleDiff,
          y: mouseY - (mouseY - prev.y) * scaleDiff
        }));
        setMapScale(newScale);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // В режиме редактирования карты - только правая кнопка для панорамирования
      // В обычном режиме - правая кнопка для панорамирования
      if (e.button === 2 && !mapEditMode) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(true);
        panStart.current = { x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y };
        container.style.cursor = 'grabbing';
      }
      // НЕ перехватываем левую кнопку - оставляем для игровых действий или рисования тумана
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        e.preventDefault();
        setMapOffset({
          x: e.clientX - panStart.current.x,
          y: e.clientY - panStart.current.y
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isPanning && e.button === 2) {
        setIsPanning(false);
        container.style.cursor = mapEditMode ? 'crosshair' : 'default';
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Отключаем контекстное меню для правой кнопки
    };

    // Обработчики touch для мобильных устройств
    let lastTouchDistance = 0;
    let touchStartOffset = { x: 0, y: 0 };
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now();
      
      if (e.touches.length === 1) {
        // Одиночное касание - может быть игровое действие или панорамирование
        const touch = e.touches[0];
        touchStartOffset = { x: touch.clientX - mapOffset.x, y: touch.clientY - mapOffset.y };
        
        // Ждем немного, чтобы определить намерение
        setTimeout(() => {
          if (Date.now() - touchStartTime > 150) { // Долгое нажатие = панорамирование
            setIsPanning(true);
          }
        }, 150);
      } else if (e.touches.length === 2) {
        // Двойное касание - масштабирование
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastTouchDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isPanning) {
        // Панорамирование
        e.preventDefault();
        const touch = e.touches[0];
        setMapOffset({
          x: touch.clientX - touchStartOffset.x,
          y: touch.clientY - touchStartOffset.y
        });
      } else if (e.touches.length === 2) {
        // Масштабирование
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (lastTouchDistance > 0) {
          const scaleDelta = currentDistance / lastTouchDistance;
          const newScale = Math.min(3, Math.max(0.3, mapScale * scaleDelta));
          setMapScale(newScale);
        }
        
        lastTouchDistance = currentDistance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchDuration = Date.now() - touchStartTime;
      
      if (touchDuration < 150) {
        // Быстрое касание - игровое действие (НЕ панорамирование)
        setIsPanning(false);
      } else {
        // Долгое касание завершено
        setIsPanning(false);
      }
      
      lastTouchDistance = 0;
    };

    // Добавляем обработчики только к контейнеру карты
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    // Глобальные обработчики только для завершения панорамирования
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mapScale, mapOffset, isPanning, mapEditMode]);

  // Токены/инициатива
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const initOrder = useMemo(() => [...tokens].sort((a, b) => b.initiative - a.initiative), [tokens]);
  const activeToken = initOrder.length ? initOrder[turnIndex % initOrder.length] : undefined;

  // Перетаскивание токенов
  const [dragId, setDragId] = useState<string | null>(null);
  const dragOffset = useRef<Vec2>({ x: 0, y: 0 });
  
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragId || !mapRef.current) return;
      const rect = mapRef.current.getBoundingClientRect();
      
      // Корректируем координаты с учетом масштаба и смещения
      const x = (e.clientX - rect.left) / mapScale - mapOffset.x / mapScale;
      const y = (e.clientY - rect.top) / mapScale - mapOffset.y / mapScale;
      
      const clampedX = Math.max(0, Math.min(MAP_W - GRID, x - dragOffset.current.x));
      const clampedY = Math.max(0, Math.min(MAP_H - GRID, y - dragOffset.current.y));
      
      setTokens((prev) => prev.map((t) => {
        if (t.id === dragId) {
          const newPos = { x: snap(clampedX), y: snap(clampedY) };
          
          // Обновляем видимость для игроков при движении
          if (!t.isEnemy) {
            updatePlayerVision(t.id, newPos.x + GRID/2, newPos.y + GRID/2);
          }
          
          return { ...t, position: newPos };
        }
        return t;
      }));
    };
    const onUp = () => setDragId(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragId, mapScale, mapOffset, updatePlayerVision]);

  // Туман войны - новая система
  const [fogEnabled, setFogEnabled] = useState(true);

  // Журнал и кубы
  const [log, setLog] = useState<LogEntry[]>([{ id: uid("log"), ts: now(), text: "Бой начался. Бросьте инициативу!" }]);
  const roll = (sides: number) => { const value = 1 + Math.floor(Math.random()*sides); setLog((l)=>[{ id: uid("log"), ts: now(), text: `🎲 d${sides} → ${value}` }, ...l]); };
  const nextTurn = () => setTurnIndex((i) => (initOrder.length ? (i + 1) % initOrder.length : 0));

  // Инструменты Мастера (убраны старые инструменты тумана)
  type DMTool = "select" | "add-npc" | "measure";
  const [dmTool, setDmTool] = useState<DMTool>("select");

  // Фильтрация и группировка монстров
  const [crFilter, setCrFilter] = useState<{ min: number; max: number }>({ min: 0, max: 30 });
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [groupByType, setGroupByType] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'cr' | 'type'>('name');

  // Загрузка реального бестиария при инициализации
  useEffect(() => {
    loadSupabaseMonsters();
  }, [loadSupabaseMonsters]);

  // Получаем все монстры из реального бестиария
  const bestiary = getAllMonsters();

  // Meshy автозагрузка (объявляем перед использованием в enrichedBestiary)
  const [meshyEnabled, setMeshyEnabled] = useState(true);
  const [loadedMeshyModels, setLoadedMeshyModels] = useState<Record<string, string>>({});
  
  const handleMeshyModelLoaded = (monsterName: string, modelUrl: string) => {
    setLoadedMeshyModels(prev => ({ ...prev, [monsterName]: modelUrl }));
    setLog((l) => [{ id: uid("log"), ts: now(), text: `🎯 Meshy загрузил 3D модель для ${monsterName}` }, ...l]);
  };

  // Автопривязка 3D моделей к монстрам из бестиария (только Meshy.ai)
  const enrichedBestiary = useMemo(() => {
    return bestiary.map((monster) => {
      // Проверяем загруженные из Meshy модели
      if (loadedMeshyModels[monster.name]) {
        return { ...monster, modelUrl: loadedMeshyModels[monster.name], modelScale: 1 };
      }
      
      // Если нет модели в Meshy, оставляем без 3D модели
      return monster;
    });
  }, [bestiary, loadedMeshyModels]);

  // Функция для получения числового значения CR
  const getCRValue = (cr: string): number => {
    if (cr === '1/8') return 0.125;
    if (cr === '1/4') return 0.25;
    if (cr === '1/2') return 0.5;
    return parseFloat(cr);
  };

  // Фильтрация и сортировка монстров
  const filteredBestiary = useMemo(() => {
    let filtered = enrichedBestiary.filter((monster) => {
      const crValue = getCRValue(monster.challengeRating);
      const matchesCR = crValue >= crFilter.min && crValue <= crFilter.max;
      const matchesType = !typeFilter || monster.type === typeFilter;
      const matchesSearch = !searchFilter || 
        monster.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        monster.type.toLowerCase().includes(searchFilter.toLowerCase());
      
      return matchesCR && matchesType && matchesSearch;
    });

    // Сортировка
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'cr') return getCRValue(a.challengeRating) - getCRValue(b.challengeRating);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      return 0;
    });

    return filtered;
  }, [enrichedBestiary, crFilter, typeFilter, searchFilter, sortBy]);

  // Группировка по типам
  const groupedBestiary = useMemo(() => {
    if (!groupByType) return { 'Все монстры': filteredBestiary };
    
    return filteredBestiary.reduce((groups, monster) => {
      const type = monster.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(monster);
      return groups;
    }, {} as Record<string, typeof filteredBestiary>);
  }, [filteredBestiary, groupByType]);

  // Уникальные типы для фильтра
  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(enrichedBestiary.map(m => m.type))).sort();
  }, [enrichedBestiary]);

  // 3D загрузчик
  const [use3D, setUse3D] = useState(true);
  const { ready: modelReady, error: modelErr, status: modelStatus } = useModelViewerLoader(use3D);
  const [brokenModels, setBrokenModels] = useState<Record<string, string>>({});
  const handleModelError = (id: string, msg: string) => { setBrokenModels(s=>({ ...s, [id]: msg })); const tok = tokens.find(t=>t.id===id); if (tok) setLog((l)=>[{ id: uid("log"), ts: now(), text: `Модель ${tok.name}: ${msg}. Переход на 2D.` }, ...l]); };

  // Спавн монстров кликом по карте
  const [pendingSpawn, setPendingSpawn] = useState<string | null>(null); // id монстра для клика
  
  const addMonsterAt = (monsterId: string, pos: Vec2) => {
    const monster = enrichedBestiary.find((m) => m.id === monsterId);
    if (!monster) return;
    
    // Определяем цвет по типу монстра
    const getColorByType = (type: string): string => {
      const colorMap: Record<string, string> = {
        'Зверь': 'bg-amber-600',
        'Гуманоид': 'bg-blue-600', 
        'Нежить': 'bg-gray-600',
        'Дракон': 'bg-red-700',
        'Исчадие': 'bg-purple-700',
        'Великан': 'bg-stone-600',
        'Элементаль': 'bg-cyan-600',
        'Фея': 'bg-pink-600',
        'Аберрация': 'bg-indigo-700',
        'Конструкт': 'bg-slate-600',
        'Растение': 'bg-green-600',
        'Слизь': 'bg-lime-600',
        'Чудовище': 'bg-orange-600'
      };
      return colorMap[type] || 'bg-red-600';
    };

    const tok: Token = { 
      id: uid("npc"), 
      name: monster.name, 
      type: "NPC", 
      hp: monster.hitPoints, 
      maxHp: monster.hitPoints, 
      ac: monster.armorClass, 
      speed: monster.speed.walk ? Math.floor(monster.speed.walk / 5) : 6, 
      color: getColorByType(monster.type), 
      conditions: [], 
      position: { x: snap(pos.x), y: snap(pos.y) }, 
      initiative: Math.floor(Math.random()*20)+1, 
      isEnemy: true, // Монстры - враги
      modelUrl: monster.modelUrl, 
      modelScale: (monster as any).modelScale ?? 1 
    };
    
    setTokens((prev)=>[...prev, tok]);
    setLog((l)=>[{ id: uid("log"), ts: now(), text: `ДМ создал ${monster.name}${isValidModelUrl(tok.modelUrl)?" (3D)":" (2D)"} • CR ${monster.challengeRating}` }, ...l]);
  };
  
  const selectMonsterForSpawn = (monsterId: string) => { setPendingSpawn(monsterId); setDmTool("add-npc"); };

  // Обнаружение столкновений и запуск боя
  const checkForCombatEncounters = (playerToken: Token) => {
    if (playerToken.isEnemy) return;
    
    // Проверяем столкновения с монстрами в открытых областях
    const nearbyEnemies = tokens.filter(enemy => {
      if (!enemy.isEnemy) return false;
      
      const distance = Math.sqrt(
        Math.pow(playerToken.position.x - enemy.position.x, 2) + 
        Math.pow(playerToken.position.y - enemy.position.y, 2)
      );
      
      // Проверяем видимость позиции монстра
      const { revealed } = getCellAtPosition(enemy.position.x, enemy.position.y);
      
      return distance <= GRID * 1.5 && revealed; // Встреча в пределах 1.5 клеток
    });
    
    if (nearbyEnemies.length > 0) {
      // Запускаем инициативу
      setLog((l) => [
        { id: uid("log"), ts: now(), text: `⚔️ ${playerToken.name} обнаружил врагов! Бросаем инициативу!` },
        ...l
      ]);
      
      // Можно добавить автоматический бросок инициативы
      nearbyEnemies.forEach(enemy => {
        enemy.initiative = Math.floor(Math.random() * 20) + 1;
      });
      
      if (!playerToken.initiative) {
        playerToken.initiative = Math.floor(Math.random() * 20) + 1;
      }
    }
  };

  // Клик по карте — спавн монстров
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Игнорируем клики во время панорамирования
    if (isPanning) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Корректируем координаты с учетом масштаба и смещения
    const adjustedX = (x / mapScale) - (mapOffset.x / mapScale);
    const adjustedY = (y / mapScale) - (mapOffset.y / mapScale);
    
    // Спавн монстров
    if (isDM && dmTool === "add-npc" && pendingSpawn) { 
      addMonsterAt(pendingSpawn, { x: adjustedX, y: adjustedY }); 
      setPendingSpawn(null); 
      return; 
    }
  };

  // Правый клик - контекстное меню
  const onMapContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // ==================== Рендер ====================

  const Title = ({ children }: { children: React.ReactNode }) => (<div className="text-yellow-400 font-semibold tracking-wide uppercase text-xs">{children}</div>);
  const StatBadge = ({ label, value }: { label: string; value: React.ReactNode }) => (<div className="px-2 py-0.5 rounded-md text-[11px] text-white bg-neutral-800 border border-neutral-700"><span className="opacity-70 mr-1">{label}</span><span className="font-semibold">{value}</span></div>);

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
          <StatBadge label="Монстров" value={`${filteredBestiary.length}/${enrichedBestiary.length}`} />
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
              {(["select","add-npc","measure"] as const).map((tool)=>(
                <button key={tool} onClick={()=>setDmTool(tool)} className={`px-2 py-2 rounded-md border text-sm ${dmTool===tool?"border-emerald-400 text-emerald-400":"border-neutral-700 text-neutral-300"}`}>
                  {tool === "select" && "Выбор"}
                  {tool === "add-npc" && "Добавить NPC"}
                  {tool === "measure" && "Измерить"}
                </button>
              ))}
            </div>

            <FogOfWarControls />

            <div className="space-y-2">
              <Title>Бестиарий D&D 5e ({enrichedBestiary.length} всего, {filteredBestiary.length} показано)</Title>
              
              {/* Настройки 3D */}
              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-2">
                  <input id="meshyEnabled" type="checkbox" checked={meshyEnabled} onChange={(e)=>setMeshyEnabled(e.target.checked)} />
                  <label htmlFor="meshyEnabled" className="text-sm">Meshy.ai автозагрузка 3D моделей</label>
                </div>
                <div className="text-xs text-neutral-400">
                  Источник: https://www.meshy.ai/tags/dnd
                </div>
              </div>

              {/* Поиск */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Поиск по имени или типу..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 rounded-md"
                />
              </div>

              {/* Фильтры */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-yellow-400">ФИЛЬТРЫ</div>
                
                {/* Уровень опасности */}
                <div className="space-y-1">
                  <div className="text-xs opacity-70">Уровень опасности: {crFilter.min} - {crFilter.max}</div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min={0}
                      max={30}
                      step={0.125}
                      value={crFilter.min}
                      onChange={(e) => setCrFilter(prev => ({ ...prev, min: parseFloat(e.target.value) }))}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min={0}
                      max={30}
                      step={0.125}
                      value={crFilter.max}
                      onChange={(e) => setCrFilter(prev => ({ ...prev, max: parseFloat(e.target.value) }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Тип существа */}
                <div className="space-y-1">
                  <div className="text-xs opacity-70">Тип существа</div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 rounded-md"
                  >
                    <option value="">Все типы</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Сортировка и группировка */}
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'cr' | 'type')}
                    className="flex-1 px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 rounded-md"
                  >
                    <option value="name">По имени</option>
                    <option value="cr">По уровню</option>
                    <option value="type">По типу</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={groupByType} onChange={(e) => setGroupByType(e.target.checked)} />
                    Группировать
                  </label>
                </div>

                {/* Сброс фильтров */}
                <button
                  onClick={() => {
                    setCrFilter({ min: 0, max: 30 });
                    setTypeFilter('');
                    setSearchFilter('');
                    setSortBy('name');
                  }}
                  className="w-full px-2 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded-md hover:border-neutral-600"
                >
                  Сбросить фильтры
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto pr-1">
                {Object.entries(groupedBestiary).map(([groupName, monsters]) => (
                  <div key={groupName} className="mb-3">
                    {groupByType && (
                      <div className="text-xs font-semibold text-yellow-400 mb-1 px-1">
                        {groupName} ({monsters.length})
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-1">
                      {monsters.map((m) => (
                        <button 
                          key={m.id} 
                          onClick={() => selectMonsterForSpawn(m.id)} 
                          className={`flex items-center justify-between px-2 py-1 rounded-md border text-sm transition-colors ${
                            pendingSpawn === m.id 
                              ? "border-emerald-400 text-emerald-400 bg-emerald-900/20" 
                              : "border-neutral-700 text-neutral-200 hover:border-neutral-600"
                          }`} 
                          title={`${m.type} • AC ${m.armorClass} • HP ${m.hitPoints} • CR ${m.challengeRating} • ${m.size}`}
                        >
                          <div className="flex-1 text-left">
                            <div className="truncate font-medium">{m.name}</div>
                            <div className="text-xs opacity-70 truncate">{m.type} • {m.size}</div>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="px-1 py-0.5 rounded bg-blue-800/50 border border-blue-700/50">
                              CR {m.challengeRating}
                            </span>
                            <span className="px-1 py-0.5 rounded bg-orange-800/50 border border-orange-700/50">
                              HP {m.hitPoints}
                            </span>
                            {isValidModelUrl(m.modelUrl) ? (
                              <span className="px-1 py-0.5 rounded bg-emerald-800/50 border border-emerald-700/50">3D</span>
                            ) : (
                              <span className="px-1 py-0.5 rounded bg-neutral-800/50 border border-neutral-700/50">2D</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {filteredBestiary.length === 0 && (
                  <div className="text-center text-neutral-500 py-4 text-sm">
                    Монстры не найдены с текущими фильтрами
                  </div>
                )}
              </div>
            </div>

            {/* Диагностика и тесты */}
            <div className="space-y-2">
              <Title>Диагностика</Title>
              <ul className="text-xs list-disc ml-5 space-y-1">
                <li>model-viewer → {modelReady?"✅ Готов":modelStatus==="error"?"❌ Ошибка":"⏳ Загрузка"}</li>
                <li>валидность 3D URL → {enrichedBestiary.filter(b=>b.modelUrl).every(b=>isValidModelUrl(b.modelUrl))?"✅ ОК":"⚠️ Есть некорректные"}</li>
                <li>ожидается спавн → {pendingSpawn ? enrichedBestiary.find(m=>m.id===pendingSpawn)?.name : "—"}</li>
                <li>Meshy модели → {Object.keys(loadedMeshyModels).length} загружено</li>
                <li>монстров с 3D → {enrichedBestiary.filter(m=>isValidModelUrl(m.modelUrl)).length}</li>
              </ul>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-xs" onClick={()=>{ if (filteredBestiary[0]) addMonsterAt(filteredBestiary[0].id, { x: MAP_W/2, y: MAP_H/2 }); }}>Тестовый спавн</button>
              </div>
              
              {/* Статистика CR */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-yellow-400">СТАТИСТИКА</div>
                <div className="text-xs opacity-70">
                  3D моделей: {enrichedBestiary.filter(m => isValidModelUrl(m.modelUrl)).length}/{enrichedBestiary.length}
                </div>
                <div className="text-xs opacity-70">
                  Meshy моделей: {Object.keys(loadedMeshyModels).length}
                </div>
                <div className="text-xs opacity-70">
                  CR диапазон: {Math.min(...filteredBestiary.map(m => getCRValue(m.challengeRating)))} - {Math.max(...filteredBestiary.map(m => getCRValue(m.challengeRating)))}
                </div>
              </div>

              {/* Meshy загрузчик */}
              {meshyEnabled && (
                <div className="mt-4">
                  <Title>Meshy.ai — Автозагрузка</Title>
                  <MeshyModelLoader
                    onModelLoaded={handleMeshyModelLoaded}
                    monsterNames={filteredBestiary.map(m => m.name)}
                    autoLoad={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Центр: Карта и токены */}
        <div className="relative bg-neutral-900" onDrop={onMapDrop} onDragOver={onMapDragOver} ref={mapContainer}>
          {/* Миникарта */}
          <div className="absolute top-4 right-4 z-20 w-48 h-32 bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-lg overflow-hidden">
            <div className="relative w-full h-full">
              {mapImage && <img src={mapImage} alt="Миникарта" className="w-full h-full object-cover opacity-60" />}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/40 to-transparent" />
              
              {/* Токены на миникарте */}
              {tokens.filter(t => t && t.position).map((t) => {
                const miniX = (t.position.x / MAP_W) * 192; // 192px = w-48
                const miniY = (t.position.y / MAP_H) * 128; // 128px = h-32
                return (
                  <div
                    key={`mini-${t.id}`}
                    className={`absolute w-2 h-2 rounded-full ${t.type === "PC" ? "bg-emerald-400" : "bg-rose-400"} border border-white/50`}
                    style={{ left: miniX - 4, top: miniY - 4 }}
                    title={t.name}
                  />
                );
              })}
              
              <div className="absolute bottom-1 left-1 text-xs text-white/70 font-semibold">Миникарта</div>
              <div className="absolute bottom-1 right-1 text-xs text-white/50">{Math.round(mapScale * 100)}%</div>
            </div>
          </div>

          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center p-4">
              <div 
                className="relative rounded-xl shadow-xl bg-neutral-800 overflow-hidden transition-transform duration-200 select-none" 
                style={{ 
                  width: MAP_W, 
                  height: MAP_H,
                  transform: `scale(${mapScale}) translate(${mapOffset.x / mapScale}px, ${mapOffset.y / mapScale}px)`,
                  cursor: isPanning ? 'grabbing' : (mapEditMode ? 'crosshair' : 'default'),
                  touchAction: 'none'
                }} 
                onClick={onMapClick} 
                onContextMenu={onMapContextMenu}
                ref={mapRef}
              >
                {/* Фон карты */}
                {mapImage ? (<img src={mapImage} alt="Карта" className="absolute inset-0 w-full h-full object-cover" />) : (<div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">Перетащите изображение карты или выберите файл сверху</div>)}

                {/* Сетка */}
                <svg className="absolute inset-0 pointer-events-none" width={MAP_W} height={MAP_H}>
                  {Array.from({ length: Math.floor(MAP_W / GRID) + 1 }).map((_, i) => (<line key={`v${i}`} x1={i * GRID} y1={0} x2={i * GRID} y2={MAP_H} stroke="rgba(255,255,255,0.08)" />))}
                  {Array.from({ length: Math.floor(MAP_H / GRID) + 1 }).map((_, i) => (<line key={`h${i}`} x1={0} y1={i * GRID} x2={MAP_W} y2={i * GRID} stroke="rgba(255,255,255,0.08)" />))}
                </svg>

                {/* Токены */}
                {tokens.filter(t => t && t.position).map((t) => (
                  <div key={t.id} style={{ left: t.position.x, top: t.position.y, width: GRID, height: GRID }} className={`absolute rounded-lg border ${selectedId === t.id ? "border-yellow-400" : "border-neutral-700"}`} onMouseDown={(e)=>{ 
                    // Только левая кнопка для токенов
                    if (e.button !== 0) return;
                    e.stopPropagation(); // Предотвращаем всплытие к карте
                    if (!mapRef.current) return; 
                    const rect = mapRef.current.getBoundingClientRect(); 
                    const adjustedX = (e.clientX - rect.left) / mapScale - mapOffset.x / mapScale;
                    const adjustedY = (e.clientY - rect.top) / mapScale - mapOffset.y / mapScale;
                    dragOffset.current = { x: adjustedX - t.position.x, y: adjustedY - t.position.y }; 
                    setDragId(t.id); 
                    setSelectedId(t.id); 
                  }} title={`${t.name} (${t.hp}/${t.maxHp})`}>
                    <TokenVisual token={t} use3D={use3D} modelReady={modelReady && !brokenModels[t.id]} onModelError={handleModelError} />
                    <div className="absolute -bottom-1 left-0 right-0 h-2 bg-neutral-900/70 rounded-b-lg overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(t.hp / t.maxHp) * 100}%` }} /></div>
                  </div>
                ))}

                {/* Туман войны - новая система */}
                {fogEnabled && (
                  <FogOfWarCanvas 
                    mapWidth={MAP_W}
                    mapHeight={MAP_H}
                    mapScale={mapScale}
                    mapOffset={mapOffset}
                  />
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

          {/* Элементы управления картой */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-lg p-2">
              <div className="text-xs text-white/70 mb-1">Управление</div>
              <div className="flex flex-col gap-1 text-xs text-white/60">
                <div>🖱️ Правая кнопка - перемещение</div>
                <div>🔍 Колесо - масштаб</div>
                <div>📱 Touch - жесты</div>
                <div>👆 ЛКМ - действия</div>
              </div>
            </div>
            
            {/* Масштаб карты */}
            <div className="bg-neutral-900/90 backdrop-blur border border-neutral-700 rounded-lg p-2">
              <div className="text-xs text-white/70 mb-1">Масштаб: {Math.round(mapScale * 100)}%</div>
              <div className="flex gap-1">
                <button className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded" onClick={() => {
                  const newScale = Math.min(3, mapScale * 1.2);
                  setMapScale(newScale);
                }}>+</button>
                <button className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded" onClick={() => {
                  const newScale = Math.max(0.3, mapScale * 0.8);
                  setMapScale(newScale);
                }}>-</button>
                <button className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded" onClick={() => {
                  setMapScale(1);
                  setMapOffset({ x: 0, y: 0 });
                }}>Сброс</button>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur px-3 py-2 shadow-2xl">
              <div className="flex items-center gap-2 justify-center flex-wrap text-sm">
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400">Движение</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Атака</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Заклинание</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Предмет</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" onClick={nextTurn}>Закончить ход</button>
                <div className="ml-2 flex items-center gap-1 text-xs"><span className="opacity-70">Кости:</span>{[20,12,10,8,6,4].map((s)=>(<button key={s} className="px-2 py-1 rounded-md border border-neutral-700 hover:border-neutral-400" onClick={()=>roll(s)}>d{s}</button>))}</div>
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
    </div>
  );
}