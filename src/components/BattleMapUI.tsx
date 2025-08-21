// Suggested path: /src/components/BattleMapUI.tsx
// Usage: import BattleMapUI from "../components/BattleMapUI"; and render <BattleMapUI /> in your route/page.
// -----------------------------------------------------------------------------
// ✅ Fix summary (for the "Script error" crash) + new features:
// 1) Надёжная загрузка <model-viewer> (type="module" + legacy) → без падений.
// 2) Валидация modelUrl (.glb/.gltf) и откат к 2D при ошибках.
// 3) TS‑типы для <model-viewer>.
// 4) Диагностика с тестами.
// 5) Новое: АВТОПРИВЯЗКА 3D‑моделей к монстрам через реестр правил (локальный
//    и/или внешний /data/model-registry.json), + спавн монстра кликом по карте:
//    выбери монстра → инструмент «Добавить NPC» → клик на карту.
// -----------------------------------------------------------------------------
// Feature recap:
// - Русский интерфейс; тёмный общий стиль (жёлтые заголовки / зелёный active / красный danger)
// - Загрузка карт: input + drag&drop (objectURL)
// - Бестиарий: API (или локальный fallback) + автопривязка 3D из реестра
// - 3D через <model-viewer>, безопасно, с логами и откатом на 2D
// - Спавн монстров: кликом по карте в режиме «Добавить NPC»

import React, { useEffect, useMemo, useRef, useState } from "react";

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

type BestiaryItem = {
  name: string;
  type: TokenType;
  hp: number; maxHp: number; ac: number; speed: number;
  color: string;
  conditions: string[];
  modelUrl?: string;
  modelScale?: number;
  [key: string]: any; // допускаем поля от внешнего API
};

type TestResult = { name: string; status: "pass" | "fail" | "skip"; info?: string };

// ==================== Константы ====================

const GRID = 64;
const MAP_W = 1600;
const MAP_H = 900;

// Твой бэкенд (если проксируешь 5e API) — оставь как есть
const API_BASE = "/api";
const BESTIARY_ENDPOINT = `${API_BASE}/bestiary`;

// Внешний реестр моделей (опционально). Формат файла:
// [ { "match": "^Aboleth$", "url": "https://.../aboleth.glb", "scale": 1 } ]
const MODEL_REGISTRY_URL = "/data/model-registry.json"; // положи файл в /public/data

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

// ==================== Локальные fallbacks ====================

