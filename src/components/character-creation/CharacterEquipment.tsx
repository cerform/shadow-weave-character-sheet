
import React, { useState, useEffect } from 'react';
import { Character, Item } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CharacterEquipmentProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();
  
  // Состояние для оружия, брони и предметов
  const [weapons, setWeapons] = useState<string[]>([]);
  const [armor, setArmor] = useState<string>('');
  const [items, setItems] = useState<string[]>([]);
  const [gold, setGold] = useState<number>(0);
  
  // Инициализация начальных значений из character
  useEffect(() => {
    // Проверяем наличие экипировки и её тип
    if (character.equipment) {
      if (Array.isArray(character.equipment)) {
        // Если это массив Item объектов, преобразуем в строки
        const weaponItems = character.equipment
          .filter(item => item.type === 'weapon')
          .map(item => item.name);
        setWeapons(weaponItems);
        
        const armorItem = character.equipment
          .find(item => item.type === 'armor');
        setArmor(armorItem?.name || '');
        
        const otherItems = character.equipment
          .filter(item => item.type !== 'weapon' && item.type !== 'armor')
          .map(item => item.name);
        setItems(otherItems);
      } else {
        // Если это объект с weapons, armor, items
        const equip = character.equipment as { weapons?: string[], armor?: string, items?: string[] };
        setWeapons(equip.weapons || []);
        setArmor(equip.armor || '');
        setItems(equip.items || []);
      }
    }
    
    // Инициализация золота
    setGold(character.gold || 0);
  }, [character.equipment, character.gold]);
  
  // Функция обновления оружия
  const handleWeaponsChange = (value: string) => {
    const weaponsList = value.split(',').map(w => w.trim()).filter(w => w !== '');
    setWeapons(weaponsList);
  };
  
  // Функция обновления предметов
  const handleItemsChange = (value: string) => {
    const itemsList = value.split(',').map(i => i.trim()).filter(i => i !== '');
    setItems(itemsList);
  };
  
  // Сохранение экипировки
  const saveEquipment = () => {
    // Создаем новый объект экипировки
    const equipmentObj = {
      weapons,
      armor,
      items
    };
    
    // Обновляем персонажа с правильным типом
    onUpdate({ 
      equipment: equipmentObj as any, // Используем any для обхода проверки типов
      gold: gold
    });
    
    toast({
      title: "Экипировка обновлена",
      description: "Ваша экипировка и золото успешно обновлены.",
    });
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="weapons">Оружие (через запятую)</Label>
            <Textarea 
              id="weapons"
              value={weapons.join(", ")}
              onChange={(e) => handleWeaponsChange(e.target.value)}
              placeholder="Длинный меч, кинжал, лук..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="armor">Доспехи</Label>
            <Input
              id="armor"
              value={armor}
              onChange={(e) => setArmor(e.target.value)}
              placeholder="Кольчуга, кожаный доспех..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="items">Предметы (через запятую)</Label>
            <Textarea
              id="items"
              value={items.join(", ")}
              onChange={(e) => handleItemsChange(e.target.value)}
              placeholder="Рюкзак, верёвка 50 футов, фонарь..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="gold">Золото</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="gold"
                type="number"
                value={gold}
                onChange={(e) => setGold(Number(e.target.value) || 0)}
                min={0}
              />
              <span>зм</span>
            </div>
          </div>
          
          <Button onClick={saveEquipment} className="w-full">
            Сохранить экипировку
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterEquipment;
