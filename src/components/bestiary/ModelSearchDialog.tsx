import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, ExternalLink } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface ModelResult {
  uid: string;
  name: string;
  thumbnails: {
    images: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  viewerUrl: string;
  faceCount: number;
  vertexCount: number;
  isDownloadable: boolean;
  license: {
    label: string;
  };
  user: {
    displayName: string;
  };
}

interface ModelSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onModelUploaded?: () => void;
}

export const ModelSearchDialog: React.FC<ModelSearchDialogProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onModelUploaded
}) => {
  const [results, setResults] = useState<ModelResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState(searchQuery);

  const searchModels = async (query: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-3d-models', {
        body: { query }
      });

      if (error) throw error;

      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Ошибка поиска моделей');
    } finally {
      setIsSearching(false);
    }
  };

  const downloadAndUploadModel = async (model: ModelResult) => {
    setDownloadingModel(model.uid);
    try {
      const { data, error } = await supabase.functions.invoke('search-3d-models', {
        body: { 
          action: 'download',
          modelId: model.uid,
          modelName: model.name
        }
      });

      if (error) throw error;

      toast.success(`Модель "${model.name}" успешно загружена!`);
      onModelUploaded?.();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Ошибка загрузки модели');
    } finally {
      setDownloadingModel(null);
    }
  };

  React.useEffect(() => {
    if (isOpen && searchQuery) {
      setCustomQuery(searchQuery);
      searchModels(searchQuery);
    }
  }, [isOpen, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Поиск 3D моделей</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Поиск моделей..."
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchModels(customQuery)}
          />
          <Button 
            onClick={() => searchModels(customQuery)}
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Поиск'}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Поиск моделей...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((model) => (
                <Card key={model.uid} className="p-4">
                  <div className="aspect-square mb-3 relative overflow-hidden rounded-md">
                    {model.thumbnails?.images?.[0] ? (
                      <img
                        src={model.thumbnails.images[0].url}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        Нет превью
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold mb-2 text-sm line-clamp-2">{model.name}</h3>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {model.faceCount?.toLocaleString()} полигонов
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {model.license?.label || 'Неизвестно'}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    от {model.user?.displayName}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(model.viewerUrl, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Просмотр
                    </Button>
                    
                    {model.isDownloadable && (
                      <Button
                        size="sm"
                        onClick={() => downloadAndUploadModel(model)}
                        disabled={downloadingModel === model.uid}
                        className="flex-1"
                      >
                        {downloadingModel === model.uid ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Download className="w-3 h-3 mr-1" />
                        )}
                        Загрузить
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {!isSearching && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Модели не найдены. Попробуйте другой запрос.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};