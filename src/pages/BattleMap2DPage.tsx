import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Simple2DMapFromAssets from '@/components/battle/Simple2DMapFromAssets';

const BattleMap2DPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const sKey = (name: string) => (sessionId ? `${name}:${sessionId}` : name);
  
  const [assets3D, setAssets3D] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [mapUrl, setMapUrl] = useState<string>('');

  useEffect(() => {
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
  }, [sessionId]);

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

      {/* 2D Map */}
      <div className="w-full h-full pt-20">
        <Simple2DMapFromAssets
          assets3D={assets3D}
          tokens={tokens}
          mapImageUrl={mapUrl}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default BattleMap2DPage;