
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Character } from '@/types/character';
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
  // Инициализируем состояние из объекта character
  const initialEquipment = character.equipment || {
    weapons: [],
    armor: '',
    items: []
  };
  
  const equipmentIsArray = Array.isArray(initialEquipment);
  
  // Преобразуем в объект, если equipment это массив
  const initialEquipmentObj = equipmentIsArray 
    ? { weapons: initialEquipment as string[], armor: '', items: [] }
    : initialEquipment as { weapons?: string[], armor?: string, items?: string[] };

  const [weapons, setWeapons] = useState<string[]>(initialEquipmentObj.weapons || []);
  const [armor, setArmor] = useState<string>(initialEquipmentObj.armor || '');
  const [items, setItems] = useState<string[]>(initialEquipmentObj.items || []);
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
    // Форматируем данные о снаряжении
    const equipmentData = {
      weapons: weapons,
      armor: armor,
      items: items
    };
    
    // Обновляем персонажа
    onUpdate({ 
      equipment: equipmentData,
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
