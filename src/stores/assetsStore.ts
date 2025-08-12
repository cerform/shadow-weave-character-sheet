import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface AssetCategory {
  id: string;
  key: string;
  name: string;
  created_at?: string;
}

export interface AssetItem {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  storage_path: string; // path inside `models` bucket
  preview_url?: string | null;
  scale_x?: number;
  scale_y?: number;
  scale_z?: number;
  pivot?: { x: number; y: number; z: number };
  tags?: string[] | null;
  approved: boolean;
  created_by?: string | null;
  created_at?: string;
}

interface AssetsState {
  categories: AssetCategory[];
  assets: AssetItem[];
  loading: boolean;
  loadAll: () => Promise<void>;
  reloadCategories: () => Promise<void>;
  reloadAssets: () => Promise<void>;
  addCategory: (payload: { key: string; name: string }) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  createAsset: (payload: Omit<AssetItem, 'id' | 'approved'> & { approved?: boolean }) => Promise<void>;
  setApproved: (id: string, approved: boolean) => Promise<void>;
}

export const useAssetsStore = create<AssetsState>((set, get) => ({
  categories: [],
  assets: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    await Promise.all([get().reloadCategories(), get().reloadAssets()]);
    set({ loading: false });
  },

  reloadCategories: async () => {
    const { data, error } = await supabase
      .from('asset_categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error('Ошибка загрузки категорий:', error.message);
      return;
    }
    set({ categories: data as any });
  },

  reloadAssets: async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Ошибка загрузки ассетов:', error.message);
      return;
    }
    set({ assets: data as any });
  },

  addCategory: async ({ key, name }) => {
    const { error } = await supabase.from('asset_categories').insert([{ key, name }]);
    if (error) {
      console.error('Ошибка добавления категории:', error.message);
      return;
    }
    await get().reloadCategories();
  },

  removeCategory: async (id) => {
    const { error } = await supabase.from('asset_categories').delete().eq('id', id);
    if (error) {
      console.error('Ошибка удаления категории:', error.message);
      return;
    }
    await get().reloadCategories();
  },

  createAsset: async (payload) => {
    // sanitize undefined
    const clean = JSON.parse(JSON.stringify(payload));
    const { error } = await supabase.from('assets').insert([clean]);
    if (error) {
      console.error('Ошибка создания ассета:', error.message);
      return;
    }
    await get().reloadAssets();
  },

  setApproved: async (id, approved) => {
    const { error } = await supabase.from('assets').update({ approved }).eq('id', id);
    if (error) {
      console.error('Ошибка смены статуса ассета:', error.message);
      return;
    }
    await get().reloadAssets();
  },
}));
