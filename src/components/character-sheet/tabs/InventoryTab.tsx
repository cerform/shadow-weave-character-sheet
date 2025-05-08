
import React, { useState } from 'react';
import { Character, Item } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';

interface InventoryTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const InventoryTab: React.FC<InventoryTabProps> = ({ character, onUpdate }) => {
  const [newItem, setNewItem] = useState<Item>({
    name: '',
    quantity: 1,
    weight: 0,
  });

  // Вспомогательная функция для отображения предмета
  const renderItem = (item: string | Item) => {
    if (typeof item === 'string') {
      return item;
    } else {
      return (
        <div className="flex items-center justify-between">
          <span>
            {item.name} {item.quantity && item.quantity > 1 ? `(${item.quantity})` : ''}
          </span>
          <span className="text-sm text-gray-500">
            {item.weight ? `${item.weight} фн.` : ''}
          </span>
        </div>
      );
    }
  };

  // Управление добавлением предмета
  const handleAddItem = () => {
    if (!newItem.name) return;

    const updatedInventory = [...(character.inventory || []), { ...newItem, id: `item-${Date.now()}` }];
    onUpdate({ inventory: updatedInventory });
    
    // Сбросить форму
    setNewItem({
      name: '',
      quantity: 1,
      weight: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Валюта */}
      <Card>
        <CardHeader>
          <CardTitle>Валюта</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <Label htmlFor="copper">Медь</Label>
              <div className="flex items-center">
                <Input 
                  id="copper" 
                  type="number" 
                  value={character.currency?.copper || character.copper || 0}
                  onChange={(e) => onUpdate({ 
                    copper: parseInt(e.target.value) || 0,
                    currency: { 
                      ...character.currency,
                      copper: parseInt(e.target.value) || 0 
                    }
                  })}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="silver">Серебро</Label>
              <div className="flex items-center">
                <Input 
                  id="silver" 
                  type="number" 
                  value={character.currency?.silver || character.silver || 0}
                  onChange={(e) => onUpdate({ 
                    silver: parseInt(e.target.value) || 0,
                    currency: { 
                      ...character.currency,
                      silver: parseInt(e.target.value) || 0 
                    }
                  })}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="electrum">Электрум</Label>
              <div className="flex items-center">
                <Input 
                  id="electrum" 
                  type="number" 
                  value={character.currency?.electrum || character.electrum || 0}
                  onChange={(e) => onUpdate({ 
                    electrum: parseInt(e.target.value) || 0,
                    currency: { 
                      ...character.currency,
                      electrum: parseInt(e.target.value) || 0 
                    }
                  })}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gold">Золото</Label>
              <div className="flex items-center">
                <Input 
                  id="gold" 
                  type="number" 
                  value={character.currency?.gold || character.gold || 0}
                  onChange={(e) => onUpdate({ 
                    gold: parseInt(e.target.value) || 0,
                    currency: { 
                      ...character.currency,
                      gold: parseInt(e.target.value) || 0 
                    }
                  })}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="platinum">Платина</Label>
              <div className="flex items-center">
                <Input 
                  id="platinum" 
                  type="number" 
                  value={character.currency?.platinum || character.platinum || 0}
                  onChange={(e) => onUpdate({ 
                    platinum: parseInt(e.target.value) || 0,
                    currency: { 
                      ...character.currency,
                      platinum: parseInt(e.target.value) || 0 
                    }
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Инвентарь */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Инвентарь</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Список предметов */}
            <div className="border rounded-md p-3 space-y-2">
              {character.inventory && character.inventory.length > 0 ? (
                character.inventory.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between items-center py-1 border-b last:border-b-0">
                    {renderItem(item)}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const newInventory = [...character.inventory!];
                        newInventory.splice(index, 1);
                        onUpdate({ inventory: newInventory });
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-2">Инвентарь пуст</p>
              )}
            </div>

            {/* Форма добавления предмета */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Label htmlFor="item-name">Название</Label>
                <Input 
                  id="item-name" 
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Зелье лечения"
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="item-quantity">Кол-во</Label>
                <Input 
                  id="item-quantity" 
                  type="number"
                  value={newItem.quantity || 1}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="item-weight">Вес (фн.)</Label>
                <Input 
                  id="item-weight" 
                  type="number"
                  step="0.1"
                  value={newItem.weight || 0}
                  onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-1 flex items-end">
                <Button variant="outline" onClick={handleAddItem} className="w-full">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryTab;
