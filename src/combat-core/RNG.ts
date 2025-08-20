// src/combat-core/RNG.ts
export class RNG { 
  constructor(public seed = 123456789) {} 
  
  next() { 
    let x = this.seed |= 0; 
    x ^= x << 13; 
    x ^= x >>> 17; 
    x ^= x << 5; 
    this.seed = x; 
    return (x >>> 0) / 0x100000000; 
  } 
}