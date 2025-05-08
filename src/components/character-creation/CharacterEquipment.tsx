import React, { useState } from 'react';
import { Character, Item } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CharacterEquipmentProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({ character, onUpdate }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const { toast } = useToast();
  
  // Преобразование оборудования к единому формату Item[]
  const getEquipmentItems = (): Item[] => {
    if (!character.equipment) return [];
    
    // Если уже в нужном формате Item[]
    if (Array.isArray(character.equipment) && 
        character.equipment.length > 0 && 
        typeof character.equipment[0] === 'object' &&
        'name' in character.equipment[0]) {
      return character.equipment as Item[];
    }
    
    // Если в формате строк
    if (Array.isArray(character.equipment) && 
        character.equipment.length > 0 && 
        typeof character.equipment[0] === 'string') {
      return (character.equipment as unknown as string[]).map(name => ({
        name,
        quantity: 1,
      }));
    }
    
    // Если в формате объекта с weapons, armor, items
    if (!Array.isArray(character.equipment)) {
      const equipment = character.equipment as { weapons?: string[], armor?: string, items?: string[] };
      const result: Item[] = [];
      
      if (equipment.weapons) {
        equipment.weapons.forEach(weapon => {
          result.push({
            name: weapon,
            quantity: 1,
            type: 'weapon',
          });
        });
      }
      
      if (equipment.armor) {
        result.push({
          name: equipment.armor,
          quantity: 1,
          type: 'armor',
        });
      }
      
      if (equipment.items) {
        equipment.items.forEach(item => {
          result.push({
            name: item,
            quantity: 1,
            type: 'item',
          });
        });
      }
      
      return result;
    }
    
    return [];
  };
  
  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название предмета",
        variant: "destructive",
      });
      return;
    }
    
    const newItem: Item = {
      name: newItemName,
      quantity: newItemQuantity,
    };
    
    const currentEquipment = getEquipmentItems();
    const updatedEquipment = [...currentEquipment, newItem];
    
    onUpdate({ equipment: updatedEquipment });
    
    setNewItemName('');
    setNewItemQuantity(1);
    
    toast({
      title: "Предмет добавлен",
      description: `${newItemName} (${newItemQuantity}) добавлен в инвентарь`,
    });
  };
  
  const handleRemoveItem = (index: number) => {
    const currentEquipment = getEquipmentItems();
    const updatedEquipment = [...currentEquipment];
    updatedEquipment.splice(index, 1);
    
    onUpdate({ equipment: updatedEquipment });
    
    toast({
      title: "Предмет удален",
      description: "Предмет удален из инвентаря",
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">Экипировка</h3>
        
        <div className="space-y-2">
          {getEquipmentItems().map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span>{item.name} ({item.quantity})</span>
              <Button variant="outline" size="icon" onClick={() => handleRemoveItem(index)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {getEquipmentItems().length === 0 && (
            <div className="text-center text-muted-foreground">
              Нет экипировки
            </div>
          )}
        </div>
        
        <div>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Название предмета"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Количество"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
              className="w-24"
            />
          </div>
          <Button className="mt-2 w-full" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить предмет
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterEquipment;
