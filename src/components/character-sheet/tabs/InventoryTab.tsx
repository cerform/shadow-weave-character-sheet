
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash, Coins } from 'lucide-react';

interface InventoryTabProps {
  character: Character | null;
  onUpdate: (updates: Partial<Character>) => void;
}

const InventoryTab = ({ character, onUpdate }: InventoryTabProps) => {
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  
  // Получение инвентаря персонажа
  const getEquipment = () => {
    if (!character?.equipment) return [];
    
    if (typeof character.equipment[0] === 'object' && character.equipment[0] !== null) {
      return character.equipment as { name: string; quantity: number }[];
    }
    
    // Преобразуем строковый формат в объектный
    return (character.equipment as string[]).map(item => ({ name: item, quantity: 1 }));
  };
  
  const equipment = getEquipment();
  
  // Добавление нового предмета
  const addItem = () => {
    if (!character || !newItem.trim()) return;
    
    const itemToAdd = { name: newItem.trim(), quantity: newQuantity };
    const updatedEquipment = [...equipment, itemToAdd];
    
    onUpdate({ equipment: updatedEquipment });
    setNewItem('');
    setNewQuantity(1);
  };
  
  // Удаление предмета
  const removeItem = (indexToRemove: number) => {
    const updatedEquipment = equipment.filter((_, index) => index !== indexToRemove);
    onUpdate({ equipment: updatedEquipment });
  };
  
  // Обновление количества предмета
  const updateItemQuantity = (index: number, newQty: number) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index].quantity = Math.max(1, newQty);
    onUpdate({ equipment: updatedEquipment });
  };
  
  // Обновление денег персонажа
  const updateMoney = (currency: keyof NonNullable<Character['money']>, amount: number) => {
    if (!character) return;
    
    const updatedMoney = { 
      ...character.money || {},
      [currency]: Math.max(0, amount)
    };
    
    onUpdate({ money: updatedMoney });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Инвентарь</h2>
        
        {/* Деньги */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Coins className="mr-2 h-5 w-5" />
              <h3 className="text-lg font-medium">Деньги</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Медные (мм)</label>
                <Input 
                  type="number"
                  value={character?.money?.copper || 0}
                  min={0}
                  onChange={(e) => updateMoney('copper', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Серебряные (см)</label>
                <Input 
                  type="number"
                  value={character?.money?.silver || 0}
                  min={0}
                  onChange={(e) => updateMoney('silver', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Электрум (эм)</label>
                <Input 
                  type="number"
                  value={character?.money?.electrum || 0}
                  min={0}
                  onChange={(e) => updateMoney('electrum', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Золотые (зм)</label>
                <Input 
                  type="number"
                  value={character?.money?.gold || 0}
                  min={0}
                  onChange={(e) => updateMoney('gold', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Платиновые (пм)</label>
                <Input 
                  type="number"
                  value={character?.money?.platinum || 0}
                  min={0}
                  onChange={(e) => updateMoney('platinum', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Добавление предметов */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Добавить предмет</h3>
            <div className="flex gap-3">
              <Input 
                placeholder="Название предмета"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="flex-1"
              />
              <Input 
                type="number"
                min={1}
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Button onClick={addItem} disabled={!newItem.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Добавить
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Список предметов */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Список предметов</h3>
            <ScrollArea className="h-[300px] pr-4">
              {equipment.length > 0 ? (
                <div className="space-y-2">
                  {equipment.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-r-none"
                            onClick={() => updateItemQuantity(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className="h-7 w-16 rounded-none text-center"
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-l-none"
                            onClick={() => updateItemQuantity(index, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Нет предметов в инвентаре</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryTab;
