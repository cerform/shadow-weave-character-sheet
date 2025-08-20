import { describe, it, expect } from 'vitest';
import { aStar } from '@/systems/pathfinding/AStar';

const grid = Array.from({length:10},(_,z)=>Array.from({length:10},(_,x)=>({cost:1,opaque:false,elevation:0})));

describe('A*', () => { 
  it('straight path', () => { 
    const p = aStar(grid, 0,0, 5,0)!; 
    expect(p[0]).toEqual([0,0]); 
    expect(p[p.length-1]).toEqual([5,0]); 
  }); 
});