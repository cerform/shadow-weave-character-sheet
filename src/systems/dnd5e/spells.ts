// src/systems/dnd5e/spells.ts
import type { Character, Spell, CombatResult, AbilityScore } from '@/types/dnd5e';
import { getModifier, rollSavingThrow } from './abilities';
import { roll } from '@/utils/dice';

export class SpellcastingSystem {
  /**
   * Базовые заклинания D&D 5e
   */
  static SPELLS: Record<string, Spell> = {
    'fire-bolt': {
      name: 'Огненная стрела',
      level: 0,
      school: 'Evocation',
      castingTime: '1 действие',
      range: '120 футов',
      components: ['V', 'S'],
      duration: 'Мгновенно',
      description: 'Огненная стрела летит в цель',
      damage: '1d10',
      attackRoll: true
    },
    'healing-word': {
      name: 'Слово лечения',
      level: 1,
      school: 'Evocation',
      castingTime: '1 бонусное действие',
      range: '60 футов',
      components: ['V'],
      duration: 'Мгновенно',
      description: 'Восстанавливает хит-поинты',
      damage: '1d4'
    },
    'fireball': {
      name: 'Огненный шар',
      level: 3,
      school: 'Evocation',
      castingTime: '1 действие',
      range: '150 футов',
      components: ['V', 'S', 'M'],
      duration: 'Мгновенно',
      description: 'Взрыв огня в области',
      damage: '8d6',
      savingThrow: 'dexterity'
    },
    'magic-missile': {
      name: 'Волшебная стрела',
      level: 1,
      school: 'Evocation',
      castingTime: '1 действие',
      range: '120 футов',
      components: ['V', 'S'],
      duration: 'Мгновенно',
      description: 'Автоматически попадающие стрелы',
      damage: '1d4+1'
    }
  };

  /**
   * Применяет заклинание
   */
  static castSpell(
    caster: Character,
    spellName: string,
    target?: Character,
    spellLevel?: number
  ): CombatResult {
    const spell = this.SPELLS[spellName];
    if (!spell) {
      return { success: false, description: 'Заклинание не найдено' };
    }

    const castLevel = spellLevel || spell.level;

    // Проверяем слоты заклинаний
    if (spell.level > 0) {
      const slots = caster.resources.spellSlots[castLevel];
      if (!slots || slots.used >= slots.max) {
        return { 
          success: false, 
          description: `Нет слотов заклинаний ${castLevel} уровня` 
        };
      }

      // Тратим слот
      caster.resources.spellSlots[castLevel].used++;
    }

    // Проверяем тип действия
    const isBonusAction = spell.castingTime.includes('бонусное');
    if (isBonusAction && caster.resources.bonusActionUsed) {
      return { 
        success: false, 
        description: 'Бонусное действие уже использовано' 
      };
    } else if (!isBonusAction && caster.resources.actionUsed) {
      return { 
        success: false, 
        description: 'Действие уже использовано' 
      };
    }

    // Применяем заклинание
    let result: CombatResult;

    if (spell.attackRoll && target) {
      result = this.handleAttackSpell(caster, target, spell, castLevel);
    } else if (spell.savingThrow && target) {
      result = this.handleSaveSpell(caster, target, spell, castLevel);
    } else if (spell.name === 'Слово лечения' && target) {
      result = this.handleHealingSpell(target, spell, castLevel);
    } else if (spell.name === 'Волшебная стрела' && target) {
      result = this.handleMagicMissile(target, castLevel);
    } else {
      result = { success: false, description: 'Невозможно применить заклинание' };
    }

    // Отмечаем использование действия
    if (result.success) {
      if (isBonusAction) {
        caster.resources.bonusActionUsed = true;
      } else {
        caster.resources.actionUsed = true;
      }
    }

    return result;
  }

