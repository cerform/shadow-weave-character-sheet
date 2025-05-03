
export interface Session {
  id: string;
  campaignId?: string; // Добавляем ID кампании
  title: string;
  description: string;
  dmId: string;
  players: string[];
  startTime: string;
  endTime?: string;
  isActive: boolean;
  notes: {
    id: string;
    content: string;
    timestamp: string;
    authorId: string;
  }[];
  mapId?: string;
  lastActivity?: string;
  createdAt: string;
  code?: string;
}
