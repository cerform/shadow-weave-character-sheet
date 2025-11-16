import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-auth";

export type FogCell = {
  x: number;
  y: number;
  revealed: boolean;
};

export type FogController = {
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

  // LOCAL GRID (always authoritative for rendering)
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: gridH }, () =>
      Array.from({ length: gridW }, () => 0)
    )
  );

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
      setGrid(prev => {
        const g = prev.map(row => [...row]);
        g[y][x] = revealed ? 1 : 0;
        return g;
      });

      if (isDM) pendingCells.current.set(`${x}:${y}`, revealed);
    },
    [isDM]
  );

  const reveal = useCallback((x: number, y: number) => applyLocal(x, y, true), [applyLocal]);
  const hide = useCallback((x: number, y: number) => applyLocal(x, y, false), [applyLocal]);

  const toggle = useCallback(
    (x: number, y: number) => {
      const cur = grid[y]?.[x] ?? 0;
      applyLocal(x, y, !cur);
    },
    [grid, applyLocal]
  );

  // ─────────────────────────────────────────────────────────────
  // CIRCLE TOOL (REVEAL / HIDE)
  // ─────────────────────────────────────────────────────────────
  const applyCircle = useCallback(
    (cx: number, cy: number, r: number, revealState: boolean) => {
      const r2 = r * r;

      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x < 0 || y < 0 || x >= gridW || y >= gridH) continue;

          const dx = x - cx;
          const dy = y - cy;
          if (dx * dx + dy * dy <= r2) applyLocal(x, y, revealState);
        }
      }
    },
    [applyLocal, gridW, gridH]
  );

  const isRevealed = useCallback((x: number, y: number) => grid[y]?.[x] === 1, [grid]);

  return {
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
