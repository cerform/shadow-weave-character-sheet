import { supabase } from '@/integrations/supabase/client';
import type { Monster, MonsterSize, MonsterType, ChallengeRating } from '@/types/monsters';

export interface SupabaseCreature {
  id: string;
  name: string;
  slug: string;
  type: string;
  size: string;
  alignment: string;
  armor_class: number;
  hit_points: number;
  speed: any;
  stats: any;
  saves?: any;
  skills?: any;
  senses?: any;
  cr: number;
  hit_dice: string;
  languages: string;
  actions?: any;
  traits?: any;
  legendary_actions?: any;
  reactions?: any;
  meta?: any;
}

export class MonstersService {
  static async getAllCreatures(): Promise<Monster[]> {
    try {
      const { data, error } = await supabase
        .from('srd_creatures')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching creatures:', error);
        return [];
      }

      return data?.map(this.mapSupabaseCreatureToMonster) || [];
    } catch (error) {
      console.error('Error in getAllCreatures:', error);
      return [];
    }
  }

  static async getCreatureBySlug(slug: string): Promise<Monster | null> {
    try {
      const { data, error } = await supabase
        .from('srd_creatures')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching creature by slug:', error);
        return null;
      }

      return data ? this.mapSupabaseCreatureToMonster(data) : null;
    } catch (error) {
      console.error('Error in getCreatureBySlug:', error);
      return null;
    }
  }

  static async searchCreatures(query: string): Promise<Monster[]> {
    try {
      const { data, error } = await supabase
        .from('srd_creatures')
        .select('*')
        .or(`name.ilike.%${query}%,type.ilike.%${query}%,alignment.ilike.%${query}%`)
        .order('name')
        .limit(50);

      if (error) {
        console.error('Error searching creatures:', error);
        return [];
      }

      return data?.map(this.mapSupabaseCreatureToMonster) || [];
    } catch (error) {
      console.error('Error in searchCreatures:', error);
      return [];
    }
  }

  private static mapSupabaseCreatureToMonster(creature: SupabaseCreature): Monster {
    const abilities = creature.stats || {};
    const actions = Array.isArray(creature.actions) ? creature.actions : [];
    const traits = Array.isArray(creature.traits) ? creature.traits : [];
    const legendaryActions = Array.isArray(creature.legendary_actions) ? creature.legendary_actions : [];

    return {
      id: creature.id,
      name: creature.name,
      nameEn: creature.slug,
      size: this.mapSizeToRussian(creature.size),
      type: this.mapTypeToRussian(creature.type),
      alignment: creature.alignment,
      armorClass: creature.armor_class,
      hitPoints: creature.hit_points,
      hitDice: creature.hit_dice,
      speed: this.parseSpeed(creature.speed),
      abilities: {
        strength: abilities.strength || 10,
        dexterity: abilities.dexterity || 10,
        constitution: abilities.constitution || 10,
        intelligence: abilities.intelligence || 10,
        wisdom: abilities.wisdom || 10,
        charisma: abilities.charisma || 10,
      },
      savingThrows: creature.saves || {},
      skills: creature.skills || {},
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: {
        darkvision: 0,
        blindsight: 0,
        tremorsense: 0,
        truesight: 0,
        passivePerception: 10 + Math.floor((abilities.wisdom || 10 - 10) / 2),
        ...creature.senses
      },
      languages: creature.languages ? creature.languages.split(', ') : [],
      challengeRating: this.formatChallengeRating(creature.cr),
      experiencePoints: this.calculateExperiencePoints(creature.cr),
      proficiencyBonus: this.calculateProficiencyBonus(creature.cr),
      actions: actions.map((action: any) => ({
        name: action.name || '',
        description: action.description || '',
        recharge: action.recharge,
        damage: action.damage,
        damageType: action.damageType,
        savingThrow: action.savingThrow
      })),
      traits: traits.map((trait: any) => ({
        name: trait.name || '',
        description: trait.description || ''
      })),
      legendaryActions: legendaryActions.map((action: any) => ({
        name: action.name || '',
        description: action.description || '',
        cost: action.cost || 1
      })),
      spellcasting: null,
      environment: [],
      source: creature.meta?.source || 'SRD',
      tags: [],
      tokenSize: this.getTokenSize(creature.size),
      modelUrl: undefined,
      iconUrl: undefined
    };
  }

  private static parseSpeed(speed: any): { walk?: number; fly?: number; swim?: number; burrow?: number; climb?: number } {
    if (typeof speed === 'object' && speed !== null) {
      return {
        walk: speed.walk || 30,
        fly: speed.fly,
        swim: speed.swim,
        burrow: speed.burrow,
        climb: speed.climb
      };
    }
    return { walk: 30 };
  }

  private static formatChallengeRating(cr: number): ChallengeRating {
    if (cr === 0) return '0';
    if (cr < 1) {
      if (cr === 0.125) return '1/8';
      if (cr === 0.25) return '1/4';
      if (cr === 0.5) return '1/2';
    }
    const crStr = cr.toString();
    // Убедимся, что возвращаемое значение соответствует типу ChallengeRating
    const validCRs: ChallengeRating[] = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'];
    return validCRs.includes(crStr as ChallengeRating) ? crStr as ChallengeRating : '0';
  }

  private static mapSizeToRussian(size: string): MonsterSize {
    const sizeMap: Record<string, MonsterSize> = {
      'tiny': 'Крошечный',
      'small': 'Маленький',
      'medium': 'Средний',
      'large': 'Большой',
      'huge': 'Огромный',
      'gargantuan': 'Гигантский'
    };
    return sizeMap[size.toLowerCase()] || 'Средний';
  }

  private static mapTypeToRussian(type: string): MonsterType {
    const typeMap: Record<string, MonsterType> = {
      'aberration': 'Аберрация',
      'beast': 'Зверь',
      'celestial': 'Небожитель',
      'construct': 'Конструкт',
      'dragon': 'Дракон',
      'elemental': 'Элементаль',
      'fey': 'Фея',
      'fiend': 'Исчадие',
      'giant': 'Великан',
      'humanoid': 'Гуманоид',
      'undead': 'Нежить',
      'plant': 'Растение',
      'ooze': 'Слизь',
      'monstrosity': 'Чудовище'
    };
    return typeMap[type.toLowerCase()] || 'Монстр';
  }

  private static calculateProficiencyBonus(cr: number): number {
    if (cr === 0) return 2;
    if (cr <= 4) return 2;
    if (cr <= 8) return 3;
    if (cr <= 12) return 4;
    if (cr <= 16) return 5;
    if (cr <= 20) return 6;
    if (cr <= 24) return 7;
    if (cr <= 28) return 8;
    return 9;
  }

  private static calculateExperiencePoints(cr: number): number {
    const xpMap: Record<number, number> = {
      0: 10,
      0.125: 25,
      0.25: 50,
      0.5: 100,
      1: 200,
      2: 450,
      3: 700,
      4: 1100,
      5: 1800,
      6: 2300,
      7: 2900,
      8: 3900,
      9: 5000,
      10: 5900,
      11: 7200,
      12: 8400,
      13: 10000,
      14: 11500,
      15: 13000,
      16: 15000,
      17: 18000,
      18: 20000,
      19: 22000,
      20: 25000,
      21: 33000,
      22: 41000,
      23: 50000,
      24: 62000,
      25: 75000,
      26: 90000,
      27: 105000,
      28: 120000,
      29: 135000,
      30: 155000
    };
    return xpMap[cr] || 10;
  }

  private static getTokenSize(size: string): number {
    switch (size.toLowerCase()) {
      case 'tiny': return 0.5;
      case 'small': return 1;
      case 'medium': return 1;
      case 'large': return 2;
      case 'huge': return 3;
      case 'gargantuan': return 4;
      default: return 1;
    }
  }
}