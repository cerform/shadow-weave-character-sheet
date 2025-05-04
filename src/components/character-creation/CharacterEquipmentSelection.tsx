
import React, { useState, useEffect } from 'react';
import { Equipment } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CharacterEquipmentSelectionProps {
  initialEquipment?: Equipment[];
  onChange: (equipment: Equipment[]) => void;
}

export const CharacterEquipmentSelection: React.FC<CharacterEquipmentSelectionProps> = ({ 
  initialEquipment = [], 
  onChange 
}) => {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [newEquipmentName, setNewEquipmentName] = useState('');
  
  // Сохраняем в state строковый массив для совместимости
  const [equipmentAsStrings, setEquipmentAsStrings] = useState<string[]>(
    initialEquipment.map(item => typeof item === 'string' ? item : (item.name || String(item)))
  );

  // Обновляем родительский компонент при изменении списка снаряжения
  useEffect(() => {
    // Преобразуем массив оборудования в формат Equipment[]
    const formattedEquipment = equipment.map(item => {
      if (typeof item === 'string') {
        return { name: item };
      }
      return item;
    });
    
    onChange(formattedEquipment);
  }, [equipment, onChange]);

  // Добавляем новый предмет снаряжения
  const addEquipment = () => {
    if (!newEquipmentName.trim()) return;
    
    // Создаем новый объект Equipment
    const newItem: Equipment = { name: newEquipmentName.trim() };
    
    setEquipment(prev => [...prev, newItem]);
    // Обновляем также строковое представление для совместимости
    setEquipmentAsStrings(prev => [...prev, newEquipmentName.trim()]);
    
    setNewEquipmentName('');
  };

  // Удаляем предмет снаряжения
  const removeEquipment = (index: number) => {
    setEquipment(prev => prev.filter((_, i) => i !== index));
    setEquipmentAsStrings(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="font-semibold text-lg mb-2">Снаряжение</div>
      
      <div className="space-y-2">
        {equipment.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-grow p-2 bg-secondary/20 rounded-md">
              {typeof item === 'string' ? item : item.name || String(item)}
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeEquipment(index)}
              title="Удалить предмет"
            >
              <Trash size={16} />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 items-end mt-4">
        <div className="flex-grow space-y-1">
          <Label htmlFor="newEquipment">Добавить снаряжение</Label>
          <Input
            id="newEquipment"
            value={newEquipmentName}
            onChange={(e) => setNewEquipmentName(e.target.value)}
            placeholder="Название предмета"
            onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
          />
        </div>
        <Button onClick={addEquipment} className="flex items-center gap-1">
          <Plus size={16} />
          <span>Добавить</span>
        </Button>
      </div>
    </div>
  );
};

export default CharacterEquipmentSelection;
