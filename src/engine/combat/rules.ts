// Правила D&D 5e для пошаговой боевой системы
import { CombatEntity, Condition, AOETemplate } from './types';

export function canEndTurn(entity: CombatEntity): boolean {
  // В D&D 5e ход можно завершить всегда, даже если остались очки действий
  return true;
}

export function getRemainingActionHints(entity: CombatEntity) {
  return {
    movementLeft: Math.max(0, entity.movement.base - entity.actions.usedMovement),
    hasAction: !entity.actions.usedAction,
    hasBonus: !entity.actions.usedBonus,
    hasReaction: !entity.actions.usedReaction,
    canAct: !entity.isDead && !entity.isUnconscious
  };
}

export function canUseAction(entity: CombatEntity, actionType: 'action' | 'bonus' | 'reaction'): boolean {
  if (entity.isDead || entity.isUnconscious) return false;
  
  // Проверяем условия, которые могут запретить действия
  const preventingConditions = entity.conditions.filter(c => 
    c.effects.preventActions?.includes(actionType)
  );
  
  if (preventingConditions.length > 0) return false;
  
  switch (actionType) {
    case 'action':
      return !entity.actions.usedAction;
    case 'bonus':
      return !entity.actions.usedBonus;
    case 'reaction':
      return !entity.actions.usedReaction;
    default:
      return false;
  }
}

export function canMove(entity: CombatEntity, distance: number): boolean {
  if (entity.isDead || entity.isUnconscious) return false;
  
  // Проверяем условия, блокирующие движение
  const preventingConditions = entity.conditions.filter(c => 
    c.effects.preventActions?.includes('movement')
  );
  
  if (preventingConditions.length > 0) return false;
  
  const remainingMovement = entity.movement.base - entity.actions.usedMovement;
  return remainingMovement >= distance;
}

export function calculateMovementCost(
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number },
  isDifficultTerrain: boolean = false
): number {
  // Базовое расстояние в футах (1 клетка = 5 футов)
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const dz = Math.abs(to.z - from.z);
  
  // В D&D 5e диагональное движение стоит столько же, сколько прямое
  const gridDistance = Math.max(dx, dy) * 5; // 5 футов за клетку
  const verticalCost = dz * 5; // подъем/спуск тоже стоит движения
  
  let totalCost = gridDistance + verticalCost;
  
  // Трудная местность удваивает стоимость
  if (isDifficultTerrain) {
    totalCost *= 2;
  }
  
  return totalCost;
}

export function hasAdvantage(entity: CombatEntity, rollType: string): boolean {
  return entity.conditions.some(c => 
    c.effects.advantage?.includes(rollType)
  );
}

export function hasDisadvantage(entity: CombatEntity, rollType: string): boolean {
  return entity.conditions.some(c => 
    c.effects.disadvantage?.includes(rollType)
  );
}

export function getModifier(entity: CombatEntity, modifierType: string): number {
  return entity.conditions.reduce((total, condition) => {
    const modifier = condition.effects.modifiers?.[modifierType] || 0;
    return total + modifier;
  }, 0);
}

export function rollD20(advantage?: boolean, disadvantage?: boolean): { roll: number; total: number; wasAdvantage: boolean; wasDisadvantage: boolean } {
  // Advantage и disadvantage взаимно исключают друг друга
  const hasAdv = advantage && !disadvantage;
  const hasDisadv = disadvantage && !advantage;
  
  if (hasAdv) {
    const roll1 = Math.floor(Math.random() * 20) + 1;
    const roll2 = Math.floor(Math.random() * 20) + 1;
    const roll = Math.max(roll1, roll2);
    return { roll, total: roll, wasAdvantage: true, wasDisadvantage: false };
  }
  
  if (hasDisadv) {
    const roll1 = Math.floor(Math.random() * 20) + 1;
    const roll2 = Math.floor(Math.random() * 20) + 1;
    const roll = Math.min(roll1, roll2);
    return { roll, total: roll, wasAdvantage: false, wasDisadvantage: true };
  }
  
  const roll = Math.floor(Math.random() * 20) + 1;
  return { roll, total: roll, wasAdvantage: false, wasDisadvantage: false };
}

export function rollDamage(diceFormula: string): { rolls: number[]; total: number; formula: string } {
  // Простой парсер для формул типа "2d6+4" или "1d8+3"
  const match = diceFormula.match(/(\d+)d(\d+)(?:\+(\d+))?/);
  if (!match) {
    console.warn(`Invalid dice formula: ${diceFormula}`);
    return { rolls: [1], total: 1, formula: diceFormula };
  }
  
  const numDice = parseInt(match[1]);
  const diceSize = parseInt(match[2]);
  const modifier = parseInt(match[3]) || 0;
  
  const rolls: number[] = [];
  let total = 0;
  
  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * diceSize) + 1;
    rolls.push(roll);
    total += roll;
  }
  
  total += modifier;
  
  return { rolls, total, formula: diceFormula };
}

