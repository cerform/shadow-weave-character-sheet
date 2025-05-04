
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { CharacterSheet, ClassLevel, MulticlassRequirements } from "@/types/character";
import { useToast } from "@/hooks/use-toast";
import { classes } from "@/data/classes";
import { Plus, Minus } from "lucide-react";

// Минимальные требования характеристик для мультиклассирования согласно Книге Игрока
const multiclassRequirements: MulticlassRequirements = {
  "Варвар": { "strength": 13 },
  "Бард": { "charisma": 13 },
  "Жрец": { "wisdom": 13 },
  "Друид": { "wisdom": 13 },
  "Воин": { "strength": 13, "dexterity": 13 },
  "Монах": { "dexterity": 13, "wisdom": 13 },
  "Паладин": { "strength": 13, "charisma": 13 },
  "Следопыт": { "dexterity": 13, "wisdom": 13 },
  "Плут": { "dexterity": 13 },
  "Чародей": { "charisma": 13 },
  "Колдун": { "charisma": 13 },
  "Волшебник": { "intelligence": 13 }
};

interface CharacterMulticlassingProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
  getModifier: (abilityScore: number) => string;
}

const CharacterMulticlassing: React.FC<CharacterMulticlassingProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
  getModifier
}) => {
  const { toast } = useToast();
  const [additionalClasses, setAdditionalClasses] = useState<ClassLevel[]>(
    character.additionalClasses || []
  );
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedClassDetails, setSelectedClassDetails] = useState<any>(null);
  const [totalLevel, setTotalLevel] = useState<number>(character.level || 1);

  // Проверка требований к характеристикам для мультиклассирования
  const checkRequirements = (className: string): boolean => {
    if (!className || !multiclassRequirements[className]) return true;
    
    const requirements = multiclassRequirements[className];
    
    for (const ability in requirements) {
      if (ability === 'description') continue; // Пропускаем описание
      const requiredValue = requirements[ability];
      const characterValue = character.abilities?.[ability as keyof typeof character.abilities];
      
      if (typeof characterValue !== 'number' || characterValue < requiredValue) {
        return false;
      }
    }
    
    return true;
  };
  
  useEffect(() => {
    // Обновляем детали выбранного класса при его изменении
    if (selectedClass) {
      const classDetails = classes.find(c => c.name === selectedClass);
      setSelectedClassDetails(classDetails);
    } else {
      setSelectedClassDetails(null);
    }
  }, [selectedClass]);
  
  useEffect(() => {
    // Подсчитываем общий уровень персонажа
    let total = character.level || 1;
    additionalClasses.forEach(cls => {
      total += cls.level;
    });
    setTotalLevel(total);
  }, [character.level, additionalClasses]);
  
  // Добавление нового класса
  const addClass = () => {
    if (!selectedClass) {
      toast({
        title: "Выберите класс",
        description: "Необходимо выбрать класс для добавления",
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем, соответствуют ли характеристики требованиям класса
    if (!checkRequirements(selectedClass)) {
      const requirements = multiclassRequirements[selectedClass];
      const reqList: string[] = [];
      
      // Формируем список требований
      for (const ability in requirements) {
        if (ability === 'description') continue;
        reqList.push(`${getAbilityName(ability)}: ${requirements[ability]}`);
      }
      
      const requirementsList = reqList.join(", ");
      
      toast({
        title: "Недостаточно характеристик",
        description: `Для класса ${selectedClass} требуется: ${requirementsList}`,
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем, не выбран ли класс уже
    const isClassAlreadyAdded = additionalClasses.some(c => c.class === selectedClass);
    const isPrimaryClass = character.class === selectedClass;
    
    if (isClassAlreadyAdded || isPrimaryClass) {
      toast({
        title: "Класс уже выбран",
        description: "Этот класс уже добавлен вашему персонажу",
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем, не превышает ли общий уровень 20
    if (totalLevel + selectedLevel > 20) {
      toast({
        title: "Превышен максимальный уровень",
        description: "Общий уровень персонажа не может превышать 20",
        variant: "destructive"
      });
      return;
    }
    
    const newClass: ClassLevel = {
      class: selectedClass,
      level: selectedLevel
    };
    
    const newAdditionalClasses = [...additionalClasses, newClass];
    setAdditionalClasses(newAdditionalClasses);
    
    // Сбрасываем выбранный класс
    setSelectedClass("");
  };
  
  // Удаление класса
  const removeClass = (index: number) => {
    const newAdditionalClasses = [...additionalClasses];
    newAdditionalClasses.splice(index, 1);
    setAdditionalClasses(newAdditionalClasses);
  };
  
  // Изменение уровня класса
  const changeClassLevel = (index: number, level: number) => {
    if (level < 1 || level > 19) return;
    
    // Проверяем, не превышает ли общий уровень 20
    let totalWithoutThis = character.level || 1;
    additionalClasses.forEach((cls, i) => {
      if (i !== index) totalWithoutThis += cls.level;
    });
    
    if (totalWithoutThis + level > 20) {
      toast({
        title: "Превышен максимальный уровень",
        description: "Общий уровень персонажа не может превышать 20",
        variant: "destructive"
      });
      return;
    }
    
    const newAdditionalClasses = [...additionalClasses];
    newAdditionalClasses[index].level = level;
    setAdditionalClasses(newAdditionalClasses);
  };
  
  const handleNext = () => {
    // Перед переходом к следующему шагу сохраняем дополнительные классы
    updateCharacter({ additionalClasses });
    nextStep();
  };
  
  // Получить название характеристики на русском
  const getAbilityName = (ability: string): string => {
    const names: {[key: string]: string} = {
      'strength': 'Сила',
      'dexterity': 'Ловкость',
      'constitution': 'Телосложение',
      'intelligence': 'Интеллект',
      'wisdom': 'Мудрость',
      'charisma': 'Харизма'
    };
    return names[ability] || ability;
  };
  
  // Отображаем требования к классу
  const renderRequirements = (className: string) => {
    if (!className || !multiclassRequirements[className]) return null;
    
    const requirements = multiclassRequirements[className];
    const reqItems: React.ReactNode[] = [];
    
    // Формируем элементы списка требований
    for (const ability in requirements) {
      if (ability === 'description') continue;
      const value = requirements[ability];
      const characterValue = character.abilities?.[ability as keyof typeof character.abilities];
      const isMet = typeof characterValue === 'number' && characterValue >= value;
      
      reqItems.push(
        <li key={ability} className={isMet ? "text-green-500" : "text-red-500"}>
          {getAbilityName(ability)}: {value} 
          {isMet 
            ? ` (✓ у вас ${characterValue})` 
            : ` (✗ у вас ${characterValue})`}
        </li>
      );
    }
    
    return (
      <div className="mt-2 text-sm">
        <p className="font-medium">Требования к характеристикам:</p>
        <ul className="list-disc list-inside">
          {reqItems}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Мультиклассирование</h2>
      
      <div className="mb-6 bg-muted/20 p-4 rounded-lg">
        <p>Мультиклассирование позволяет вам получать уровни в нескольких классах. Это даёт вам разнообразие возможностей за счёт специализации.</p>
        <p className="mt-2">
          <strong>Текущий класс:</strong> {character.class} (уровень {character.level})
        </p>
        <p className="mt-1">
          <strong>Общий уровень:</strong> {totalLevel}/20
        </p>
      </div>
      
      {/* Текущие дополнительные классы */}
      {additionalClasses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Дополнительные классы</h3>
          <div className="space-y-2">
            {additionalClasses.map((cls, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                <span className="font-medium">{cls.class}</span>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => changeClassLevel(index, cls.level - 1)}
                      disabled={cls.level <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">
                      {cls.level}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => changeClassLevel(index, cls.level + 1)}
                      disabled={totalLevel >= 20}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeClass(index)}
                  >
                    X
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Выбор нового класса */}
      <div className="mb-8 p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">Добавить новый класс</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Класс</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите класс" />
              </SelectTrigger>
              <SelectContent>
                {classes
                  .filter(c => c.name !== character.class && !additionalClasses.some(ac => ac.class === c.name))
                  .map(c => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            
            {selectedClass && renderRequirements(selectedClass)}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Уровень</label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedLevel(prev => Math.max(1, prev - 1))}
                disabled={selectedLevel <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input 
                type="number" 
                min={1} 
                max={19} 
                value={selectedLevel}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= 19) {
                    setSelectedLevel(val);
                  }
                }}
                className="w-16 text-center"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedLevel(prev => Math.min(19, prev + 1))}
                disabled={selectedLevel >= 19 || totalLevel + selectedLevel > 20}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={addClass}
          disabled={!selectedClass || !checkRequirements(selectedClass) || totalLevel + selectedLevel > 20}
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-2" /> Добавить класс
        </Button>
      </div>
      
      {/* Описание выбранного класса */}
      {selectedClassDetails && (
        <div className="mb-8 bg-card/20 p-4 rounded-lg border">
          <h3 className="text-xl font-medium mb-3">{selectedClassDetails.name}</h3>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="features">Особенности</TabsTrigger>
              <TabsTrigger value="proficiencies">Владения</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-64 rounded-md border p-4">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <p>{selectedClassDetails.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-medium text-sm">Кость здоровья</h4>
                    <p className="text-sm">{selectedClassDetails.hitDie}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Основная характеристика</h4>
                    <p className="text-sm">{selectedClassDetails.primaryAbility}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Спасброски</h4>
                    <p className="text-sm">{selectedClassDetails.savingThrows}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="mt-0">
                <div className="space-y-4">
                  {selectedClassDetails.features && selectedClassDetails.features
                    .filter((feature: any) => feature.level <= selectedLevel)
                    .map((feature: any, index: number) => (
                    <div key={index}>
                      <h4 className="font-medium">{feature.name} (уровень {feature.level})</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="proficiencies" className="mt-0">
                <p>{selectedClassDetails.proficiencies}</p>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      )}

      <NavigationButtons
        allowNext={true}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterMulticlassing;
