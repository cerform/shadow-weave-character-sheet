// src/map-core/GridAdapter.ts
export const GridAdapter = {
  worldToGrid(world: {x:number;y:number;z:number}, tileSize = 5) { 
    return { 
      x: Math.round(world.x / tileSize), 
      y: Math.round(world.y / tileSize), 
      z: Math.round(world.z / tileSize) 
    }; 
  },
  gridToWorld(grid: {x:number;y:number;z:number}, tileSize = 5) { 
    return { 
      x: grid.x * tileSize, 
      y: grid.y * tileSize, 
      z: grid.z * tileSize 
    }; 
  }
};