export function calculateAC(entity: CombatEntity, attackType?: string): number {
  let ac = entity.ac;
  
  // Применяем модификаторы от условий
  ac += getModifier(entity, 'ac');
  
  // Некоторые состояния влияют на AC
  if (entity.conditions.some(c => c.key === 'prone')) {
    // Prone дает disadvantage на ranged атаки против цели
    // и advantage на melee атаки, но не меняет AC напрямую
  }
  
  return Math.max(1, ac); // AC не может быть меньше 1
}

export function isInRange(
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number },
  range: number
): boolean {
  if (range === -1) return true; // self-targeting
  if (range === 0) return false; // touch требует adjacency (реализовать отдельно)
  
  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) + 
    Math.pow(to.y - from.y, 2) + 
    Math.pow(to.z - from.z, 2)
  ) * 5; // конвертируем в футы
  
  return distance <= range;
}

export function getEntitiesInAOE(
  template: AOETemplate,
  allEntities: CombatEntity[]
): CombatEntity[] {
  const affected: CombatEntity[] = [];
  
  for (const entity of allEntities) {
    if (isInAOETemplate(entity.position, template)) {
      affected.push(entity);
    }
  }
  
  return affected;
}

function isInAOETemplate(
  position: { x: number; y: number; z: number },
  template: AOETemplate
): boolean {
  const dx = position.x - template.origin.x;
  const dy = position.y - template.origin.y;
  const dz = position.z - template.origin.z;
  
  switch (template.type) {
    case 'sphere':
      const sphereDistance = Math.sqrt(dx * dx + dy * dy + dz * dz) * 5;
      return sphereDistance <= template.size;
      
    case 'cube':
      const halfSize = template.size / 10; // конвертируем футы в клетки
      return Math.abs(dx) <= halfSize && 
             Math.abs(dy) <= halfSize && 
             Math.abs(dz) <= halfSize;
      
    case 'cylinder':
      const cylinderDistance = Math.sqrt(dx * dx + dy * dy) * 5;
      const height = template.height || template.size;
      return cylinderDistance <= template.size && Math.abs(dz * 5) <= height;
      
    case 'cone':
      if (!template.direction) return false;
      // Упрощенная проверка конуса - проверяем угол и расстояние
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) * 5;
      if (distance > template.size) return false;
      
      // Вектор к цели
      const toTarget = { x: dx, y: dy, z: dz };
      const targetLength = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (targetLength === 0) return true; // в центре
      
      // Нормализуем
      toTarget.x /= targetLength;
      toTarget.y /= targetLength;
      toTarget.z /= targetLength;
      
      // Скалярное произведение для угла
      const dot = toTarget.x * template.direction.x + 
                  toTarget.y * template.direction.y + 
                  toTarget.z * template.direction.z;
      
      // Конус 60 градусов (cos(30) = 0.866)
      return dot >= 0.866;
      
    case 'line':
      if (!template.direction) return false;
      // Линия - упрощенная проверка расстояния до линии
      const lineDistance = Math.sqrt(dx * dx + dy * dy + dz * dz) * 5;
      return lineDistance <= template.size && 
             Math.abs(dx) <= (template.width || 5) / 10;
      
    default:
      return false;
  }
}

export function updateConditionDurations(entity: CombatEntity, currentRound: number): Condition[] {
  return entity.conditions.filter(condition => {
    if (condition.duration.type === 'permanent') return true;
    if (condition.duration.type === 'rounds') {
      const startRound = condition.duration.startRound || 0;
      return (currentRound - startRound) < condition.duration.value;
    }
    // Для минут и часов нужна более сложная логика с реальным временем
    return true;
  });
}

export function triggersOpportunityAttack(
  movingEntity: CombatEntity,
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number },
  allEntities: CombatEntity[]
): CombatEntity[] {
  const threateningEnemies: CombatEntity[] = [];
  
  for (const entity of allEntities) {
    if (entity.id === movingEntity.id) continue;
    if (entity.isDead || entity.isUnconscious) continue;
    if (entity.isPlayer === movingEntity.isPlayer) continue; // союзники
    if (entity.actions.usedReaction) continue; // уже использовал реакцию
    
    // Проверяем, был ли в зоне угрозы и покидает ли её
    const wasInReach = isInMeleeReach(from, entity.position);
    const stillInReach = isInMeleeReach(to, entity.position);
    
    if (wasInReach && !stillInReach) {
      threateningEnemies.push(entity);
    }
  }
  
  return threateningEnemies;
}

function isInMeleeReach(
  position1: { x: number; y: number; z: number },
  position2: { x: number; y: number; z: number },
  reach: number = 5
): boolean {
  const distance = Math.sqrt(
    Math.pow(position2.x - position1.x, 2) + 
    Math.pow(position2.y - position1.y, 2) + 
    Math.pow(position2.z - position1.z, 2)
  ) * 5;
  
  return distance <= reach;
}