  /**
   * Обрабатывает заклинания с броском атаки
   */
  private static handleAttackSpell(
    caster: Character,
    target: Character,
    spell: Spell,
    castLevel: number
  ): CombatResult {
    // Бонус атаки заклинанием (обычно Int/Wis/Cha + профбонус)
    const spellAttackBonus = getModifier(caster.abilities, 'intelligence') + caster.proficiencyBonus;
    
    const attackRoll = roll('d20');
    const totalAttack = attackRoll.total + spellAttackBonus;

    if (totalAttack >= target.armorClass) {
      const damageRoll = roll(spell.damage!);
      const scaledDamage = this.scaleDamage(spell, castLevel, damageRoll.total);
      
      target.hitPoints = Math.max(0, target.hitPoints - scaledDamage);
      
      return {
        success: true,
        damage: scaledDamage,
        description: `${spell.name} попадает по ${target.name} на ${scaledDamage} урона`
      };
    } else {
      return {
        success: false,
        description: `${spell.name} промахивается по ${target.name}`
      };
    }
  }

  /**
   * Обрабатывает заклинания со спасброском
   */
  private static handleSaveSpell(
    caster: Character,
    target: Character,
    spell: Spell,
    castLevel: number
  ): CombatResult {
    const spellSaveDC = 8 + getModifier(caster.abilities, 'intelligence') + caster.proficiencyBonus;
    
    const saveResult = rollSavingThrow(
      target.abilities,
      target.proficiencyBonus,
      spell.savingThrow!,
      spellSaveDC
    );

    const damageRoll = roll(spell.damage!);
    const scaledDamage = this.scaleDamage(spell, castLevel, damageRoll.total);
    const finalDamage = saveResult.success ? Math.floor(scaledDamage / 2) : scaledDamage;

    target.hitPoints = Math.max(0, target.hitPoints - finalDamage);

    return {
      success: true,
      damage: finalDamage,
      description: `${spell.name}: ${target.name} ${saveResult.success ? 'проходит' : 'проваливает'} спасбросок и получает ${finalDamage} урона`
    };
  }

  /**
   * Обрабатывает лечащие заклинания
   */
  private static handleHealingSpell(
    target: Character,
    spell: Spell,
    castLevel: number
  ): CombatResult {
    const healingRoll = roll(spell.damage!);
    const scaledHealing = this.scaleDamage(spell, castLevel, healingRoll.total);
    
    target.hitPoints = Math.min(target.maxHitPoints, target.hitPoints + scaledHealing);

    return {
      success: true,
      healing: scaledHealing,
      description: `${target.name} восстанавливает ${scaledHealing} хит-поинтов`
    };
  }

  /**
   * Обрабатывает волшебную стрелу
   */
  private static handleMagicMissile(target: Character, castLevel: number): CombatResult {
    const missiles = 2 + castLevel; // 3 стрелы на 1 уровне, +1 за каждый уровень выше
    let totalDamage = 0;

    for (let i = 0; i < missiles; i++) {
      const damageRoll = roll('1d4+1');
      totalDamage += damageRoll.total;
    }

    target.hitPoints = Math.max(0, target.hitPoints - totalDamage);

    return {
      success: true,
      damage: totalDamage,
      description: `${missiles} волшебных стрел наносят ${totalDamage} урона`
    };
  }

  /**
   * Масштабирует урон заклинания по уровню
   */
  private static scaleDamage(spell: Spell, castLevel: number, baseDamage: number): number {
    if (spell.level === 0) {
      // Заговоры масштабируются по уровню персонажа (упрощенно)
      return baseDamage;
    }

    // Большинство заклинаний получают дополнительные кубики за уровень выше базового
    const extraLevels = castLevel - spell.level;
    if (extraLevels > 0 && spell.name === 'Огненный шар') {
      // Огненный шар: +1d6 за уровень
      const extraDamage = roll(`${extraLevels}d6`);
      return baseDamage + extraDamage.total;
    }

    return baseDamage;
  }
}