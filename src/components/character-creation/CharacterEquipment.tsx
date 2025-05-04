
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CharacterSheet } from '@/types/character';

interface CharacterEquipmentProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Пример стартового снаряжения
const startingEquipment = {
  weapons: [
    "Длинный меч", "Короткий меч", "Длинный лук", "Кинжал", "Боевой топор",
    "Посох", "Лёгкий арбалет", "Дубинка", "Копьё"
  ],
  armor: [
    "Кожаный доспех", "Кольчуга", "Клёпаный кожаный доспех", "Чешуйчатый доспех",
    "Кираса", "Щит"
  ],
  adventuringGear: [
    "Рюкзак", "Спальник", "Рацион (1 день)", "Фляга с водой", "Верёвка (50 футов)",
    "Факел", "Огниво", "Инструменты вора", "Целительский набор", "Алхимический набор"
  ]
};

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep 
}) => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<string[]>(character.equipment || []);
  const [newItem, setNewItem] = useState("");
  
  // Добавление предмета снаряжения
  const addItem = () => {
    if (!newItem.trim()) return;
    
    setEquipment(prev => [...prev, newItem.trim()]);
    setNewItem("");
  };
  
  // Удаление предмета снаряжения
  const removeItem = (index: number) => {
    setEquipment(prev => prev.filter((_, i) => i !== index));
  };
  
  // Обработчик сохранения данных и перехода к следующему шагу
  const handleNextStep = () => {
    updateCharacter({ equipment });
    nextStep();
  };
  
  // Обработчик добавления предмета из списка
  const addListItem = (item: string) => {
    if (equipment.includes(item)) {
      toast({
        title: "Предмет уже выбран",
        description: `${item} уже добавлен в ваше снаряжение`
      });
      return;
    }
    
    setEquipment(prev => [...prev, item]);
    toast({
      title: "Предмет добавлен",
      description: `${item} добавлен в снаряжение`
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">Снаряжение</h1>
      
      <Card className="p-6">
        <div className="mb-6">
          <Label htmlFor="equipment-list" className="text-lg font-semibold mb-2">
            Снаряжение персонажа
          </Label>
          
          <div className="flex items-center mb-4">
            <Input 
              id="new-item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Добавить предмет снаряжения"
              className="mr-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem();
                }
              }}
            />
            <Button onClick={addItem} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-60 border rounded-md p-4">
            {equipment.length > 0 ? (
              <ul className="space-y-2">
                {equipment.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{item}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground p-4">
                У вас нет снаряжения. Добавьте предметы из списка или вручную.
              </p>
            )}
          </ScrollArea>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Стандартное снаряжение</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Оружие</h4>
              <ul className="space-y-1">
                {startingEquipment.weapons.map((item) => (
                  <li key={item}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-auto py-1"
                      onClick={() => addListItem(item)}
                    >
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Доспехи</h4>
              <ul className="space-y-1">
                {startingEquipment.armor.map((item) => (
                  <li key={item}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-auto py-1"
                      onClick={() => addListItem(item)}
                    >
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Снаряжение</h4>
              <ul className="space-y-1">
                {startingEquipment.adventuringGear.map((item) => (
                  <li key={item}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-auto py-1"
                      onClick={() => addListItem(item)}
                    >
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
          >
            Назад
          </Button>
          <Button
            onClick={handleNextStep}
          >
            Далее
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CharacterEquipment;
