// Интегрированная боевая карта с реальными данными из проекта
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCombatStateMachine } from '@/hooks/combat/useCombatStateMachine';
import { useBattleEntitySync } from '@/hooks/useBattleEntitySync';
import { getBestiaryEntry } from '@/services/BestiaryService';
import { createBattleEntity, updateBattleEntity, deleteBattleEntity } from '@/services/BattleEntityService';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { CombatEntity } from '@/engine/combat/types';
import { supabase } from '@/integrations/supabase/client';
import { Size } from '@/types/Monster';
import { useAuth } from '@/hooks/use-auth';
import { ImportMonstersButton } from './ImportMonstersButton';
import { Battle3DScene } from './Battle3DScene';

type SRDCreature = {
  id: string;
  slug: string;
  name: string;
  type: string;
  size: string;
  armor_class: number;
  hit_points: number;
  speed: any;
  stats: any;
  cr: number;
  alignment?: string;
  hit_dice?: string;
  languages?: string;
  model_url?: string;
  icon_url?: string;
};

type Vec2 = { x: number; y: number };

type FogCircle = { x: number; y: number; r: number };

type LogEntry = { id: string; ts: string; text: string };
const GRID = 64; // px per square
const MAP_W = 1600; // px
const MAP_H = 900; // px

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  const d = new Date();
  return d.toLocaleTimeString();
}

