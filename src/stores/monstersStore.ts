// Хранилище для управления монстрами
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Monster } from '@/types/monsters';
import { MONSTERS_DATABASE } from '@/data/monsters';

interface MonstersState {
  importedMonsters: Monster[];
  favoriteMonsters: string[];
  customMonsters: Monster[];
  addImportedMonsters: (monsters: Monster[]) => void;
  removeImportedMonster: (monsterId: string) => void;
  toggleFavorite: (monsterId: string) => void;
  addCustomMonster: (monster: Monster) => void;
  updateCustomMonster: (monsterId: string, updates: Partial<Monster>) => void;
  removeCustomMonster: (monsterId: string) => void;
  getAllMonsters: () => Monster[];
  clearImportedMonsters: () => void;
}

export const useMonstersStore = create<MonstersState>()(
  persist(
    (set, get) => ({
      importedMonsters: [],
      favoriteMonsters: [],
      customMonsters: [],

      addImportedMonsters: (monsters) => {
        set((state) => {
          const existingIds = new Set(state.importedMonsters.map(m => m.id));
          const newMonsters = monsters.filter(m => !existingIds.has(m.id));
          return {
            importedMonsters: [...state.importedMonsters, ...newMonsters]
          };
        });
      },

      removeImportedMonster: (monsterId) => {
        set((state) => ({
          importedMonsters: state.importedMonsters.filter(m => m.id !== monsterId)
        }));
      },

      toggleFavorite: (monsterId) => {
        set((state) => {
          const isFavorite = state.favoriteMonsters.includes(monsterId);
          return {
            favoriteMonsters: isFavorite
              ? state.favoriteMonsters.filter(id => id !== monsterId)
              : [...state.favoriteMonsters, monsterId]
          };
        });
      },

      addCustomMonster: (monster) => {
        set((state) => ({
          customMonsters: [...state.customMonsters, monster]
        }));
      },

      updateCustomMonster: (monsterId, updates) => {
        set((state) => ({
          customMonsters: state.customMonsters.map(m =>
            m.id === monsterId ? { ...m, ...updates } : m
          )
        }));
      },

      removeCustomMonster: (monsterId) => {
        set((state) => ({
          customMonsters: state.customMonsters.filter(m => m.id !== monsterId)
        }));
      },

      getAllMonsters: () => {
        const state = get();
        return [
          ...MONSTERS_DATABASE,
          ...state.importedMonsters,
          ...state.customMonsters
        ];
      },

      clearImportedMonsters: () => {
        set({ importedMonsters: [] });
      }
    }),
    {
      name: 'monsters-storage',
      partialize: (state) => ({
        importedMonsters: state.importedMonsters,
        favoriteMonsters: state.favoriteMonsters,
        customMonsters: state.customMonsters
      })
    }
  )
);