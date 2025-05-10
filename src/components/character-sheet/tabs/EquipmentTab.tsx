import React, { useState } from 'react';
import { Character, Item } from '@/types/character';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";

interface EquipmentTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, onUpdate }) => {
  const [newItem, setNewItem] = useState<Item>({ name: '', type: 'item', quantity: 1 });
  
  // Helper function to ensure equipment is in the correct format
  const getEquipment = () => {
    // If equipment is undefined, initialize it properly
    if (!character.equipment) {
      return {
        weapons: [],
        armor: '',
        items: [],
        gold: 0
      };
    }
    
    // If equipment is an array, convert to object structure
    if (Array.isArray(character.equipment)) {
      // Handle equipment as string[] or Item[]
      const equipmentArray = character.equipment as (string | Item)[];
      return {
        weapons: equipmentArray.filter(item => {
          if (typeof item === 'string') return true;
          return item.type === 'weapon';
        }).map(item => typeof item === 'string' ? item : item.name),
        armor: '',
        items: equipmentArray.filter(item => {
          if (typeof item === 'string') return true;
          return item.type === 'item';
        }).map(item => typeof item === 'string' ? item : item.name),
        gold: 0
      };
    }
    
    // Otherwise, return the equipment object directly
    return character.equipment;
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    
    const equipment = getEquipment();
    
    // Cast to ensure TypeScript understands the structure
    const updatedEquipment = {
      weapons: [...equipment.weapons],
      armor: equipment.armor,
      items: [...equipment.items, newItem.name],
      gold: equipment.gold
    };
    
    onUpdate({ equipment: updatedEquipment });
    setNewItem({ name: '', type: 'item', quantity: 1 });
  };

  const handleAddWeapon = (weaponName: string) => {
    if (!weaponName.trim()) return;
    
    const equipment = getEquipment();
    
    const updatedEquipment = {
      weapons: [...equipment.weapons, weaponName],
      armor: equipment.armor,
      items: [...equipment.items],
      gold: equipment.gold
    };
    
    onUpdate({ equipment: updatedEquipment });
  };

  const handleSetArmor = (armorName: string) => {
    if (!armorName.trim()) return;
    
    const equipment = getEquipment();
    
    const updatedEquipment = {
      weapons: [...equipment.weapons],
      armor: armorName,
      items: [...equipment.items],
      gold: equipment.gold
    };
    
    onUpdate({ equipment: updatedEquipment });
  };

  const handleRemoveItem = (index: number) => {
    const equipment = getEquipment();
    
    const updatedItems = [...equipment.items];
    updatedItems.splice(index, 1);
    
    const updatedEquipment = {
      weapons: [...equipment.weapons],
      armor: equipment.armor,
      items: updatedItems,
      gold: equipment.gold
    };
    
    onUpdate({ equipment: updatedEquipment });
  };

  const handleRemoveWeapon = (index: number) => {
    const equipment = getEquipment();
    
    const updatedWeapons = [...equipment.weapons];
    updatedWeapons.splice(index, 1);
    
    const updatedEquipment = {
      weapons: updatedWeapons,
      armor: equipment.armor,
      items: [...equipment.items],
      gold: equipment.gold
    };
    
    onUpdate({ equipment: updatedEquipment });
  };

  const handleUpdateGold = (amount: number) => {
    const equipment = getEquipment();
    
    const updatedEquipment = {
      weapons: [...equipment.weapons],
      armor: equipment.armor,
      items: [...equipment.items],
      gold: amount
    };
    
    onUpdate({ equipment: updatedEquipment });
  };

  const equipment = getEquipment();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Снаряжение</h2>
      
      <Tabs defaultValue="items">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="items">Предметы</TabsTrigger>
          <TabsTrigger value="weapons">Оружие</TabsTrigger>
          <TabsTrigger value="armor">Доспехи</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Предметы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="Название предмета" 
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="flex-1"
                />
                <Button onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>
              
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {equipment.items.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Нет предметов в инвентаре
                    </p>
                  ) : (
                    equipment.items.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-2 border rounded-md"
                      >
                        <span>{item}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveItem(index)}
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
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Валюта</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">ММ</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={character.currency?.cp || 0}
                    onChange={(e) => onUpdate({
                      currency: { ...character.currency, cp: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">СМ</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={character.currency?.sp || 0}
                    onChange={(e) => onUpdate({
                      currency: { ...character.currency, sp: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">ЭМ</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={character.currency?.ep || 0}
                    onChange={(e) => onUpdate({
                      currency: { ...character.currency, ep: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">ЗМ</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={character.currency?.gp || equipment.gold || 0}
                    onChange={(e) => handleUpdateGold(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">ПМ</label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={character.currency?.pp || 0}
                    onChange={(e) => onUpdate({
                      currency: { ...character.currency, pp: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weapons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Оружие</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="Название оружия" 
                  id="weaponName"
                  className="flex-1"
                />
                <Button onClick={() => {
                  const weaponInput = document.getElementById('weaponName') as HTMLInputElement;
                  handleAddWeapon(weaponInput.value);
                  weaponInput.value = '';
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>
              
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {equipment.weapons.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Нет оружия в инвентаре
                    </p>
                  ) : (
                    equipment.weapons.map((weapon, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-2 border rounded-md"
                      >
                        <span>{weapon}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveWeapon(index)}
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
        </TabsContent>
        
        <TabsContent value="armor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Доспехи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="Название доспеха" 
                  id="armorName"
                  className="flex-1"
                  defaultValue={equipment.armor}
                />
                <Button onClick={() => {
                  const armorInput = document.getElementById('armorName') as HTMLInputElement;
                  handleSetArmor(armorInput.value);
                }}>
                  Сохранить
                </Button>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-2">Текущие доспехи</h3>
                {equipment.armor ? (
                  <p>{equipment.armor}</p>
                ) : (
                  <p className="text-muted-foreground">Нет надетых доспехов</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
