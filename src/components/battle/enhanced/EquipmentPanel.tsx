import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { equipmentHelpers } from '@/stores/assetEquipStore';
import { SlotName } from '@/utils/CharacterManager';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';

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
  const [characterId, setCharacterId] = useState('hero-1');
  const [assetUrl, setAssetUrl] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<SlotName>('head');
  const [boneName, setBoneName] = useState('');
  const [scale, setScale] = useState(1);

  const handleAddCharacter = () => {
    if (!characterId || !assetUrl) return;
    
    equipmentHelpers.addCharacter(characterId, assetUrl);
    setAssetUrl('');
  };

  const handleAddEquipment = () => {
    if (!characterId || !assetUrl || !selectedSlot) return;
    
    equipmentHelpers.addEquipment(characterId, assetUrl, selectedSlot, {
      boneName: boneName || undefined,
      scale: scale !== 1 ? scale : undefined
    });
    
    setAssetUrl('');
    setBoneName('');
    setScale(1);
  };

  const handleQuickEquip = (slot: SlotName, url: string, bone?: string) => {
    if (!characterId) return;
    
    equipmentHelpers.addEquipment(characterId, url, slot, {
      boneName: bone,
      scale: 1
    });
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

        {/* Asset URL */}
        <div className="space-y-2">
          <Label htmlFor="asset-url">URL модели (.glb)</Label>
          <Input
            id="asset-url"
            value={assetUrl}
            onChange={(e) => setAssetUrl(e.target.value)}
            placeholder="/models/character.glb"
          />
        </div>

        {/* Quick actions for character */}
        <div className="flex gap-2">
          <Button 
            onClick={handleAddCharacter}
            variant="outline"
            className="flex-1"
            disabled={!characterId || !assetUrl}
          >
            Добавить персонажа
          </Button>
        </div>

        <hr className="border-border" />

        {/* Equipment section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Снаряжение</h4>
          
          {/* Slot selection */}
          <div className="space-y-2">
            <Label>Слот экипировки</Label>
            <Select value={selectedSlot} onValueChange={(value) => setSelectedSlot(value as SlotName)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {slotOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bone name */}
          <div className="space-y-2">
            <Label htmlFor="bone-name">Название кости (опционально)</Label>
            <Select value={boneName} onValueChange={setBoneName}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите кость или оставьте пустым" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без кости (якорная точка)</SelectItem>
                {commonBones.map((bone) => (
                  <SelectItem key={bone} value={bone}>
                    {bone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <Label htmlFor="scale">Масштаб: {scale}</Label>
            <input
              id="scale"
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Add equipment button */}
          <Button 
            onClick={handleAddEquipment}
            className="w-full"
            disabled={!characterId || !assetUrl || !selectedSlot}
          >
            Экипировать
          </Button>
        </div>

        <hr className="border-border" />

        {/* Quick equipment buttons */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Быстрая экипировка</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickEquip('head', '/models/hat.glb', 'Head')}
              disabled={!characterId}
            >
              🎩 Шляпа
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickEquip('mainHand', '/models/sword.glb', 'RightHand')}
              disabled={!characterId}
            >
              ⚔️ Меч
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickEquip('back', '/models/cloak.glb')}
              disabled={!characterId}
            >
              🧥 Плащ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickEquip('body', '/models/armor.glb')}
              disabled={!characterId}
            >
              🛡️ Доспех
            </Button>
          </div>
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