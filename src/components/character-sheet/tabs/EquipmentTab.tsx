import React, { useState, useEffect } from 'react';
import { Character, Item } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { classData } from '@/data/classes/index';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EquipmentTabProps {
  character: Character;
  equipment?: string[];
  onUpdate: (updates: Partial<Character>) => void;
}

export const EquipmentTab: React.FC<EquipmentTabProps> = ({ character, equipment = [], onUpdate }) => {
  const [newItem, setNewItem] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [tab, setTab] = useState<string>('current');
  
  // Получаем доступное снаряжение в зависимости от класса и уровня
  useEffect(() => {
    if (!character.class) return;
    
    const characterClass = character.class.toLowerCase();
    const classInfo = classData[characterClass];
    
    if (!classInfo) return;
    
    // Базовый список снаряжения в зависимости от класса
    let baseEquipment: string[] = [];
    
    // Оружие в зависимости от владений
    if (classInfo.weaponProficiencies.includes('martial')) {
      baseEquipment = [...baseEquipment, 
        'Длинный меч', 'Боевой топор', 'Рапира', 'Алебарда', 
        'Двуручный меч', 'Кирка', 'Палица'
      ];
    }
    
    if (classInfo.weaponProficiencies.includes('simple')) {
      baseEquipment = [...baseEquipment, 
        'Кинжал', 'Дубинка', 'Метательное копье', 'Лёгкий арбалет',
        'Ручной топор', 'Копьё', 'Праща'
      ];
    }
    
    // Доспехи в зависимости от владений
    if (classInfo.armorProficiencies.includes('heavy')) {
      baseEquipment = [...baseEquipment, 'Латы', 'Полулаты', 'Кольчужная рубаха'];
    }
    
    if (classInfo.armorProficiencies.includes('medium')) {
      baseEquipment = [...baseEquipment, 'Кольчуга', 'Чешуйчатый доспех', 'Полулаты'];
    }
    
    if (classInfo.armorProficiencies.includes('light') || classInfo.armorProficiencies.includes('medium')) {
      baseEquipment = [...baseEquipment, 'Кожаный доспех', 'Проклёпанная кожа'];
    }
    
    // Щиты
    if (classInfo.armorProficiencies.includes('shields')) {
      baseEquipment = [...baseEquipment, 'Щит'];
    }
    
    // Наборы инструментов
    if (classInfo.toolProficiencies.length > 0) {
      baseEquipment = [...baseEquipment, 'Набор инструментов', 'Воровские инструменты'];
    }
    
    // Магические фокусировки для заклинателей
    if (classInfo.spellcasting) {
      baseEquipment = [...baseEquipment, 'Магическая фокусировка', 'Мешочек с компонентами'];
      
      // Книга заклинаний для волшебника
      if (characterClass === 'волшебник') {
        baseEquipment.push('Книга заклинаний');
      }
    }
    
    // Набор приключенца всегда доступен
    baseEquipment.push('Набор путешественника', 'Набор исследователя подземелий');
    
    // Дополнительное снаряжение в зависимости от уровня
    if (character.level && character.level >= 5) {
      baseEquipment.push('Зелье лечения', 'Свиток защиты');
    }
    
    if (character.level && character.level >= 10) {
      baseEquipment.push('Зелье большого лечения', 'Кольцо защиты');
    }
    
    if (character.level && character.level >= 15) {
      baseEquipment.push('Зелье превосходного лечения', 'Плащ защиты');
    }
    
    // Удаляем дубликаты
    const uniqueEquipment = [...new Set(baseEquipment)];
    setAvailableEquipment(uniqueEquipment);
  }, [character.class, character.level]);
  
  // Обработка добавления снаряжения
  const addItem = () => {
    if (!newItem.trim()) return;
    
    let updatedEquipment: Array<string | Item> = [];
    
    // Обрабатываем существующее снаряжение с учетом разных возможных типов
    if (Array.isArray(character.equipment)) {
      updatedEquipment = [...character.equipment, newItem];
    } else if (character.equipment && typeof character.equipment === 'object') {
      // Конвертируем объект в массив строк для упрощения
      const existingItems: string[] = [];
      const equipment = character.equipment as any; // используем any для обхода проверки типов
      
      if (equipment.weapons) existingItems.push(...equipment.weapons);
      if (equipment.armor) existingItems.push(equipment.armor);
      if (equipment.items) existingItems.push(...equipment.items);
      
      updatedEquipment = [...existingItems, newItem];
    } else {
      updatedEquipment = [newItem];
    }
    
    onUpdate({ equipment: updatedEquipment });
    setNewItem('');
  };
  
  // Добавление предмета из списка доступного снаряжения
  const addAvailableItem = (item: string) => {
    if (!item) return;
    
    let updatedEquipment: Array<string | Item> = [];
    
    // Обрабатываем существующее снаряжение с учетом разных возможных типов
    if (Array.isArray(character.equipment)) {
      updatedEquipment = [...character.equipment, item];
    } else if (character.equipment && typeof character.equipment === 'object') {
      // Конвертируем объект в массив строк для упрощения
      const existingItems: string[] = [];
      const equipment = character.equipment as any; // используем any для обхода проверки типов
      
      if (equipment.weapons) existingItems.push(...equipment.weapons);
      if (equipment.armor) existingItems.push(equipment.armor);
      if (equipment.items) existingItems.push(...equipment.items);
      
      updatedEquipment = [...existingItems, item];
    } else {
      updatedEquipment = [item];
    }
    
    onUpdate({ equipment: updatedEquipment });
  };
  
  // Удаление предмета
  const removeItem = (index: number) => {
    let currentEquipment: Array<string | Item> = [];
    
    if (Array.isArray(character.equipment)) {
      currentEquipment = [...character.equipment];
    } else if (character.equipment && typeof character.equipment === 'object') {
      const equipment = character.equipment as any; // используем any для обхода проверки типов
      
      if (equipment.weapons) currentEquipment.push(...equipment.weapons);
      if (equipment.armor) currentEquipment.push(equipment.armor);
      if (equipment.items) currentEquipment.push(...equipment.items);
    } else {
      return; // Нет снаряжения для удаления
    }
    
    const updatedEquipment = [...currentEquipment];
    updatedEquipment.splice(index, 1);
    
    onUpdate({ equipment: updatedEquipment });
  };
  
  // Получаем список предметов для отображения
  const getEquipmentList = (): Array<string | Item> => {
    if (equipment && equipment.length > 0) {
      return equipment;
    }
    
    if (Array.isArray(character.equipment)) {
      return character.equipment;
    }
    
    if (character.equipment && typeof character.equipment === 'object') {
      const items: Array<string | Item> = [];
      const equipment = character.equipment as any; // используем any для обхода проверки типов
      
      if (equipment.weapons) items.push(...equipment.weapons);
      if (equipment.armor) items.push(equipment.armor);
      if (equipment.items) items.push(...equipment.items);
      
      return items;
    }
    
    return [];
  };
  
  const equipmentList = getEquipmentList();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Снаряжение</CardTitle>
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Текущее снаряжение</TabsTrigger>
            <TabsTrigger value="available">Доступное снаряжение</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
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
                      <span>{typeof item === 'string' ? item : item.name}</span>
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
          </TabsContent>
          
          <TabsContent value="available">
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">
                Доступное снаряжение на основе класса {character.class} и уровня {character.level}:
              </p>
            </div>
            
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableEquipment.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 col-span-2">
                    Нет доступного снаряжения для текущего класса и уровня
                  </p>
                ) : (
                  availableEquipment.map((item, index) => (
                    <Badge
                      key={index}
                      className="py-2 px-3 hover:bg-primary cursor-pointer flex justify-between items-center"
                      variant="outline" 
                      onClick={() => addAvailableItem(item)}
                    >
                      <span>{item}</span>
                      <Plus className="h-3 w-3 ml-2" />
                    </Badge>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="text-sm text-muted-foreground">
          <p>* Нажмите на предмет из доступного снаряжения, чтобы добавить его в свой инвентарь</p>
        </div>
      </CardContent>
    </Card>
  );
};
