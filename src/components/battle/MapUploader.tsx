import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FolderOpen, X } from 'lucide-react';
import { MapScaleController } from './controls/MapScaleController';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';

interface MapUploaderProps {
  onMapLoaded: (imageUrl: string, scale?: number) => void;
  currentMapUrl?: string;
  onMapRemove?: () => void;
}

const MapUploader: React.FC<MapUploaderProps> = ({
  onMapLoaded,
  currentMapUrl,
  onMapRemove
}) => {
  const { toast } = useToast();
  const { id: sessionId } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [scale, setScale] = useState([100]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите файл изображения",
        variant: "destructive"
      });
      return;
    }

    // Проверяем размер файла (максимум 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла: 50MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `map_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('battle-maps')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('battle-maps')
        .getPublicUrl(filePath);

      // Сохраняем карту в базе данных, если есть sessionId
      if (sessionId) {
        try {
          const { error: dbError } = await supabase
            .from('battle_maps')
            .insert({
              session_id: sessionId,
              name: file.name,
              image_url: data.publicUrl,
              width: 800,
              height: 600,
              grid_size: 25
            });

          if (dbError) {
            console.warn('Не удалось сохранить карту в базе данных:', dbError);
          } else {
            console.log('Карта успешно сохранена в базе данных');
          }
        } catch (dbError) {
          console.warn('Ошибка при сохранении карты в базе данных:', dbError);
        }
      }

      onMapLoaded(data.publicUrl, scale[0]);
      
      toast({
        title: "Карта загружена",
        description: "Карта успешно загружена и сохранена",
      });

    } catch (error) {
      console.error('Ошибка загрузки карты:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить карту. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleScaleChange = (newScale: number[]) => {
    setScale(newScale);
    if (currentMapUrl) {
      onMapLoaded(currentMapUrl, newScale[0]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Загрузка карты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentMapUrl ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="map-upload">Выберите файл карты</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="map-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Загрузка...' : 'Выбрать'}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Поддерживаемые форматы: JPG, PNG, GIF, WebP</p>
              <p>• Максимальный размер: 50MB</p>
              <p>• Рекомендуемое разрешение: 2048x2048 или выше</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Карта загружена</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onMapRemove}
              >
                <X className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>

            <MapScaleController
              scale={scale[0]}
              onScaleChange={(newScale) => handleScaleChange([newScale])}
              min={50}
              max={500}
              step={10}
              label="Масштаб карты"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Загрузить другую карту
            </Button>
            
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapUploader;