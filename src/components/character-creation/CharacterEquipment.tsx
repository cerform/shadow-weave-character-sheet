
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Character, Item } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CharacterEquipmentProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({
  character,
  onUpdate,
  nextStep = () => {},
  prevStep = () => {}
}) => {
  // Инициализируем оборудование с учетом возможных форматов данных
  const initialWeapons: string[] = [];
  let initialArmorValue: string = '';
  const initialItems: string[] = [];
  
  // Проверяем формат оборудования и извлекаем данные
  if (character.equipment) {
    if (Array.isArray(character.equipment)) {
      // Если это массив Item, извлекаем имена
      character.equipment.forEach(item => {
        if (item.type === 'weapon') {
          initialWeapons.push(item.name);
        } else if (item.type === 'armor') {
          // Берем только первую броню в список
          if (!initialArmorValue) {
            initialArmorValue = item.name;
          }
        } else {
          initialItems.push(item.name);
        }
      });
    } else if (typeof character.equipment === 'object') {
      // Если это объект с weapons, armor, items
      const equip = character.equipment as any;
      if (equip.weapons) initialWeapons.push(...equip.weapons);
      if (equip.armor) initialArmorValue = equip.armor;
      if (equip.items) initialItems.push(...equip.items);
    }
  }

  const [weapons, setWeapons] = useState<string[]>(initialWeapons);
  const [armor, setArmor] = useState<string>(initialArmorValue);
  const [items, setItems] = useState<string[]>(initialItems);
  const [gold, setGold] = useState<number>(character.gold || 0);
  
  // Для ввода нового оружия
  const [newWeapon, setNewWeapon] = useState<string>('');
  const [newItem, setNewItem] = useState<string>('');
  
  // Обработчики добавления снаряжения
  const addWeapon = () => {
    if (newWeapon.trim()) {
      setWeapons([...weapons, newWeapon.trim()]);
      setNewWeapon('');
    }
  };
  
  const removeWeapon = (index: number) => {
    setWeapons(weapons.filter((_, i) => i !== index));
  };
  
  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const handleNext = () => {
    // Форматируем данные о снаряжении в соответствии с типом Item[]
    const equipmentItems: Item[] = [
      ...weapons.map(name => ({ name, quantity: 1, type: 'weapon' })),
      ...(armor ? [{ name: armor, quantity: 1, type: 'armor' }] : []),
      ...items.map(name => ({ name, quantity: 1, type: 'item' }))
    ];
    
    // Обновляем персонажа
    onUpdate({ 
      equipment: equipmentItems,
      gold: gold
    });
    
    // Переходим к следующему шагу
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Снаряжение персонажа</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          {/* Оружие */}
          <div>
            <h3 className="font-medium mb-3">Оружие</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Введите название оружия" 
                  value={newWeapon}
                  onChange={(e) => setNewWeapon(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addWeapon()}
                />
                <button 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded"
                  onClick={addWeapon}
                >
                  Добавить
                </button>
              </div>
              
              {weapons.length > 0 ? (
                <div className="space-y-2">
                  {weapons.map((weapon, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span>{weapon}</span>
                      <button 
                        className="text-red-500"
                        onClick={() => removeWeapon(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-center p-2">
                  Пока нет оружия в списке
                </div>
              )}
            </div>
          </div>
          
          {/* Броня */}
          <div>
            <Label htmlFor="armor">Броня</Label>
            <Input 
              id="armor"
              placeholder="Опишите вашу броню" 
              value={armor}
              onChange={(e) => setArmor(e.target.value)}
            />
          </div>
          
          {/* Предметы */}
          <div>
            <h3 className="font-medium mb-3">Предметы</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Введите название предмета" 
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem()}
                />
                <button 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded"
                  onClick={addItem}
                >
                  Добавить
                </button>
              </div>
              
              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span>{item}</span>
                      <button 
                        className="text-red-500"
                        onClick={() => removeItem(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-center p-2">
                  Пока нет предметов в списке
                </div>
              )}
            </div>
          </div>
          
          {/* Золото */}
          <div>
            <Label htmlFor="gold">Золото</Label>
            <Input 
              id="gold"
              type="number" 
              min="0"
              placeholder="Количество золота" 
              value={gold}
              onChange={(e) => setGold(Number(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>
      
      <NavigationButtons
        allowNext={true}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterEquipment;
