// Suggested path: /src/components/BattleMapUI.tsx
// Usage: import BattleMapUI from "../components/BattleMapUI"; and render <BattleMapUI /> in your route/page.
// Notes:
// - Single-file prototype of a modern VTT battle map UI (DM tools • Map • Combat Log • Action Bar).
// - No external UI libs required; pure React + Tailwind. (lucide-react optional, not used here.)
// - Uses your color prefs: yellow titles, green for Active, red for danger/inactive.
// - Includes: token drag with grid snap, initiative tracker, dice roller, fog-of-war (SVG mask w/ reveal circles),
//   DM tools panel, action bar, context menu on token click, simple combat log, minimap.
// - Everything is mocked in-memory; replace hooks with your real state later.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Vec2 = { x: number; y: number };

type TokenType = "PC" | "NPC";

type Token = {
  id: string;
  name: string;
  type: TokenType;
  hp: number;
  maxHp: number;
  ac: number;
  speed: number; // feet
  color: string; // tailwind bg-* color class
  position: Vec2; // pixels inside map space
  initiative: number;
  conditions: string[];
};

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

const defaultTokens: Token[] = [
  {
    id: uid("pc"),
    name: "Arannis",
    type: "PC",
    hp: 27,
    maxHp: 27,
    ac: 15,
    speed: 30,
    color: "bg-emerald-500",
    position: { x: GRID * 3, y: GRID * 5 },
    initiative: 14,
    conditions: [],
  },
  {
    id: uid("pc"),
    name: "Lyra",
    type: "PC",
    hp: 22,
    maxHp: 22,
    ac: 13,
    speed: 30,
    color: "bg-sky-500",
    position: { x: GRID * 4, y: GRID * 5 },
    initiative: 18,
    conditions: ["Blessed"],
  },
  {
    id: uid("npc"),
    name: "Goblin A",
    type: "NPC",
    hp: 7,
    maxHp: 7,
    ac: 13,
    speed: 30,
    color: "bg-rose-500",
    position: { x: GRID * 10, y: GRID * 5 },
    initiative: 12,
    conditions: [],
  },
  {
    id: uid("npc"),
    name: "Goblin B",
    type: "NPC",
    hp: 7,
    maxHp: 7,
    ac: 13,
    speed: 30,
    color: "bg-rose-600",
    position: { x: GRID * 11, y: GRID * 6 },
    initiative: 9,
    conditions: [],
  },
];

