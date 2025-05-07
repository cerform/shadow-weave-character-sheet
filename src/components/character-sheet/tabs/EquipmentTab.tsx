// Import necessary modules and components
import React, { useState, useEffect } from 'react';
import { Character, Item } from '@/types/character';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface EquipmentTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Helper function to convert string[] or Item[] to Item[]
const normalizeItems = (items: (string | Item)[]): Item[] => {
  return items.map(item => {
    if (typeof item === 'string') {
      return { name: item };
    }
    return item;
  });
};

const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();

  // Initialize state for weapons, armor, and items
  const [weapons, setWeapons] = useState<Item[]>([]);
  const [armor, setArmor] = useState<Item | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [gold, setGold] = useState<number>(0);

  // Initialize values from character
  useEffect(() => {
    if (character.equipment) {
      if (Array.isArray(character.equipment)) {
        // Normalize items to ensure they are Item objects
        const normalizedEquipment = normalizeItems(character.equipment);

        // Filter and set weapons, armor, and items
        setWeapons(normalizedEquipment.filter(item => item.type === 'weapon'));
        setArmor(normalizedEquipment.find(item => item.type === 'armor') || null);
        setItems(normalizedEquipment.filter(item => item.type !== 'weapon' && item.type !== 'armor'));
      }
    }

    // Initialize gold
    setGold(character.gold || 0);
  }, [character.equipment, character.gold]);

  // Update functions to handle both string and Item types
  const handleSaveEquipment = () => {
    // Create equipment array with proper Item objects
    const equipment: Item[] = [
      ...weapons.map(w => typeof w === 'string' ? { name: w, type: 'weapon' } : w),
      ...(armor ? [typeof armor === 'string' ? { name: armor, type: 'armor' } : armor] : []),
      ...items.map(i => typeof i === 'string' ? { name: i } : i)
    ];

    onUpdate({
      equipment,
      gold
    });

    toast({
      title: "Экипировка обновлена",
      description: "Экипировка и золото успешно обновлены."
    });
  };

  // Function to handle weapon changes
  const handleWeaponsChange = (value: string) => {
    const weaponsList = value.split(',').map(w => ({ name: w.trim(), type: 'weapon' })).filter(w => w.name !== '');
    setWeapons(weaponsList);
  };

  // Function to handle armor changes
  const handleArmorChange = (value: string) => {
    setArmor(value ? { name: value.trim(), type: 'armor' } : null);
  };

  // Function to handle item changes
  const handleItemsChange = (value: string) => {
    const itemsList = value.split(',').map(i => ({ name: i.trim() })).filter(i => i.name !== '');
    setItems(itemsList);
  };

  return (
    <Card className="w-full">
      {/* ... Card Header and Title ... */}
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="weapons">Оружие (через запятую)</Label>
            <Textarea
              id="weapons"
              value={weapons.map(w => w.name).join(", ")}
              onChange={(e) => handleWeaponsChange(e.target.value)}
              placeholder="Длинный меч, кинжал, лук..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="armor">Доспехи</Label>
            <Input
              id="armor"
              value={armor ? armor.name : ''}
              onChange={(e) => handleArmorChange(e.target.value)}
              placeholder="Кольчуга, кожаный доспех..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="items">Предметы (через запятую)</Label>
            <Textarea
              id="items"
              value={items.map(i => i.name).join(", ")}
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

          <Button onClick={handleSaveEquipment} className="w-full">
            Сохранить экипировку
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentTab;
