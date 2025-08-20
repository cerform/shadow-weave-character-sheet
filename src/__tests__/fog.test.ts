import { describe, it, expect } from 'vitest';
import { useFogStore } from '@/stores/fogStore';

describe('Fog', () => { 
  it('reveal circle', () => { 
    useFogStore.getState().setMap('m', new Uint8Array(100), 10, 10); 
    useFogStore.getState().reveal('m', 5, 5, 2); 
    const data = useFogStore.getState().maps['m']; 
    expect(data.some(v=>v===1)).toBe(true); 
  }); 
});