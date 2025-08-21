// Сервис для работы с TTG.Club API
import { TTGClubParser } from './ttgClubParser';
import type { Monster } from '@/types/monsters';

export class TTGClubService {
  private static readonly BASE_URL = 'https://ttg.club';
  private static readonly BESTIARY_URL = `${TTGClubService.BASE_URL}/bestiary`;

  static async fetchMonstersList(): Promise<string[]> {
    try {
      const response = await fetch(TTGClubService.BESTIARY_URL);
      const html = await response.text();
      
      // Парсим список монстров из HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const monsterLinks: string[] = [];
      const links = doc.querySelectorAll('a[href*="/bestiary/"]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('#') && href !== '/bestiary') {
          const monsterId = href.replace('/bestiary/', '');
          if (monsterId && !monsterLinks.includes(monsterId)) {
            monsterLinks.push(monsterId);
          }
        }
      });
      
      return monsterLinks;
    } catch (error) {
      console.error('Ошибка получения списка монстров:', error);
      return [];
    }
  }

  static async fetchMonster(monsterId: string): Promise<Monster | null> {
    try {
      const url = `${TTGClubService.BESTIARY_URL}/${monsterId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const html = await response.text();
      const ttgData = TTGClubParser.parseMonsterFromHTML(html);
      
      if (!ttgData) {
        console.warn(`Не удалось распарсить монстра: ${monsterId}`);
        return null;
      }
      
      return TTGClubParser.convertToMonster(ttgData);
    } catch (error) {
      console.error(`Ошибка загрузки монстра ${monsterId}:`, error);
      return null;
    }
  }

  static async fetchMultipleMonsters(monsterIds: string[], onProgress?: (loaded: number, total: number) => void): Promise<Monster[]> {
    const monsters: Monster[] = [];
    
    for (let i = 0; i < monsterIds.length; i++) {
      const monster = await this.fetchMonster(monsterIds[i]);
      if (monster) {
        monsters.push(monster);
      }
      
      if (onProgress) {
        onProgress(i + 1, monsterIds.length);
      }
      
      // Добавляем небольшую задержку, чтобы не перегружать сервер
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return monsters;
  }

  static async searchMonsters(query: string): Promise<Monster[]> {
    try {
      const searchUrl = `${TTGClubService.BESTIARY_URL}?search=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const monsterIds: string[] = [];
      const links = doc.querySelectorAll('a[href*="/bestiary/"]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('#') && href !== '/bestiary') {
          const monsterId = href.replace('/bestiary/', '');
          if (monsterId && !monsterIds.includes(monsterId)) {
            monsterIds.push(monsterId);
          }
        }
      });
      
      // Загружаем найденных монстров
      return await this.fetchMultipleMonsters(monsterIds.slice(0, 20)); // Ограничиваем до 20 результатов
    } catch (error) {
      console.error('Ошибка поиска монстров:', error);
      return [];
    }
  }

  static async importRandomMonsters(count: number = 50): Promise<Monster[]> {
    const allMonsterIds = await this.fetchMonstersList();
    
    if (allMonsterIds.length === 0) {
      console.warn('Не найдено монстров для импорта');
      return [];
    }
    
    // Перемешиваем и берем случайную выборку
    const shuffled = allMonsterIds.sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, count);
    
    console.log(`Импортируем ${selectedIds.length} монстров из TTG.Club...`);
    
    return await this.fetchMultipleMonsters(selectedIds, (loaded, total) => {
      console.log(`Загружено ${loaded}/${total} монстров`);
    });
  }
}