const localBestiary: BestiaryItem[] = [
  { name: "Гоблин", type: "NPC", hp: 7, maxHp: 7, ac: 13, speed: 30, color: "bg-rose-500", conditions: [], modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf", modelScale: 0.02 },
  { name: "Орк",    type: "NPC", hp: 15, maxHp: 15, ac: 13, speed: 30, color: "bg-red-600",  conditions: [] },
  { name: "Скелет", type: "NPC", hp: 13, maxHp: 13, ac: 13, speed: 30, color: "bg-gray-500", conditions: [] },
];

// Мини‑реестр моделей по шаблонам (regex). Рекомендуется расширять через JSON.
const LOCAL_MODEL_REGISTRY: Array<{ match: RegExp; url: string; scale?: number }> = [
  { match: /^aboleth$/i,           url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb", scale: 5 },
  { match: /dragon/i,              url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",   scale: 18 },
  { match: /goblin/i,              url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF/Fox.gltf",                                   scale: 0.02 },
  { match: /skeleton|undead/i,     url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb", scale: 3 },
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

function pickModelFor(name: string, registry: Array<{ match: RegExp; url: string; scale?: number }>): { url?: string; scale?: number } {
  const n = norm(name);
  for (const r of registry) { if (r.match.test(n)) return { url: r.url, scale: r.scale }; }
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
    return <div className={`w-full h-full ${token.color} bg-opacity-90 flex items-center justify-center text-[11px] font-semibold text-white select-none`}>{token.name}</div>;
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
  // Режим и панели
  const [isDM, setIsDM] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

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

  // Журнал и кубы
  const [log, setLog] = useState<LogEntry[]>([{ id: uid("log"), ts: now(), text: "Бой начался. Бросьте инициативу!" }]);
  const roll = (sides: number) => { const value = 1 + Math.floor(Math.random()*sides); setLog((l)=>[{ id: uid("log"), ts: now(), text: `🎲 d${sides} → ${value}` }, ...l]); };
  const nextTurn = () => setTurnIndex((i) => (initOrder.length ? (i + 1) % initOrder.length : 0));

  // Инструменты Мастера
  type DMTool = "select" | "fog-reveal" | "fog-hide" | "add-npc" | "measure";
  const [dmTool, setDmTool] = useState<DMTool>("select");

  // Бестиарий + реестр моделей
  const [bestiary, setBestiary] = useState<BestiaryItem[]>(localBestiary);
  const [useApi, setUseApi] = useState(true);
  const [modelRegistry, setModelRegistry] = useState<Array<{ match: RegExp; url: string; scale?: number }>>(LOCAL_MODEL_REGISTRY);

  useEffect(() => {
    if (!useApi) return;
    (async () => {
      try {
        const res = await fetch(BESTIARY_ENDPOINT);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (Array.isArray(data) && data.length) setBestiary(data);
      } catch (e) {
        setLog((l) => [{ id: uid("log"), ts: now(), text: "Не удалось загрузить бестиарий из API. Использую локальный." }, ...l]);
        setBestiary(localBestiary);
      }
    })();
  }, [useApi]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(MODEL_REGISTRY_URL, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json)) {
          const rules = json.filter((r: any)=>r && r.match && r.url).map((r: any)=>({ match: new RegExp(r.match, "i"), url: String(r.url), scale: r.scale?Number(r.scale):undefined }));
          if (rules.length) setModelRegistry(rules);
        }
      } catch {/* ignore */}
    })();
  }, []);

  // Автопривязка 3D к монстрам при обновлении реестра
  useEffect(() => {
    setBestiary((prev) => prev.map((m) => {
      if (m.modelUrl && isValidModelUrl(m.modelUrl)) return m;
      const mk = pickModelFor(m.name, modelRegistry);
      return mk.url ? { ...m, modelUrl: mk.url, modelScale: mk.scale ?? m.modelScale } : m;
    }));
  }, [modelRegistry]);

  // 3D загрузчик
  const [use3D, setUse3D] = useState(true);
  const { ready: modelReady, error: modelErr, status: modelStatus } = useModelViewerLoader(use3D);
  const [brokenModels, setBrokenModels] = useState<Record<string, string>>({});
  const handleModelError = (id: string, msg: string) => { setBrokenModels(s=>({ ...s, [id]: msg })); const tok = tokens.find(t=>t.id===id); if (tok) setLog((l)=>[{ id: uid("log"), ts: now(), text: `Модель ${tok.name}: ${msg}. Переход на 2D.` }, ...l]); };

  // Спавн монстров кликом по карте
  const [pendingSpawn, setPendingSpawn] = useState<string | null>(null); // имя монстра для клика
  const addMonsterAt = (name: string, pos: Vec2) => {
    const base = bestiary.find((m) => m.name === name);
    if (!base) return;
    const tok: Token = { id: uid("npc"), name: base.name, type: base.type, hp: base.hp, maxHp: base.maxHp, ac: base.ac, speed: base.speed, color: base.color, conditions: base.conditions ?? [], position: { x: snap(pos.x), y: snap(pos.y) }, initiative: Math.floor(Math.random()*20)+1, modelUrl: base.modelUrl, modelScale: base.modelScale ?? 1 };
    setTokens((prev)=>[...prev, tok]);
    setLog((l)=>[{ id: uid("log"), ts: now(), text: `ДМ создал ${base.name}${isValidModelUrl(tok.modelUrl)?" (3D)":" (2D)"}` }, ...l]);
  };
  const selectMonsterForSpawn = (name: string) => { setPendingSpawn(name); setDmTool("add-npc"); };

  // Клик по карте — туман / спавн
  const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    if (isDM && dmTool === "add-npc" && pendingSpawn) { addMonsterAt(pendingSpawn, { x, y }); setPendingSpawn(null); return; }
    if (!isDM || dmTool !== "fog-reveal") return;
    setReveal((prev) => [...prev, { x, y, r: fogRadius }]);
  };

  // ==================== Рендер ====================

  const Title = ({ children }: { children: React.ReactNode }) => (<div className="text-yellow-400 font-semibold tracking-wide uppercase text-xs">{children}</div>);
  const StatBadge = ({ label, value }: { label: string; value: React.ReactNode }) => (<div className="px-2 py-0.5 rounded-md text-[11px] text-white bg-neutral-800 border border-neutral-700"><span className="opacity-70 mr-1">{label}</span><span className="font-semibold">{value}</span></div>);

  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Верхняя панель */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="text-yellow-400 font-bold">Боевая карта</div>
          {activeToken && <StatBadge label="Активный" value={activeToken.name} />}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-1"><input type="checkbox" checked={isDM} onChange={(e)=>setIsDM(e.target.checked)} /> Режим Мастера</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={useApi} onChange={(e)=>setUseApi(e.target.checked)} /> Бестиарий из API</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={use3D} onChange={(e)=>setUse3D(e.target.checked)} /> 3D модели</label>
          <span className="px-2 py-0.5 rounded-md border border-neutral-700">3D: {modelStatus === "loading" && "загрузка…"}{modelStatus === "ready" && "готово"}{modelStatus === "error" && (modelErr || "ошибка")}{modelStatus === "idle" && "выкл."}</span>
          <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) setMapImage(URL.createObjectURL(f)); }} />
        </div>
      </div>

      <div className="h-[calc(100vh-3rem)] grid" style={{ gridTemplateColumns: `${leftOpen && isDM ? "280px" : "0px"} 1fr ${rightOpen ? "360px" : "0px"}` }}>
        {/* Левая панель */}
        <div className={`border-r border-neutral-800 bg-neutral-900/60 overflow-y-auto ${leftOpen && isDM ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="p-3 space-y-4">
            <Title>Инструменты</Title>
            <div className="grid grid-cols-2 gap-2">
              {(["select","fog-reveal","fog-hide","add-npc","measure"] as const).map((tool)=>(
                <button key={tool} onClick={()=>setDmTool(tool)} className={`px-2 py-2 rounded-md border text-sm ${dmTool===tool?"border-emerald-400 text-emerald-400":"border-neutral-700 text-neutral-300"}`}>
                  {tool === "select" && "Выбор"}
                  {tool === "fog-reveal" && "Открыть туман"}
                  {tool === "fog-hide" && "Скрыть туман"}
                  {tool === "add-npc" && "Добавить NPC"}
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
              <div className="flex gap-2"><button className="px-2 py-1 rounded-md border border-neutral-700 text-sm" onClick={()=>setReveal([])}>Очистить</button><button className="px-2 py-1 rounded-md border border-neutral-700 text-sm" onClick={()=>setReveal(r=>r.slice(0,-1))}>Отменить</button></div>
              <div className="text-xs opacity-70">Подсказка: «Добавить NPC» + клик по карте — спавн монстра.</div>
            </div>

            <div className="space-y-2">
              <Title>Бестиарий</Title>
              <div className="text-xs opacity-70">Выберите монстра → инструмент «Добавить NPC» → кликните на карте, куда поставить.</div>
              <div className="grid grid-cols-1 gap-1 max-h-56 overflow-y-auto pr-1">
                {bestiary.map((m) => (
                  <button key={m.name} onClick={()=>selectMonsterForSpawn(m.name)} className={`flex items-center justify-between px-2 py-1 rounded-md border text-sm ${pendingSpawn===m.name?"border-emerald-400 text-emerald-400":"border-neutral-700 text-neutral-200"}`} title={`AC ${m.ac} • HP ${m.hp} • ${m.speed}ft`}>
                    <span className="truncate">{m.name}</span>
                    <span className="ml-2 inline-flex items-center gap-1 text-xs opacity-80">{isValidModelUrl(m.modelUrl)?<span className="px-1 rounded bg-neutral-800 border border-neutral-700">3D</span>:<span className="px-1 rounded bg-neutral-800 border border-neutral-800">2D</span>}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Диагностика и тесты */}
            <div className="space-y-2">
              <Title>Диагностика</Title>
              <ul className="text-xs list-disc ml-5 space-y-1">
                <li>custom element model-viewer → {modelReady?"OK":modelStatus==="error"?"Ошибка":"Ожидание"}</li>
                <li>валидность URL 3D в бестиарии → {bestiary.filter(b=>b.modelUrl).every(b=>isValidModelUrl(b.modelUrl))?"OK":"Есть некорректные"}</li>
                <li>ожидается спавн → {pendingSpawn ?? "—"}</li>
              </ul>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-xs" onClick={()=>{ const sample: BestiaryItem = { name: "Adult Black Dragon", type: "NPC", hp: 100, maxHp: 100, ac: 19, speed: 40, color: "bg-emerald-700", conditions: [] }; const mk = pickModelFor(sample.name, modelRegistry); setLog((l)=>[{ id: uid("log"), ts: now(), text: `Тест автопривязки для "${sample.name}": ${mk.url?"нашёл 3D":"нет 3D"}` }, ...l]); }}>Проверить автопривязку</button>
                <button className="px-2 py-1 rounded-md border border-neutral-700 text-xs" onClick={()=>{ if (bestiary[0]) addMonsterAt(bestiary[0].name, { x: MAP_W/2, y: MAP_H/2 }); }}>Тестовый спавн</button>
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
                <svg className="absolute inset-0" width={MAP_W} height={MAP_H}>
                  {Array.from({ length: Math.floor(MAP_W / GRID) + 1 }).map((_, i) => (<line key={`v${i}`} x1={i * GRID} y1={0} x2={i * GRID} y2={MAP_H} stroke="rgba(255,255,255,0.08)" />))}
                  {Array.from({ length: Math.floor(MAP_H / GRID) + 1 }).map((_, i) => (<line key={`h${i}`} x1={0} y1={i * GRID} x2={MAP_W} y2={i * GRID} stroke="rgba(255,255,255,0.08)" />))}
                </svg>

                {/* Токены */}
                {tokens.map((t) => (
                  <div key={t.id} style={{ left: t.position.x, top: t.position.y, width: GRID, height: GRID }} className={`absolute rounded-lg border ${selectedId === t.id ? "border-yellow-400" : "border-neutral-700"}`} onMouseDown={(e)=>{ if (!mapRef.current) return; const rect = mapRef.current.getBoundingClientRect(); dragOffset.current = { x: e.clientX - rect.left - t.position.x, y: e.clientY - rect.top - t.position.y }; setDragId(t.id); setSelectedId(t.id); }} title={`${t.name} (${t.hp}/${t.maxHp})`}>
                    <TokenVisual token={t} use3D={use3D} modelReady={modelReady && !brokenModels[t.id]} onModelError={handleModelError} />
                    <div className="absolute -bottom-1 left-0 right-0 h-2 bg-neutral-900/70 rounded-b-lg overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(t.hp / t.maxHp) * 100}%` }} /></div>
                  </div>
                ))}

                {/* Туман войны */}
                {fogEnabled && (
                  <svg className="absolute inset-0 pointer-events-none" width={MAP_W} height={MAP_H}>
                    <defs><mask id="fogMask"><rect width="100%" height="100%" fill="white" />{[...reveal, ...(autoRevealAllies?tokens.filter(t=>t.type==="PC").map(t=>({x:t.position.x+GRID/2,y:t.position.y+GRID/2,r:fogRadius})):[])].map((c,i)=>(<circle key={i} cx={c.x} cy={c.y} r={c.r} fill="black" />))}</mask></defs>
                    <rect width="100%" height="100%" fill={`rgba(0,0,0,${fogOpacity})`} mask="url(#fogMask)" />
                  </svg>
                )}

                {/* Панель выбранного токена */}
                {selectedId && (() => { const t = tokens.find((x)=>x.id===selectedId)!; const left = Math.min(MAP_W - 260, Math.max(0, t.position.x + GRID + 8)); const top = Math.min(MAP_H - 170, Math.max(0, t.position.y - 8)); return (
                  <div className="absolute z-10" style={{ left, top }}>
                    <div className="w-64 rounded-xl border border-neutral-700 bg-neutral-900/95 backdrop-blur p-3 space-y-2 shadow-xl">
                      <div className="flex items-center justify-between"><div className="font-semibold">{t.name}</div><button className="text-neutral-400 hover:text-white" onClick={()=>setSelectedId(null)}>✕</button></div>
                      <div className="flex items-center gap-2"><StatBadge label="HP" value={`${t.hp}/${t.maxHp}`} /><StatBadge label="AC" value={t.ac} /><StatBadge label="Init" value={t.initiative} /></div>
                      <div className="flex items-center gap-2 text-sm">
                        <button className="px-2 py-1 rounded-md border border-neutral-700 hover:border-emerald-400 hover:text-emerald-400" onClick={()=>setTokens(prev=>prev.map(x=>x.id===t.id?{...x, hp: Math.min(x.maxHp, x.hp + Math.ceil(x.maxHp*0.25))}:x))}>Лечить 25%</button>
                        <button className="px-2 py-1 rounded-md border border-neutral-700 hover:border-rose-400 hover:text-rose-400" onClick={()=>setTokens(prev=>prev.map(x=>x.id===t.id?{...x, hp: Math.max(0, x.hp - Math.ceil(x.maxHp*0.25))}:x))}>Урон 25%</button>
                        <button className="ml-auto px-2 py-1 rounded-md border border-neutral-700 hover:border-rose-400 hover:text-rose-400" onClick={()=>setTokens(prev=>prev.filter(x=>x.id!==t.id))}>Удалить</button>
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

            <Title>Журнал</Title>
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