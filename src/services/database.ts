
import { UserProfile, DMMaster, CampaignInfo, SessionHistoryItem } from "@/types/user";
import { CharacterSheet } from "@/types/character";
import { Session } from "@/types/session";

// Имитация локального хранилища данных (в реальном приложении тут будет Firebase/Supabase)
const LOCAL_STORAGE_KEYS = {
  USERS: 'dnd_app_users',
  DM_MASTERS: 'dnd_app_dm_masters',
  CHARACTERS: 'dnd-characters', // Обновляем ключ для соответствия с CharacterContext
  CAMPAIGNS: 'dnd_app_campaigns',
  SESSIONS: 'dnd_app_sessions',
  CURRENT_USER: 'dnd_app_current_user'
};

// Базовый класс для работы с данными
class BaseDatabase<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  // Получить все записи
  getAll(): T[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  // Получить запись по ID
  getById(id: string): T | null {
    const records = this.getAll();
    const record = records.find((r: any) => r.id === id);
    return record || null;
  }

  // Добавить новую запись
  add(record: T): T {
    const records = this.getAll();
    records.push(record);
    localStorage.setItem(this.key, JSON.stringify(records));
    return record;
  }

  // Обновить запись
  update(id: string, updates: Partial<T>): T | null {
    const records = this.getAll();
    const index = records.findIndex((r: any) => r.id === id);
    
    if (index >= 0) {
      records[index] = { ...records[index], ...updates };
      localStorage.setItem(this.key, JSON.stringify(records));
      return records[index];
    }
    
    return null;
  }

  // Удалить запись
  delete(id: string): boolean {
    const records = this.getAll();
    const filtered = records.filter((r: any) => r.id !== id);
    
    if (filtered.length !== records.length) {
      localStorage.setItem(this.key, JSON.stringify(filtered));
      return true;
    }
    
    return false;
  }
}

// Класс для работы с пользователями
export class UserDatabase extends BaseDatabase<UserProfile> {
  constructor() {
    super(LOCAL_STORAGE_KEYS.USERS);
  }
  
  // Получить пользователя по email
  getByEmail(email: string): UserProfile | null {
    const users = this.getAll();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }
  
  // Сохранить текущего пользователя
  setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    }
  }
  
  // Получить текущего пользователя
  getCurrentUser(): UserProfile | null {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }
}

// Класс для работы с мастерами подземелий
export class DMDatabase extends BaseDatabase<DMMaster> {
  constructor() {
    super(LOCAL_STORAGE_KEYS.DM_MASTERS);
  }
  
  // Получить мастера по email
  getByEmail(email: string): DMMaster | null {
    const masters = this.getAll();
    const master = masters.find(m => m.email.toLowerCase() === email.toLowerCase());
    return master || null;
  }
}

// Класс для работы с персонажами
export class CharacterDatabase extends BaseDatabase<CharacterSheet> {
  constructor() {
    super(LOCAL_STORAGE_KEYS.CHARACTERS);
  }
  
  // Получить персонажей пользователя
  getByUserId(userId: string): CharacterSheet[] {
    const characters = this.getAll();
    return characters.filter(char => char.userId === userId);
  }
}

// Класс для работы с кампаниями
export class CampaignDatabase extends BaseDatabase<CampaignInfo> {
  constructor() {
    super(LOCAL_STORAGE_KEYS.CAMPAIGNS);
  }
  
  // Получить кампании мастера
  getByDMId(dmId: string): CampaignInfo[] {
    const campaigns = this.getAll();
    return campaigns.filter(campaign => campaign.dmId === dmId);
  }
  
  // Получить кампании игрока
  getByPlayerId(playerId: string): CampaignInfo[] {
    const campaigns = this.getAll();
    return campaigns.filter(campaign => campaign.players.includes(playerId));
  }
}

// Класс для работы с сессиями
export class SessionDatabase extends BaseDatabase<Session> {
  constructor() {
    super(LOCAL_STORAGE_KEYS.SESSIONS);
  }
  
  // Получить сессии кампании
  getByCampaignId(campaignId: string): Session[] {
    const sessions = this.getAll();
    return sessions.filter(session => session.campaignId === campaignId);
  }
}

// Экземпляры баз данных для экспорта
export const userDB = new UserDatabase();
export const dmDB = new DMDatabase();
export const characterDB = new CharacterDatabase();
export const campaignDB = new CampaignDatabase();
export const sessionDB = new SessionDatabase();
