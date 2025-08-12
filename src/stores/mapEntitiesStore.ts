import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type EntityType = 'character' | 'monster' | 'prop' | 'terrain' | 'fx';

export interface MapEntity {
  id: string;
  map_id: string;
  asset_id: string;
  type: EntityType;
  owner_id?: string | null;
  x: number; y: number; z: number;
  rot_x?: number; rot_y?: number; rot_z?: number;
  scale_x?: number | null; scale_y?: number | null; scale_z?: number | null;
  hp?: number | null; max_hp?: number | null; ac?: number | null; initiative?: number | null;
  data?: any;
  is_locked?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MapEntitiesState {
  entities: MapEntity[];
  loading: boolean;
  channelId?: string;
  loadEntities: (mapId: string) => Promise<void>;
  subscribe: (mapId: string) => () => void;
  addEntity: (payload: Omit<MapEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEntity: (id: string, patch: Partial<MapEntity>) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
}

export const useMapEntitiesStore = create<MapEntitiesState>((set, get) => ({
  entities: [],
  loading: false,

  loadEntities: async (mapId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('map_entities')
      .select('*')
      .eq('map_id', mapId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Ошибка загрузки сущностей карты:', error.message);
      set({ loading: false });
      return;
    }
    set({ entities: (data || []) as any, loading: false });
  },

  subscribe: (mapId: string) => {
    // Realtime подписка на изменения
    const filter = `map_id=eq.${mapId}`;
    const channel = supabase
      .channel(`map-entities-${mapId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'map_entities', filter }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload as any;
        set((state) => {
          if (eventType === 'INSERT') {
            return { entities: [...state.entities, newRow] };
          }
          if (eventType === 'UPDATE') {
            return { entities: state.entities.map(e => e.id === newRow.id ? newRow : e) };
          }
          if (eventType === 'DELETE') {
            return { entities: state.entities.filter(e => e.id !== oldRow.id) };
          }
          return state;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  addEntity: async (payload) => {
    const clean = JSON.parse(JSON.stringify(payload));
    const { error } = await supabase.from('map_entities').insert([clean]);
    if (error) console.error('Ошибка добавления сущности:', error.message);
  },

  updateEntity: async (id, patch) => {
    const clean = JSON.parse(JSON.stringify(patch));
    const { error } = await supabase.from('map_entities').update(clean).eq('id', id);
    if (error) console.error('Ошибка обновления сущности:', error.message);
  },

  deleteEntity: async (id) => {
    const { error } = await supabase.from('map_entities').delete().eq('id', id);
    if (error) console.error('Ошибка удаления сущности:', error.message);
  },
}));
