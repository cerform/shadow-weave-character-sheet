// Парсер данных с TTG.Club
import type { Monster } from '@/types/monsters';

interface TTGMonsterData {
  name: string;
  nameEn: string;
  size: string;
  type: string;
  alignment: string;
  ac: number;
  hp: string;
  speed: string;
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  skills?: string;
  senses?: string;
  languages?: string;
  cr: string;
  actions?: Array<{
    name: string;
    description: string;
  }>;
  traits?: Array<{
    name: string;
    description: string;
  }>;
  reactions?: Array<{
    name: string;
    description: string;
  }>;
  source?: string;
}

export class TTGClubParser {
  static parseMonsterFromHTML(html: string): TTGMonsterData | null {
    try {
      // Создаем временный DOM элемент для парсинга
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Извлекаем название
      const nameElement = doc.querySelector('h1, .monster-name');
      const name = nameElement?.textContent?.trim() || '';

      // Ищем основную информацию о монстре
      const statsSection = doc.querySelector('.monster-stats, .stats-block') || doc.body;
      
      // Парсим основные характеристики
      const acMatch = statsSection.textContent?.match(/Класс доспеха[:\s]*(\d+)/i);
      const hpMatch = statsSection.textContent?.match(/Хиты[:\s]*(\d+(?:\s*\([^)]+\))?)/i);
      const speedMatch = statsSection.textContent?.match(/Скорость[:\s]*([^.]+)/i);
      const crMatch = statsSection.textContent?.match(/Уровень опасности[:\s]*([^\n\r]+)/i);

      // Парсим характеристики (СИЛ, ЛОВ, ТЕЛ, ИНТ, МДР, ХАР)
      const abilities = {
        str: this.parseAbility(statsSection, 'СИЛ'),
        dex: this.parseAbility(statsSection, 'ЛОВ'),
        con: this.parseAbility(statsSection, 'ТЕЛ'),
        int: this.parseAbility(statsSection, 'ИНТ'),
        wis: this.parseAbility(statsSection, 'МДР'),
        cha: this.parseAbility(statsSection, 'ХАР')
      };

      // Парсим действия
      const actions = this.parseActions(statsSection);
      const traits = this.parseTraits(statsSection);
      const reactions = this.parseReactions(statsSection);

      return {
        name,
        nameEn: this.extractEnglishName(name) || name.toLowerCase().replace(/\s+/g, '_'),
        size: this.parseSize(statsSection),
        type: this.parseType(statsSection),
        alignment: this.parseAlignment(statsSection),
        ac: parseInt(acMatch?.[1] || '10'),
        hp: hpMatch?.[1] || '1',
        speed: speedMatch?.[1]?.trim() || '30 фт.',
        abilities,
        skills: this.parseSkills(statsSection),
        senses: this.parseSenses(statsSection),
        languages: this.parseLanguages(statsSection),
        cr: crMatch?.[1]?.trim() || '0',
        actions,
        traits,
        reactions
      };
    } catch (error) {
      console.error('Ошибка парсинга монстра:', error);
      return null;
    }
  }

  private static parseAbility(element: Element, abilityName: string): number {
    const text = element.textContent || '';
    const regex = new RegExp(`${abilityName}[\\s\\n]*?(\\d+)\\s*\\([+-]?\\d+\\)`, 'i');
    const match = text.match(regex);
    return parseInt(match?.[1] || '10');
  }

  private static parseSize(element: Element): string {
    const text = element.textContent || '';
    const sizeMatch = text.match(/(Крошечный|Маленький|Средний|Большой|Огромный|Громадный)/i);
    return sizeMatch?.[1] || 'Средний';
  }

  private static parseType(element: Element): string {
    const text = element.textContent || '';
    const typeMatch = text.match(/(гуманоид|зверь|дракон|великан|исчадие|нежить|элементаль|фея|растение|чудовище|конструкт|слизь|аберрация)/i);
    return typeMatch?.[1] || 'Гуманоид';
  }

  private static parseAlignment(element: Element): string {
    const text = element.textContent || '';
    const alignmentMatch = text.match(/(законно-добрый|нейтрально-добрый|хаотично-добрый|законно-нейтральный|истинно нейтральный|хаотично-нейтральный|законно-злой|нейтрально-злой|хаотично-злой|без мировоззрения)/i);
    return alignmentMatch?.[1] || 'без мировоззрения';
  }

  private static parseSkills(element: Element): string | undefined {
    const text = element.textContent || '';
    const skillsMatch = text.match(/Навыки[:\s]*([^\n\r]+)/i);
    return skillsMatch?.[1]?.trim();
  }

  private static parseSenses(element: Element): string | undefined {
    const text = element.textContent || '';
    const sensesMatch = text.match(/Чувства[:\s]*([^\n\r]+)/i);
    return sensesMatch?.[1]?.trim();
  }

  private static parseLanguages(element: Element): string | undefined {
    const text = element.textContent || '';
    const languagesMatch = text.match(/Языки[:\s]*([^\n\r]+)/i);
    return languagesMatch?.[1]?.trim();
  }

  private static parseActions(element: Element): Array<{name: string, description: string}> {
    const actions: Array<{name: string, description: string}> = [];
    const text = element.textContent || '';
    
    // Ищем секцию действий
    const actionsMatch = text.match(/Действия([\s\S]*?)(?=Реакции|Легендарные действия|$)/i);
    if (actionsMatch) {
      const actionsText = actionsMatch[1];
      // Парсим отдельные действия
      const actionMatches = actionsText.matchAll(/^([^.]+)\.\s*(.+?)(?=^[А-ЯЁ]|$)/gmi);
      for (const match of actionMatches) {
        actions.push({
          name: match[1].trim(),
          description: match[2].trim()
        });
      }
    }
    
    return actions;
  }

  private static parseTraits(element: Element): Array<{name: string, description: string}> {
    const traits: Array<{name: string, description: string}> = [];
    const text = element.textContent || '';
    
    // Ищем черты перед действиями
    const traitsMatch = text.match(/(?:Черты|Особенности)([\s\S]*?)(?=Действия|$)/i);
    if (traitsMatch) {
      const traitsText = traitsMatch[1];
      const traitMatches = traitsText.matchAll(/^([^.]+)\.\s*(.+?)(?=^[А-ЯЁ]|$)/gmi);
      for (const match of traitMatches) {
        traits.push({
          name: match[1].trim(),
          description: match[2].trim()
        });
      }
    }
    
    return traits;
  }

  private static parseReactions(element: Element): Array<{name: string, description: string}> {
    const reactions: Array<{name: string, description: string}> = [];
    const text = element.textContent || '';
    
    const reactionsMatch = text.match(/Реакции([\s\S]*?)(?=Легендарные действия|$)/i);
    if (reactionsMatch) {
      const reactionsText = reactionsMatch[1];
      const reactionMatches = reactionsText.matchAll(/^([^.]+)\.\s*(.+?)(?=^[А-ЯЁ]|$)/gmi);
      for (const match of reactionMatches) {
        reactions.push({
          name: match[1].trim(),
          description: match[2].trim()
        });
      }
    }
    
    return reactions;
  }

  private static extractEnglishName(name: string): string | null {
    const match = name.match(/\[([^\]]+)\]/);
    return match ? match[1].toLowerCase().replace(/\s+/g, '_') : null;
  }

  static convertToMonster(ttgData: TTGMonsterData): Monster {
    return {
      id: ttgData.nameEn || ttgData.name.toLowerCase().replace(/\s+/g, '_'),
      name: ttgData.name,
      nameEn: ttgData.nameEn,
      size: ttgData.size as any,
      type: ttgData.type as any,
      alignment: ttgData.alignment,
      armorClass: ttgData.ac,
      hitPoints: this.parseHitPoints(ttgData.hp),
      hitDice: this.extractHitDice(ttgData.hp),
      speed: this.parseSpeed(ttgData.speed),
      abilities: {
        strength: ttgData.abilities.str,
        dexterity: ttgData.abilities.dex,
        constitution: ttgData.abilities.con,
        intelligence: ttgData.abilities.int,
        wisdom: ttgData.abilities.wis,
        charisma: ttgData.abilities.cha
      },
      senses: this.convertSenses(ttgData.senses),
      languages: ttgData.languages ? ttgData.languages.split(',').map(l => l.trim()) : [],
      challengeRating: this.normalizeCR(ttgData.cr) as any,
      experiencePoints: this.calculateXP(ttgData.cr),
      proficiencyBonus: this.calculateProficiencyBonus(ttgData.cr),
      actions: ttgData.actions?.map(action => ({
        name: action.name,
        description: action.description,
        attackBonus: this.extractAttackBonus(action.description),
        damage: this.extractDamage(action.description),
        damageType: this.extractDamageType(action.description)
      })) || [],
      traits: ttgData.traits,
      source: ttgData.source || 'TTG.Club',
      environment: [],
      tokenSize: this.calculateTokenSize(ttgData.size)
    };
  }

  private static parseHitPoints(hp: string): number {
    const match = hp.match(/(\d+)/);
    return parseInt(match?.[1] || '1');
  }

  private static extractHitDice(hp: string): string {
    const match = hp.match(/\(([^)]+)\)/);
    return match?.[1] || '1d8';
  }

  private static parseSpeed(speed: string): { walk?: number; fly?: number; swim?: number } {
    const result: { walk?: number; fly?: number; swim?: number } = {};
    
    const walkMatch = speed.match(/(\d+)\s*фт/);
    if (walkMatch) result.walk = parseInt(walkMatch[1]);
    
    const flyMatch = speed.match(/полёт\s+(\d+)\s*фт/i);
    if (flyMatch) result.fly = parseInt(flyMatch[1]);
    
    const swimMatch = speed.match(/плавание\s+(\d+)\s*фт/i);
    if (swimMatch) result.swim = parseInt(swimMatch[1]);
    
    return result;
  }

  private static convertSenses(senses?: string): { darkvision?: number; passivePerception: number } {
    const result: { darkvision?: number; passivePerception: number } = {
      passivePerception: 10
    };
    
    if (senses) {
      const darkvisionMatch = senses.match(/темновидение\s+(\d+)/i);
      if (darkvisionMatch) result.darkvision = parseInt(darkvisionMatch[1]);
      
      const passiveMatch = senses.match(/пассивная\s+внимательность\s+(\d+)/i);
      if (passiveMatch) result.passivePerception = parseInt(passiveMatch[1]);
    }
    
    return result;
  }

  private static normalizeCR(cr: string): string {
    if (cr === '—' || cr === '-' || !cr.trim()) return '0';
    return cr.trim();
  }

  private static calculateXP(cr: string): number {
    const xpTable: Record<string, number> = {
      '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
      '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
      '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900
    };
    return xpTable[this.normalizeCR(cr)] || 10;
  }

  private static calculateProficiencyBonus(cr: string): number {
    const crNum = this.getCRNumericValue(this.normalizeCR(cr));
    if (crNum <= 4) return 2;
    if (crNum <= 8) return 3;
    if (crNum <= 12) return 4;
    if (crNum <= 16) return 5;
    return 6;
  }

  private static getCRNumericValue(cr: string): number {
    if (cr === '0') return 0;
    if (cr === '1/8') return 0.125;
    if (cr === '1/4') return 0.25;
    if (cr === '1/2') return 0.5;
    return parseInt(cr) || 0;
  }

  private static extractAttackBonus(description: string): number | undefined {
    const match = description.match(/[+](\d+)\s*к\s*попаданию/i);
    return match ? parseInt(match[1]) : undefined;
  }

  private static extractDamage(description: string): string | undefined {
    const match = description.match(/(\d+(?:\s*\([^)]+\))?)\s*\w+\s*урон/i);
    return match?.[1];
  }

  private static extractDamageType(description: string): string | undefined {
    const match = description.match(/(\w+)\s*урон/i);
    return match?.[1];
  }

  private static calculateTokenSize(size: string): number {
    const sizeMap: Record<string, number> = {
      'Крошечный': 0.5,
      'Маленький': 1,
      'Средний': 1,
      'Большой': 2,
      'Огромный': 3,
      'Громадный': 4
    };
    return sizeMap[size] || 1;
  }
}