
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EquipmentTabProps {
  character: Character;
  equipment?: string[];
  onUpdate: (updates: Partial<Character>) => void;
}

export const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, equipment = [], onUpdate }) => {
  const [newItem, setNewItem] = useState('');
  
  // Обработка добавления снаряжения
  const addItem = () => {
    if (!newItem.trim()) return;
    
    let updatedEquipment: string[] = [];
    
    // Обрабатываем существующее снаряжение
    if (Array.isArray(character.equipment)) {
      updatedEquipment = [...character.equipment, newItem];
    } else if (typeof character.equipment === 'object' && character.equipment) {
      // Конвертируем объект в массив для упрощения
      const existingItems: string[] = [];
      if (character.equipment.weapons) existingItems.push(...character.equipment.weapons);
      if (character.equipment.armor) existingItems.push(character.equipment.armor);
      if (character.equipment.items) existingItems.push(...character.equipment.items);
      
      updatedEquipment = [...existingItems, newItem];
    } else {
      updatedEquipment = [newItem];
    }
    
    onUpdate({ equipment: updatedEquipment });
    setNewItem('');
  };
  
  // Удаление предмета
  const removeItem = (index: number) => {
    let currentEquipment: string[] = [];
    
    if (Array.isArray(character.equipment)) {
      currentEquipment = [...character.equipment];
    } else if (typeof character.equipment === 'object' && character.equipment) {
      if (character.equipment.weapons) currentEquipment.push(...character.equipment.weapons);
      if (character.equipment.armor) currentEquipment.push(character.equipment.armor);
      if (character.equipment.items) currentEquipment.push(...character.equipment.items);
    } else {
      return; // Нет снаряжения для удаления
    }
    
    const updatedEquipment = [...currentEquipment];
    updatedEquipment.splice(index, 1);
    
    onUpdate({ equipment: updatedEquipment });
  };
  
  // Получаем список предметов для отображения
  const getEquipmentList = (): string[] => {
    if (equipment && equipment.length > 0) {
      return equipment;
    }
    
    if (Array.isArray(character.equipment)) {
      return character.equipment;
    }
    
    if (typeof character.equipment === 'object' && character.equipment) {
      const items: string[] = [];
      if (character.equipment.weapons) items.push(...character.equipment.weapons);
      if (character.equipment.armor) items.push(character.equipment.armor);
      if (character.equipment.items) items.push(...character.equipment.items);
      return items;
    }
    
    return [];
  };
  
  const equipmentList = getEquipmentList();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Снаряжение</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="Добавить предмет снаряжения"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <Button onClick={addItem} size="icon" disabled={!newItem.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {equipmentList.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                У персонажа нет снаряжения
              </p>
            ) : (
              equipmentList.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-muted rounded-md"
                >
                  <span>{item}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
