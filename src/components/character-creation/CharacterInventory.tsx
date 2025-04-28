
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Backpack, Plus, Minus, Sword, Shield } from "lucide-react";
import { toast } from "sonner";

interface Item {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  description: string;
  type: 'weapon' | 'armor' | 'gear' | 'consumable' | 'treasure';
}

interface CharacterInventoryProps {
  character: any;
  onUpdateCharacter: (updates: any) => void;
}

export const CharacterInventory = ({ character, onUpdateCharacter }: CharacterInventoryProps) => {
  const [inventory, setInventory] = useState<Item[]>(character.inventory || []);
  const [newItem, setNewItem] = useState<Item>({
    id: '',
    name: '',
    quantity: 1,
    weight: 0,
    description: '',
    type: 'gear'
  });
  
  // Standard starting equipment based on class
  const startingEquipment: Record<string, Item[]> = {
    "Воин": [
      { id: crypto.randomUUID(), name: "Длинный меч", quantity: 1, weight: 3, description: "Рубящее оружие, урон 1d8", type: 'weapon' },
      { id: crypto.randomUUID(), name: "Щит", quantity: 1, weight: 6, description: "+2 к КД", type: 'armor' },
      { id: crypto.randomUUID(), name: "Кольчуга", quantity: 1, weight: 40, description: "КД 16", type: 'armor' },
      { id: crypto.randomUUID(), name: "Рюкзак путешественника", quantity: 1, weight: 5, description: "Набор базовых предметов", type: 'gear' },
      { id: crypto.randomUUID(), name: "Зелье лечения", quantity: 2, weight: 0.5, description: "Восстанавливает 2d4+2 хитов", type: 'consumable' },
    ],
    "Волшебник": [
      { id: crypto.randomUUID(), name: "Посох", quantity: 1, weight: 4, description: "Урон 1d6", type: 'weapon' },
      { id: crypto.randomUUID(), name: "Книга заклинаний", quantity: 1, weight: 3, description: "Содержит заклинания волшебника", type: 'gear' },
      { id: crypto.randomUUID(), name: "Мешочек с компонентами", quantity: 1, weight: 2, description: "Необходим для заклинаний с М компонентом", type: 'gear' },
      { id: crypto.randomUUID(), name: "Рюкзак ученого", quantity: 1, weight: 10, description: "Книги, пергамент, чернила", type: 'gear' },
    ],
    "Жрец": [
      { id: crypto.randomUUID(), name: "Булава", quantity: 1, weight: 4, description: "Урон 1d6", type: 'weapon' },
      { id: crypto.randomUUID(), name: "Щит", quantity: 1, weight: 6, description: "+2 к КД", type: 'armor' },
      { id: crypto.randomUUID(), name: "Кольчужная рубаха", quantity: 1, weight: 20, description: "КД 14", type: 'armor' },
      { id: crypto.randomUUID(), name: "Священный символ", quantity: 1, weight: 1, description: "Фокусировка для божественной магии", type: 'gear' },
      { id: crypto.randomUUID(), name: "Набор целителя", quantity: 1, weight: 3, description: "Бинты, мази, инструменты", type: 'gear' },
    ],
    "Бард": [
      { id: crypto.randomUUID(), name: "Рапира", quantity: 1, weight: 2, description: "Колющее оружие, урон 1d8", type: 'weapon' },
      { id: crypto.randomUUID(), name: "Кожаный доспех", quantity: 1, weight: 10, description: "КД 11 + модификатор Ловкости", type: 'armor' },
      { id: crypto.randomUUID(), name: "Лютня", quantity: 1, weight: 2, description: "Музыкальный инструмент, фокусировка", type: 'gear' },
      { id: crypto.randomUUID(), name: "Набор актера", quantity: 1, weight: 5, description: "Реквизит, косметика, простая одежда", type: 'gear' },
    ],
  };
  
  const addDefaultEquipment = () => {
    if (character.class && startingEquipment[character.class]) {
      const newInventory = [...inventory, ...startingEquipment[character.class]];
      setInventory(newInventory);
      onUpdateCharacter({ inventory: newInventory });
      toast.success("Добавлено стартовое снаряжение");
    } else {
      toast.error("Для выбранного класса нет стандартного снаряжения");
    }
  };
  
  const addItem = () => {
    if (!newItem.name) {
      toast.error("Введите название предмета");
      return;
    }
    
    const itemToAdd = {
      ...newItem,
      id: crypto.randomUUID()
    };
    
    const updatedInventory = [...inventory, itemToAdd];
    setInventory(updatedInventory);
    onUpdateCharacter({ inventory: updatedInventory });
    
    // Reset new item form
    setNewItem({
      id: '',
      name: '',
      quantity: 1,
      weight: 0,
      description: '',
      type: 'gear'
    });
    
    toast.success("Предмет добавлен в инвентарь");
  };
  
  const removeItem = (id: string) => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    onUpdateCharacter({ inventory: updatedInventory });
    toast.success("Предмет удален из инвентаря");
  };
  
  const updateItemQuantity = (id: string, change: number) => {
    const updatedInventory = inventory.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setInventory(updatedInventory);
    onUpdateCharacter({ inventory: updatedInventory });
  };
  
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Sword size={16} />;
      case 'armor':
        return <Shield size={16} />;
      default:
        return <Backpack size={16} />;
    }
  };
  
  const getTotalWeight = (): number => {
    return inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
  };
  
  const getCarryCapacity = (): number => {
    return (character.abilities?.strength || 10) * 15;
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Инвентарь персонажа</h2>
      
      <div className="mb-4 p-3 bg-primary/10 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span>
          Вес: <strong>{getTotalWeight().toFixed(1)}</strong> / <strong>{getCarryCapacity()}</strong> фунтов
        </span>
        {character.class && startingEquipment[character.class] && (
          <Button onClick={addDefaultEquipment} variant="outline" className="gap-2">
            <Backpack size={16} />
            Добавить стандартное снаряжение
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Добавить предмет</h3>
            
            <div className="space-y-3">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="itemName">Название</Label>
                <Input
                  id="itemName"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Название предмета"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="itemQuantity">Количество</Label>
                  <Input
                    id="itemQuantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="itemWeight">Вес (фунты)</Label>
                  <Input
                    id="itemWeight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItem.weight}
                    onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="itemType">Тип</Label>
                <select 
                  id="itemType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                >
                  <option value="weapon">Оружие</option>
                  <option value="armor">Доспех</option>
                  <option value="gear">Снаряжение</option>
                  <option value="consumable">Расходник</option>
                  <option value="treasure">Сокровище</option>
                </select>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="itemDescription">Описание</Label>
                <Input
                  id="itemDescription"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Краткое описание предмета"
                />
              </div>
              
              <Button onClick={addItem} className="w-full">
                <Plus size={16} className="mr-2" /> Добавить предмет
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Список предметов</h3>
            
            {inventory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Инвентарь пуст</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {inventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-primary/10 rounded">
                        {getItemTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-right">
                        <div>{(item.weight * item.quantity).toFixed(1)} фнт.</div>
                        <div className="flex items-center space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0" 
                            onClick={() => updateItemQuantity(item.id, -1)}
                          >
                            <Minus size={12} />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0" 
                            onClick={() => updateItemQuantity(item.id, 1)}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
