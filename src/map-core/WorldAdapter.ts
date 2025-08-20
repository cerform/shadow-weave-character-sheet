// src/map-core/WorldAdapter.ts
export interface WorldBindings {
  placeToken(id: string, worldPos: {x:number;y:number;z:number}): void;
  moveToken(id: string, worldPos: {x:number;y:number;z:number}): void;
  removeToken(id: string): void;
  highlightTiles(tiles: Array<{x:number;z:number}>): void;
}