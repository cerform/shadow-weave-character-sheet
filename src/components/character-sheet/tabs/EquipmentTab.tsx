
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character, Item } from '@/types/character';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface EquipmentTabProps {
  character: Character;
}

const EquipmentTab: React.FC<EquipmentTabProps> = ({ character }) => {
  const { updateCharacter } = useCharacter();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Состояние для оружия, брони и предметов
  const [weapons, setWeapons] = useState<Item[]>([]);
  const [armor, setArmor] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [gold, setGold] = useState<number>(0);
  const [silver, setSilver] = useState<number>(0);
  const [copper, setCopper] = useState<number>(0);
  const [electrum, setElectrum] = useState<number>(0);
  const [platinum, setPlatinum] = useState<number>(0);
  
  // Новый предмет
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemType, setNewItemType] = useState('item');
  
  // Инициализация начальных значений из character
  useEffect(() => {
    // Проверяем наличие экипировки и её тип
    if (character.equipment) {
      if (Array.isArray(character.equipment)) {
        // Если это массив Item объектов
        setWeapons(character.equipment.filter(item => item.type === 'weapon'));
        
        const armorItem = character.equipment.find(item => item.type === 'armor');
        setArmor(armorItem ? armorItem.name : '');
        
        setItems(character.equipment.filter(item => item.type !== 'weapon' && item.type !== 'armor'));
      } else {
        // Если это объект с weapons, armor, items
        const equipObj = character.equipment;
        
        // Преобразуем строки оружия в объекты Item
        if (equipObj.weapons) {
          setWeapons(equipObj.weapons.map(name => ({
            name,
            quantity: 1,
            type: 'weapon'
          })));
        }
        
        if (equipObj.armor) {
          setArmor(equipObj.armor);
        }
        
        // Преобразуем строки предметов в объекты Item
        if (equipObj.items) {
          setItems(equipObj.items.map(name => ({
            name,
            quantity: 1,
            type: 'item'
          })));
        }
      }
    }
    
    // Инициализация денег
    if (character.money) {
      setGold(character.money.gp || 0);
      setSilver(character.money.sp || 0);
      setCopper(character.money.cp || 0);
      setElectrum(character.money.ep || 0);
      setPlatinum(character.money.pp || 0);
    } else if (character.gold !== undefined) {
      setGold(character.gold);
    }
  }, [character.equipment, character.money, character.gold]);
  
  // Добавление нового предмета
  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: Item = {
      name: newItemName.trim(),
      quantity: newItemQuantity,
      type: newItemType
    };
    
    if (newItemType === 'weapon') {
      setWeapons(prev => [...prev, newItem]);
    } else if (newItemType === 'armor') {
      setArmor(newItemName);
    } else {
      setItems(prev => [...prev, newItem]);
    }
    
    // Сбрасываем форму
    setNewItemName('');
    setNewItemQuantity(1);
  };
  
  // Удаление предмета
  const handleRemoveItem = (item: Item, type: string) => {
    if (type === 'weapon') {
      setWeapons(prev => prev.filter(w => w.name !== item.name));
    } else if (type === 'armor') {
      setArmor('');
    } else {
      setItems(prev => prev.filter(i => i.name !== item.name));
    }
  };
  
  // Сохранение изменений
  const handleSaveEquipment = () => {
    // Создаем новый массив всех предметов
    const allItems: Item[] = [
      ...weapons,
      ...(armor ? [{ name: armor, quantity: 1, type: 'armor' }] : []),
      ...items
    ];
    
    // Обновляем персонажа
    updateCharacter({
      equipment: allItems,
      money: {
        gp: gold,
        sp: silver,
        cp: copper,
        ep: electrum,
        pp: platinum
      },
      gold: gold // Для обратной совместимости
    });
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-accent/30">
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-xl font-medium">Деньги</h3>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            <div>
              <Label htmlFor="platinum">Платиновые (пм)</Label>
              <Input
                id="platinum"
                type="number"
                value={platinum}
                onChange={e => setPlatinum(Number(e.target.value) || 0)}
                min={0}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="gold">Золотые (зм)</Label>
              <Input
                id="gold"
                type="number"
                value={gold}
                onChange={e => setGold(Number(e.target.value) || 0)}
                min={0}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="electrum">Электрум (эм)</Label>
              <Input
                id="electrum"
                type="number"
                value={electrum}
                onChange={e => setElectrum(Number(e.target.value) || 0)}
                min={0}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="silver">Серебряные (см)</Label>
              <Input
                id="silver"
                type="number"
                value={silver}
                onChange={e => setSilver(Number(e.target.value) || 0)}
                min={0}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="copper">Медные (мм)</Label>
              <Input
                id="copper"
                type="number"
                value={copper}
                onChange={e => setCopper(Number(e.target.value) || 0)}
                min={0}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-accent/30">
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-xl font-medium">Снаряжение</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Добавить предмет</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Название предмета"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                />
                
                <div className="flex space-x-2">
                  <select
                    className="form-select w-full"
                    value={newItemType}
                    onChange={e => setNewItemType(e.target.value)}
                  >
                    <option value="item">Предмет</option>
                    <option value="weapon">Оружие</option>
                    <option value="armor">Доспех</option>
                  </select>
                  
                  <Input
                    type="number"
                    min={1}
                    value={newItemQuantity}
                    onChange={e => setNewItemQuantity(Number(e.target.value) || 1)}
                    disabled={newItemType === 'armor'}
                  />
                </div>
                
                <Button onClick={handleAddItem} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" /> Добавить
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Оружие</Label>
              <ScrollArea className="h-[100px] border rounded-md p-2">
                <div className="space-y-2">
                  {weapons.length === 0 && (
                    <p className="text-gray-500">Нет оружия в инвентаре</p>
                  )}
                  
                  {weapons.map((weapon, index) => (
                    <div key={`weapon-${index}`} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{weapon.name}</span>
                        <Badge variant="outline" className="ml-2">x{weapon.quantity}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(weapon, 'weapon')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="space-y-3">
              <Label>Доспех</Label>
              <div className="border rounded-md p-2">
                {!armor ? (
                  <p className="text-gray-500">Нет доспеха</p>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{armor}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setArmor('')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Предметы</Label>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {items.length === 0 && (
                    <p className="text-gray-500">Нет предметов в инвентаре</p>
                  )}
                  
                  {items.map((item, index) => (
                    <div key={`item-${index}`} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline" className="ml-2">x{item.quantity}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item, 'item')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <Button onClick={handleSaveEquipment} className="w-full">
            Сохранить снаряжение
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentTab;
