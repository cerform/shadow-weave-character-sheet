
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CharacterSheet, ClassLevel } from '@/types/character';

interface CharacterMulticlassProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Минимальные требования для мультиклассирования по PHB
const multiclassRequirements: { [key: string]: { [key: string]: number; description: string } } = {
  "Бард": { charisma: 13, description: "Харизма 13+" },
  "Варвар": { strength: 13, description: "Сила 13+" },
  "Воин": { strength: 13, dexterity: 13, description: "Сила 13+ или Ловкость 13+" },
  "Волшебник": { intelligence: 13, description: "Интеллект 13+" },
  "Друид": { wisdom: 13, description: "Мудрость 13+" },
  "Жрец": { wisdom: 13, description: "Мудрость 13+" },
  "Колдун": { charisma: 13, description: "Харизма 13+" },
  "Монах": { dexterity: 13, wisdom: 13, description: "Ловкость 13+ и Мудрость 13+" },
  "Паладин": { strength: 13, charisma: 13, description: "Сила 13+ и Харизма 13+" },
  "Плут": { dexterity: 13, description: "Ловкость 13+" },
  "Рейнджер": { dexterity: 13, wisdom: 13, description: "Ловкость 13+ и Мудрость 13+" },
  "Чародей": { charisma: 13, description: "Харизма 13+" }
};

const CharacterMulticlassing: React.FC<CharacterMulticlassProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  
  // Проверка соответствия требованиям мультиклассирования
  const checkRequirements = (className: string): boolean => {
    if (!className || !multiclassRequirements[className]) {
      return false;
    }
    
    const requirements = multiclassRequirements[className];
    
    // Проверка характеристик персонажа
    for (const [ability, minValue] of Object.entries(requirements)) {
      if (ability === 'description') continue; // Пропускаем поле description
      
      const abilityValue = character.abilities[ability as keyof typeof character.abilities];
      if (typeof abilityValue === 'number' && abilityValue < minValue as number) {
        return false;
      }
    }
    
    return true;
  };
  
  // Получаем список доступных классов для мультиклассирования
  const getAvailableClasses = () => {
    const allClasses = [
      "Бард", "Варвар", "Воин", "Волшебник", "Друид", "Жрец", 
      "Колдун", "Монах", "Паладин", "Плут", "Рейнджер", "Чародей"
    ];
    
    // Исключаем основной класс персонажа
    return allClasses.filter(cls => cls !== character.class);
  };
  
  // Добавление нового класса
  const handleAddClass = () => {
    if (!selectedClass) {
      toast({
        title: "Выберите класс",
        description: "Пожалуйста, выберите класс для мультиклассирования",
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем соответствие требованиям
    if (!checkRequirements(selectedClass)) {
      toast({
        title: "Не соответствует требованиям",
        description: `Характеристики персонажа не соответствуют минимальным требованиям для класса ${selectedClass}`,
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем общий уровень персонажа
    const currentAdditionalLevels = character.additionalClasses?.reduce((sum, cls) => sum + cls.level, 0) || 0;
    if (character.level + currentAdditionalLevels + selectedLevel > 20) {
      toast({
        title: "Превышен максимальный уровень",
        description: "Общий уровень персонажа не может превышать 20",
        variant: "destructive"
      });
      return;
    }
    
    // Добавляем новый класс
    const newClass: ClassLevel = {
      class: selectedClass,
      level: selectedLevel,
    };
    
    const currentAdditionalClasses = character.additionalClasses || [];
    updateCharacter({
      additionalClasses: [...currentAdditionalClasses, newClass]
    });
    
    toast({
      title: "Класс добавлен",
      description: `${selectedClass} (${selectedLevel} уровень) успешно добавлен`
    });
    
    // Сбрасываем форму
    setSelectedClass("");
    setSelectedLevel(1);
  };
  
  // Удаление дополнительного класса
  const handleRemoveClass = (index: number) => {
    if (!character.additionalClasses) return;
    
    const updatedClasses = [...character.additionalClasses];
    updatedClasses.splice(index, 1);
    
    updateCharacter({ additionalClasses: updatedClasses });
    
    toast({
      title: "Класс удален",
      description: "Дополнительный класс успешно удален"
    });
  };
  
  // Расчет общего уровня персонажа
  const getTotalLevel = () => {
    const additionalLevels = character.additionalClasses?.reduce((sum, cls) => sum + cls.level, 0) || 0;
    return character.level + additionalLevels;
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">Мультиклассирование</h2>
        <p className="text-muted-foreground text-center">
          Добавьте дополнительные классы для вашего персонажа
        </p>
      </div>
      
      <div className="bg-background/30 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Текущие классы</h3>
        
        {/* Основной класс */}
        <div className="flex justify-between items-center p-2 border border-border rounded mb-2">
          <div>
            <span className="font-medium">{character.class}</span>
            {character.subclass && <span className="text-sm text-muted-foreground ml-1">({character.subclass})</span>}
            <span className="ml-2">{character.level} уровень</span>
          </div>
          <Badge variant="outline">Основной</Badge>
        </div>
        
        {/* Дополнительные классы */}
        {character.additionalClasses?.map((cls, index) => (
          <div key={index} className="flex justify-between items-center p-2 border border-border rounded mb-2">
            <div>
              <span className="font-medium">{cls.class}</span>
              <span className="ml-2">{cls.level} уровень</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveClass(index)}
              className="text-destructive"
            >
              Удалить
            </Button>
          </div>
        ))}
        
        <div className="mt-2 text-right">
          <Badge variant="secondary">
            Общий уровень: {getTotalLevel()}/20
          </Badge>
        </div>
      </div>
      
      <Separator />
      
      {/* Форма для добавления нового класса */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Добавить класс</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="class">Класс</Label>
            <Select 
              onValueChange={setSelectedClass} 
              value={selectedClass}
            >
              <SelectTrigger id="class">
                <SelectValue placeholder="Выберите класс" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableClasses().map(cls => (
                  <SelectItem 
                    key={cls} 
                    value={cls}
                    disabled={!checkRequirements(cls)}
                  >
                    {cls} {!checkRequirements(cls) && <span className="text-red-500">(Не соответствует требованиям)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="level">Уровень</Label>
            <Select 
              onValueChange={value => setSelectedLevel(parseInt(value))} 
              value={selectedLevel.toString()}
            >
              <SelectTrigger id="level">
                <SelectValue placeholder="Выберите уровень" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(20 - getTotalLevel() + (selectedLevel || 0), 20) }, (_, i) => i + 1).map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedClass && (
          <div className="bg-muted/30 p-3 rounded">
            <h4 className="font-medium">Требования для {selectedClass}:</h4>
            <p className="text-sm text-muted-foreground">
              {multiclassRequirements[selectedClass]?.description || "Нет особых требований"}
            </p>
          </div>
        )}
        
        <Button 
          onClick={handleAddClass}
          disabled={!selectedClass || !checkRequirements(selectedClass)}
        >
          Добавить класс
        </Button>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button onClick={prevStep} variant="outline">
          Назад
        </Button>
        <Button onClick={nextStep}>
          Далее
        </Button>
      </div>
    </div>
  );
};

// Добавляем недостающий компонент Badge, вызывающий ошибку
const Badge = ({ children, variant = 'default', className = '' }) => {
  const getVariantClass = () => {
    switch(variant) {
      case 'outline':
        return 'border border-border bg-background text-foreground';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${getVariantClass()} ${className}`}>
      {children}
    </span>
  );
};

export default CharacterMulticlassing;
