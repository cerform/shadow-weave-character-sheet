import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-auth";
import { FogEngine } from "@/modules/fog/FogEngine";
import type { FogCell } from "@/modules/fog/FogTypes";

export type FogController = {
  engine: FogEngine | null;
  grid: number[][];
  width: number;
  height: number;

  reveal: (x: number, y: number) => void;
  hide: (x: number, y: number) => void;
  toggle: (x: number, y: number) => void;

  applyCircle: (cx: number, cy: number, radius: number, reveal: boolean) => void;

  isRevealed: (x: number, y: number) => boolean;
};

/**
 * Efficient fog-of-war system:
 * - Full in-memory grid
 * - Local updates instantly visible
 * - DM → Supabase batching
 * - Players → read-only subscription
 */
export function useFogController(
  sessionId: string,
  mapId: string,
  gridW: number,
  gridH: number
): FogController {
  const { isDM } = useUserRole();

  // FogEngine instance
  const engineRef = useRef<FogEngine | null>(null);

  // LOCAL GRID (always authoritative for rendering)
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: gridH }, () =>
      Array.from({ length: gridW }, () => 0)
    )
  );

  // Initialize engine
  useEffect(() => {
    engineRef.current = new FogEngine(gridW, gridH);
    engineRef.current.loadGrid(grid);
  }, [gridW, gridH]);

  // Sync grid with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.loadGrid(grid);
    }
  }, [grid]);

  // Prevent infinite loops
  const suppressNextUpdate = useRef(false);

  // Pending DB updates (batched)
  const pendingCells = useRef<Map<string, boolean>>(new Map());

  // ─────────────────────────────────────────────────────────────
  // LOAD INITIAL FOG GRID
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("fog_of_war")
        .select("*")
        .eq("session_id", sessionId)
        .eq("map_id", mapId);

      if (error) {
        console.error("Fog load error:", error);
        return;
      }

      const newGrid = Array.from({ length: gridH }, () =>
        Array.from({ length: gridW }, () => 0)
      );

      for (const cell of data ?? []) {
        if (
          cell.grid_x >= 0 &&
          cell.grid_x < gridW &&
          cell.grid_y >= 0 &&
          cell.grid_y < gridH
        ) {
          newGrid[cell.grid_y][cell.grid_x] = cell.is_revealed ? 1 : 0;
        }
      }

      suppressNextUpdate.current = true; // avoid recursion
      setGrid(newGrid);
    };

    load();
  }, [sessionId, mapId, gridW, gridH]);

  // ─────────────────────────────────────────────────────────────
  // SUBSCRIPTION (PLAYERS ONLY)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDM) return; // DM is authoritative

    const chan = supabase
      .channel(`fog-${sessionId}-${mapId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fog_of_war",
          filter: `session_id=eq.${sessionId}`,
        },
        payload => {
          if (suppressNextUpdate.current) {
            suppressNextUpdate.current = false;
            return;
          }

          const newRecord = payload.new as any;
          if (!newRecord) return;

          const cx = newRecord.grid_x;
          const cy = newRecord.grid_y;
          const revealed = newRecord.is_revealed ? 1 : 0;

          setGrid(prev => {
            if (!prev[cy] || prev[cy][cx] === revealed) return prev;
            const copy = prev.map(row => [...row]);
            copy[cy][cx] = revealed;
            return copy;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chan);
    };
  }, [sessionId, mapId, isDM]);

  // ─────────────────────────────────────────────────────────────
  // BATCHED DB WRITER (DM ONLY)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDM) return;

    const interval = setInterval(async () => {
      if (pendingCells.current.size === 0) return;

      const updates = [];
      for (const [key, revealed] of pendingCells.current.entries()) {
        const [x, y] = key.split(":").map(Number);
        updates.push({ session_id: sessionId, map_id: mapId, grid_x: x, grid_y: y, is_revealed: revealed });
      }

      pendingCells.current.clear();

      // BATCH UPSERT
      await supabase.from("fog_of_war").upsert(updates, {
        onConflict: "session_id,map_id,grid_x,grid_y",
      });
    }, 250); // UPDATE EVERY 250ms

    return () => clearInterval(interval);
  }, [sessionId, mapId, isDM]);

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────
  const applyLocal = useCallback(
    (x: number, y: number, revealed: boolean) => {
      if (!engineRef.current) return;
      
      const changed = revealed 
        ? engineRef.current.reveal(x, y)
        : engineRef.current.hide(x, y);
      
      if (changed) {
        setGrid(engineRef.current.getGrid());
        if (isDM) pendingCells.current.set(`${x}:${y}`, revealed);
      }
    },
    [isDM]
  );

  const reveal = useCallback((x: number, y: number) => applyLocal(x, y, true), [applyLocal]);
  const hide = useCallback((x: number, y: number) => applyLocal(x, y, false), [applyLocal]);

  const toggle = useCallback(
    (x: number, y: number) => {
      if (!engineRef.current) return;
      
      const changed = engineRef.current.toggle(x, y);
      if (changed) {
        setGrid(engineRef.current.getGrid());
        const revealed = engineRef.current.isRevealed(x, y);
        if (isDM) pendingCells.current.set(`${x}:${y}`, revealed);
      }
    },
    [isDM]
  );

  // ─────────────────────────────────────────────────────────────
  // CIRCLE TOOL (REVEAL / HIDE)
  // ─────────────────────────────────────────────────────────────
  const applyCircle = useCallback(
    (cx: number, cy: number, r: number, revealState: boolean) => {
      if (!engineRef.current) return;
      
      const mode = revealState ? 'reveal' : 'hide';
      const changed = engineRef.current.applyBrush(cx, cy, r, mode);
      
      if (changed.length > 0) {
        setGrid(engineRef.current.getGrid());
        if (isDM) {
          changed.forEach(cell => {
            pendingCells.current.set(`${cell.x}:${cell.y}`, cell.revealed);
          });
        }
      }
    },
    [isDM]
  );

  const isRevealed = useCallback(
    (x: number, y: number) => engineRef.current?.isRevealed(x, y) ?? false, 
    []
  );

  return {
    engine: engineRef.current,
    grid,
    width: gridW,
    height: gridH,

    reveal,
    hide,
    toggle,
    applyCircle,
    isRevealed,
  };
}
