import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MapUploaderProps {
  onMapFile: (file: File) => void;
  onMapUrl: (url: string) => void;
  currentMapUrl?: string | null;
}

export function MapUploader({ onMapFile, onMapUrl, currentMapUrl }: MapUploaderProps) {
  const [mapUrl, setMapUrl] = useState('');
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Неверный формат",
          description: "Пожалуйста, выберите файл изображения",
          variant: "destructive",
        });
        return;
      }
      onMapFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onMapFile, toast]);

  const handleUrlSubmit = useCallback(() => {
    if (!mapUrl.trim()) {
      toast({
        title: "Введите URL",
        description: "Пожалуйста, введите URL изображения",
        variant: "destructive",
      });
      return;
    }

    // Простая проверка URL
    try {
      new URL(mapUrl);
      onMapUrl(mapUrl);
      setMapUrl('');
      toast({
        title: "Карта загружается",
        description: "Загрузка карты по URL...",
      });
    } catch {
      toast({
        title: "Неверный URL",
        description: "Пожалуйста, введите корректный URL",
        variant: "destructive",
      });
    }
  }, [mapUrl, onMapUrl, toast]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <ImageIcon className="h-5 w-5" />
        <span>Загрузка карты</span>
      </div>

      {/* Текущая карта */}
      {currentMapUrl && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Текущая карта</Label>
          <div className="relative w-full h-32 rounded-md overflow-hidden border border-border">
            <img
              src={currentMapUrl}
              alt="Current map"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Загрузка файла */}
      <div className="space-y-2">
        <Label htmlFor="map-file">Загрузить файл</Label>
        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            id="map-file"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Загрузка по URL */}
      <div className="space-y-2">
        <Label htmlFor="map-url">Загрузить по URL</Label>
        <div className="flex gap-2">
          <Input
            id="map-url"
            type="url"
            placeholder="https://example.com/map.jpg"
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUrlSubmit();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleUrlSubmit}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Или перетащите изображение прямо на карту
      </div>
    </Card>
  );
}
