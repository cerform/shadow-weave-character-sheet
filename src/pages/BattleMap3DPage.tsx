import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Simple3DMap from '@/components/battle/Simple3DMap';
import { useSimpleBattleStore } from '@/stores/simpleBattleStore';
import { sessionService } from '@/services/sessionService';
import { preloadMonsterModels } from '@/components/battle/MonsterModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const BattleMap3DPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  
  const { 
    tokens, 
    selectedTokenId, 
    mapBackground,
    selectToken,
    addToken,
    updateToken,
    moveToken,
    setTokens,
    setMapBackground
  } = useSimpleBattleStore();

  const [mapUrl, setMapUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // 3D ассеты из Supabase Storage (эпhemeral + sessionStorage)
  type AssetModel = { id: string; storage_path: string; x: number; y: number; scale?: number | [number, number, number] };
  const [assets3D, setAssets3D] = useState<AssetModel[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [prefix, setPrefix] = useState<string>('');
  const [files, setFiles] = useState<{ name: string; id?: string }[]>([]);
  const [fileQuery, setFileQuery] = useState('');

  // Предзагружаем все 3D модели при загрузке страницы
  useEffect(() => {
    console.log('🎮 Loading 3D Battle Map with real models...');
    preloadMonsterModels();
  }, []);

  // Синхронизация с 2D картой
  useEffect(() => {
    const savedMapUrl = sessionStorage.getItem('current3DMapUrl');
    const savedTokens = sessionStorage.getItem('current3DTokens');
    const savedSessionId = sessionStorage.getItem('currentSessionId');
    
    if (savedMapUrl) {
      setMapUrl(savedMapUrl);
      setMapBackground(savedMapUrl);
    }
    
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        console.log('🔄 Loading tokens from 2D map:', parsedTokens);
        
        // Конвертируем токены из формата 2D карты в формат 3D
        const convertedTokens = parsedTokens.map((token: any) => ({
          id: token.id,
          name: token.name,
          x: token.x || 0,
          y: token.y || 0,
          color: token.color || '#3b82f6',
          size: token.size || 50,
          hp: token.hp || token.maxHp || 30,
          maxHp: token.maxHp || 30,
          ac: token.ac || 15,
          type: token.type || 'monster',
          controlledBy: token.controlledBy || 'dm',
          monsterType: determineMonsterType(token.name, token.type)
        }));
        
        setTokens(convertedTokens);
      } catch (error) {
        console.error('Error parsing saved tokens:', error);
      }
    }
    
    console.log('🗺️ BattleMap3DPage: Loaded from session storage', { 
      mapUrl: savedMapUrl, 
      sessionId: savedSessionId,
      tokens: savedTokens 
    });
  }, [setTokens, setMapBackground]);

  // Восстанавливаем добавленные 3D ассеты
  useEffect(() => {
    const saved = sessionStorage.getItem('current3DAssets');
    if (saved) {
      try {
        setAssets3D(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Загрузка файлов из bucket models по префиксу
  const loadFiles = async (p: string = prefix) => {
    const { data, error } = await supabase.storage.from('models').list(p, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.error('Ошибка чтения storage:', error.message);
      return;
    }
    setFiles((data as any) || []);
  };

  useEffect(() => {
    if (addOpen) loadFiles(prefix);
  }, [addOpen, prefix]);

  const parentPrefix = (p: string) => {
    const n = p.replace(/\\/g, '/').replace(/\/$/, '');
    const idx = n.lastIndexOf('/');
    return idx >= 0 ? n.slice(0, idx) : '';
  };

  const handleAddAsset = (name: string) => {
    const full = prefix ? `${prefix}/${name}` : name;
    const newItem: AssetModel = { id: uuidv4(), storage_path: full, x: 600, y: 400 };
    const next = [...assets3D, newItem];
    setAssets3D(next);
    sessionStorage.setItem('current3DAssets', JSON.stringify(next));
    setAddOpen(false);
  };

  const handleAssetMove = (id: string, x: number, y: number) => {
    setAssets3D((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, x, y } : a));
      sessionStorage.setItem('current3DAssets', JSON.stringify(next));
      return next;
    });
  };

  // Определяем тип монстра по имени и типу
  const determineMonsterType = (name: string, type: string): string | undefined => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('гоблин') || lowerName.includes('goblin')) return 'goblin';
    if (lowerName.includes('орк') || lowerName.includes('orc')) return 'orc';
    if (lowerName.includes('скелет') || lowerName.includes('skeleton')) return 'skeleton';
    if (lowerName.includes('дракон') || lowerName.includes('dragon')) return 'dragon';
    if (lowerName.includes('волк') || lowerName.includes('wolf')) return 'wolf';
    if (lowerName.includes('голем') || lowerName.includes('golem')) return 'golem';
    if (type === 'player' || lowerName.includes('воин') || lowerName.includes('fighter') || lowerName.includes('wizard')) return 'fighter';
    return undefined;
  };

  // Обработчик перемещения токена в 3D
  const handleTokenMove = (tokenId: string, x: number, y: number) => {
    console.log('🏃 3D Token move:', { tokenId, x, y });
    moveToken(tokenId, x, y);
    
    // Синхронизируем с sessionStorage для 2D карты
    const currentTokens = sessionStorage.getItem('current3DTokens');
    if (currentTokens) {
      try {
        const parsedTokens = JSON.parse(currentTokens);
        const updatedTokens = parsedTokens.map((token: any) => 
          token.id === tokenId ? { ...token, x, y } : token
        );
        sessionStorage.setItem('current3DTokens', JSON.stringify(updatedTokens));
      } catch (error) {
        console.error('Error updating tokens in session storage:', error);
      }
    }
  };

  // Обработчик обновления токена
  const handleTokenUpdate = (tokenId: string, updates: any) => {
    console.log('📝 3D Token update:', { tokenId, updates });
    updateToken(tokenId, updates);
    
    // Синхронизируем с sessionStorage
    const currentTokens = sessionStorage.getItem('current3DTokens');
    if (currentTokens) {
      try {
        const parsedTokens = JSON.parse(currentTokens);
        const updatedTokens = parsedTokens.map((token: any) => 
          token.id === tokenId ? { ...token, ...updates } : token
        );
        sessionStorage.setItem('current3DTokens', JSON.stringify(updatedTokens));
      } catch (error) {
        console.error('Error updating tokens in session storage:', error);
      }
    }
  };

  // Сохранение изменений в базу данных
  const handleSave = async () => {
    if (!sessionId) {
      toast.error('ID сессии не найден');
      return;
    }

    try {
      setIsSaving(true);
      
      // Получаем текущую карту сессии
      const maps = await sessionService.getSessionMaps(sessionId);
      const activeMap = maps.find(m => m.is_active) || maps[0];
      
      if (!activeMap) {
        toast.error('Активная карта не найдена');
        return;
      }

      // Сохраняем все токены
      for (const token of tokens) {
        try {
          await sessionService.updateToken(token.id, {
            position_x: token.x,
            position_y: token.y,
            current_hp: token.hp,
            max_hp: token.maxHp,
            armor_class: token.ac,
            name: token.name
          });
        } catch (error) {
          console.warn(`Токен ${token.id} не найден в БД, пропускаем обновление`);
        }
      }
      
      toast.success('Изменения сохранены');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка сохранения изменений');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-white">3D Боевая карта</h1>
          <div className="flex gap-2">
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button 
              onClick={() => {
                // Синхронизируем данные перед переходом на 2D
                sessionStorage.setItem('current3DMapUrl', mapUrl);
                sessionStorage.setItem('current3DTokens', JSON.stringify(tokens));
                navigate(sessionId ? `/battle-map/${sessionId}` : '/battle-map');
              }}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Переключить на 2D
            </Button>
            <Button 
              onClick={() => setAddOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить 3D ассет
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

      {/* 3D Map */}
      <div className="w-full h-full pt-20">
        <Simple3DMap
          mapImageUrl={mapUrl}
          tokens={tokens}
          selectedTokenId={selectedTokenId}
          onTokenSelect={selectToken}
          onTokenMove={handleTokenMove}
          onTokenUpdate={handleTokenUpdate}
          isDM={true}
        />
      </div>
    </div>
  );
};

export default BattleMap3DPage;