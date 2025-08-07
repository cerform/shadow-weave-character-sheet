import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Upload, Image as ImageIcon, Layers, Map, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MapUploadFor3DProps {
  onMapGenerated: (mapData: {
    originalImage: string;
    heightMap: string;
    textureMap: string;
    dimensions: { width: number; height: number };
    settings: MapProcessingSettings;
  }) => void;
}

interface MapProcessingSettings {
  heightIntensity: number;
  smoothness: number;
  generateHeightFromColors: boolean;
  invertHeight: boolean;
  gridSize: number;
}

const MapUploadFor3D: React.FC<MapUploadFor3DProps> = ({ onMapGenerated }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedData, setProcessedData] = useState<any>(null);
  
  const [settings, setSettings] = useState<MapProcessingSettings>({
    heightIntensity: 50,
    smoothness: 20,
    generateHeightFromColors: true,
    invertHeight: false,
    gridSize: 1
  });

  // Обработка загрузки файла
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Создаем URL для оригинального изображения
      const imageUrl = URL.createObjectURL(file);
      setOriginalImage(imageUrl);
      
      // Обрабатываем изображение для 3D
      const mapData = await processImageFor3D(file, settings);
      setProcessedData(mapData);
      
      toast({
        title: "Карта загружена",
        description: "Изображение успешно обработано для 3D",
      });
      
    } catch (error) {
      console.error('Ошибка обработки изображения:', error);
      toast({
        title: "Ошибка обработки",
        description: "Не удалось обработать изображение",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [settings, toast]);

  // Основная функция обработки изображения для 3D
  const processImageFor3D = async (file: File, processingSettings: MapProcessingSettings) => {
    return new Promise<any>((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Создаем canvas для обработки
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Устанавливаем размеры
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Рисуем оригинальное изображение
        ctx.drawImage(img, 0, 0);
        
        // Получаем данные пикселей
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Создаем карту высот
        const heightMapData = generateHeightMap(pixels, canvas.width, canvas.height, processingSettings);
        
        // Создаем canvas для карты высот
        const heightCanvas = document.createElement('canvas');
        heightCanvas.width = canvas.width;
        heightCanvas.height = canvas.height;
        const heightCtx = heightCanvas.getContext('2d')!;
        
        // Применяем карту высот
        const heightImageData = heightCtx.createImageData(canvas.width, canvas.height);
        heightImageData.data.set(heightMapData);
        heightCtx.putImageData(heightImageData, 0, 0);
        
        // Применяем сглаживание если нужно
        if (processingSettings.smoothness > 0) {
          applySmoothing(heightCtx, canvas.width, canvas.height, processingSettings.smoothness);
        }
        
        const result = {
          originalImage: canvas.toDataURL('image/png'),
          heightMap: heightCanvas.toDataURL('image/png'),
          textureMap: canvas.toDataURL('image/png'),
          dimensions: { width: img.width, height: img.height },
          settings: processingSettings
        };
        
        resolve(result);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Генерация карты высот из цветов
  const generateHeightMap = (
    pixels: Uint8ClampedArray, 
    width: number, 
    height: number, 
    settings: MapProcessingSettings
  ): Uint8ClampedArray => {
    const heightData = new Uint8ClampedArray(pixels.length);
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      // Вычисляем яркость как основу для высоты
      let brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      
      // Применяем интенсивность
      brightness = brightness * (settings.heightIntensity / 100);
      
      // Инвертируем если нужно
      if (settings.invertHeight) {
        brightness = 1 - brightness;
      }
      
      // Преобразуем в значение 0-255
      const heightValue = Math.floor(brightness * 255);
      
      // Устанавливаем в grayscale
      heightData[i] = heightValue;     // R
      heightData[i + 1] = heightValue; // G
      heightData[i + 2] = heightValue; // B
      heightData[i + 3] = 255;         // A
    }
    
    return heightData;
  };

  // Применение сглаживания
  const applySmoothing = (ctx: CanvasRenderingContext2D, width: number, height: number, smoothness: number) => {
    const blurAmount = smoothness / 10;
    ctx.filter = `blur(${blurAmount}px)`;
    const imageData = ctx.getImageData(0, 0, width, height);
    ctx.putImageData(imageData, 0, 0);
    ctx.filter = 'none';
  };

  // Генерация 3D карты
  const generateMap = () => {
    if (!processedData) return;
    
    onMapGenerated(processedData);
    toast({
      title: "3D карта готова",
      description: "Карта сгенерирована и готова к использованию",
    });
  };

  // Пересоздание карты с новыми настройками
  const reprocessWithSettings = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(originalImage);
      const blob = await response.blob();
      const file = new File([blob], 'map.png', { type: 'image/png' });
      
      const mapData = await processImageFor3D(file, settings);
      setProcessedData(mapData);
      
      toast({
        title: "Настройки применены",
        description: "Карта пересоздана с новыми параметрами",
      });
    } catch (error) {
      console.error('Ошибка пересоздания:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-slate-800/90 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Map className="h-5 w-5" />
          Загрузка карты для 3D
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Загрузка файла */}
        <div className="space-y-2">
          <Label className="text-slate-300">Выберите изображение карты</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 border-slate-600 text-slate-300"
            >
              <Upload className="h-4 w-4 mr-2" />
              {originalImage ? 'Изменить' : 'Загрузить'}
            </Button>
            {processedData && (
              <Button
                onClick={generateMap}
                className="bg-green-600 hover:bg-green-700"
              >
                <Layers className="h-4 w-4 mr-2" />
                Создать 3D
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Превью оригинала */}
        {originalImage && (
          <div className="space-y-2">
            <Label className="text-slate-300">Оригинальная карта</Label>
            <div className="border border-slate-600 rounded overflow-hidden">
              <img 
                src={originalImage} 
                alt="Загруженная карта" 
                className="w-full h-32 object-cover"
              />
            </div>
          </div>
        )}

        {/* Настройки обработки */}
        {originalImage && (
          <div className="space-y-4">
            <Label className="text-slate-300">Настройки 3D обработки</Label>
            
            {/* Интенсивность высоты */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-slate-400 text-xs">Интенсивность рельефа</Label>
                <span className="text-slate-400 text-xs">{settings.heightIntensity}%</span>
              </div>
              <Slider
                value={[settings.heightIntensity]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, heightIntensity: value[0] }))}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* Сглаживание */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-slate-400 text-xs">Сглаживание</Label>
                <span className="text-slate-400 text-xs">{settings.smoothness}</span>
              </div>
              <Slider
                value={[settings.smoothness]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, smoothness: value[0] }))}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Размер сетки */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-slate-400 text-xs">Размер клетки (м)</Label>
                <span className="text-slate-400 text-xs">{settings.gridSize}</span>
              </div>
              <Slider
                value={[settings.gridSize]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, gridSize: value[0] }))}
                max={5}
                min={0.5}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Переключатели */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-400 text-xs">Высота из цветов</Label>
                <Switch
                  checked={settings.generateHeightFromColors}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, generateHeightFromColors: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-slate-400 text-xs">Инвертировать высоту</Label>
                <Switch
                  checked={settings.invertHeight}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, invertHeight: checked }))}
                />
              </div>
            </div>

            {/* Применить настройки */}
            <Button
              variant="outline"
              onClick={reprocessWithSettings}
              disabled={isProcessing}
              className="w-full border-slate-600 text-slate-300"
            >
              {isProcessing ? 'Обработка...' : 'Применить настройки'}
            </Button>
          </div>
        )}

        {/* Превью карты высот */}
        {processedData && (
          <div className="space-y-2">
            <Label className="text-slate-300">Карта высот (3D рельеф)</Label>
            <div className="border border-slate-600 rounded overflow-hidden">
              <img 
                src={processedData.heightMap} 
                alt="Карта высот" 
                className="w-full h-32 object-cover"
              />
            </div>
          </div>
        )}

        {/* Статус */}
        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Обработка изображения...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapUploadFor3D;