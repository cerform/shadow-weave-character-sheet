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
      // Проверяем авторизацию
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Пользователь не авторизован:', authError);
        toast({
          title: "Требуется авторизация",
          description: "Войдите в систему, чтобы загружать карты",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      console.log('✅ Пользователь авторизован:', user.id);

      const fileExt = file.name.split('.').pop();
      const fileName = `map_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log('📤 Загрузка файла в bucket battle-maps:', filePath);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('battle-maps')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Ошибка загрузки в storage:', uploadError);
        throw uploadError;
      }

      console.log('✅ Файл загружен:', uploadData);

      const { data } = supabase.storage
        .from('battle-maps')
        .getPublicUrl(filePath);

      console.log('🔗 Получен публичный URL:', data.publicUrl);

      // Сохраняем карту в базе данных, если есть sessionId
      if (sessionId) {
        try {
          console.log('💾 Сохранение карты в БД для сессии:', sessionId);
          
          // Проверяем, что сессия существует в game_sessions
          const { data: sessionData, error: sessionCheckError } = await supabase
            .from('game_sessions')
            .select('id, dm_id')
            .eq('id', sessionId)
            .maybeSingle();

          if (sessionCheckError) {
            console.error('❌ Ошибка проверки сессии:', sessionCheckError);
            throw new Error(`Не удалось проверить сессию: ${sessionCheckError.message}`);
          }

          if (!sessionData) {
            console.warn('⚠️ Сессия не найдена в game_sessions:', sessionId);
            throw new Error(`Сессия с ID ${sessionId} не найдена в базе данных. Убедитесь, что используете правильную игровую сессию.`);
          }

          // Проверяем, является ли текущий пользователь DM этой сессии
          if (sessionData.dm_id !== user.id) {
            throw new Error('Только мастер сессии может загружать карты');
          }

          console.log('✅ Сессия найдена и пользователь является DM');

          // Деактивируем предыдущие карты для этой сессии
          await supabase
            .from('battle_maps')
            .update({ is_active: false })
            .eq('session_id', sessionId)
            .eq('is_active', true);

          // Сохраняем карту в battle_maps
          const { error: dbError } = await supabase
            .from('battle_maps')
            .insert({
              session_id: sessionId,
              name: file.name,
              image_url: data.publicUrl,
              file_url: data.publicUrl,
              file_path: filePath,
              width: 800,
              height: 600,
              grid_size: 25,
              is_active: true
            });

          if (dbError) {
            console.error('❌ Ошибка сохранения в battle_maps:', dbError);
            throw new Error(`Не удалось сохранить карту: ${dbError.message}`);
          }

          // Обновляем current_map_url в game_sessions
          const { error: updateError } = await supabase
            .from('game_sessions')
            .update({ current_map_url: data.publicUrl })
            .eq('id', sessionId);

          if (updateError) {
            console.warn('⚠️ Не удалось обновить current_map_url в game_sessions:', updateError);
          } else {
            console.log('✅ current_map_url обновлен в game_sessions');
          }

          console.log('✅ Карта успешно сохранена в базе данных');
        } catch (dbError: any) {
          console.error('❌ Ошибка при сохранении карты в базе данных:', dbError);
          toast({
            title: "Ошибка сохранения карты",
            description: dbError.message || "Не удалось сохранить карту в базе данных",
            variant: "destructive"
          });
          // Не продолжаем, если не удалось сохранить в БД
          throw dbError;
        }
      }

      onMapLoaded(data.publicUrl, scale[0]);
      
      toast({
        title: "Карта загружена",
        description: "Карта успешно загружена и сохранена",
      });

    } catch (error: any) {
      console.error('❌ Критическая ошибка загрузки карты:', error);
      console.error('Детали ошибки:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        hint: error.hint
      });
      
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось загрузить карту. Попробуйте еще раз.",
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