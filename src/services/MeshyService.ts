import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MeshyModel {
  id: string;
  name: string;
  thumbnail: string;
  model_urls: {
    glb?: string;
    gltf?: string;
    fbx?: string;
    obj?: string;
  };
  tags: string[];
  created_at: string;
}

export interface MeshySearchResult {
  success: boolean;
  models: MeshyModel[];
  total: number;
  page: number;
  hasMore: boolean;
  error?: string;
}

export interface MeshyDownloadResult {
  success: boolean;
  modelUrl?: string;
  fileName?: string;
  originalModel?: MeshyModel;
  error?: string;
}

class MeshyService {
  private static instance: MeshyService;
  
  static getInstance(): MeshyService {
    if (!MeshyService.instance) {
      MeshyService.instance = new MeshyService();
    }
    return MeshyService.instance;
  }

  async searchModels(
    query: string = 'dnd', 
    tags: string[] = ['dnd', 'fantasy'], 
    page: number = 1, 
    limit: number = 20
  ): Promise<MeshySearchResult> {
    try {
      console.log('Searching Meshy models:', { query, tags, page, limit });
      
      const { data, error } = await supabase.functions.invoke('meshy-models', {
        body: {
          action: 'search',
          query,
          tags,
          page,
          limit
        }
      });

      if (error) {
        console.error('Meshy search error:', error);
        throw new Error(error.message || 'Failed to search models');
      }

      return data as MeshySearchResult;
    } catch (error) {
      console.error('Error searching Meshy models:', error);
      return {
        success: false,
        models: [],
        total: 0,
        page: 1,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async downloadModel(modelId: string, monsterName: string): Promise<MeshyDownloadResult> {
    try {
      console.log('Downloading Meshy model:', { modelId, monsterName });
      
      toast.info(`Загружаю 3D модель для ${monsterName}...`);
      
      const { data, error } = await supabase.functions.invoke('meshy-models', {
        body: {
          action: 'download',
          modelId,
          monsterName
        }
      });

      if (error) {
        console.error('Meshy download error:', error);
        throw new Error(error.message || 'Failed to download model');
      }

      if (data.success) {
        toast.success(`3D модель для ${monsterName} загружена!`);
      } else {
        toast.error(`Ошибка загрузки модели: ${data.error}`);
      }

      return data as MeshyDownloadResult;
    } catch (error) {
      console.error('Error downloading Meshy model:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Ошибка загрузки модели: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getAutocompleteSuggestions(query: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('meshy-models', {
        body: {
          action: 'autocomplete',
          query
        }
      });

      if (error) {
        console.error('Meshy autocomplete error:', error);
        return [];
      }

      return data.suggestions || [];
    } catch (error) {
      console.error('Error getting autocomplete suggestions:', error);
      return [];
    }
  }

  // Автоматическая загрузка модели для монстра
  async autoLoadModelForMonster(monsterName: string): Promise<string | null> {
    try {
      // Ищем подходящую модель
      const searchResult = await this.searchModels(monsterName, ['dnd', 'fantasy', 'character', 'monster'], 1, 5);
      
      if (!searchResult.success || searchResult.models.length === 0) {
        console.log(`No Meshy models found for ${monsterName}`);
        return null;
      }

      // Берем первую найденную модель
      const bestModel = searchResult.models[0];
      
      // Загружаем модель
      const downloadResult = await this.downloadModel(bestModel.id, monsterName);
      
      if (downloadResult.success && downloadResult.modelUrl) {
        console.log(`Auto-loaded 3D model for ${monsterName}:`, downloadResult.modelUrl);
        return downloadResult.modelUrl;
      }

      return null;
    } catch (error) {
      console.error(`Error auto-loading model for ${monsterName}:`, error);
      return null;
    }
  }

  // Пакетная загрузка моделей для списка монстров
  async batchLoadModels(monsterNames: string[], onProgress?: (loaded: number, total: number) => void): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    for (let i = 0; i < monsterNames.length; i++) {
      const monsterName = monsterNames[i];
      
      try {
        const modelUrl = await this.autoLoadModelForMonster(monsterName);
        if (modelUrl) {
          results[monsterName] = modelUrl;
        }
        
        onProgress?.(i + 1, monsterNames.length);
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to load model for ${monsterName}:`, error);
      }
    }
    
    return results;
  }
}

export const meshyService = MeshyService.getInstance();