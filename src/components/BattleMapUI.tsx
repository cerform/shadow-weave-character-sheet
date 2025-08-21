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
  const sessionId = 'demo-session'; // TODO: get from props/context
  
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
  useEffect(() => {  
    const loadMonsters = async () => {
      setIsLoadingMonsters(true);
      try {
        const { data, error } = await supabase
          .from('srd_creatures')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setAvailableMonsters(data || []);
      } catch (error) {
        console.error('Failed to load monsters:', error);
      } finally {
        setIsLoadingMonsters(false);
      }
    };
    
    loadMonsters();
  }, []);

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

            <div className="space-y-2">
              <Title>Спавн монстров</Title>
              {isLoadingMonsters ? (
                <div className="text-xs opacity-70">Загрузка монстров...</div>
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
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Title>Измерения (в разработке)</Title>
              <div className="text-xs opacity-70">Выберите инструмент "Измерить", затем кликайте и тяните по карте (скоро).</div>
            </div>
          </div>
        </div>

        {/* Center: Map & Action Bar */}
        <div className="relative bg-neutral-900">
          {/* Map canvas */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center p-4">
              <div
                ref={mapRef}
                className="relative rounded-xl shadow-xl bg-neutral-800 overflow-hidden"
                style={{ width: MAP_W, height: MAP_H }}
                onClick={onMapClick}
              >
                {/* Map background placeholder */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.5))]" />

                {/* Grid overlay */}
                <svg className="absolute inset-0" width={MAP_W} height={MAP_H}>
                  {/* vertical lines */}
                  {Array.from({ length: Math.floor(MAP_W / GRID) + 1 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * GRID} y1={0} x2={i * GRID} y2={MAP_H} stroke="rgba(255,255,255,0.08)" />
                  ))}
                  {/* horizontal lines */}
                  {Array.from({ length: Math.floor(MAP_H / GRID) + 1 }).map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * GRID} x2={MAP_W} y2={i * GRID} stroke="rgba(255,255,255,0.08)" />
                  ))}
                </svg>

                {/* Battle Entities */}
                {entities.map((entity) => {
                  const pixelX = entity.position.x * GRID;
                  const pixelY = entity.position.y * GRID;
                  const color = entity.isPlayer ? "bg-emerald-500" : "bg-rose-500";
                  
                  return (
                    <div
                      key={entity.id}
                      style={{ left: pixelX, top: pixelY, width: GRID, height: GRID }}
                      className={`absolute rounded-lg cursor-grab active:cursor-grabbing border ${selectedId === entity.id ? "border-yellow-400" : "border-neutral-700"}`}
                      onMouseDown={(e) => {
                        if (!mapRef.current || !isDM) return;
                        const rect = mapRef.current.getBoundingClientRect();
                        dragOffset.current = { x: e.clientX - rect.left - pixelX, y: e.clientY - rect.top - pixelY };
                        setDragId(entity.id);
                        setSelectedId(entity.id);
                      }}
                      onDoubleClick={() => setSelectedId(entity.id)}
                      title={`${entity.name} (${entity.hp.current}/${entity.hp.max})`}
                    >
                      {/* Entity body */}
                      <div className={`w-full h-full ${color} bg-opacity-90 flex items-center justify-center text-xs font-semibold text-white select-none overflow-hidden`}>
                        {entity.name.slice(0, 8)}
                      </div>
                      {/* HP bar */}
                      <div className="absolute -bottom-1 left-0 right-0 h-2 bg-neutral-900/70 rounded-b-lg overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(entity.hp.current / entity.hp.max) * 100}%` }} />
                      </div>
                      {/* Active indicator */}
                      {entity.id === combatState.activeEntityId && (
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  );
                })}

                {/* Fog of war (SVG mask with holes) */}
                {fogEnabled && (
                  <svg className="absolute inset-0 pointer-events-none" width={MAP_W} height={MAP_H}>
                    <defs>
                      <mask id="fogMask">
                        <rect width="100%" height="100%" fill="white" />
                        {[...reveal, ...autoHoles].map((c, i) => (
                          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="black" />
                        ))}
                      </mask>
                    </defs>
                    <rect width="100%" height="100%" fill={`rgba(0,0,0,${fogOpacity})`} mask="url(#fogMask)" />
                  </svg>
                )}

                {/* Minimap */}
                <div className="absolute top-3 left-3 w-48 h-28 bg-neutral-900/70 border border-neutral-700 rounded-lg p-1">
                  <div className="text-[10px] text-yellow-400 mb-1">Мини-карта</div>
                  <div className="relative w-full h-[calc(100%-14px)] bg-neutral-800 rounded">
                    {entities.map((entity) => (
                      <div
                        key={`mini_${entity.id}`}
                        className={`absolute w-1.5 h-1.5 ${entity.isPlayer ? "bg-emerald-400" : "bg-rose-400"} rounded-full`}
                        style={{ 
                          left: `${(entity.position.x * GRID / MAP_W) * 100}%`, 
                          top: `${(entity.position.y * GRID / MAP_H) * 100}%` 
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Entity context (quick panel) */}
                {selectedId && (
                  (() => {
                    const entity = entities.find((e) => e.id === selectedId);
                    if (!entity) return null;
                    
                    const pixelX = entity.position.x * GRID;
                    const pixelY = entity.position.y * GRID;
                    const left = Math.min(MAP_W - 260, Math.max(0, pixelX + GRID + 8));
                    const top = Math.min(MAP_H - 170, Math.max(0, pixelY - 8));
                    
                    return (
                      <div className="absolute z-10" style={{ left, top }}>
                        <div className="w-64 rounded-xl border border-neutral-700 bg-neutral-900/95 backdrop-blur p-3 space-y-2 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{entity.name}</div>
                            <button className="text-neutral-400 hover:text-white" onClick={() => setSelectedId(null)}>✕</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatBadge label="ХП" value={`${entity.hp.current}/${entity.hp.max}`} color="bg-neutral-800" />
                            <StatBadge label="КД" value={entity.ac} color="bg-neutral-800" />
                            <StatBadge label="Скорость" value={`${entity.movement.base}фт`} color="bg-neutral-800" />
                          </div>
                          {isDM && (
                            <div className="flex items-center gap-2 text-sm">
                              <button 
                                className="px-2 py-1 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" 
                                onClick={() => healEntity(entity.id, Math.ceil(entity.hp.max * 0.25))}
                              >
                                Лечить 25%
                              </button>
                              <button 
                                className="px-2 py-1 rounded-md border border-neutral-700 hover:border-rose-400 hover:text-rose-400" 
                                onClick={() => damageEntity(entity.id, Math.ceil(entity.hp.max * 0.25))}
                              >
                                Урон 25%
                              </button>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {(entity.conditions.length ? entity.conditions.map(c => c.key) : ["Нет эффектов"]).map((c, i) => (
                              <ConditionChip key={i} text={c} />
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <button 
                              className="px-2 py-1 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400" 
                              onClick={() => setLog((l) => [{ id: uid("log"), ts: now(), text: `${entity.name} атакует!` }, ...l])}
                            >
                              Атака
                            </button>
                            <button 
                              className="px-2 py-1 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400" 
                              onClick={() => setLog((l) => [{ id: uid("log"), ts: now(), text: `${entity.name} колдует!` }, ...l])}
                            >
                              Заклинание
                            </button>
                            <button 
                              className="px-2 py-1 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400" 
                              onClick={() => setLog((l) => [{ id: uid("log"), ts: now(), text: `${entity.name} использует предмет.` }, ...l])}
                            >
                              Предмет
                            </button>
                            {isDM && (
                              <button 
                                className="ml-auto px-2 py-1 rounded-md border border-neutral-700 hover:border-rose-400 hover:text-rose-400" 
                                onClick={() => removeEntity(entity.id)}
                              >
                                Удалить
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>

          {/* Bottom: Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
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