// src/systems/dnd5e/combat.ts
import type { Character, CombatState, TurnOrder, CombatResult, Weapon, AbilityScore } from '@/types/dnd5e';
import { rollInitiative, getAttackBonus, getModifier, rollSavingThrow } from './abilities';
import { roll } from '@/utils/dice';

export class DnD5eCombatSystem {
  private state: CombatState = {
    isActive: false,
    round: 1,
    turnOrder: [],
    currentTurnIndex: 0,
    characters: []
  };

  /**
   * Начинает бой и определяет инициативу
   */
  startCombat(characters: Character[]): CombatState {
    const turnOrder: TurnOrder[] = characters
      .map(char => ({
        characterId: char.id,
        initiative: rollInitiative(char.abilities),
        hasActed: false
      }))
      .sort((a, b) => b.initiative - a.initiative);

    this.state = {
      isActive: true,
      round: 1,
      turnOrder,
      currentTurnIndex: 0,
      characters: characters.map(char => ({
        ...char,
        resources: {
          actionUsed: false,
          bonusActionUsed: false,
          reactionUsed: false,
          movement: char.speed,
          spellSlots: char.resources?.spellSlots || {}
        }
      }))
    };

    return this.state;
  }

  /**
   * Заканчивает текущий ход и переходит к следующему
   */
  endTurn(): CombatState {
    if (!this.state.isActive) return this.state;

    // Отмечаем текущего персонажа как совершившего ход
    this.state.turnOrder[this.state.currentTurnIndex].hasActed = true;

    // Переходим к следующему персонажу
    this.state.currentTurnIndex = (this.state.currentTurnIndex + 1) % this.state.turnOrder.length;

    // Если все прошли - новый раунд
    if (this.state.currentTurnIndex === 0) {
      this.state.round++;
      this.state.turnOrder.forEach(turn => turn.hasActed = false);
      this.resetRoundResources();
    }

    return this.state;
  }

  /**
   * Выполняет атаку оружием
   */
  makeWeaponAttack(
    attackerId: string, 
    targetId: string, 
    weapon: Weapon,
    advantage: boolean = false,
    disadvantage: boolean = false
  ): CombatResult {
    const attacker = this.getCharacter(attackerId);
    const target = this.getCharacter(targetId);

    if (!attacker || !target) {
      return { success: false, description: 'Персонаж не найден' };
    }

    if (attacker.resources.actionUsed) {
      return { success: false, description: 'Действие уже использовано в этом ходу' };
    }

    // Определяем характеристику для атаки
    const attackAbility: AbilityScore = weapon.properties.includes('finesse') 
      ? (getModifier(attacker.abilities, 'dexterity') > getModifier(attacker.abilities, 'strength') ? 'dexterity' : 'strength')
      : 'strength';

    // Бросок атаки
    const attackBonus = getAttackBonus(attacker.abilities, attacker.proficiencyBonus, attackAbility);
    
    let attackRollMode: 'normal' | 'advantage' | 'disadvantage' = 'normal';
    if (advantage && !disadvantage) attackRollMode = 'advantage';
    if (disadvantage && !advantage) attackRollMode = 'disadvantage';

    const attackRoll = roll('d20', attackRollMode);
    const totalAttack = attackRoll.total + attackBonus;

    // Проверяем попадание
    if (totalAttack >= target.armorClass) {
      // Попадание - бросаем урон
      const damageRoll = roll(weapon.damage);
      const abilityModifier = getModifier(attacker.abilities, attackAbility);
      const totalDamage = Math.max(1, damageRoll.total + abilityModifier);

      // Наносим урон
      target.hitPoints = Math.max(0, target.hitPoints - totalDamage);
      attacker.resources.actionUsed = true;

      return {
        success: true,
        damage: totalDamage,
        description: `${attacker.name} попадает по ${target.name} на ${totalDamage} урона (бросок атаки: ${attackRoll.total}+${attackBonus}=${totalAttack} против AC ${target.armorClass})`
      };
    } else {
      attacker.resources.actionUsed = true;
      return {
        success: false,
        description: `${attacker.name} промахивается по ${target.name} (бросок атаки: ${attackRoll.total}+${attackBonus}=${totalAttack} против AC ${target.armorClass})`
      };
    }
  }

  /**
   * Выполняет перемещение
   */
  moveCharacter(characterId: string, distance: number): CombatResult {
    const character = this.getCharacter(characterId);
    if (!character) {
      return { success: false, description: 'Персонаж не найден' };
    }

    if (character.resources.movement < distance) {
      return { 
        success: false, 
        description: `Недостаточно очков движения. Осталось: ${character.resources.movement}` 
      };
    }

    character.resources.movement -= distance;
    return {
      success: true,
      description: `${character.name} перемещается на ${distance} футов. Осталось движения: ${character.resources.movement}`
    };
  }

  /**
   * Выполняет спасбросок
   */
  makeSavingThrow(
    characterId: string,
    ability: AbilityScore,
    dc: number,
    isProficient: boolean = false
  ): CombatResult {
    const character = this.getCharacter(characterId);
    if (!character) {
      return { success: false, description: 'Персонаж не найден' };
    }

    const result = rollSavingThrow(
      character.abilities,
      character.proficiencyBonus,
      ability,
      dc,
      isProficient
    );

    return {
      success: result.success,
      description: `${character.name} ${result.success ? 'проходит' : 'проваливает'} спасбросок ${ability} (${result.roll}+${result.total - result.roll}=${result.total} против DC ${dc})`
    };
  }

  /**
   * Получает текущее состояние боя
   */
  getState(): CombatState {
    return { ...this.state };
  }

  /**
   * Получает персонажа по ID
   */
  private getCharacter(id: string): Character | undefined {
    return this.state.characters.find(char => char.id === id);
  }

  /**
   * Сбрасывает ресурсы в начале нового раунда
   */
  private resetRoundResources(): void {
    this.state.characters.forEach(char => {
      char.resources.actionUsed = false;
      char.resources.bonusActionUsed = false;
      char.resources.reactionUsed = false;
      char.resources.movement = char.speed;
    });
  }

  /**
   * Заканчивает бой
   */
  endCombat(): void {
    this.state.isActive = false;
    this.state.turnOrder = [];
    this.state.currentTurnIndex = 0;
  }
}