import { describe, it, expect } from 'vitest';
import { hasLineOfSight } from '@/systems/los/LineOfSight';

const g = Array.from({length:10},(_,z)=>Array.from({length:10},(_,x)=>({cost:1,opaque:false,elevation:0})));

describe('LoS', () => { 
  it('clear', ()=>{ 
    expect(hasLineOfSight(g,0,0,5,5)).toBe(true); 
  }); 
});