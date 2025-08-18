import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Save, Plus, Trash2, Upload, Sword, Cloud } from 'lucide-react';
import MapUploader from '@/components/battle/MapUploader';
import { EquipmentPanel } from '@/components/battle/enhanced/EquipmentPanel';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { EnhancedBattleManager } from '../components/battle/EnhancedBattleManager';
import { FogOfWarToggle } from '../components/battle/FogOfWarToggle';
import { FogControlPanel } from '@/components/battle/FogControlPanel';
import { FogDrawingOverlay3D } from '@/components/battle/FogDrawingOverlay3D';
import { toast } from 'sonner';
import { determineMonsterType, updateTokenWithModelType } from '@/utils/tokenModelMapping';
import { EnhancedBattleMap } from '@/components/battle/enhanced/EnhancedBattleMap';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

import { sessionService } from '@/services/sessionService';
import { preloadMonsterModels } from '@/components/battle/MonsterModel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const BattleMap3DPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: sessionId } = useParams<{ id: string }>();
  const sKey = (name: string) => (sessionId ? `${name}:${sessionId}` : name);
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [mapBackground, setMapBackground] = useState<string>('');
  const { clearAllTokens } = useEnhancedBattleStore();

  const [mapUrl, setMapUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showFogPanel, setShowFogPanel] = useState(false);

  // Fog of War store для синхронизации
  const { initializeSync, disconnectSync } = useFogOfWarStore();

  // 3D ассеты из Supabase Storage (эпhemeral + sessionStorage)
type AssetModel = { 
  id: string; 
  storage_path: string; 
  x: number; 
  y: number; 
  scale?: number | [number, number, number]; 
  rotationY?: number; 
  animate?: boolean; 
  controlledBy?: string; 
  ownerId?: string; 
};
  const [assets3D, setAssets3D] = useState<AssetModel[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [mapUploadOpen, setMapUploadOpen] = useState(false);
  const [showInitiative, setShowInitiative] = useState(false);
  const [prefix, setPrefix] = useState<string>('');
  const [files, setFiles] = useState<{ name: string; id?: string }[]>([]);
  const [fileQuery, setFileQuery] = useState('');

  // Предзагружаем все 3D модели при загрузке страницы
  useEffect(() => {
    console.log('🎮 Loading 3D Battle Map with real models...');
    preloadMonsterModels();
  }, []);

  // Инициализация синхронизации тумана войны
  useEffect(() => {
    if (sessionId) {
      initializeSync(sessionId);
      console.log('🌫️ Initializing fog sync for 3D map, sessionId:', sessionId);
    }
    
    return () => {
      if (sessionId) {
        disconnectSync();
      }
    };
  }, [sessionId, initializeSync, disconnectSync]);

  // Синхронизация с 2D картой
  useEffect(() => {
    const savedMapUrl = sessionStorage.getItem(sKey('current3DMapUrl'));
    const savedTokens = sessionStorage.getItem(sKey('current3DTokens'));
    
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
          // Применяем утилиту для определения правильного типа модели
          monsterType: token.monsterType || determineMonsterType(token.name, token.type)
        }));
        
        setTokens(convertedTokens);
      } catch (error) {
        console.error('Error parsing saved tokens:', error);
      }
    }
    
    console.log('🗺️ BattleMap3DPage: Loaded from session storage', { 
      mapUrl: savedMapUrl, 
      tokens: savedTokens 
    });
  }, []);

  // Восстанавливаем добавленные 3D ассеты
  useEffect(() => {
    const saved = sessionStorage.getItem(sKey('current3DAssets'));
    if (saved) {
      try {
        setAssets3D(JSON.parse(saved));
      } catch {}
    }
  }, [sessionId]);

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
  if (addOpen) {
    const initial = prefix || 'monsters';
    if (!prefix) setPrefix(initial);
    loadFiles(initial);
  }
}, [addOpen, prefix]);

  const parentPrefix = (p: string) => {
    const n = p.replace(/\\/g, '/').replace(/\/$/, '');
    const idx = n.lastIndexOf('/');
    return idx >= 0 ? n.slice(0, idx) : '';
  };

