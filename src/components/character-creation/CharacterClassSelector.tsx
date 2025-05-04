import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

// Define the available classes
const characterClasses = [
  'Бард', 'Варвар', 'Воин', 'Волшебник', 'Друид', 'Жрец', 
  'Колдун', 'Монах', 'Паладин', 'Плут', 'Следопыт', 'Чародей'
];

// Define the subclasses for each class
const subclassesByClass: Record<string, string[]> = {
  'Бард': ['Коллегия Знаний', 'Коллегия Доблести'],
  'Варвар': ['Путь Берсерка', 'Путь Тотемного Воина'],
  'Воин': ['Мастер Боевых Искусств', 'Чемпион', 'Боевой Маг'],
  'Волшебник': ['Школа Вызова', 'Школа Прорицания', 'Школа Некромантии', 'Школа Преобразования'],
  'Друид': ['Круг Земли', 'Круг Луны'],
  'Жрец': ['Домен Знаний', 'Домен Жизни', 'Домен Света', 'Домен Природы', 'Домен Бури', 'Домен Обмана'],
  'Колдун': ['Архифея', 'Исчадие', 'Великий Древний'],
  'Монах': ['Путь Открытой Ладони', 'Путь Тени', 'Путь Четырех Стихий'],
  'Паладин': ['Клятва Преданности', 'Клятва Древних', 'Клятва Мести'],
  'Плут': ['Вор', 'Убийца', 'Мистический Ловкач'],
  'Следопыт': ['Охотник', 'Повелитель Зверей'],
  'Чародей': ['Дикая Магия', 'Наследие Дракона']
};

interface CharacterClassSelectorProps {
  character: any;
  onClassChange: (className: string) => void;
  onLevelChange: (level: number) => void;
  onAdditionalClassChange?: (index: number, className: string) => void;
  onSubclassChange?: (subclass: string) => void;
}

export const CharacterClassSelector = ({
  character,
  onClassChange,
  onLevelChange,
  onAdditionalClassChange,
  onSubclassChange
}: CharacterClassSelectorProps) => {
  const [selectedClass, setSelectedClass] = useState<string>(character.class || '');
  
  // Handle class selection
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    onClassChange(value);
    
    // Reset subclass when class changes
    if (onSubclassChange) {
      onSubclassChange('');
    }
  };
  
  // Handle level change
  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(e.target.value, 10) || 1;
    // Restrict level range between 1 and 20
    const clampedLevel = Math.min(Math.max(level, 1), 20);
    onLevelChange(clampedLevel);
  };
  
  // Handle subclass selection
  const handleSubclassChange = (value: string) => {
    if (onSubclassChange) {
      onSubclassChange(value);
    }
  };
  
  // Get available subclasses for the selected class
  const availableSubclasses = selectedClass ? subclassesByClass[selectedClass] || [] : [];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Выбор класса персонажа</CardTitle>
          <CardDescription>Выберите основной класс вашего персонажа</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Класс персонажа</label>
              <Select 
                value={character.class || ''} 
                onValueChange={handleClassChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {characterClasses.map((className) => (
                      <SelectItem key={className} value={className}>{className}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Уровень</label>
              <Input 
                type="number" 
                min="1" 
                max="20" 
                value={character.level || 1} 
                onChange={handleLevelChange} 
              />
              <p className="text-xs text-gray-500 mt-1">Уровень персонажа от 1 до 20</p>
            </div>
          </div>
          
          {character.level >= 3 && selectedClass && (
            <div>
              <label className="block text-sm font-medium mb-1">Подкласс</label>
              <Select 
                value={character.subclass || ''} 
                onValueChange={handleSubclassChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подкласс" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-60">
                    {availableSubclasses.map((subclass) => (
                      <SelectItem key={subclass} value={subclass}>{subclass}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Доступно с 3-го уровня для большинства классов
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Можно добавить мультиклассовость здесь, если потребуется */}
    </div>
  );
};