export default function BattleMapUI() {
  // —— Mode & panels ——
  const [isDM, setIsDM] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // —— Tokens & selection ——
  const [tokens, setTokens] = useState<Token[]>(defaultTokens);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // —— Initiative ——
  const initOrder = useMemo(
    () => [...tokens].sort((a, b) => b.initiative - a.initiative),
    [tokens]
  );
  const [turnIndex, setTurnIndex] = useState(0);
  const activeToken = initOrder[turnIndex % initOrder.length];

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
    { id: uid("log"), ts: now(), text: "Combat started. Roll initiative!" },
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

  // —— Helpers ——
  const snap = (v: number) => Math.round(v / GRID) * GRID;

  const updateToken = (id: string, patch: Partial<Token>) => {
    setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const addNPC = () => {
    const id = uid("npc");
    const t: Token = {
      id,
      name: `Goblin ${id.slice(-3)}`,
      type: "NPC",
      hp: 7,
      maxHp: 7,
      ac: 13,
      speed: 30,
      color: "bg-rose-500",
      position: { x: snap(MAP_W / 2), y: snap(MAP_H / 2) },
      initiative: Math.floor(Math.random() * 20) + 1,
      conditions: [],
    };
    setTokens((prev) => [...prev, t]);
    setLog((l) => [{ id: uid("log"), ts: now(), text: `DM added ${t.name}` }, ...l]);
  };

  const removeToken = (id: string) => {
    const tok = tokens.find((t) => t.id === id);
    setTokens((prev) => prev.filter((t) => t.id !== id));
    if (tok) setLog((l) => [{ id: uid("log"), ts: now(), text: `Removed ${tok.name}` }, ...l]);
    if (selectedId === id) setSelectedId(null);
  };

  const damageToken = (id: string, dmg: number) => {
    const tok = tokens.find((t) => t.id === id);
    if (!tok) return;
    const hp = Math.max(0, tok.hp - dmg);
    updateToken(id, { hp });
    setLog((l) => [{ id: uid("log"), ts: now(), text: `${tok.name} takes ${dmg} dmg (${hp}/${tok.maxHp})` }, ...l]);
  };

  const healToken = (id: string, amt: number) => {
    const tok = tokens.find((t) => t.id === id);
    if (!tok) return;
    const hp = Math.min(tok.maxHp, tok.hp + amt);
    updateToken(id, { hp });
    setLog((l) => [{ id: uid("log"), ts: now(), text: `${tok.name} heals ${amt} (${hp}/${tok.maxHp})` }, ...l]);
  };

  const nextTurn = () => {
    setTurnIndex((i) => (i + 1) % initOrder.length);
  };

  // —— Drag logic ——
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragId) return;
      const map = mapRef.current;
      if (!map) return;
      const rect = map.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.current.x;
      const y = e.clientY - rect.top - dragOffset.current.y;
      const clampedX = Math.max(0, Math.min(MAP_W - GRID, x));
      const clampedY = Math.max(0, Math.min(MAP_H - GRID, y));
      updateToken(dragId, { position: { x: snap(clampedX), y: snap(clampedY) } });
    };
    const onUp = () => setDragId(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragId]);

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
    return tokens
      .filter((t) => t.type === "PC")
      .map((t) => ({ x: t.position.x + GRID / 2, y: t.position.y + GRID / 2, r: fogRadius }));
  }, [tokens, autoRevealAllies, fogRadius]);

  // —— Keyboard shortcuts ——
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") roll(20);
      if (e.key.toLowerCase() === "e") nextTurn();
      if (e.key.toLowerCase() === "m") setSelectedId(activeToken?.id ?? null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [roll, activeToken]);

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
          <div className="text-yellow-400 font-bold">Shadow Weave • Battle</div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <StatBadge label="Grid" value={`${GRID}px`} />
            <StatBadge label="Map" value={`${MAP_W}×${MAP_H}`} />
            {activeToken && <StatBadge label="Active" value={activeToken.name} color="bg-emerald-700" />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded-md border text-xs ${isDM ? "border-emerald-400 text-emerald-400" : "border-neutral-700 text-neutral-300"}`}
            onClick={() => setIsDM((v) => !v)}
            title="Toggle DM/Player"
          >
            {isDM ? "DM Mode" : "Player Mode"}
          </button>
          <button className="px-3 py-1 rounded-md border border-neutral-700 text-xs" onClick={() => setLeftOpen((v) => !v)}>
            {leftOpen ? "Hide Tools" : "Show Tools"}
          </button>
          <button className="px-3 py-1 rounded-md border border-neutral-700 text-xs" onClick={() => setRightOpen((v) => !v)}>
            {rightOpen ? "Hide Log" : "Show Log"}
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-3rem)] grid" style={{ gridTemplateColumns: `${leftOpen && isDM ? "280px" : "0px"} 1fr ${rightOpen ? "360px" : "0px"}` }}>
        {/* Left: DM Tools */}
        <div className={`border-r border-neutral-800 bg-neutral-900/50 overflow-y-auto ${leftOpen && isDM ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="p-3 space-y-4">
            <Title>DM Tools</Title>

            <div className="grid grid-cols-2 gap-2">
              {(["select", "fog-reveal", "fog-hide", "add-npc", "measure"] as DMTool[]).map((tool) => (
                <button
                  key={tool}
                  onClick={() => setDmTool(tool)}
                  className={`px-2 py-2 rounded-md border text-sm ${dmTool === tool ? "border-emerald-400 text-emerald-400" : "border-neutral-700 text-neutral-300"}`}
                >
                  {tool}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Title>Fog of War</Title>
              <div className="flex items-center gap-2">
                <input id="fog" type="checkbox" checked={fogEnabled} onChange={(e) => setFogEnabled(e.target.checked)} />
                <label htmlFor="fog" className="text-sm">Enable</label>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-70 w-24">Opacity</span>
                <input type="range" min={0.2} max={0.95} step={0.05} value={fogOpacity} onChange={(e) => setFogOpacity(parseFloat(e.target.value))} className="w-full" />
                <span className="w-12 text-right">{Math.round(fogOpacity * 100)}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-70 w-24">Radius</span>
                <input type="range" min={60} max={260} step={10} value={fogRadius} onChange={(e) => setFogRadius(parseInt(e.target.value))} className="w-full" />
                <span className="w-12 text-right">{fogRadius}</span>
              </div>
              <div className="flex items-center gap-2">
                <input id="autoAlly" type="checkbox" checked={autoRevealAllies} onChange={(e) => setAutoRevealAllies(e.target.checked)} />
                <label htmlFor="autoAlly" className="text-sm">Auto reveal around allies</label>
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-sm" onClick={() => setReveal([])}>Clear draws</button>
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-sm" onClick={() => setReveal((r) => r.slice(0, -1))}>Undo</button>
              </div>
              <div className="text-xs opacity-70">Tip: with "fog-reveal" tool active, click on map to punch a hole.</div>
            </div>

            <div className="space-y-2">
              <Title>Spawner</Title>
              <button className="px-3 py-2 rounded-md border border-neutral-700 text-sm hover:border-emerald-400 hover:text-emerald-400" onClick={addNPC}>Add Goblin</button>
            </div>

            <div className="space-y-2">
              <Title>Measure (WIP)</Title>
              <div className="text-xs opacity-70">Select tool "measure" then click & drag on the map (coming soon).</div>
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

                {/* Tokens */}
                {tokens.map((t) => (
                  <div
                    key={t.id}
                    style={{ left: t.position.x, top: t.position.y, width: GRID, height: GRID }}
                    className={`absolute rounded-lg cursor-grab active:cursor-grabbing border ${selectedId === t.id ? "border-yellow-400" : "border-neutral-700"}`}
                    onMouseDown={(e) => {
                      if (!mapRef.current) return;
                      const rect = mapRef.current.getBoundingClientRect();
                      dragOffset.current = { x: e.clientX - rect.left - t.position.x, y: e.clientY - rect.top - t.position.y };
                      setDragId(t.id);
                      setSelectedId(t.id);
                    }}
                    onDoubleClick={() => setSelectedId(t.id)}
                    title={`${t.name} (${t.hp}/${t.maxHp})`}
                  >
                    {/* Token body */}
                    <div className={`w-full h-full ${t.color} bg-opacity-90 flex items-center justify-center text-xs font-semibold text-white select-none`}>{t.name}</div>
                    {/* HP bar */}
                    <div className="absolute -bottom-1 left-0 right-0 h-2 bg-neutral-900/70 rounded-b-lg overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(t.hp / t.maxHp) * 100}%` }} />
                    </div>
                  </div>
                ))}

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
                  <div className="text-[10px] text-yellow-400 mb-1">Minimap</div>
                  <div className="relative w-full h-[calc(100%-14px)] bg-neutral-800 rounded">
                    {tokens.map((t) => (
                      <div
                        key={`mini_${t.id}`}
                        className={`absolute w-1.5 h-1.5 ${t.type === "PC" ? "bg-emerald-400" : "bg-rose-400"} rounded-full`}
                        style={{ left: `${(t.position.x / MAP_W) * 100}%`, top: `${(t.position.y / MAP_H) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Token context (quick panel) */}
                {selectedId && (
                  (() => {
                    const t = tokens.find((x) => x.id === selectedId)!;
                    const left = Math.min(MAP_W - 260, Math.max(0, t.position.x + GRID + 8));
                    const top = Math.min(MAP_H - 170, Math.max(0, t.position.y - 8));
                    return (
                      <div className="absolute z-10" style={{ left, top }}>
                        <div className="w-64 rounded-xl border border-neutral-700 bg-neutral-900/95 backdrop-blur p-3 space-y-2 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{t.name}</div>
                            <button className="text-neutral-400 hover:text-white" onClick={() => setSelectedId(null)}>✕</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatBadge label="HP" value={`${t.hp}/${t.maxHp}`} color="bg-neutral-800" />
                            <StatBadge label="AC" value={t.ac} color="bg-neutral-800" />
                            <StatBadge label="Init" value={t.initiative} color="bg-neutral-800" />
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <button className="px-2 py-1 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" onClick={() => healToken(t.id, Math.ceil(t.maxHp * 0.25))}>Heal 25%</button>
                            <button className="px-2 py-1 rounded-md border border-neutral-700 hover:border-rose-400 hover:text-rose-400" onClick={() => damageToken(t.id, Math.ceil(t.maxHp * 0.25))}>Damage 25%</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(t.conditions.length ? t.conditions : ["No Conditions"]).map((c, i) => (
                              <ConditionChip key={i} text={c} />
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <button className="px-2 py-1 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400" onClick={() => setLog((l) => [{ id: uid("log"), ts: now(), text: `${t.name} attacks!` }, ...l])}>Attack</button>
                            <button className="px-2 py-1 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400" onClick={() => setLog((l) => [{ id: uid("log"), ts: now(), text: `${t.name} casts a spell!` }, ...l])}>Cast</button>
                            <button className="px-2 py-1 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400" onClick={() => setLog((l) => [{ id: uid("log"), ts: now(), text: `${t.name} uses an item.` }, ...l])}>Use Item</button>
                            {isDM && (
                              <button className="ml-auto px-2 py-1 rounded-md border border-neutral-700 hover:border-rose-400 hover:text-rose-400" onClick={() => removeToken(t.id)}>Delete</button>
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
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400">Move</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Attack</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Cast Spell</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Use Item</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400">Inventory</button>
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" onClick={nextTurn}>End Turn</button>
                {/* Dice */}
                <div className="ml-2 flex items-center gap-1 text-xs">
                  <span className="opacity-70">Dice:</span>
                  {[20, 12, 10, 8, 6, 4].map((s) => (
                    <button key={s} className="px-2 py-1 rounded-md border border-neutral-700 hover:border-neutral-400" onClick={() => roll(s)}>d{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Combat Log + Initiative */}
        <div className={`border-l border-neutral-800 bg-neutral-900/50 overflow-y-auto ${rightOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="p-3 space-y-4">
            <Title>Initiative</Title>
            <div className="space-y-2">
              {initOrder.map((t, idx) => (
                <div key={t.id} className={`flex items-center justify-between rounded-lg border px-2 py-2 ${idx === (turnIndex % initOrder.length) ? "border-emerald-400 bg-emerald-900/20" : "border-neutral-700 bg-neutral-900/60"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${t.type === "PC" ? "bg-emerald-400" : "bg-rose-400"}`} />
                    <div className="font-medium">{t.name}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <StatBadge label="Init" value={t.initiative} />
                    <StatBadge label="HP" value={`${t.hp}/${t.maxHp}`} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" onClick={nextTurn}>Next Turn</button>
                <div className="text-emerald-400 text-xs">Active: {activeToken?.name ?? "—"}</div>
              </div>
            </div>

            <Title>Combat Log</Title>
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