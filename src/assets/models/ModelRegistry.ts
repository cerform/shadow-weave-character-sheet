/**
 * Родовой маппинг монстров D&D 5e на 3D модели
 * Автоматическая привязка: тип существа → 3D модель
 */

export interface ModelMapping {
  path: string;
  scale: number;
  yOffset: number;
  fallbackColor?: string;
}

// Основные семейства существ и их модели
export const CREATURE_FAMILIES: Record<string, ModelMapping> = {
  // Гуманоиды
  human: { path: '/models/creatures/human.glb', scale: 1.0, yOffset: 0 },
  elf: { path: '/models/creatures/elf.glb', scale: 1.0, yOffset: 0 },
  dwarf: { path: '/models/creatures/dwarf.glb', scale: 0.9, yOffset: 0 },
  halfling: { path: '/models/creatures/halfling.glb', scale: 0.8, yOffset: 0 },
  
  // Гоблиноиды
  goblin: { path: '/models/creatures/goblin.glb', scale: 0.8, yOffset: 0, fallbackColor: '#8B4513' },
  hobgoblin: { path: '/models/creatures/hobgoblin.glb', scale: 1.1, yOffset: 0, fallbackColor: '#8B0000' },
  orc: { path: '/models/creatures/orc.glb', scale: 1.2, yOffset: 0, fallbackColor: '#556B2F' },
  bugbear: { path: '/models/creatures/bugbear.glb', scale: 1.3, yOffset: 0, fallbackColor: '#654321' },
  
  // Нежить
  skeleton: { path: '/models/creatures/skeleton.glb', scale: 1.0, yOffset: 0, fallbackColor: '#F5F5DC' },
  zombie: { path: '/models/creatures/zombie.glb', scale: 1.0, yOffset: 0, fallbackColor: '#696969' },
  ghoul: { path: '/models/creatures/ghoul.glb', scale: 1.0, yOffset: 0, fallbackColor: '#2F4F4F' },
  wight: { path: '/models/creatures/wight.glb', scale: 1.0, yOffset: 0, fallbackColor: '#1C1C1C' },
  
  // Звери
  wolf: { path: '/models/creatures/wolf.glb', scale: 1.0, yOffset: 0, fallbackColor: '#708090' },
  bear: { path: '/models/creatures/bear.glb', scale: 1.5, yOffset: 0, fallbackColor: '#8B4513' },
  lion: { path: '/models/creatures/lion.glb', scale: 1.3, yOffset: 0, fallbackColor: '#DAA520' },
  eagle: { path: '/models/creatures/eagle.glb', scale: 0.8, yOffset: 0.5, fallbackColor: '#8B4513' },
  
  // Драконы
  dragon: { path: '/models/creatures/dragon.glb', scale: 3.0, yOffset: 0, fallbackColor: '#8B0000' },
  wyrmling: { path: '/models/creatures/dragon_young.glb', scale: 1.5, yOffset: 0, fallbackColor: '#8B0000' },
  
  // Великаны
  giant: { path: '/models/creatures/giant.glb', scale: 2.5, yOffset: 0, fallbackColor: '#A0522D' },
  ogre: { path: '/models/creatures/ogre.glb', scale: 2.0, yOffset: 0, fallbackColor: '#8B4513' },
  troll: { path: '/models/creatures/troll.glb', scale: 2.2, yOffset: 0, fallbackColor: '#228B22' },
  
  // Аберрации
  beholder: { path: '/models/creatures/beholder.glb', scale: 2.0, yOffset: 1.0, fallbackColor: '#8B008B' },
  mindflayer: { path: '/models/creatures/mindflayer.glb', scale: 1.1, yOffset: 0, fallbackColor: '#4B0082' },
  
  // Элементали
  elemental: { path: '/models/creatures/elemental.glb', scale: 1.5, yOffset: 0, fallbackColor: '#4169E1' },
  
  // По умолчанию
  default: { path: '/models/creatures/default.glb', scale: 1.0, yOffset: 0, fallbackColor: '#696969' },
};

