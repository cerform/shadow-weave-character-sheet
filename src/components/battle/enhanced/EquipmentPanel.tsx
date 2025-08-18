import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { equipmentHelpers } from '@/stores/assetEquipStore';
import { SlotName } from '@/utils/CharacterManager';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useAssetsStore } from '@/stores/assetsStore';
import { publicModelUrl } from '@/utils/storageUrls';
import { assetUrl } from '@/config/assets';

const slotOptions: { value: SlotName; label: string }[] = [
  { value: 'head', label: 'Голова' },
  { value: 'body', label: 'Тело' },
  { value: 'mainHand', label: 'Основная рука' },
  { value: 'offHand', label: 'Вторая рука' },
  { value: 'back', label: 'Спина' },
  { value: 'misc', label: 'Разное' }
];

const commonBones = [
  'Head',
  'mixamorigHead',
  'RightHand',
  'LeftHand',
  'mixamorigRightHand',
  'mixamorigLeftHand',
  'Spine',
  'mixamorigSpine'
];

export const EquipmentPanel: React.FC = () => {
  const { tokens } = useEnhancedBattleStore();
  const { assets, categories, loadAll } = useAssetsStore();
  const [characterId, setCharacterId] = useState('hero-1');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<SlotName>('head');
  const [boneName, setBoneName] = useState('');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Мемоизированные данные
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

  const handleAddCharacter = () => {
    if (!characterId || !selectedAsset) return;
    
    // Find a random position to avoid overlapping
    const randomOffset: [number, number, number] = [
      Math.random() * 4 - 2, // -2 to 2
      0,
      Math.random() * 4 - 2  // -2 to 2
    ];
    
    const assetUrl = publicModelUrl(selectedAsset.storage_path);
    equipmentHelpers.addCharacter(characterId, assetUrl, randomOffset);
    setSelectedAssetId('');
  };

  const handleAddEquipment = () => {
    if (!characterId || !selectedAsset || !selectedSlot) return;
    
    const assetUrl = publicModelUrl(selectedAsset.storage_path);
    equipmentHelpers.addEquipment(characterId, assetUrl, selectedSlot, {
      boneName: boneName && boneName !== 'none' ? boneName : undefined,
      scale: scale !== 1 ? scale : undefined
    });
    
    setSelectedAssetId('');
    setBoneName('');
    setScale(1);
  };


  return (
    <Card className="fixed bottom-4 left-4 w-96 bg-background/95 backdrop-blur-sm border-border z-40">
      <CardHeader>
        <CardTitle className="text-primary">Экипировка персонажей</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Character ID */}
        <div className="space-y-2">
          <Label htmlFor="character-id">Персонаж</Label>
          <Select value={characterId} onValueChange={setCharacterId}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите персонажа" />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem key={token.id} value={token.id}>
                  {token.name} ({token.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Asset Selection */}
        <div className="space-y-2">
          <Label htmlFor="asset-select">Модель из библиотеки</Label>
          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите модель" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {approvedAssets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  <div className="flex items-center gap-2">
                    <span>{asset.name}</span>
                    {categoriesById[asset.category_id] && (
                      <Badge variant="secondary" className="text-xs">
                        {categoriesById[asset.category_id]}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedAsset && (
            <div className="text-xs text-muted-foreground">
              Путь: {selectedAsset.storage_path}
            </div>
          )}
        </div>

        {/* Quick actions for character */}
        <div className="flex gap-2">
          <Button 
            onClick={handleAddCharacter}
            variant="outline"
            className="flex-1"
            disabled={!characterId || !selectedAsset}
          >
            Добавить персонажа
          </Button>
        </div>


        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Сначала добавьте персонажа, затем экипируйте его</p>
          <p>• Если модель имеет скелет, указывайте название кости</p>
          <p>• Без кости предмет крепится к якорной точке слота</p>
          <p>• Клик по любой части персонажа выберет всего персонажа</p>
        </div>
      </CardContent>
    </Card>
  );
};