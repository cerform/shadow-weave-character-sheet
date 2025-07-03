import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MapUploaderProps {
  onMapUpload: (mapUrl: string) => void;
  currentMap?: string | null;
}

const MapUploader: React.FC<MapUploaderProps> = ({ onMapUpload, currentMap }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Неподдерживаемый формат",
        description: "Пожалуйста, выберите изображение (PNG, JPG, WEBP)",
        variant: "destructive"
      });
      return;
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла: 10MB",
        variant: "destructive"
      });
      return;
    }

    // Создаем URL для предварительного просмотра
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onMapUpload(imageUrl);
      
      toast({
        title: "🗺️ Карта загружена",
        description: "Карта успешно установлена как фон",
      });
    };
    reader.readAsDataURL(file);
  };

  const clearMap = () => {
    onMapUpload('');
    toast({
      title: "Карта удалена",
      description: "Фон карты сброшен",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          🗺️ Управление картами
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {currentMap ? (
          <div className="space-y-2">
            <div className="relative">
              <img 
                src={currentMap} 
                alt="Текущая карта"
                className="w-full h-32 object-cover rounded border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={clearMap}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Заменить карту
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-4">
                Нет загруженной карты
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Загрузить карту
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Поддерживаемые форматы: PNG, JPG, WEBP</p>
              <p>• Максимальный размер: 10MB</p>
              <p>• Рекомендуемое разрешение: 1920x1080</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapUploader;