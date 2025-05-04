import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CharacterSheet, ClassRequirement } from '@/types/character';

interface CharacterMulticlassingProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Требования для мультиклассирования
const multiclassRequirements: {[key: string]: ClassRequirement} = {
  barbarian: {
    abilities: { STR: 13 },
    description: "Сила 13 или выше"
  },
  bard: {
    abilities: { CHA: 13 },
    description: "Харизма 13 или выше"
  },
  cleric: {
    abilities: { WIS: 13 },
    description: "Мудрость 13 или выше"
  },
  druid: {
    abilities: { WIS: 13 },
    description: "Мудрость 13 или выше"
  },
  fighter: {
    abilities: { STR: 13, DEX: 13 },
    description: "Сила 13 или Ловкость 13 или выше"
  },
  monk: {
    abilities: { DEX: 13, WIS: 13 },
    description: "Ловкость 13 и Мудрость 13 или выше"
  },
  paladin: {
    abilities: { STR: 13, CHA: 13 },
    description: "Сила 13 и Харизма 13 или выше"
  },
  ranger: {
    abilities: { DEX: 13, WIS: 13 },
    description: "Ловкость 13 и Мудрость 13 или выше"
  },
  rogue: {
    abilities: { DEX: 13 },
    description: "Ловкость 13 или выше"
  },
  sorcerer: {
    abilities: { CHA: 13 },
    description: "Харизма 13 или выше"
  },
  warlock: {
    abilities: { CHA: 13 },
    description: "Харизма 13 или выше"
  },
  wizard: {
    abilities: { INT: 13 },
    description: "Интеллект 13 или выше"
  }
};

// Список классов
const classes = [
  { id: "barbarian", name: "Варвар" },
  { id: "bard", name: "Бард" },
  { id: "cleric", name: "Жрец" },
  { id: "druid", name: "Друид" },
  { id: "fighter", name: "Воин" },
  { id: "monk", name: "Монах" },
  { id: "paladin", name: "Паладин" },
  { id: "ranger", name: "Следопыт" },
  { id: "rogue", name: "Плут" },
  { id: "sorcerer", name: "Чародей" },
  { id: "warlock", name: "Колдун" },
  { id: "wizard", name: "Волшебник" }
];

const CharacterMulticlassing: React.FC<CharacterMulticlassingProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep 
}) => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [additionalClasses, setAdditionalClasses] = useState<Array<{class: string; level: number}>>([]);
  
  // Проверяем, соответствует ли персонаж требованиям для мультиклассирования
  const canMulticlass = (classId: string): boolean => {
    if (!character.abilities) return false;
    const req = multiclassRequirements[classId];
    if (!req) return true;
    
    // Проверяем каждое требование
    if (req.abilities.STR && req.abilities.DEX) {
      // Для классов с альтернативными требованиями (например, воин)
      if (character.abilities.STR >= req.abilities.STR || character.abilities.DEX >= req.abilities.DEX) {
        return true;
      }
      return false;
    }
    
    // Для классов с обязательным сочетанием требований (например, паладин)
    for (const ability in req.abilities) {
      if (typeof character.abilities[ability] === 'number' && 
          character.abilities[ability] < req.abilities[ability]) {
        return false;
      }
    }
    
    return true;
  };
  
  // Функция для добавления дополнительного класса
  const addAdditionalClass = () => {
    if (!selectedClass) {
      toast({
        title: "Ошибка",
        description: "Выберите класс для добавления",
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем, не выбран ли уже этот класс
    if (additionalClasses.some(c => c.class === selectedClass) || character.class === selectedClass) {
      toast({
        title: "Дублирование класса",
        description: "Этот класс уже выбран",
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем требования для мультикласса
    if (!canMulticlass(selectedClass)) {
      const className = classes.find(c => c.id === selectedClass)?.name || selectedClass;
      toast({
        title: "Не соответствует требованиям",
        description: `Ваш персонаж не соответствует требованиям для класса ${className}`,
        variant: "destructive"
      });
      return;
    }
    
    // Добавляем класс
    setAdditionalClasses([...additionalClasses, {
      class: selectedClass,
      level: selectedLevel
    }]);
    
    // Сбрасываем выбор
    setSelectedClass("");
    setSelectedLevel(1);
    
    toast({
      title: "Класс добавлен",
      description: `${classes.find(c => c.id === selectedClass)?.name || selectedClass} (Уровень ${selectedLevel}) добавлен`
    });
  };
  
  // Удаление дополнительного класса
  const removeAdditionalClass = (index: number) => {
    setAdditionalClasses(additionalClasses.filter((_, i) => i !== index));
  };
  
  // Обработчик сохранения данных и перехода к следующему шагу
  const handleNextStep = () => {
    // Обновляем основной класс персонажа
    const updates: Partial<CharacterSheet> = {};
    
    // Добавляем дополнительные классы, если они есть
    if (additionalClasses.length > 0) {
      updates.additionalClasses = additionalClasses;
    }
    
    updateCharacter(updates);
    nextStep();
  };
  
  // Отображение требований для выбранного класса
  const renderRequirements = () => {
    if (!selectedClass) return null;
    
    const req = multiclassRequirements[selectedClass];
    if (!req || !req.description) return null;
    
    const meetsRequirements = canMulticlass(selectedClass);
    
    return (
      <div className={`mt-2 p-2 rounded-md ${meetsRequirements ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
        <p>
          <span className="font-medium">Требования: </span>
          {req.description}
        </p>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">Мультиклассирование</h1>
      
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Текущий класс</h2>
          <div className="bg-primary-foreground/10 p-4 rounded-md">
            <p>
              <span className="font-medium">Основной класс: </span>
              {character.className || character.class || "Не выбран"}, Уровень {character.level || 1}
            </p>
          </div>
        </div>
        
        {character.abilities && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Характеристики</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="font-medium">СИЛ: {character.abilities.STR}</p>
              </div>
              <div>
                <p className="font-medium">ЛОВ: {character.abilities.DEX}</p>
              </div>
              <div>
                <p className="font-medium">ТЕЛ: {character.abilities.CON}</p>
              </div>
              <div>
                <p className="font-medium">ИНТ: {character.abilities.INT}</p>
              </div>
              <div>
                <p className="font-medium">МДР: {character.abilities.WIS}</p>
              </div>
              <div>
                <p className="font-medium">ХАР: {character.abilities.CHA}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Добавить класс</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="class-select" className="block mb-2">Дополнительный класс</Label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="Выберите класс" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {renderRequirements()}
            </div>
            
            <div>
              <Label htmlFor="level-select" className="block mb-2">Уровень</Label>
              <Select
                value={selectedLevel.toString()}
                onValueChange={(val) => setSelectedLevel(Number(val))}
              >
                <SelectTrigger id="level-select">
                  <SelectValue placeholder="Выберите уровень" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
                    <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={addAdditionalClass}
            disabled={!selectedClass}
            className="w-full"
          >
            Добавить класс
          </Button>
        </div>
        
        {additionalClasses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Дополнительные классы</h2>
            <div className="space-y-2">
              {additionalClasses.map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-primary-foreground/10 rounded-md">
                  <div>
                    {classes.find(c => c.id === cls.class)?.name || cls.class}, Уровень {cls.level}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeAdditionalClass(index)}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
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

export default CharacterMulticlassing;
