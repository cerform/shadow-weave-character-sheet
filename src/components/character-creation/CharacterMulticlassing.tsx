
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ClassRequirement, MulticlassRequirements } from '@/types/character';

// Правильно определяем требования к мультиклассированию согласно интерфейсу ClassRequirement
const multiclassRequirements: MulticlassRequirements = {
  "Бард": {
    abilities: { charisma: 13 }, // Исправление: используем объект с abilities вместо прямого объекта
    description: "Харизма 13 или выше"
  },
  "Варвар": {
    abilities: { strength: 13 },
    description: "Сила 13 или выше"
  },
  "Воин": {
    abilities: { strength: 13, dexterity: 13 },
    description: "Сила 13 или Ловкость 13 или выше"
  },
  "Волшебник": {
    abilities: { intelligence: 13 },
    description: "Интеллект 13 или выше"
  },
  "Друид": {
    abilities: { wisdom: 13 },
    description: "Мудрость 13 или выше"
  },
  "Жрец": {
    abilities: { wisdom: 13 },
    description: "Мудрость 13 или выше"
  },
  "Колдун": {
    abilities: { charisma: 13 },
    description: "Харизма 13 или выше"
  },
  "Монах": {
    abilities: { dexterity: 13, wisdom: 13 },
    description: "Ловкость 13 и Мудрость 13 или выше"
  },
  "Паладин": {
    abilities: { strength: 13, charisma: 13 },
    description: "Сила 13 и Харизма 13 или выше"
  },
  "Плут": {
    abilities: { dexterity: 13 },
    description: "Ловкость 13 или выше"
  },
  "Следопыт": {
    abilities: { dexterity: 13, wisdom: 13 },
    description: "Ловкость 13 и Мудрость 13 или выше"
  },
  "Чародей": {
    abilities: { charisma: 13 },
    description: "Харизма 13 или выше"
  }
};

interface Props {
  selectedClass: string;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

const CharacterMulticlassing = ({ selectedClass, abilities }: Props) => {
  const [meetsRequirements, setMeetsRequirements] = useState(true);
  const [requirements, setRequirements] = useState<ClassRequirement | null>(null);

  useEffect(() => {
    const classReqs = multiclassRequirements[selectedClass];
    if (classReqs) {
      setRequirements(classReqs);
      
      // Проверяем, что все необходимые характеристики соответствуют требованиям
      const meetsCriteria = Object.entries(classReqs.abilities).every(
        ([ability, minValue]) => {
          const abilityValue = abilities[ability as keyof typeof abilities] || 0;
          return abilityValue >= minValue;
        }
      );
      
      setMeetsRequirements(meetsCriteria);
    }
  }, [selectedClass, abilities]);

  if (!requirements) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <Label className="font-bold">Требования для мультиклассирования:</Label>
          <p className="text-sm">{requirements.description}</p>
          <div className={`mt-2 font-medium ${meetsRequirements ? 'text-green-500' : 'text-red-500'}`}>
            {meetsRequirements 
              ? 'Ваши характеристики соответствуют требованиям для этого класса.' 
              : 'Ваши характеристики не соответствуют требованиям для этого класса.'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterMulticlassing;
