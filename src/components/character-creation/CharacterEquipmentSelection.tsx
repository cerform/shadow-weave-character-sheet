import React, { useState } from 'react';
import type { CharacterSheet } from "@/utils/characterImports";
import NavigationButtons from './NavigationButtons';
import { Check, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  SelectionCard,
  SelectionCardGrid 
} from "@/components/ui/selection-card";
import SectionHeader from "@/components/ui/section-header";

interface CharacterEquipmentSelectionProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface EquipmentItem {
  name: string;
  description?: string;
  category: 'weapon' | 'armor' | 'accessory' | 'gear' | 'tool';
}

const CharacterEquipmentSelection: React.FC<CharacterEquipmentSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  // Преобразуем equipment в массив строк, если это объект
  const initialEquipment = Array.isArray(character.equipment) 
    ? character.equipment 
    : character.equipment?.weapons?.concat(
        character.equipment?.armor ? [character.equipment.armor] : [],
        character.equipment?.items || []
      ) || [];
  
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(initialEquipment);
  const [customItem, setCustomItem] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentItem[]>([]);
  
  // Загружаем доступное снаряжение на основе класса и предыстории
  useEffect(() => {
    const loadEquipment = () => {
      // Здесь будет логика загрузки снаряжения на основе класса и предыстории
      // Пока используем тестовый набор
      setAvailableEquipment([
        { name: "Длинный меч", category: "weapon" },
        { name: "Короткий меч", category: "weapon" },
        { name: "Длинный лук", category: "weapon" },
        { name: "Кинжал", category: "weapon" },
        { name: "Боевой топор", category: "weapon" },
        { name: "Кожаный доспех", category: "armor" },
        { name: "Кольчуга", category: "armor" },
        { name: "Щит", category: "armor" },
        { name: "Набор авантюриста", category: "gear" },
        { name: "Набор исследователя подземелий", category: "gear" },
        { name: "Набор целителя", category: "gear" },
        { name: "Инструменты вора", category: "tool" },
        { name: "Музыкальный инструмент", category: "tool" },
        { name: "Алхимический набор", category: "tool" },
        { name: "Мешочек с компонентами", category: "accessory" },
        { name: "Священный символ", category: "accessory" },
        { name: "Амулет защиты", category: "accessory" }
      ]);
    };
    
    loadEquipment();
  }, [character.class, character.background]);
  
  const toggleEquipment = (item: string) => {
    let newEquipment;
    
    if (selectedEquipment.includes(item)) {
      newEquipment = selectedEquipment.filter(i => i !== item);
    } else {
      newEquipment = [...selectedEquipment, item];
    }
    
    setSelectedEquipment(newEquipment);
    updateCharacter({ equipment: newEquipment });
  };
  
  const addCustomItem = () => {
    if (customItem.trim() !== '') {
      const newEquipment = [...selectedEquipment, customItem.trim()];
      setSelectedEquipment(newEquipment);
      updateCharacter({ equipment: newEquipment });
      setCustomItem('');
    }
  };
  
  const getEquipmentByCategory = (category: string) => {
    return availableEquipment.filter(item => item.category === category);
  };
  
  const renderEquipmentCategory = (category: string, title: string) => {
    const items = getEquipmentByCategory(category);
    
    return (
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-3">{title}</h3>
        <SelectionCardGrid>
          {items.map(item => (
            <SelectionCard
              key={item.name}
              title={item.name}
              selected={selectedEquipment.includes(item.name)}
              onClick={() => toggleEquipment(item.name)}
            />
          ))}
        </SelectionCardGrid>
      </div>
    );
  };
  
  return (
    <div>
      <SectionHeader
        title="Снаряжение"
        description="Выберите снаряжение для вашего персонажа."
      />
      
      {/* Снаряжение по категориям */}
      {renderEquipmentCategory('weapon', 'Оружие')}
      {renderEquipmentCategory('armor', 'Доспехи и щиты')}
      {renderEquipmentCategory('accessory', 'Аксессуары')}
      {renderEquipmentCategory('gear', 'Снаряжение')}
      {renderEquipmentCategory('tool', 'Инструменты')}
      
      {/* Добавление собственного снаряжения */}
      <Card className="mt-8 mb-6">
        <CardContent className="p-6">
          <h3 className="font-medium text-lg mb-3">Добавить своё снаряжение</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Введите название предмета..."
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addCustomItem} className="shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Добавить
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Выбранное снаряжение */}
      {selectedEquipment.length > 0 && (
        <Card className="mt-6 mb-8">
          <CardContent className="p-6">
            <h3 className="font-medium text-lg mb-3">Выбранное снаряжение:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {selectedEquipment.map((item, index) => (
                <li key={index} className="text-primary">
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      <NavigationButtons
        nextStep={nextStep}
        prevStep={prevStep}
        allowNext={selectedEquipment.length > 0}
        disableNext={selectedEquipment.length === 0}
      />
    </div>
  );
};

export default CharacterEquipmentSelection;
