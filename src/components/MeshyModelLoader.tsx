import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Download, Loader2, ExternalLink } from 'lucide-react';
import { meshyService, type MeshyModel } from '@/services/MeshyService';
import { toast } from 'sonner';

interface MeshyModelLoaderProps {
  onModelLoaded?: (monsterName: string, modelUrl: string) => void;
  monsterNames?: string[];
  autoLoad?: boolean;
}

export default function MeshyModelLoader({ 
  onModelLoaded, 
  monsterNames = [],
  autoLoad = false 
}: MeshyModelLoaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [models, setModels] = useState<MeshyModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState(autoLoad);

  // Автозагрузка при изменении списка монстров
  useEffect(() => {
    if (autoLoadEnabled && monsterNames.length > 0) {
      handleBatchAutoLoad();
    }
  }, [monsterNames, autoLoadEnabled]);

  // Автозавершение при изменении поискового запроса
  useEffect(() => {
    if (searchQuery.length > 2) {
      const timeoutId = setTimeout(async () => {
        const results = await meshyService.getAutocompleteSuggestions(searchQuery);
        setSuggestions(results);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await meshyService.searchModels(
        searchQuery, 
        ['dnd', 'fantasy', 'character', 'monster'], 
        1, 
        12
      );
      
      if (result.success) {
        setModels(result.models);
        if (result.models.length === 0) {
          toast.info('Модели не найдены. Попробуйте другой запрос.');
        }
      } else {
        toast.error(`Ошибка поиска: ${result.error}`);
      }
    } catch (error) {
      toast.error('Ошибка при поиске моделей');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownload = async (model: MeshyModel, monsterName?: string) => {
    const modelId = model.id;
    const name = monsterName || model.name || 'unnamed-model';
    
    setIsDownloading(prev => ({ ...prev, [modelId]: true }));
    
    try {
      const result = await meshyService.downloadModel(modelId, name);
      
      if (result.success && result.modelUrl) {
        onModelLoaded?.(name, result.modelUrl);
        toast.success(`Модель "${name}" загружена и готова к использованию!`);
      }
    } catch (error) {
      toast.error('Ошибка при загрузке модели');
    } finally {
      setIsDownloading(prev => ({ ...prev, [modelId]: false }));
    }
  };

  const handleBatchAutoLoad = async () => {
    if (monsterNames.length === 0) return;
    
    setBatchProgress({ loaded: 0, total: monsterNames.length });
    
    try {
      const results = await meshyService.batchLoadModels(monsterNames, (loaded, total) => {
        setBatchProgress({ loaded, total });
      });
      
      // Уведомляем о загруженных моделях
      Object.entries(results).forEach(([name, url]) => {
        onModelLoaded?.(name, url);
      });
      
      const loadedCount = Object.keys(results).length;
      toast.success(`Автозагрузка завершена: ${loadedCount}/${monsterNames.length} моделей загружено`);
    } catch (error) {
      toast.error('Ошибка при автозагрузке моделей');
    } finally {
      setBatchProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Meshy.ai — Автозагрузка 3D моделей
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Поиск */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Поиск D&D персонажей и монстров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white dark:bg-gray-800 border rounded-md mt-1 max-h-40 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Поиск
            </Button>
          </div>

          {/* Автозагрузка */}
          {monsterNames.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Автозагрузка для {monsterNames.length} монстров
                </span>
                <Button
                  size="sm"
                  onClick={handleBatchAutoLoad}
                  disabled={!!batchProgress}
                  variant="outline"
                >
                  {batchProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Загрузить все
                </Button>
              </div>
              
              {batchProgress && (
                <div className="space-y-1">
                  <Progress value={(batchProgress.loaded / batchProgress.total) * 100} />
                  <div className="text-xs text-gray-500 text-center">
                    {batchProgress.loaded} / {batchProgress.total} загружено
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Результаты поиска */}
          {models.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <Card key={model.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                    {model.thumbnail && (
                      <img
                        src={model.thumbnail}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm mb-2 line-clamp-2">
                      {model.name || 'Unnamed Model'}
                    </h4>
                    
                    {model.tags && model.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {model.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleDownload(model)}
                      disabled={isDownloading[model.id]}
                    >
                      {isDownloading[model.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Загрузить
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}