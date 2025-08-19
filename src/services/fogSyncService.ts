import { VisibleArea, FogSettings } from '@/stores/fogOfWarStore';

interface FogUpdateData {
  visibleAreas: VisibleArea[];
  fogSettings: FogSettings;
  updatedBy: string;
  timestamp: number;
}

type FogUpdateCallback = (data: FogUpdateData) => void;

class FogSyncService {
  private sessionId: string | null = null;
  private callbacks: Set<FogUpdateCallback> = new Set();
  public userId: string = Math.random().toString(36).substr(2, 9);
  private connected = false;

  async initialize(sessionId: string): Promise<void> {
    this.sessionId = sessionId;
    this.connected = true;
    console.log('🔄 Fog sync service initialized for session:', sessionId);
  }

  onFogUpdate(callback: FogUpdateCallback): void {
    this.callbacks.add(callback);
  }

  offFogUpdate(callback: FogUpdateCallback): void {
    this.callbacks.delete(callback);
  }

  broadcastFogUpdate(visibleAreas: VisibleArea[], fogSettings: FogSettings): void {
    if (!this.connected || !this.sessionId) return;

    const updateData: FogUpdateData = {
      visibleAreas,
      fogSettings,
      updatedBy: this.userId,
      timestamp: Date.now()
    };

    // В реальной реализации здесь будет отправка через WebSocket или другой механизм
    // Для демонстрации просто логируем
    console.log('📡 Broadcasting fog update:', updateData);
    
    // Симулируем получение обновления от другого клиента (только для тестирования)
    // В реальности это будет происходить через сетевое соединение
    setTimeout(() => {
      this.callbacks.forEach(callback => {
        if (Math.random() > 0.9) { // 10% вероятность симуляции внешнего обновления
          callback({
            ...updateData,
            updatedBy: 'external_user_' + Math.random().toString(36).substr(2, 4)
          });
        }
      });
    }, 1000);
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.sessionId = null;
    this.callbacks.clear();
    console.log('🔌 Fog sync service disconnected');
  }
}

export const fogSyncService = new FogSyncService();