/**
 * Battle map constants
 */

export const GRID = 64; // Grid size in pixels
export const MAP_W = 1600; // Default map width
export const MAP_H = 900; // Default map height

export const MODEL_REGISTRY_URL = "/data/dnd-model-registry.json";

// Helper functions
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function now(): string {
  return new Date().toLocaleTimeString();
}

export function isClient(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function isValidModelUrl(url?: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url, isClient() ? window.location.href : "http://local");
    const p = u.pathname.toLowerCase();
    return p.endsWith(".glb") || p.endsWith(".gltf");
  } catch {
    return false;
  }
}

export const norm = (s: string) =>
  s
    ?.normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-zа-я0-9 ]+/gi, "")
    .trim();
