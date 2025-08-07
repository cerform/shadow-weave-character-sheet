import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Map, Upload } from 'lucide-react';
import MapUploadFor3D from '@/components/battle/MapUploadFor3D';
import Generated3DMap from '@/components/battle/Generated3DMap';

const DMMapGenerator3D: React.FC = () => {
  const navigate = useNavigate();
  const [generatedMapData, setGeneratedMapData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview'>('upload');

  const handleMapGenerated = (mapData: any) => {
    setGeneratedMapData(mapData);
    setCurrentStep('preview');
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
    setGeneratedMapData(null);
  };

  return (
    <div className="min-h-screen text-white">
      {/* Заголовок */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Map className="h-5 w-5" />
              Генератор 3D карт для Мастера
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Навигация */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dm-dashboard')}
          className="border-slate-600 text-slate-300 bg-slate-800/90 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          К панели DM
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
            <Generated3DMap mapData={generatedMapData} isDM={true} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DMMapGenerator3D;