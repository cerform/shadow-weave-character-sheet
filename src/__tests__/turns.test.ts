import { describe, it, expect } from 'vitest';
import { nextTurnIndex } from '@/combat-core/TurnEngine';

describe('Turns',()=>{ 
  it('wraps',()=>{ 
    expect(nextTurnIndex([{tokenId:1,initiative:10,acted:false}],0)).toBe(0); 
  }); 
});