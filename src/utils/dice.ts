// src/utils/dice.ts
export type RollMode = 'normal'|'advantage'|'disadvantage';
const RE=/^(\d+)?d(\d+)([+-]\d+)?$/i;

export function roll(formula: string, mode: RollMode = 'normal'){
  const m=formula.replace(/\s+/g,'').match(RE); 
  if(!m) return { total: NaN, breakdown: '' };
  
  const c=parseInt(m[1]||'1',10), s=parseInt(m[2],10), mod=parseInt(m[3]||'0',10);
  const once=()=>Array.from({length:c},()=>1+Math.floor(Math.random()*s)).reduce((a,b)=>a+b,0)+mod;
  
  if(mode!=='normal'){ 
    const a=once(), b=once(); 
    const total = mode==='advantage'?Math.max(a,b):Math.min(a,b);
    return { total, breakdown: `${total}` }; 
  }
  
  const total = once();
  return { total, breakdown: `${total}` };
}