// src/combat-core/EventBus.ts
export type EventMap = {
  'token:add': { id: string },
  'action:move': { id: string, to: {x:number;y:number;z:number} },
  'action:attack': { from: string, to: string, hit: boolean, dmg?: number },
};

export class EventBus { 
  private handlers: { [K in keyof EventMap]?: Array<(p: EventMap[K]) => void> } = {};
  
  on<K extends keyof EventMap>(k: K, h: (p: EventMap[K]) => void) { 
    (this.handlers[k] ||= []).push(h); 
  } 
  
  emit<K extends keyof EventMap>(k: K, p: EventMap[K]) { 
    this.handlers[k]?.forEach(fn => fn(p)); 
  } 
}