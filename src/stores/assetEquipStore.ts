import { create } from 'zustand';
import { SlotName } from '@/utils/CharacterManager';

export interface AssetEquipItem {
  id: string;
  type: 'character' | 'equipment';
  url: string;
  targetCharId?: string;
  slot?: SlotName;
  boneName?: string;
  offset?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

interface AssetEquipState {
  queue: AssetEquipItem[];
  processing: boolean;
  
  // Actions
  addToQueue: (item: AssetEquipItem) => void;
  processNext: () => AssetEquipItem | undefined;
  setProcessing: (processing: boolean) => void;
  clearQueue: () => void;
}

export const useAssetEquipStore = create<AssetEquipState>((set, get) => ({
  queue: [],
  processing: false,

  addToQueue: (item) => 
    set((state) => ({ 
      queue: [...state.queue, item] 
    })),

  processNext: () => {
    const { queue } = get();
    if (queue.length === 0) return undefined;
    
    const [next, ...rest] = queue;
    set({ queue: rest });
    return next;
  },

  setProcessing: (processing) => set({ processing }),

  clearQueue: () => set({ queue: [] })
}));

// Helper functions for common equipment additions
export const equipmentHelpers = {
  addCharacter: (id: string, url: string) => {
    useAssetEquipStore.getState().addToQueue({
      id,
      type: 'character',
      url
    });
  },

  addEquipment: (
    targetCharId: string, 
    url: string, 
    slot: SlotName, 
    options?: {
      boneName?: string;
      offset?: [number, number, number];
      rotation?: [number, number, number];
      scale?: number;
    }
  ) => {
    useAssetEquipStore.getState().addToQueue({
      id: crypto.randomUUID(),
      type: 'equipment',
      url,
      targetCharId,
      slot,
      boneName: options?.boneName,
      offset: options?.offset,
      rotation: options?.rotation,
      scale: options?.scale
    });
  }
};