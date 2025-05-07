import React, { useState, useEffect } from 'react';
import { Character, Item } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { isItem, stringToItem } from '@/utils/itemUtils';

interface CharacterEquipmentProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({ character, onUpdate }) => {
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newEquipmentQuantity, setNewEquipmentQuantity] = useState(1);
  const [newEquipmentType, setNewEquipmentType] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItemName, setEditedItemName] = useState('');
  const [editedItemQuantity, setEditedItemQuantity] = useState(1);
  const [editedItemType, setEditedItemType] = useState('');

  useEffect(() => {
    // Initialize local state when character.equipment changes
    if (character.equipment && Array.isArray(character.equipment)) {
      // No specific initialization needed for this component
    }
  }, [character.equipment]);

  const handleAddItem = () => {
    if (newEquipmentName.trim() === '') {
      return;
    }

    const newItem: Item = {
      name: newEquipmentName,
      quantity: newEquipmentQuantity,
      type: newEquipmentType,
    };

    let updatedEquipment: Item[] = [];
    
    if (character.equipment) {
      if (Array.isArray(character.equipment)) {
        // Преобразуем все элементы equipment в Item
        updatedEquipment = [...character.equipment.map(item => {
          if (typeof item === 'string') {
            return stringToItem(item);
          }
          return item as Item;
        }), newItem];
      } else {
        // Конвертируем объект в массив Item для нового формата
        const items: Item[] = [];
        if (character.equipment.weapons) {
          character.equipment.weapons.forEach(w => items.push({ name: w, quantity: 1, type: 'weapon' }));
        }
        if (character.equipment.armor) {
          items.push({ name: character.equipment.armor, quantity: 1, type: 'armor' });
        }
        if (character.equipment.items) {
          character.equipment.items.forEach(i => items.push({ name: i, quantity: 1 }));
        }
        updatedEquipment = [...items, newItem];
      }
    } else {
      updatedEquipment = [newItem];
    }

    onUpdate({ equipment: updatedEquipment });
    setNewEquipmentName('');
    setNewEquipmentQuantity(1);
    setNewEquipmentType('');
  };

  const handleRemoveItem = (index: number) => {
    if (!character.equipment || !Array.isArray(character.equipment)) {
      return;
    }

    const updatedEquipment = [...character.equipment];
    updatedEquipment.splice(index, 1);
    
    // Преобразуем все элементы equipment в Item
    const normalizedEquipment: Item[] = updatedEquipment.map(item => {
      if (typeof item === 'string') {
        return stringToItem(item);
      }
      return item as Item;
    });
    
    onUpdate({ equipment: normalizedEquipment });
  };

  const handleStartEdit = (item: Item) => {
    setEditingItemId(item.name);
    setEditedItemName(item.name);
    setEditedItemQuantity(item.quantity);
    setEditedItemType(item.type || '');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSaveEdit = (index: number) => {
    if (!character.equipment || !Array.isArray(character.equipment)) {
      return;
    }

    const updatedEquipment = [...character.equipment];
    const itemToUpdate: Item = {
      name: editedItemName,
      quantity: editedItemQuantity,
      type: editedItemType,
    };
    updatedEquipment[index] = itemToUpdate;
    
    // Преобразуем все элементы equipment в Item
    const normalizedEquipment: Item[] = updatedEquipment.map(item => {
      if (typeof item === 'string') {
        return stringToItem(item);
      }
      return item as Item;
    });

    onUpdate({ equipment: normalizedEquipment });
    setEditingItemId(null);
  };
  
  const renderItem = (item: string | Item, index: number) => {
    const itemObj = isItem(item) ? item : stringToItem(item);
    
    if (editingItemId === itemObj.name) {
      return (
        <div key={itemObj.name} className="flex items-center space-x-2">
          <Input
            type="text"
            value={editedItemName}
            onChange={(e) => setEditedItemName(e.target.value)}
            className="w-24"
          />
          <Input
            type="number"
            value={String(editedItemQuantity)}
            onChange={(e) => setEditedItemQuantity(Number(e.target.value))}
            className="w-16"
          />
          <Input
            type="text"
            value={editedItemType}
            onChange={(e) => setEditedItemType(e.target.value)}
            className="w-24"
          />
          <Button size="sm" onClick={() => handleSaveEdit(index)}>
            Сохранить
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
            Отмена
          </Button>
        </div>
      );
    } else {
      return (
        <div key={itemObj.name} className="flex items-center justify-between">
          <div>
            <span>{itemObj.name}</span>
            {itemObj.type && <span className="ml-2 text-sm text-gray-500">({itemObj.type})</span>}
            {itemObj.quantity > 1 && <span className="ml-2 text-sm text-gray-500">x{itemObj.quantity}</span>}
          </div>
          <div>
            <Button size="sm" onClick={() => handleStartEdit(itemObj)}>
              Редактировать
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleRemoveItem(index)}>
              <X className="h-4 w-4 mr-2" />
              Удалить
            </Button>
          </div>
        </div>
      );
    }
  };
  
  return (
    <Card className="w-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Снаряжение</h2>
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="newItemName">Название:</Label>
              <Input
                type="text"
                id="newItemName"
                value={newEquipmentName}
                onChange={(e) => setNewEquipmentName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newItemQuantity">Количество:</Label>
              <Input
                type="number"
                id="newItemQuantity"
                value={String(newEquipmentQuantity)}
                onChange={(e) => setNewEquipmentQuantity(Number(e.target.value))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="newItemType">Тип:</Label>
              <Input
                type="text"
                id="newItemType"
                value={newEquipmentType}
                onChange={(e) => setNewEquipmentType(e.target.value)}
              />
            </div>
          </div>
          <Button className="mt-2" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        </div>
        <div>
          {character.equipment && Array.isArray(character.equipment) ? (
            character.equipment.map((item, index) => renderItem(item, index))
          ) : (
            <p>Нет снаряжения.</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CharacterEquipment;
