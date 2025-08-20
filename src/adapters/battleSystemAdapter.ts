// src/adapters/battleSystemAdapter.ts
import type { Character } from '@/types/dnd5e';
import type { EnhancedToken, CombatEvent } from '@/stores/enhancedBattleStore';
import { getProficiencyBonus } from '@/systems/dnd5e/abilities';

/**
 * Адаптер для преобразования между системами боя
 */
export class BattleSystemAdapter {
  /**
   * Преобразует персонажа D&D 5e в токен для карты
   */
  static characterToToken(character: Character): EnhancedToken {
    return {
      id: character.id,
      name: character.name,
      hp: character.hitPoints,
      maxHp: character.maxHitPoints,
      ac: character.armorClass,
      position: [character.position.x, character.position.y, character.position.z],
      conditions: character.conditions.map(c => c.name),
      isEnemy: false, // По умолчанию союзник
      isVisible: true,
      size: 1,
      speed: character.speed / 5, // Конвертируем футы в клетки (5 футов = 1 клетка)
      hasMovedThisTurn: false,
      class: character.level ? `Level ${character.level}` : undefined
    };
  }

  /**
   * Преобразует токен обратно в персонажа D&D 5e
   */
  static tokenToCharacter(token: EnhancedToken, originalCharacter?: Character): Character {
    // Если есть оригинальный персонаж, используем его как основу
    const baseCharacter: Character = originalCharacter || {
      id: token.id,
      name: token.name,
      level: 1,
      hitPoints: token.hp,
      maxHitPoints: token.maxHp,
      armorClass: token.ac,
      speed: (token.speed || 6) * 5, // Конвертируем клетки обратно в футы
      abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      proficiencyBonus: 2,
      savingThrows: {},
      skills: {},
      conditions: [],
      position: { x: 0, y: 0, z: 0 },
      resources: {
        actionUsed: false,
        bonusActionUsed: false,
        reactionUsed: false,
        movement: 30,
        spellSlots: {}
      }
    };

    return {
      ...baseCharacter,
      hitPoints: token.hp,
      maxHitPoints: token.maxHp,
      armorClass: token.ac,
      position: {
        x: token.position[0],
        y: token.position[1],
        z: token.position[2]
      },
      conditions: token.conditions.map(name => ({
        name,
        description: '',
        duration: -1
      })),
      speed: (token.speed || 6) * 5,
      proficiencyBonus: getProficiencyBonus(baseCharacter.level)
    };
  }

  /**
   * Создает демонстрационных персонажей на основе токенов
   */
  static createDemoCharactersFromTokens(tokens: EnhancedToken[]): Character[] {
    return tokens.map(token => {
      const character = this.tokenToCharacter(token);
      
      // Настраиваем характеристики в зависимости от типа токена
      if (token.isEnemy) {
        // Враги получают более высокие характеристики
        character.abilities.strength = 14 + Math.floor(Math.random() * 4);
        character.abilities.constitution = 12 + Math.floor(Math.random() * 4);
        character.abilities.dexterity = 10 + Math.floor(Math.random() * 6);
      } else {
        // Союзники получают сбалансированные характеристики
        character.abilities.strength = 12 + Math.floor(Math.random() * 6);
        character.abilities.dexterity = 12 + Math.floor(Math.random() * 6);
        character.abilities.constitution = 12 + Math.floor(Math.random() * 4);
        character.abilities.intelligence = 10 + Math.floor(Math.random() * 6);
        character.abilities.wisdom = 10 + Math.floor(Math.random() * 6);
        character.abilities.charisma = 10 + Math.floor(Math.random() * 6);
      }

      // Устанавливаем уровень на основе HP
      if (character.maxHitPoints > 50) {
        character.level = 5;
      } else if (character.maxHitPoints > 30) {
        character.level = 3;
      } else {
        character.level = 1;
      }

      character.proficiencyBonus = getProficiencyBonus(character.level);

      return character;
    });
  }

  /**
   * Синхронизирует изменения между персонажем и токеном
   */
  static syncCharacterToToken(character: Character, token: EnhancedToken): EnhancedToken {
    return {
      ...token,
      hp: character.hitPoints,
      maxHp: character.maxHitPoints,
      ac: character.armorClass,
      position: [character.position.x, character.position.y, character.position.z],
      conditions: character.conditions.map(c => c.name),
      speed: character.speed / 5
    };
  }

  /**
   * Создает боевое событие из результата D&D 5e системы
   */
  static createCombatEvent(
    actor: string,
    action: string,
    result: {
      success: boolean;
      damage?: number;
      healing?: number;
      description: string;
    },
    target?: string
  ): Omit<CombatEvent, 'id' | 'timestamp'> {
    return {
      actor,
      action,
      target,
      damage: result.damage,
      healing: result.healing,
      description: result.description,
      playerName: 'System'
    };
  }
}