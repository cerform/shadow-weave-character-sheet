import { MonstersService } from './monstersService';
import type { Monster } from '@/types/monsters';

export class MonsterImportService {
  /**
   * Извлекает имена монстров из текстового списка
   */
  static extractMonsterNamesFromList(listText: string): string[] {
    const lines = listText.split('\n').filter(line => line.trim());
    const monsterNames: string[] = [];
    
    for (const line of lines) {
      // Ищем русское название до скобок или дефиса
      let russianName = line.trim();
      
      // Убираем все после скобок [English Name]
      const bracketIndex = russianName.indexOf('[');
      if (bracketIndex > 0) {
        russianName = russianName.substring(0, bracketIndex).trim();
      }
      
      // Убираем все после дефиса (если есть)
      const dashIndex = russianName.indexOf('—');
      if (dashIndex > 0) {
        russianName = russianName.substring(0, dashIndex).trim();
      }
      
      // Убираем CR и другие метки
      russianName = russianName.replace(/\s*(CR\s*\d+.*|Basic|HB|UA|3rd)$/, '').trim();
      
      if (russianName && russianName !== '—' && russianName !== '-') {
        monsterNames.push(russianName);
      }
    }
    
    return monsterNames;
  }

  /**
   * Импортирует монстров из списка, используя базу данных Supabase
   */
  static async importMonstersFromList(
    listText: string, 
    onProgress?: (loaded: number, total: number) => void
  ): Promise<Monster[]> {
    const monsterNames = this.extractMonsterNamesFromList(listText);
    
    if (monsterNames.length === 0) {
      console.warn('Не найдено монстров в списке для импорта');
      return [];
    }
    
    console.log(`Импортируем ${monsterNames.length} монстров из списка:`, monsterNames);
    
    try {
      // Загружаем всех монстров из базы данных
      const allMonsters = await MonstersService.getAllCreatures();
      const foundMonsters: Monster[] = [];
      
      for (let i = 0; i < monsterNames.length; i++) {
        const searchName = monsterNames[i].toLowerCase();
        
        // Ищем монстра по имени (с нечеткой логикой)
        const monster = allMonsters.find(m => {
          const monsterName = m.name.toLowerCase();
          return monsterName.includes(searchName) || 
                 searchName.includes(monsterName) ||
                 this.normalizeMonsterName(monsterName) === this.normalizeMonsterName(searchName);
        });
        
        if (monster) {
          foundMonsters.push(monster);
          console.log(`Найден монстр: ${monster.name}`);
        } else {
          console.warn(`Не найден монстр: ${monsterNames[i]}`);
        }
        
        // Обновляем прогресс
        if (onProgress) {
          onProgress(i + 1, monsterNames.length);
        }
      }
      
      console.log(`Импортировано ${foundMonsters.length} из ${monsterNames.length} монстров`);
      return foundMonsters;
      
    } catch (error) {
      console.error('Ошибка импорта монстров из базы данных:', error);
      return [];
    }
  }

  /**
   * Нормализует имя монстра для лучшего сопоставления
   */
  private static normalizeMonsterName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^а-яёa-z0-9\s]/g, '') // Убираем специальные символы
      .replace(/\s+/g, ' ') // Нормализуем пробелы
      .trim();
  }

  /**
   * Ищет монстров по частичному совпадению имени
   */
  static async searchMonstersByName(query: string): Promise<Monster[]> {
    try {
      const allMonsters = await MonstersService.getAllCreatures();
      const normalizedQuery = this.normalizeMonsterName(query);
      
      return allMonsters.filter(monster => {
        const normalizedName = this.normalizeMonsterName(monster.name);
        return normalizedName.includes(normalizedQuery) || 
               normalizedQuery.includes(normalizedName);
      });
    } catch (error) {
      console.error('Ошибка поиска монстров:', error);
      return [];
    }
  }
}