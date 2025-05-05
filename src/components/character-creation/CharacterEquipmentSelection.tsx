
import React, { useState, useEffect, useMemo } from 'react';
import type { CharacterSheet } from "@/utils/characterImports";
import NavigationButtons from './NavigationButtons';
import { Check, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  SelectionCard,
  SelectionCardGrid,
  SelectionCardBadge
} from "@/components/ui/selection-card";
import SectionHeader from "@/components/ui/section-header";
import { useTheme } from '@/hooks/use-theme';

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
  // Получаем текущую тему
  const { themeStyles } = useTheme();
  
  // Преобразуем equipment в массив строк, если это объект
  const initialEquipment = useMemo(() => {
    return Array.isArray(character.equipment) 
      ? character.equipment 
      : character.equipment?.weapons?.concat(
          character.equipment?.armor ? [character.equipment.armor] : [],
          character.equipment?.items || []
        ) || [];
  }, [character.equipment]);
  
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
  
  // Определяем стили для выбранного снаряжения на основе текущей темы
  const selectionStyles = useMemo(() => ({
    selectedBgColor: `${themeStyles?.accent}20` || 'rgba(157, 92, 255, 0.2)',
    selectedBorderColor: themeStyles?.accent || '#9D5CFF',
    hoverBgColor: `${themeStyles?.accent}10` || 'rgba(157, 92, 255, 0.1)',
    textColor: themeStyles?.textColor || '#FFFFFF',
    boxShadow: `0 0 8px ${themeStyles?.accent}50` || '0 0 8px rgba(157, 92, 255, 0.5)',
  }), [themeStyles]);
  
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
    
    if (items.length === 0) return null;
    
    return (
      <div className="mb-6 animate-fade-in">
        <h3 className="font-medium text-lg mb-3" style={{ color: themeStyles?.accent }}>{title}</h3>
        <SelectionCardGrid>
          {items.map(item => {
            const isSelected = selectedEquipment.includes(item.name);
            return (
              <SelectionCard
                key={item.name}
                title={item.name}
                selected={isSelected}
                onClick={() => toggleEquipment(item.name)}
                className="transition-all duration-200 border-2"
                style={{
                  backgroundColor: isSelected ? selectionStyles.selectedBgColor : 'rgba(0, 0, 0, 0.3)',
                  borderColor: isSelected ? selectionStyles.selectedBorderColor : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isSelected ? selectionStyles.boxShadow : 'none',
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <SelectionCardBadge
                      className="bg-transparent"
                      style={{ color: selectionStyles.selectedBorderColor }}
                    >
                      <Check size={16} />
                    </SelectionCardBadge>
                  </div>
                )}
              </SelectionCard>
            );
          })}
        </SelectionCardGrid>
      </div>
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Снаряжение"
        description="Выберите снаряжение для вашего персонажа."
        className="mb-6"
      />
      
      {/* Снаряжение по категориям */}
      {renderEquipmentCategory('weapon', 'Оружие')}
      {renderEquipmentCategory('armor', 'Доспехи и щиты')}
      {renderEquipmentCategory('accessory', 'Аксессуары')}
      {renderEquipmentCategory('gear', 'Снаряжение')}
      {renderEquipmentCategory('tool', 'Инструменты')}
      
      {/* Добавление собственного снаряжения */}
      <Card 
        className="mt-8 mb-6 border animate-fade-in" 
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderColor: `${themeStyles?.accent}30`,
        }}
      >
        <CardContent className="p-6">
          <h3 className="font-medium text-lg mb-3" style={{ color: themeStyles?.accent }}>Добавить своё снаряжение</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Введите название предмета..."
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              className="flex-1 bg-black/50 border-gray-700 text-white"
              style={{ borderColor: `${themeStyles?.accent}30` }}
            />
            <Button 
              onClick={addCustomItem} 
              className="shrink-0"
              style={{ 
                backgroundColor: themeStyles?.accent,
                borderColor: themeStyles?.accent
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Добавить
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Выбранное снаряжение */}
      {selectedEquipment.length > 0 && (
        <Card 
          className="mt-6 mb-8 border animate-fade-in" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderColor: `${themeStyles?.accent}30`,
          }}
        >
          <CardContent className="p-6">
            <h3 className="font-medium text-lg mb-3" style={{ color: themeStyles?.accent }}>Выбранное снаряжение:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {selectedEquipment.map((item, index) => (
                <li key={index} style={{ color: themeStyles?.accent }}>
                  <span style={{ color: themeStyles?.textColor }}>{item}</span>
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
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterEquipmentSelection;
