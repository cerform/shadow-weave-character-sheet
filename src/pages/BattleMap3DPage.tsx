import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Map, ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import MapUploadFor3D from '@/components/battle/MapUploadFor3D';
import Generated3DMap from '@/components/battle/Generated3DMap';

const BattleMap3DPage: React.FC = () => {
  const navigate = useNavigate();
  const [generatedMapData, setGeneratedMapData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview'>('upload');
  const [tokens, setTokens] = useState<any[]>([]);

  // Проверяем наличие переданного изображения и токенов
  useEffect(() => {
    const savedMapUrl = sessionStorage.getItem('current3DMapUrl');
    const savedTokens = sessionStorage.getItem('current3DTokens');
    if (savedMapUrl) {
      // Автоматически генерируем 3D из переданного изображения
      processExistingImage(savedMapUrl);
      sessionStorage.removeItem('current3DMapUrl'); // Очищаем после использования
    }
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        setTokens(parsedTokens);
        sessionStorage.removeItem('current3DTokens');
      } catch (error) {
        console.error('Ошибка парсинга токенов:', error);
      }
    }
  }, []);

  const processExistingImage = async (imageUrl: string) => {
    try {
      // Создаем настройки по умолчанию
      const defaultSettings = {
        heightIntensity: 50,
        smoothness: 20,
        generateHeightFromColors: true,
        invertHeight: false,
        gridSize: 1
      };

      // Генерируем карту высот и текстуру из существующего изображения
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Используем оригинальное изображение как текстуру и генерируем карту высот
        const mapData = {
          originalImage: imageUrl,
          heightMap: imageUrl, // Используем то же изображение для карты высот
          textureMap: imageUrl,
          dimensions: { width: img.width, height: img.height },
          settings: defaultSettings
        };

        setGeneratedMapData(mapData);
        setCurrentStep('preview');
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Ошибка обработки изображения:', error);
      toast.error('Ошибка обработки изображения');
    }
  };

  const handleMapGenerated = (mapData: any) => {
    setGeneratedMapData(mapData);
    setCurrentStep('preview');
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
    setGeneratedMapData(null);
  };

  const handleTokenUpdate = (updatedTokens: any[]) => {
    setTokens(updatedTokens);
    // Сохраняем обновленные токены обратно в sessionStorage для синхронизации с 2D
    sessionStorage.setItem('updated3DTokens', JSON.stringify(updatedTokens));
  };

  return (
    <div className="min-h-screen text-white">
      {/* Заголовок */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Map className="h-5 w-5" />
              3D Боевая карта
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Навигация */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            // Всегда возвращаемся на 2D карту
            const sessionId = sessionStorage.getItem('currentSessionId');
            if (sessionId) {
              navigate(`/dm/battle-map/${sessionId}`);
            } else {
              navigate('/battle-map-fixed');
            }
          }}
          className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          К 2D карте
        </Button>
        
        {currentStep === 'preview' && (
          <Button 
            variant="outline" 
            onClick={handleBackToUpload}
            className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Новая карта
          </Button>
        )}
      </div>

      {/* Кнопка домой */}
      <div className="absolute top-4 right-4 z-20">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
        >
          <Home className="h-4 w-4 mr-2" />
          Главная
        </Button>
      </div>

      {/* Основной контент */}
      <div className="w-full h-screen pt-20">
        {currentStep === 'upload' ? (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md w-full px-4">
              <MapUploadFor3D onMapGenerated={handleMapGenerated} />
              
              {/* Инструкция */}
              <Card className="mt-6 bg-slate-800/60 border-slate-700">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-2">📋 Инструкция</h3>
                  <div className="text-slate-300 text-sm space-y-2">
                    <p>1. Загрузите изображение боевой карты</p>
                    <p>2. Настройте параметры 3D обработки</p>
                    <p>3. Система автоматически создаст рельеф из цветов</p>
                    <p>4. Нажмите "Создать 3D" для генерации</p>
                  </div>
                  <div className="mt-3 p-2 bg-blue-500/20 rounded border border-blue-500/30">
                    <p className="text-blue-300 text-xs">
                      💡 Темные области станут низинами, светлые - возвышенностями
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            <Generated3DMap 
              mapData={generatedMapData} 
              tokens={tokens}
              onTokenUpdate={handleTokenUpdate}
              isDM={true} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleMap3DPage;