// Специфичные маппинги для конкретных монстров
export const SPECIFIC_MAPPINGS: Record<string, ModelMapping> = {
  // Знаменитые монстры
  'tarrasque': { path: '/models/creatures/tarrasque.glb', scale: 4.0, yOffset: 0, fallbackColor: '#8B0000' },
  'lich': { path: '/models/creatures/lich.glb', scale: 1.0, yOffset: 0, fallbackColor: '#2F4F4F' },
  'ancient-red-dragon': { path: '/models/creatures/ancient_dragon.glb', scale: 5.0, yOffset: 0, fallbackColor: '#DC143C' },
  
  // Классические D&D монстры
  'owlbear': { path: '/models/creatures/owlbear.glb', scale: 1.8, yOffset: 0, fallbackColor: '#8B4513' },
  'bulette': { path: '/models/creatures/bulette.glb', scale: 1.6, yOffset: 0, fallbackColor: '#A0522D' },
  'displacer-beast': { path: '/models/creatures/displacer_beast.glb', scale: 1.4, yOffset: 0, fallbackColor: '#4B0082' },
  'rust-monster': { path: '/models/creatures/rust_monster.glb', scale: 1.2, yOffset: 0, fallbackColor: '#B8860B' },
  
  // Планарные существа
  'balor': { path: '/models/creatures/balor.glb', scale: 2.8, yOffset: 0, fallbackColor: '#8B0000' },
  'solar': { path: '/models/creatures/solar.glb', scale: 2.0, yOffset: 0.5, fallbackColor: '#FFD700' },
  'pit-fiend': { path: '/models/creatures/pit_fiend.glb', scale: 2.5, yOffset: 0, fallbackColor: '#8B0000' },
};

export class ModelRegistry {
  private loadedModels: Map<string, boolean> = new Map();
  private failedModels: Set<string> = new Set();

  /**
   * Получение маппинга модели для монстра
   */
  getModelMapping(monsterName: string, monsterType: string): ModelMapping {
    const normalizedName = this.normalizeMonsterName(monsterName);
    
    // Сначала проверяем специфичные маппинги
    if (SPECIFIC_MAPPINGS[normalizedName]) {
      return SPECIFIC_MAPPINGS[normalizedName];
    }
    
    // Затем проверяем по типу/семейству
    const family = this.getCreatureFamily(normalizedName, monsterType);
    return CREATURE_FAMILIES[family] || CREATURE_FAMILIES.default;
  }

  /**
   * Нормализация имени монстра для поиска
   */
  private normalizeMonsterName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  /**
   * Определение семейства существа на основе имени и типа
   */
  private getCreatureFamily(normalizedName: string, type: string): string {
    // Проверяем по имени
    for (const family of Object.keys(CREATURE_FAMILIES)) {
      if (normalizedName.includes(family)) {
        return family;
      }
    }

    // Проверяем по типу
    const typeMapping: Record<string, string> = {
      'humanoid': 'human',
      'undead': 'skeleton',
      'beast': 'wolf',
      'dragon': 'dragon',
      'giant': 'giant',
      'aberration': 'beholder',
      'elemental': 'elemental',
      'fiend': 'balor',
      'celestial': 'solar',
      'fey': 'elf',
      'monstrosity': 'owlbear',
      'ooze': 'default',
      'plant': 'default',
      'construct': 'default',
    };

    return typeMapping[type.toLowerCase()] || 'default';
  }

  /**
   * Проверка доступности модели
   */
  async checkModelAvailability(path: string): Promise<boolean> {
    if (this.loadedModels.has(path)) {
      return this.loadedModels.get(path)!;
    }

    if (this.failedModels.has(path)) {
      return false;
    }

    try {
      const response = await fetch(path, { method: 'HEAD' });
      const isAvailable = response.ok;
      
      this.loadedModels.set(path, isAvailable);
      if (!isAvailable) {
        this.failedModels.add(path);
      }
      
      return isAvailable;
    } catch {
      this.failedModels.add(path);
      return false;
    }
  }

  /**
   * Получение fallback модели если основная недоступна
   */
  getFallbackMapping(originalMapping: ModelMapping): ModelMapping {
    return {
      ...CREATURE_FAMILIES.default,
      fallbackColor: originalMapping.fallbackColor || CREATURE_FAMILIES.default.fallbackColor,
    };
  }

  /**
   * Получение всех доступных семейств
   */
  getAllFamilies(): string[] {
    return Object.keys(CREATURE_FAMILIES);
  }

  /**
   * Получение статистики загруженных моделей
   */
  getStatistics(): {
    totalFamilies: number;
    specificMappings: number;
    loadedModels: number;
    failedModels: number;
  } {
    return {
      totalFamilies: Object.keys(CREATURE_FAMILIES).length,
      specificMappings: Object.keys(SPECIFIC_MAPPINGS).length,
      loadedModels: this.loadedModels.size,
      failedModels: this.failedModels.size,
    };
  }

  /**
   * Предзагрузка популярных моделей
   */
  async preloadCommonModels(): Promise<void> {
    const commonModels = [
      'goblin', 'orc', 'skeleton', 'zombie', 'wolf', 'human', 'default'
    ];

    const preloadPromises = commonModels.map(async (family) => {
      const mapping = CREATURE_FAMILIES[family];
      if (mapping) {
        await this.checkModelAvailability(mapping.path);
      }
    });

    await Promise.allSettled(preloadPromises);
    console.log('🎭 Preloaded common monster models');
  }

  /**
   * Очистка кэша
   */
  clearCache(): void {
    this.loadedModels.clear();
    this.failedModels.clear();
  }
}