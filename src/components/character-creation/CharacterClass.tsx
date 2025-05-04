
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CharacterSheet } from '@/types/character';

interface CharacterClassProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

// Базовые классы D&D 5e
const classes = [
  {
    id: "barbarian",
    name: "Варвар",
    description: "Свирепый воин первобытного происхождения, который может впасть в ярость в бою",
    hitDice: "d12",
    primaryAbility: "Сила",
    savingThrows: ["Сила", "Телосложение"]
  },
  {
    id: "bard",
    name: "Бард",
    description: "Вдохновляющий маг, чья сила проистекает из музыки его сердца",
    hitDice: "d8",
    primaryAbility: "Харизма",
    savingThrows: ["Ловкость", "Харизма"]
  },
  {
    id: "cleric",
    name: "Жрец",
    description: "Жрец различных божеств с уникальной сферой магической силы",
    hitDice: "d8",
    primaryAbility: "Мудрость",
    savingThrows: ["Мудрость", "Харизма"]
  },
  {
    id: "druid",
    name: "Друид",
    description: "Священник природы, владеющий древней магией и способностью менять форму",
    hitDice: "d8",
    primaryAbility: "Мудрость",
    savingThrows: ["Интеллект", "Мудрость"]
  }
];

const CharacterClass: React.FC<CharacterClassProps> = ({ 
  character, 
  updateCharacter, 
  nextStep, 
  prevStep 
}) => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState(character.class || "");
  const [selectedLevel, setSelectedLevel] = useState(character.level || 1);
  
  // Получение информации о выбранном классе
  const classInfo = classes.find(c => c.id === selectedClass);
  
  // Обработчик сохранения данных и перехода к следующему шагу
  const handleNextStep = () => {
    if (!selectedClass) {
      toast({
        title: "Класс не выбран",
        description: "Пожалуйста, выберите класс для вашего персонажа",
        variant: "destructive"
      });
      return;
    }
    
    const updates: Partial<CharacterSheet> = { 
      class: selectedClass,
      className: classInfo?.name,
      level: selectedLevel
    };
    
    updateCharacter(updates);
    nextStep();
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">Выбор класса</h1>
      
      <Card className="p-6">
        <div className="mb-6">
          <Label htmlFor="class-select" className="block mb-2">Класс персонажа</Label>
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
        </div>
        
        {classInfo && (
          <div className="bg-primary-foreground/10 p-4 rounded-md mb-6">
            <h3 className="font-bold mb-2">{classInfo.name}</h3>
            <p className="text-sm mb-2">{classInfo.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Кость хитов: {classInfo.hitDice}</div>
              <div>Основная характеристика: {classInfo.primaryAbility}</div>
              <div className="col-span-2">Спасброски: {classInfo.savingThrows.join(", ")}</div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <Label htmlFor="level-select" className="block mb-2">Уровень</Label>
          <Select
            value={selectedLevel.toString()}
            onValueChange={(val) => setSelectedLevel(parseInt(val))}
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
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
          >
            Назад
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={!selectedClass}
          >
            Далее
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CharacterClass;
