/**
 * Система слоев карты (как в Roll20)
 * Map Layer — фон карты
 * Token Layer — токены игроков/монстров
 * GM Layer — скрытые заметки DM
 * Template Layer — шаблоны заклинаний
 * Lighting Layer — источники света и блокеры
 * Fog Layer — туман войны
 */

export type LayerType = 'map' | 'token' | 'gm' | 'template' | 'lighting' | 'fog';

export interface LayerItem {
  id: string;
  type: string;
  layer: LayerType;
  zIndex: number;
  visible: boolean;
  data: any;
}

export interface LayerState {
  activeLayer: LayerType;
  layers: Record<LayerType, LayerItem[]>;
  visibility: Record<LayerType, boolean>;
}

export class LayersEngine {
  private state: LayerState = {
    activeLayer: 'token',
    layers: {
      map: [],
      token: [],
      gm: [],
      template: [],
      lighting: [],
      fog: []
    },
    visibility: {
      map: true,
      token: true,
      gm: true,
      template: true,
      lighting: true,
      fog: true
    }
  };

  private callbacks: Array<(state: LayerState) => void> = [];

  setActive(layer: LayerType): void {
    this.state.activeLayer = layer;
    this.notifyChange();
  }

  getActive(): LayerType {
    return this.state.activeLayer;
  }

  add(item: Omit<LayerItem, 'zIndex'>, layer?: LayerType): string {
    const targetLayer = layer || this.state.activeLayer;
    const maxZ = Math.max(0, ...this.state.layers[targetLayer].map(i => i.zIndex));
    
    const layerItem: LayerItem = {
      ...item,
      layer: targetLayer,
      zIndex: maxZ + 1
    };

    this.state.layers[targetLayer].push(layerItem);
    this.notifyChange();
    return item.id;
  }

  remove(id: string, layer?: LayerType): boolean {
    if (layer) {
      const index = this.state.layers[layer].findIndex(item => item.id === id);
      if (index !== -1) {
        this.state.layers[layer].splice(index, 1);
        this.notifyChange();
        return true;
      }
      return false;
    }

    // Поиск по всем слоям
    for (const layerType of Object.keys(this.state.layers) as LayerType[]) {
      const index = this.state.layers[layerType].findIndex(item => item.id === id);
      if (index !== -1) {
        this.state.layers[layerType].splice(index, 1);
        this.notifyChange();
        return true;
      }
    }
    return false;
  }

  reorder(id: string, zIndex: number, layer?: LayerType): boolean {
    const targetLayer = layer || this.findItemLayer(id);
    if (!targetLayer) return false;

    const item = this.state.layers[targetLayer].find(i => i.id === id);
    if (!item) return false;

    item.zIndex = zIndex;
    this.state.layers[targetLayer].sort((a, b) => a.zIndex - b.zIndex);
    this.notifyChange();
    return true;
  }

  moveToLayer(id: string, targetLayer: LayerType): boolean {
    const currentLayer = this.findItemLayer(id);
    if (!currentLayer || currentLayer === targetLayer) return false;

    const itemIndex = this.state.layers[currentLayer].findIndex(i => i.id === id);
    if (itemIndex === -1) return false;

    const item = this.state.layers[currentLayer].splice(itemIndex, 1)[0];
    item.layer = targetLayer;
    item.zIndex = Math.max(0, ...this.state.layers[targetLayer].map(i => i.zIndex)) + 1;
    
    this.state.layers[targetLayer].push(item);
    this.notifyChange();
    return true;
  }

  getItems(layer: LayerType): LayerItem[] {
    return [...this.state.layers[layer]].sort((a, b) => a.zIndex - b.zIndex);
  }

  getAllItems(): LayerItem[] {
    const allItems: LayerItem[] = [];
    for (const layer of Object.keys(this.state.layers) as LayerType[]) {
      allItems.push(...this.state.layers[layer]);
    }
    return allItems.sort((a, b) => a.zIndex - b.zIndex);
  }

  getItem(id: string): LayerItem | null {
    for (const layer of Object.keys(this.state.layers) as LayerType[]) {
      const item = this.state.layers[layer].find(i => i.id === id);
      if (item) return item;
    }
    return null;
  }

  setLayerVisibility(layer: LayerType, visible: boolean): void {
    this.state.visibility[layer] = visible;
    this.notifyChange();
  }

  isLayerVisible(layer: LayerType): boolean {
    return this.state.visibility[layer];
  }

  clear(layer?: LayerType): void {
    if (layer) {
      this.state.layers[layer] = [];
    } else {
      for (const layerType of Object.keys(this.state.layers) as LayerType[]) {
        this.state.layers[layerType] = [];
      }
    }
    this.notifyChange();
  }

  getState(): LayerState {
    return JSON.parse(JSON.stringify(this.state));
  }

  private findItemLayer(id: string): LayerType | null {
    for (const layer of Object.keys(this.state.layers) as LayerType[]) {
      if (this.state.layers[layer].some(item => item.id === id)) {
        return layer;
      }
    }
    return null;
  }

  private notifyChange(): void {
    this.callbacks.forEach(callback => callback(this.getState()));
  }

  onChange(callback: (state: LayerState) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}