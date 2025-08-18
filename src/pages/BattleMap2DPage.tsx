import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import Simple2DMapFromAssets from '@/components/battle/Simple2DMapFromAssets';
import { FogControlPanel } from '@/components/battle/FogControlPanel';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

const BattleMap2DPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const sKey = (name: string) => (sessionId ? `${name}:${sessionId}` : name);
  
  const [assets3D, setAssets3D] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [mapUrl, setMapUrl] = useState<string>('');
  const [showFogPanel, setShowFogPanel] = useState(false);
  
  // Fog of War integration
  const { setIsDM, fogSettings, enableFog } = useFogOfWarStore();

  useEffect(() => {
    setIsDM(true); // Enable DM mode for 2D map
    document.title = '2D Карта из 3D Ассетов';
    
    // Загружаем данные из sessionStorage
    const savedAssets = sessionStorage.getItem(sKey('current3DAssets'));
    const savedTokens = sessionStorage.getItem(sKey('current3DTokens'));
    const savedMapUrl = sessionStorage.getItem(sKey('current3DMapUrl'));
    
    if (savedAssets) {
      try {
        setAssets3D(JSON.parse(savedAssets));
      } catch (error) {
        console.error('Error parsing assets:', error);
      }
    }
    
    if (savedTokens) {
      try {
        setTokens(JSON.parse(savedTokens));
      } catch (error) {
        console.error('Error parsing tokens:', error);
      }
    }
    
    if (savedMapUrl) {
      setMapUrl(savedMapUrl);
    }

    console.log('📋 BattleMap2DPage: Loaded data', {
      assetsCount: savedAssets ? JSON.parse(savedAssets).length : 0,
      tokensCount: savedTokens ? JSON.parse(savedTokens).length : 0,
      mapUrl: savedMapUrl
    });
  }, [sessionId, setIsDM]);

  const handleBack = () => {
    navigate(`/battle-map-3d${sessionId ? `/${sessionId}` : ''}`);
  };

  const handleSyncFromStorage = () => {
    // Перезагружаем данные из sessionStorage
    const savedAssets = sessionStorage.getItem(sKey('current3DAssets'));
    const savedTokens = sessionStorage.getItem(sKey('current3DTokens'));
    const savedMapUrl = sessionStorage.getItem(sKey('current3DMapUrl'));
    
    if (savedAssets) {
      try {
        setAssets3D(JSON.parse(savedAssets));
        toast.success('Ассеты синхронизированы');
      } catch (error) {
        toast.error('Ошибка синхронизации ассетов');
      }
    }
    
    if (savedTokens) {
      try {
        setTokens(JSON.parse(savedTokens));
        toast.success('Токены синхронизированы');
      } catch (error) {
        toast.error('Ошибка синхронизации токенов');
      }
    }
    
    if (savedMapUrl) {
      setMapUrl(savedMapUrl);
      toast.success('Карта синхронизирована');
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-white">2D Карта из 3D Ассетов</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowFogPanel(!showFogPanel)}
              className={`${showFogPanel ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'}`}
              size="sm"
            >
              <Cloud className="w-4 h-4 mr-2" />
              {showFogPanel ? 'Скрыть Туман' : 'Показать Туман'}
            </Button>
            
            <Button 
              onClick={handleSyncFromStorage}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить
            </Button>
            
            <Button 
              onClick={handleBack}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Вернуться к 3D
            </Button>
            
            <Button 
              onClick={() => navigate('/dm')}
              className="bg-slate-600 hover:bg-slate-700"
              size="sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Панель DM
            </Button>
          </div>
        </div>
      </div>

      {/* 2D Map with Interactive Fog of War */}
      <div className="w-full h-full pt-20 relative">
        <Simple2DMapFromAssets
          assets3D={assets3D}
          tokens={tokens}
          mapImageUrl={mapUrl}
          fogEnabled={fogSettings.enabled}
        />
        
        {/* Fog of War Control Panel */}
        {showFogPanel && (
          <div className="absolute top-20 right-4 z-30 w-80">
            <div className="bg-black/80 p-4 rounded-xl backdrop-blur">
              <h3 className="text-yellow-400 font-bold mb-3">Контроль Тумана Войны</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => enableFog(!fogSettings.enabled)}
                    className={`flex-1 ${fogSettings.enabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    size="sm"
                  >
                    {fogSettings.enabled ? 'Включён' : 'Выключен'}
                  </Button>
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>• Используйте кнопку режима в левом углу карты</div>
                  <div>• Режим "Туман": рисование областей</div>
                  <div>• Режим "Карта": перемещение и масштаб</div>
                  <div>• Переключайтесь между режимами по необходимости</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleMap2DPage;