/**
 * Сервис загрузки монстров из D&D 5e API
 */

export interface MonsterData {
  name: string;
  size: string;
  type: string;
  hit_points: number;
  armor_class: number[];
  speed: Record<string, string>;
  challenge_rating: number;
}

export class BestiaryService {
  private baseUrl = 'https://www.dnd5eapi.co/api/monsters';
  private cache: Map<string, MonsterData> = new Map();

  async loadMonster(index: string): Promise<MonsterData | null> {
    if (this.cache.has(index)) {
      return this.cache.get(index)!;
    }

    try {
      const response = await fetch(`${this.baseUrl}/${index}`);
      const data = await response.json();
      
      const monster: MonsterData = {
        name: data.name,
        size: data.size,
        type: data.type,
        hit_points: data.hit_points,
        armor_class: data.armor_class,
        speed: data.speed,
        challenge_rating: data.challenge_rating,
      };

      this.cache.set(index, monster);
      return monster;
    } catch {
      return null;
    }
  }

  async searchMonsters(query: string): Promise<Array<{index: string, name: string}>> {
    try {
      const response = await fetch(`${this.baseUrl}?name=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.results || [];
    } catch {
      return [];
    }
  }
}