const handleAddAsset = (name: string) => {
  const full = prefix ? `${prefix}/${name}` : name;

  // Проверяем, нет ли уже такого ассета на карте
  const existingAsset = assets3D.find(asset => asset.storage_path === full);
  if (existingAsset) {
    toast.error('Этот ассет уже добавлен на карту');
    setAddOpen(false);
    return;
  }

  // Раскладываем новые ассеты по сетке вокруг центра, чтобы не накладывались
  const centerX = 600;
  const centerY = 400;
  const spacingX = 120;
  const spacingY = 100;
  const cols = 5;
  const i = assets3D.length;
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = Math.max(0, Math.min(1200, centerX + (col - Math.floor(cols / 2)) * spacingX));
  const y = Math.max(0, Math.min(800, centerY + row * spacingY));

  const newItem: AssetModel = { 
    id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
    storage_path: full, 
    x, 
    y, 
    controlledBy: 'dm',
    scale: 1,
    rotationY: 0,
    animate: false
  };
  
  const next = [...assets3D, newItem];
  setAssets3D(next);
  sessionStorage.setItem(sKey('current3DAssets'), JSON.stringify(next));
  sessionStorage.setItem(sKey(`asset3D:${newItem.id}`), JSON.stringify(newItem));
  
  toast.success(`3D ассет "${name}" добавлен на карту`);
  setAddOpen(false);
};

const handleAssetMove = (id: string, x: number, y: number) => {
  setAssets3D((prev) => {
    const next = prev.map((a) => (a.id === id ? { ...a, x, y } : a));
    sessionStorage.setItem(sKey('current3DAssets'), JSON.stringify(next));
    const moved = next.find(a => a.id === id);
    if (moved) sessionStorage.setItem(sKey(`asset3D:${id}`), JSON.stringify(moved));
    return next;
  });
};

const handleAssetDelete = (id: string) => {
  setAssets3D((prev) => {
    const next = prev.filter((a) => a.id !== id);
    sessionStorage.setItem(sKey('current3DAssets'), JSON.stringify(next));
    sessionStorage.removeItem(sKey(`asset3D:${id}`));
    return next;
  });
};

const handleClearAssets = () => {
  // Очищаем токены из enhanced battle store
  clearAllTokens();
  
  // Удаляем кэш по каждому ассету этой сессии (старая система)
  const ids = assets3D.map(a => a.id);
  ids.forEach((id) => sessionStorage.removeItem(sKey(`asset3D:${id}`)));

  // На всякий случай выметаем «сиротские» ключи текущей сессии
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    const sessionSuffix = sessionId ? `:${sessionId}` : '';
    if (key.startsWith('asset3D:') && key.endsWith(sessionSuffix)) {
      sessionStorage.removeItem(key);
    }
  }

  setAssets3D([]);
  sessionStorage.removeItem(sKey('current3DAssets'));
  toast.success('Все ассеты и токены очищены');
};

// Обработчик загрузки карты
const handleMapLoaded = (imageUrl: string, scale?: number) => {
  setMapUrl(imageUrl);
  setMapBackground(imageUrl);
  sessionStorage.setItem(sKey('current3DMapUrl'), imageUrl);
  toast.success('Карта загружена в 3D режим');
  setMapUploadOpen(false);
};

// Обработчик удаления карты
const handleMapRemove = () => {
  setMapUrl('');
  setMapBackground('');
  sessionStorage.removeItem(sKey('current3DMapUrl'));
  toast.success('Карта удалена');
  setMapUploadOpen(false);
};

  // Обновляем токены при загрузке с правильными типами моделей
  useEffect(() => {
    const savedTokens = sessionStorage.getItem(sKey('current3DTokens'));
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        // Применяем утилиту для определения правильных типов моделей
        const tokensWithCorrectModels = parsedTokens.map((token: any) => 
          updateTokenWithModelType(token)
        );
        setTokens(tokensWithCorrectModels);
      } catch (error) {
        console.error('Error updating token models:', error);
      }
    }
  }, [setTokens]);

  // Обработчик перемещения токена в 3D
  const handleTokenMove = (tokenId: string, x: number, y: number) => {
    console.log('🏃 3D Token move:', { tokenId, x, y });
    setTokens(prev => prev.map(token => 
      token.id === tokenId ? { ...token, x, y } : token
    ));
    
    // Синхронизируем с sessionStorage для 2D карты
    const currentTokens = sessionStorage.getItem(sKey('current3DTokens'));
    if (currentTokens) {
      try {
        const parsedTokens = JSON.parse(currentTokens);
        const updatedTokens = parsedTokens.map((token: any) => 
          token.id === tokenId ? { ...token, x, y } : token
        );
        sessionStorage.setItem(sKey('current3DTokens'), JSON.stringify(updatedTokens));
      } catch (error) {
        console.error('Error updating tokens in session storage:', error);
      }
    }
  };