export default function BattleMapUI() {
  const { user } = useAuth();
  const sessionId = '11111111-1111-1111-1111-111111111111'; // Используем тестовую сессию
  
  // —— Real combat state from hooks ——
  const { isDM } = useUnifiedBattleStore();
  const {
    combatState,
    entities,
    startCombat,
    endTurn,
    useAction,
    moveEntity,
    canEndTurn
  } = useCombatStateMachine(sessionId);
  
  // —— UI state ——
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // —— Map background state ——
  const [mapBackground, setMapBackground] = useState<string | null>(null);

  // —— Available monsters from bestiary ——
  const [availableMonsters, setAvailableMonsters] = useState<SRDCreature[]>([]);
  const [isLoadingMonsters, setIsLoadingMonsters] = useState(false);
  
  // —— Initiative order from real combat state ——
  const initOrder = useMemo(() => {
    return [...entities].sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
  }, [entities]);
  
  const activeEntity = entities.find(e => e.id === combatState.activeEntityId);

  // —— Dragging ——
  const [dragId, setDragId] = useState<string | null>(null);
  const dragOffset = useRef<Vec2>({ x: 0, y: 0 });

  // —— Fog of war ——
  const [fogEnabled, setFogEnabled] = useState(true);
  const [fogOpacity, setFogOpacity] = useState(0.8);
  const [fogRadius, setFogRadius] = useState(120);
  const [autoRevealAllies, setAutoRevealAllies] = useState(true);
  const [reveal, setReveal] = useState<FogCircle[]>([
    // pre-revealed spawn area
    { x: GRID * 3.5, y: GRID * 5.2, r: 180 },
  ]);

  // —— Log ——
  const [log, setLog] = useState<LogEntry[]>([
    { id: uid("log"), ts: now(), text: "Бой начался. Кидайте инициативу!" },
  ]);

  // —— DM tool state ——
  type DMTool = "select" | "fog-reveal" | "fog-hide" | "add-npc" | "measure";
  const [dmTool, setDmTool] = useState<DMTool>("select");

  // —— Dice ——
  const roll = useCallback((sides: number) => {
    const value = 1 + Math.floor(Math.random() * sides);
    const entry = { id: uid("log"), ts: now(), text: `🎲 d${sides} → ${value}` };
    setLog((l) => [entry, ...l]);
    return value;
  }, []);

  // —— Map refs ——
  const mapRef = useRef<HTMLDivElement | null>(null);

  // —— Load monsters from SRD creatures ——
  const loadMonsters = useCallback(async () => {
    setIsLoadingMonsters(true);
    try {
      const { data, error } = await supabase
        .from('srd_creatures')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setAvailableMonsters(data || []);
      console.log(`🐉 Загружено ${data?.length || 0} монстров`);
    } catch (error) {
      console.error('Failed to load monsters:', error);
    } finally {
      setIsLoadingMonsters(false);
    }
  }, []);

  useEffect(() => {  
    loadMonsters();
  }, []); // Загружаем при монтировании компонента

  // —— Map upload handler ——
  const handleMapUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Создаем URL для предпросмотра
      const imageUrl = URL.createObjectURL(file);
      setMapBackground(imageUrl);

      // Загружаем в Supabase Storage
      const fileName = `${sessionId}-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('battle-maps')
        .upload(fileName, file);

      if (error) {
        console.error('Failed to upload map:', error);
        return;
      }

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('battle-maps')
        .getPublicUrl(fileName);

      setMapBackground(publicUrl);
      setLog((l) => [{ id: uid("log"), ts: now(), text: `ДМ загрузил новую карту: ${file.name}` }, ...l]);

      console.log('🗺️ Map uploaded successfully:', publicUrl);
    } catch (error) {
      console.error('Error uploading map:', error);
      setLog((l) => [{ id: uid("log"), ts: now(), text: `❌ Ошибка загрузки карты: ${error.message}` }, ...l]);
    }
  };

  const clearMap = () => {
    setMapBackground(null);
    setLog((l) => [{ id: uid("log"), ts: now(), text: "ДМ очистил карту" }, ...l]);
  };

  // —— Helpers ——
  const snap = (v: number) => Math.round(v / GRID) * GRID;

  const addMonsterToField = async (monsterSlug: string) => {
    if (!isDM) return;
    
    try {
      const monster = availableMonsters.find(m => m.slug === monsterSlug);
      if (!monster) return;
      
      const position = {
        x: snap(MAP_W / 2) / GRID, // Convert to grid coordinates
        y: snap(MAP_H / 2) / GRID,
        z: 0
      };
      
      // Create battle entity from SRD creature
      const battleEntity = {
        session_id: sessionId,
        slug: monster.slug,
        name: monster.name,
        model_url: monster.model_url || '',
        pos_x: position.x,
        pos_y: position.y,
        pos_z: position.z,
        rot_y: 0,
        scale: 1.0,
        hp_current: monster.hit_points,
        hp_max: monster.hit_points,
        ac: monster.armor_class,
        speed: (monster.speed?.walk || 30),
        size: (monster.size as Size) || 'Medium',
        level_or_cr: `CR ${monster.cr}`,
        creature_type: monster.type,
        statuses: [],
        is_player_character: false,
        created_by: user?.id || 'demo-user-id'
      };
      
      const entity = await createBattleEntity(battleEntity);
      setLog((l) => [{ id: uid("log"), ts: now(), text: `ДМ создал ${entity.name}` }, ...l]);
    } catch (error) {
      console.error('Failed to add monster:', error);
    }
  };

  const removeEntity = async (id: string) => {
    if (!isDM) return;
    
    try {
      await deleteBattleEntity(id);
      const entity = entities.find(e => e.id === id);
      if (entity) {
        setLog((l) => [{ id: uid("log"), ts: now(), text: `Убран ${entity.name}` }, ...l]);
      }
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      console.error('Failed to remove entity:', error);
    }
  };

  const damageEntity = async (id: string, dmg: number) => {
    try {
      const entity = entities.find(e => e.id === id);
      if (!entity) return;
      
      const newHp = Math.max(0, entity.hp.current - dmg);
      // TODO: Update через combat state machine вместо прямого обновления БД
      // await updateBattleEntity(id, { hp_current: newHp });
      
      setLog((l) => [{ 
        id: uid("log"), 
        ts: now(), 
        text: `${entity.name} получает ${dmg} урона (${newHp}/${entity.hp.max})` 
      }, ...l]);
    } catch (error) {
      console.error('Failed to damage entity:', error);
    }
  };

  const healEntity = async (id: string, amt: number) => {
    try {
      const entity = entities.find(e => e.id === id);
      if (!entity) return;
      
      const newHp = Math.min(entity.hp.max, entity.hp.current + amt);  
      // TODO: Update через combat state machine вместо прямого обновления БД
      // await updateBattleEntity(id, { hp_current: newHp });
      
      setLog((l) => [{ 
        id: uid("log"), 
        ts: now(), 
        text: `${entity.name} исцеляется на ${amt} (${newHp}/${entity.hp.max})` 
      }, ...l]);
    } catch (error) {
      console.error('Failed to heal entity:', error);
    }
  };

  const nextTurn = () => {
    if (activeEntity && canEndTurn()) {
      endTurn(activeEntity.id);
    }
  };

  // —— Drag logic for entity positions ——
  useEffect(() => {
    const onMove = async (e: MouseEvent) => {
      if (!dragId || !isDM) return;
      const map = mapRef.current;
      if (!map) return;
      
      const rect = map.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.current.x;
      const y = e.clientY - rect.top - dragOffset.current.y;
      const clampedX = Math.max(0, Math.min(MAP_W - GRID, x));
      const clampedY = Math.max(0, Math.min(MAP_H - GRID, y));
      
      // Convert pixel coordinates to grid coordinates
      const gridX = snap(clampedX) / GRID;
      const gridY = snap(clampedY) / GRID;
      
      const entity = entities.find(e => e.id === dragId);
      if (!entity) return;
      
      const from = entity.position;
      const to = { x: gridX, y: gridY, z: 0 };
      
      try {
        await moveEntity(dragId, from, to);
      } catch (error) {
        console.error('Failed to move entity:', error);
      }
    };
    
    const onUp = () => setDragId(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragId, isDM, moveEntity]);

  // —— Map interactions (DM fog drawing) ——
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDM) return;
    if (dmTool !== "fog-reveal") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setReveal((prev) => [...prev, { x, y, r: fogRadius }]);
  };

  // —— Derived: auto-reveals around PCs ——
  const autoHoles: FogCircle[] = useMemo(() => {
    if (!autoRevealAllies) return [];
    return entities
      .filter((e) => e.isPlayer)
      .map((e) => ({ 
        x: e.position.x * GRID + GRID / 2, 
        y: e.position.y * GRID + GRID / 2, 
        r: fogRadius 
      }));
  }, [entities, autoRevealAllies, fogRadius]);

  // —— Keyboard shortcuts ——
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") roll(20);
      if (e.key.toLowerCase() === "e") nextTurn();
      if (e.key.toLowerCase() === "m") setSelectedId(activeEntity?.id ?? null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roll, activeEntity]);

  // —— Render helpers ——
  const Title = ({ children }: { children: React.ReactNode }) => (
    <div className="text-yellow-400 font-semibold tracking-wide uppercase text-sm">{children}</div>
  );

  const StatBadge = ({ label, value, color = "bg-neutral-800" }: { label: string; value: React.ReactNode; color?: string }) => (
    <div className={`px-2 py-1 rounded-md text-xs text-white ${color} shadow` }>
      <span className="opacity-70 mr-1">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );

  const ConditionChip = ({ text }: { text: string }) => (
    <span className="px-2 py-1 rounded-full text-xs bg-neutral-800/70 text-white border border-neutral-700">{text}</span>
  );

  // —— Layout ——
  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Top bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="text-yellow-400 font-bold">Shadow Weave • Битва</div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <StatBadge label="Сетка" value={`${GRID}px`} />
            <StatBadge label="Карта" value={`${MAP_W}×${MAP_H}`} />
            <StatBadge label="Раунд" value={combatState.round} />
            {activeEntity && <StatBadge label="Активный" value={activeEntity.name} color="bg-emerald-700" />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-md border text-xs ${isDM ? "border-emerald-400 text-emerald-400" : "border-neutral-700 text-neutral-300"}`}>
            {isDM ? "Режим ДМ" : "Режим игрока"}
          </div>
          <button className="px-3 py-1 rounded-md border border-neutral-700 text-xs" onClick={() => setLeftOpen((v) => !v)}>
            {leftOpen ? "Скрыть инструменты" : "Показать инструменты"}
          </button>
          <button className="px-3 py-1 rounded-md border border-neutral-700 text-xs" onClick={() => setRightOpen((v) => !v)}>
            {rightOpen ? "Скрыть журнал" : "Показать журнал"}
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-3rem)] grid" style={{ gridTemplateColumns: `${leftOpen && isDM ? "280px" : "0px"} 1fr ${rightOpen ? "360px" : "0px"}` }}>
        {/* Left: DM Tools */}
        <div className={`border-r border-neutral-800 bg-neutral-900/50 overflow-y-auto ${leftOpen && isDM ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="p-3 space-y-4">
            <Title>Инструменты ДМ</Title>

            <div className="grid grid-cols-2 gap-2">
              {(["select", "fog-reveal", "fog-hide", "add-npc", "measure"] as DMTool[]).map((tool) => {
                const toolNames = {
                  "select": "Выбор",
                  "fog-reveal": "Открыть туман",
                  "fog-hide": "Скрыть туман",
                  "add-npc": "Добавить NPC",
                  "measure": "Измерить"
                };
                
                return (
                  <button
                    key={tool}
                    onClick={() => setDmTool(tool)}
                    className={`px-2 py-2 rounded-md border text-sm ${dmTool === tool ? "border-emerald-400 text-emerald-400" : "border-neutral-700 text-neutral-300"}`}
                  >
                    {toolNames[tool]}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <Title>Туман войны</Title>
              <div className="flex items-center gap-2">
                <input id="fog" type="checkbox" checked={fogEnabled} onChange={(e) => setFogEnabled(e.target.checked)} />
                <label htmlFor="fog" className="text-sm">Включить</label>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-70 w-24">Прозрачность</span>
                <input type="range" min={0.2} max={0.95} step={0.05} value={fogOpacity} onChange={(e) => setFogOpacity(parseFloat(e.target.value))} className="w-full" />
                <span className="w-12 text-right">{Math.round(fogOpacity * 100)}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-70 w-24">Радиус</span>
                <input type="range" min={60} max={260} step={10} value={fogRadius} onChange={(e) => setFogRadius(parseInt(e.target.value))} className="w-full" />
                <span className="w-12 text-right">{fogRadius}</span>
              </div>
              <div className="flex items-center gap-2">
                <input id="autoAlly" type="checkbox" checked={autoRevealAllies} onChange={(e) => setAutoRevealAllies(e.target.checked)} />
                <label htmlFor="autoAlly" className="text-sm">Автообзор вокруг союзников</label>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-sm" onClick={() => setReveal([])}>Очистить</button>
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-sm" onClick={() => setReveal((r) => r.slice(0, -1))}>Отменить</button>
              </div>
              <div className="text-xs opacity-70">Подсказка: выберите инструмент "Открыть туман" и кликайте по карте.</div>
            </div>

            {/* Map Management */}
            <div className="space-y-2">
              <Title>Управление картой</Title>
              <div className="flex gap-2">
                <label className="px-2 py-1 rounded-md border border-neutral-700 text-xs hover:border-emerald-400 hover:text-emerald-400 cursor-pointer">
                  Загрузить карту
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMapUpload}
                  />
                </label>
                <button 
                  className="px-2 py-1 rounded-md border border-neutral-700 text-xs hover:border-red-400 hover:text-red-400"
                  onClick={clearMap}
                >
                  Очистить
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Title>Спавн монстров</Title>
              <ImportMonstersButton onImportComplete={loadMonsters} />
              {isLoadingMonsters ? (
                <div className="text-xs opacity-70">Загрузка монстров...</div>
              ) : availableMonsters.length === 0 ? (
                <div className="text-xs opacity-70 text-center py-4">
                  Нет монстров в базе.<br />
                  Используйте кнопку выше для загрузки.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {availableMonsters.slice(0, 10).map((monster) => (
                    <button
                      key={monster.slug}
                      className="w-full text-left px-2 py-1.5 rounded-md border border-neutral-700 text-xs hover:border-emerald-400 hover:text-emerald-400"
                      onClick={() => addMonsterToField(monster.slug)}
                    >
                      <div className="font-medium">{monster.name}</div>
                      <div className="opacity-70">УО {monster.cr} • КД {monster.armor_class} • ХП {monster.hit_points}</div>
                    </button>
                  ))}
                  {availableMonsters.length > 10 && (
                    <div className="text-xs opacity-50 text-center py-2">
                      и еще {availableMonsters.length - 10} монстров...
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Title>Измерения (в разработке)</Title>
              <div className="text-xs opacity-70">Выберите инструмент "Измерить", затем кликайте и тяните по карте (скоро).</div>
            </div>
          </div>
        </div>

        {/* Center: Battle View with Map and Fog */}
        <div className="flex-1 relative bg-neutral-900 overflow-hidden">
          {/* 3D Scene Background */}
          <div className="absolute inset-0 z-0">
            <Battle3DScene 
              sessionId={sessionId} 
              className="w-full h-full"
              mapBackground={mapBackground}
            />
          </div>

          {/* 2D Map Canvas with fog overlay */}
          <div 
            ref={mapRef}
            className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none"
            onClick={onMapClick}
          >
            <div className="relative pointer-events-none" style={{ width: MAP_W, height: MAP_H }}>
              {/* Map background if loaded */}
              {mapBackground && (
                <img 
                  src={mapBackground} 
                  alt="Battle Map" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-30"
                />
              )}

              {/* Grid overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" style={{ zIndex: 1 }}>
                {Array.from({ length: Math.ceil(MAP_W / GRID) + 1 }).map((_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * GRID}
                    y1={0}
                    x2={i * GRID}
                    y2={MAP_H}
                    stroke="rgba(156, 163, 175, 0.3)"
                    strokeWidth="1"
                  />
                ))}
                {Array.from({ length: Math.ceil(MAP_H / GRID) + 1 }).map((_, i) => (
                  <line
                    key={`h${i}`}
                    x1={0}
                    y1={i * GRID}
                    x2={MAP_W}
                    y2={i * GRID}
                    stroke="rgba(156, 163, 175, 0.3)"
                    strokeWidth="1"
                  />
                ))}
              </svg>

              {/* Entity tokens */}
              {entities.map((entity) => {
                const x = entity.position.x * GRID;
                const y = entity.position.y * GRID;
                const isActive = entity.id === combatState.activeEntityId;
                const isSelected = selectedId === entity.id;
                
                return (
                  <div
                    key={entity.id}
                    className={`absolute w-16 h-16 rounded-full border-4 pointer-events-auto ${
                      entity.isPlayer 
                        ? isActive ? "border-blue-400 bg-blue-500" : "border-green-400 bg-green-500"
                        : isActive ? "border-orange-400 bg-red-500" : "border-red-400 bg-red-600"
                    } ${isSelected ? "ring-4 ring-yellow-400" : ""} cursor-pointer transition-all duration-200 hover:scale-110`}
                    style={{
                      left: x,
                      top: y,
                      transform: "translate(-50%, -50%)",
                      zIndex: 10
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(entity.id);
                    }}
                    onMouseDown={(e) => {
                      if (!isDM) return;
                      e.stopPropagation();
                      setDragId(entity.id);
                      const rect = mapRef.current?.getBoundingClientRect();
                      if (rect) {
                        dragOffset.current = {
                          x: e.clientX - rect.left - x,
                          y: e.clientY - rect.top - y,
                        };
                      }
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                      {entity.name.slice(0, 2).toUpperCase()}
                    </div>
                    
                    {/* HP indicator */}
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          entity.hp.current / entity.hp.max > 0.5 ? "bg-green-500" :
                          entity.hp.current / entity.hp.max > 0.25 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${(entity.hp.current / entity.hp.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {/* Fog of War */}
              {fogEnabled && dmTool === "fog-reveal" && (
                <div 
                  className="absolute inset-0 pointer-events-auto cursor-crosshair" 
                  style={{ zIndex: 15 }}
                  onClick={(e) => {
                    if (!isDM) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    setReveal((prev) => [...prev, { x, y, r: fogRadius }]);
                  }}
                >
                  <svg className="w-full h-full pointer-events-none">
                    <defs>
                      <mask id="fogMask">
                        <rect width="100%" height="100%" fill="black" />
                        {[...reveal, ...autoHoles].map((hole, i) => (
                          <circle key={i} cx={hole.x} cy={hole.y} r={hole.r} fill="white" />
                        ))}
                      </mask>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="black"
                      opacity={fogOpacity}
                      mask="url(#fogMask)"
                    />
                  </svg>
                </div>
              )}
              
              {/* Static fog display */}
              {fogEnabled && dmTool !== "fog-reveal" && (
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
                  <svg className="w-full h-full">
                    <defs>
                      <mask id="staticFogMask">
                        <rect width="100%" height="100%" fill="black" />
                        {[...reveal, ...autoHoles].map((hole, i) => (
                          <circle key={i} cx={hole.x} cy={hole.y} r={hole.r} fill="white" />
                        ))}
                      </mask>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="black"
                      opacity={fogOpacity}
                      mask="url(#staticFogMask)"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Mini Map */}
          <div className="absolute bottom-4 right-4 z-20 w-48 h-32 bg-neutral-900/90 backdrop-blur rounded-lg border border-neutral-700 overflow-hidden">
            <div className="w-full h-full relative">
              <div className="absolute top-1 left-1 text-xs text-yellow-400 font-semibold">Мини-карта</div>
              
              {/* Mini map content */}
              <div className="absolute inset-2 top-4 bg-neutral-800 rounded overflow-hidden">
                {mapBackground && (
                  <img 
                    src={mapBackground} 
                    alt="Mini Map" 
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
                
                {/* Mini grid */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <line
                        key={`mv${i}`}
                        x1={`${i * 10}%`}
                        y1="0%"
                        x2={`${i * 10}%`}
                        y2="100%"
                        stroke="rgba(156, 163, 175, 0.2)"
                        strokeWidth="1"
                      />
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line
                        key={`mh${i}`}
                        x1="0%"
                        y1={`${i * 12.5}%`}
                        x2="100%"
                        y2={`${i * 12.5}%`}
                        stroke="rgba(156, 163, 175, 0.2)"
                        strokeWidth="1"
                      />
                    ))}
                  </svg>
                </div>
                
                {/* Mini entities */}
                {entities.map((entity) => {
                  const miniX = (entity.position.x / (MAP_W / GRID)) * 100;
                  const miniY = (entity.position.y / (MAP_H / GRID)) * 100;
                  
                  return (
                    <div
                      key={`mini-${entity.id}`}
                      className={`absolute w-2 h-2 rounded-full ${
                        entity.isPlayer ? "bg-green-400" : "bg-red-400"
                      } ${entity.id === combatState.activeEntityId ? "ring-1 ring-white" : ""}`}
                      style={{
                        left: `${miniX}%`,
                        top: `${miniY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  );
                })}
                
                {/* Mini fog circles */}
                {fogEnabled && (
                  <svg className="absolute inset-0 w-full h-full">
                    <defs>
                      <mask id="miniFogMask">
                        <rect width="100%" height="100%" fill="black" />
                        {[...reveal, ...autoHoles].map((hole, i) => {
                          const miniX = (hole.x / MAP_W) * 100;
                          const miniY = (hole.y / MAP_H) * 100;
                          const miniR = (hole.r / Math.max(MAP_W, MAP_H)) * 50;
                          return (
                            <circle 
                              key={i} 
                              cx={`${miniX}%`} 
                              cy={`${miniY}%`} 
                              r={`${miniR}%`} 
                              fill="white" 
                            />
                          );
                        })}
                      </mask>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="black"
                      opacity={fogOpacity * 0.7}
                      mask="url(#miniFogMask)"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Map Management */}
          {isDM && (
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <div className="bg-neutral-900/90 backdrop-blur rounded-lg border border-neutral-700 p-3">
                <Title>Управление картой</Title>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMapUpload}
                      className="hidden"
                    />
                    <span className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                      📂 Загрузить карту
                    </span>
                  </label>
                  <button
                    onClick={clearMap}
                    className="px-3 py-1 rounded-md bg-neutral-600 hover:bg-neutral-700 text-white text-xs"
                  >
                    🗑️ Очистить
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom: Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur px-3 py-2 shadow-2xl">
              <div className="flex items-center gap-2 justify-center flex-wrap">
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400">Движение</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Атака</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Заклинание</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Предмет</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Инвентарь</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" onClick={nextTurn}>Закончить ход</button>
                {/* Dice */}
                <div className="ml-2 flex items-center gap-1 text-xs">
                  <span className="opacity-70">Кости:</span>
                  {[20, 12, 10, 8, 6, 4].map((s) => (
                    <button key={s} className="px-2 py-1 rounded-md border border-neutral-700 hover:border-neutral-400" onClick={() => roll(s)}>к{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Combat Log + Initiative */}
        <div className={`border-l border-neutral-800 bg-neutral-900/50 overflow-y-auto ${rightOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="p-3 space-y-4">
            <Title>Инициатива</Title>
            <div className="space-y-2">
              {initOrder.map((entity, idx) => {
                const isActive = entity.id === combatState.activeEntityId;
                return (
                  <div key={entity.id} className={`flex items-center justify-between rounded-lg border px-2 py-2 ${isActive ? "border-emerald-400 bg-emerald-900/20" : "border-neutral-700 bg-neutral-900/60"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${entity.isPlayer ? "bg-emerald-400" : "bg-rose-400"}`} />
                      <div className="font-medium">{entity.name}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <StatBadge label="Ини" value={entity.initiative || 0} />
                      <StatBadge label="ХП" value={`${entity.hp.current}/${entity.hp.max}`} />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-2">
                <button 
                  className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" 
                  onClick={nextTurn}
                  disabled={!isDM || !canEndTurn()}
                >
                  {isDM ? "Следующий ход" : "Закончить ход"}
                </button>
                <div className="text-emerald-400 text-xs">
                  Активный: {activeEntity?.name ?? "—"}
                </div>
              </div>
            </div>

            <Title>Журнал боя</Title>
            <div className="space-y-2">
              {log.map((e) => (
                <div key={e.id} className="rounded-lg border border-neutral-700 bg-neutral-900/70 p-2 text-sm">
                  <div className="text-xs opacity-60">{e.ts}</div>
                  <div>{e.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}