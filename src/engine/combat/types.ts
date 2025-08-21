// Типы для современной пошаговой боевой системы

export type CombatPhase = 
  | 'idle'
  | 'round_start'
  | 'turn_start'
  | 'action_phase'
  | 'reaction_phase'
  | 'turn_end'
  | 'round_end';

export interface CombatState {
  sessionId: string;
  round: number;
  turnIndex: number;
  phase: CombatPhase;
  queue: string[]; // entityIds в порядке инициативы
  activeEntityId?: string;
  heldForReaction: boolean;
  reactionTimeout?: number;
  updatedAt: number;
}

export interface ActionState {
  usedAction: boolean;
  usedBonus: boolean;
  usedReaction: boolean;
  usedMovement: number; // футы потрачены из общего пула
}

export interface MovementState {
  base: number; // базовая скорость в футах (обычно 30)
  current: number; // оставшееся движение в этом ходу
  difficult: boolean; // находится ли в трудной местности
}

export interface Condition {
  key: string; // poisoned, prone, grappled, etc.
  name: string;
  description: string;
  source: string; // кто наложил
  duration: {
    type: 'rounds' | 'minutes' | 'hours' | 'permanent';
    value: number;
    startRound?: number;
  };
  effects: {
    advantage?: string[]; // массив типов бросков
    disadvantage?: string[];
    modifiers?: { [key: string]: number }; // AC, damage, etc.
    preventActions?: ('action' | 'bonus' | 'reaction' | 'movement')[];
  };
}

export interface VisionState {
  range: number; // нормальное зрение в футах
  darkvision: number; // темное зрение в футах
  blindsight?: number;
  truesight?: number;
  currentlyVisible: string[]; // IDs видимых сущностей
  hasLineOfSight: { [entityId: string]: boolean };
}

export interface CombatEntity {
  id: string;
  name: string;
  initiative: number;
  initiativeModifier: number;
  
  // Позиция и движение
  position: { x: number; y: number; z: number };
  facing: number; // поворот в радианах
  movement: MovementState;
  
  // Боевые характеристики
  hp: { current: number; max: number; temporary: number };
  ac: number;
  actions: ActionState;
  
  // Состояния и эффекты
  conditions: Condition[];
  vision: VisionState;
  
  // Флаги состояния
  isPlayer: boolean;
  isDead: boolean;
  isUnconscious: boolean;
  isHidden: boolean;
  
  // 3D представление
  modelUrl?: string;
  scale: number;
  animationState: string;
}

export interface AOETemplate {
  type: 'cone' | 'line' | 'sphere' | 'cylinder' | 'cube';
  size: number; // радиус для sphere, длина для cone/line
  width?: number; // ширина для line
  height?: number; // высота для cylinder
  origin: { x: number; y: number; z: number };
  direction?: { x: number; y: number; z: number }; // для направленных
  affectedEntities: string[]; // IDs попавших сущностей
}

export interface CombatAction {
  id: string;
  name: string;
  type: 'action' | 'bonus' | 'reaction';
  description: string;
  range: number; // в футах, 0 = touch, -1 = self
  aoe?: AOETemplate;
  damage?: {
    dice: string; // "2d6+4"
    type: string; // "fire", "slashing", etc.
  };
  savingThrow?: {
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
    dc: number;
    effect: 'half' | 'none' | 'special';
  };
  conditions?: Condition[];
  cooldown?: number; // rounds
}

export interface ReactionRequest {
  id: string;
  triggerEntityId: string;
  targetEntityId: string;
  trigger: string; // "movement", "attack", "spell", etc.
  availableReactions: CombatAction[];
  timeoutMs: number;
}

export interface CombatLog {
  id: string;
  timestamp: number;
  round: number;
  actor: string;
  action: string;
  targets?: string[];
  rolls?: {
    type: string;
    dice: string;
    result: number;
    total: number;
    advantage?: boolean;
    disadvantage?: boolean;
  }[];
  damage?: {
    target: string;
    amount: number;
    type: string;
    reduced?: boolean;
  }[];
  description: string;
  canUndo: boolean;
}

export interface FogOfWarState {
  sessionId: string;
  explored: boolean[][]; // постоянно разведанные клетки
  visible: boolean[][]; // видимые в данный момент
  lightSources: {
    id: string;
    position: { x: number; y: number; z: number };
    radius: number;
    intensity: number;
    color: string;
  }[];
}

// События для машины состояний
export type CombatEvent =
  | { type: 'START_COMBAT'; entities: CombatEntity[] }
  | { type: 'END_COMBAT' }
  | { type: 'START_ROUND' }
  | { type: 'START_TURN'; entityId: string }
  | { type: 'END_TURN'; entityId: string }
  | { type: 'USE_ACTION'; entityId: string; action: CombatAction }
  | { type: 'MOVE_ENTITY'; entityId: string; from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number } }
  | { type: 'APPLY_DAMAGE'; entityId: string; damage: number; damageType: string }
  | { type: 'APPLY_HEALING'; entityId: string; healing: number }
  | { type: 'ADD_CONDITION'; entityId: string; condition: Condition }
  | { type: 'REMOVE_CONDITION'; entityId: string; conditionKey: string }
  | { type: 'REQUEST_REACTION'; request: ReactionRequest }
  | { type: 'RESOLVE_REACTION'; requestId: string; action?: CombatAction }
  | { type: 'UNDO_ACTION'; logEntryId: string };