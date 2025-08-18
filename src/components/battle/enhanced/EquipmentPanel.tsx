import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useAssetsStore } from '@/stores/assetsStore';

export const EquipmentPanel: React.FC = () => {
  const { tokens, addToken } = useEnhancedBattleStore();
  const { assets, categories, loadAll } = useAssetsStore();
  const [selectedAssetId, setSelectedAssetId] = useState('');

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const selectedAsset = useMemo(() => {
    return assets.find(asset => asset.id === selectedAssetId);
  }, [assets, selectedAssetId]);

  const categoriesById = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);
  }, [categories]);

  const approvedAssets = useMemo(() => {
    return assets.filter(asset => asset.approved);
  }, [assets]);

  const handleAddAsset = (asset: any) => {
    console.log('📦 Adding asset:', asset);
    
    // Формируем правильный URL для модели из библиотеки
    const modelUrl = asset.storage_path ? `https://mqdjwhjtvjnktobgruuu.supabase.co/storage/v1/object/public/models/${asset.storage_path}` : undefined;
    
    // Создаем уникальный ID и позицию
    const newToken = {
      id: `${asset.name.toLowerCase().replace(/\s+/g, '_')}-${Date.now()}`,
      name: asset.name,
      hp: 100,
      maxHp: 100,
      ac: 14,
      position: [
        Math.random() * 20 - 10, // случайная позиция X от -10 до 10
        0,
        Math.random() * 20 - 10  // случайная позиция Z от -10 до 10
      ] as [number, number, number],
      conditions: [],
      isEnemy: false,
      modelUrl: modelUrl, // Используем правильный URL
      scale: 1
    };
    
    console.log('📦 Adding token with modelUrl:', modelUrl);
    addToken(newToken);
    console.log('✅ Token added:', newToken.id);
    setSelectedAssetId('');
  };

  return (
    <Card className="w-80 bg-background/95 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Экипировка персонажей</CardTitle>
        <div className="text-sm text-muted-foreground">
          Выберите 3D модели из библиотеки для добавления на карту
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Библиотека ассетов */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">3D Модели</h4>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {approvedAssets.map((asset) => (
              <Button
                key={asset.id}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2 text-xs"
                onClick={() => handleAddAsset(asset)}
              >
                <div className="text-center">
                  <div className="font-medium">{asset.name}</div>
                  {categoriesById[asset.category_id] && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {categoriesById[asset.category_id]}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Текущие токены */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Токены на карте ({tokens.length})</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {tokens.map((token) => (
              <div key={token.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    token.isEnemy ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <span>{token.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {token.hp}/{token.maxHp} HP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Нажмите на 3D модель чтобы добавить её на карту</p>
          <p>• Активный токен можно перемещать мышью</p>
          <p>• Используйте HUD для управления боем</p>
        </div>
      </CardContent>
    </Card>
  );
};