// Обработчик обновления токена
const handleTokenUpdate = (tokenId: string, updates: any) => {
  console.log('📝 3D Token update:', { tokenId, updates });
  setTokens(prev => prev.map(token => 
    token.id === tokenId ? { ...token, ...updates } : token
  ));
  
  // Синхронизация с sessionStorage (по сессии)
  const currentTokens = sessionStorage.getItem(sKey('current3DTokens'));
  if (currentTokens) {
    try {
      const parsedTokens = JSON.parse(currentTokens);
      const updatedTokens = parsedTokens.map((token: any) => 
        token.id === tokenId ? { ...token, ...updates } : token
      );
      sessionStorage.setItem(sKey('current3DTokens'), JSON.stringify(updatedTokens));
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
                sessionStorage.setItem(sKey('current3DMapUrl'), mapUrl);
                sessionStorage.setItem(sKey('current3DTokens'), JSON.stringify(tokens));
                navigate(`/battle-map-2d${sessionId ? `/${sessionId}` : ''}`);
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
              onClick={handleClearAssets}
              className="bg-red-600 hover:bg-red-700"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Очистить ассеты
            </Button>
            <Button 
              onClick={() => setShowFogPanel(!showFogPanel)}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Cloud className="w-4 h-4 mr-2" />
              Туман войны
            </Button>
            <Button 
              onClick={() => setShowInitiative(!showInitiative)}
              className="bg-red-600 hover:bg-red-700"
              size="sm"
            >
              <Sword className="w-4 h-4 mr-2" />
              Инициатива
            </Button>
            <Button 
              onClick={() => setMapUploadOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Загрузить карту
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

      {/* Enhanced Battle Manager */}
      {showInitiative && (
        <div className="absolute top-20 left-4 z-30 w-80">
          <EnhancedBattleManager />
        </div>
      )}

      {/* Fog of War Panel */}
      {showFogPanel && (
        <div className="absolute top-20 left-96 z-30 w-80">
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg">
            <FogControlPanel />
          </div>
        </div>
      )}

      {/* Quick Fog of War Toggle */}
      <div className="absolute bottom-4 right-4 z-30">
        <FogOfWarToggle />
      </div>

      {/* 3D Map */}
      <div className="w-full h-full pt-20 relative">
        <EnhancedBattleMap />
        
        {/* 3D Fog Drawing Overlay */}
        <FogDrawingOverlay3D />
      </div>

      {/* Equipment Panel */}
      <div className="absolute top-20 right-4 z-40 w-80">
        <EquipmentPanel />
      </div>

      {/* Map Upload Dialog */}
      <Dialog open={mapUploadOpen} onOpenChange={setMapUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Загрузить карту</DialogTitle>
          </DialogHeader>
          <MapUploader
            onMapLoaded={handleMapLoaded}
            currentMapUrl={mapUrl}
            onMapRemove={handleMapRemove}
          />
        </DialogContent>
      </Dialog>

      {/* Gallery dialog for adding 3D assets */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Выбор 3D ассета</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Категории */}
            <div className="flex flex-wrap gap-2 items-center">
              <Button size="sm" variant={prefix.startsWith('monsters') ? 'default' : 'outline'} onClick={() => { setPrefix('monsters'); loadFiles('monsters'); }}>Монстры</Button>
              <Button size="sm" variant={prefix.startsWith('characters') ? 'default' : 'outline'} onClick={() => { setPrefix('characters'); loadFiles('characters'); }}>Персонажи</Button>
              <Button size="sm" variant={prefix.startsWith('structures') ? 'default' : 'outline'} onClick={() => { setPrefix('structures'); loadFiles('structures'); }}>Строения</Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Фильтр по имени..."
                value={fileQuery}
                onChange={(e) => setFileQuery(e.target.value)}
              />
              <Input
                placeholder="Префикс (папка), напр. monsters/"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
              <Button size="sm" onClick={() => loadFiles(prefix)}>Обновить</Button>
              {prefix && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const p = parentPrefix(prefix);
                    setPrefix(p);
                    loadFiles(p);
                  }}
                >
                  Назад
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-auto">
              {files
                .filter((f) => !fileQuery || f.name.toLowerCase().includes(fileQuery.toLowerCase()))
                .map((f) => {
                  const isFile = /\.(glb|gltf)$/i.test(f.name);
                  return (
                    <button
                      key={f.name}
                      className="p-3 rounded-md border hover:bg-muted text-left"
                      onClick={() => {
                        if (isFile) {
                          handleAddAsset(f.name);
                        } else {
                          const next = prefix ? `${prefix}/${f.name}` : f.name;
                          setPrefix(next);
                          loadFiles(next);
                        }
                      }}
                    >
                      <div className="font-medium truncate">{f.name}</div>
                      <div className="text-xs opacity-70">{isFile ? 'Модель' : 'Папка'}</div>
                    </button>
                  );
                })}

              {files.length === 0 && (
                <div className="col-span-full text-sm opacity-70">Нет элементов в этой папке.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BattleMap3DPage;