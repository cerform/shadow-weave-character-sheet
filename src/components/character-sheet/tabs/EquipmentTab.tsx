import React, { useState } from 'react';
import { Character, Item } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Добавляем импорт CardContent
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EquipmentTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, onUpdate }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;

    const newItem: Item = {
      name: newItemName,
      quantity: newItemQuantity,
    };

    const updatedEquipment = [...(character.equipment as Item[] || []), newItem];
    onUpdate({ equipment: updatedEquipment });
    setNewItemName('');
    setNewItemQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const updatedEquipment = [...(character.equipment as Item[] || [])];
    updatedEquipment.splice(index, 1);
    onUpdate({ equipment: updatedEquipment });
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updatedEquipment = [...(character.equipment as Item[] || [])];
    if (updatedEquipment[index]) {
      updatedEquipment[index] = { ...updatedEquipment[index], quantity: newQuantity };
      onUpdate({ equipment: updatedEquipment });
    }
  };

  return (
    <Tabs defaultValue="equipment" className="w-full">
      <TabsList>
        <TabsTrigger value="equipment">Снаряжение</TabsTrigger>
        <TabsTrigger value="inventory">Инвентарь</TabsTrigger>
      </TabsList>
      <TabsContent value="equipment" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Экипировка</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full">
              <div className="divide-y divide-border">
                {(character.equipment as Item[] || []).map((item, index) => (
                  <div key={index} className="py-2 flex items-center justify-between">
                    <span>{item.name} (x{item.quantity})</span>
                    <div>
                      <Input
                        type="number"
                        value={item.quantity || 1}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                        className="w-20 text-center"
                      />
                      <Button variant="outline" size="sm" onClick={() => handleRemoveItem(index)}>
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <div className="flex gap-2">
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
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
            className="w-24"
          />
          <Button onClick={handleAddItem}>Добавить предмет</Button>
        </div>
      </TabsContent>

      <TabsContent value="inventory">
        <Card>
          <CardHeader>
            <CardTitle>Инвентарь</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Здесь будет отображаться инвентарь персонажа.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default EquipmentTab;
