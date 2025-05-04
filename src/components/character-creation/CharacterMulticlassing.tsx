
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MulticlassRequirements, ClassRequirement } from '@/types/character';

// Define correct multiclass requirements interface structure
const MULTICLASS_REQUIREMENTS: MulticlassRequirements = {
  "Бард": {
    abilities: { charisma: 13 },
    description: "Харизма 13"
  },
  "Варвар": {
    abilities: { strength: 13 },
    description: "Сила 13"
  },
  "Воин": {
    abilities: { strength: 13, dexterity: 13 },
    description: "Сила 13 или Ловкость 13"
  },
  "Волшебник": {
    abilities: { intelligence: 13 },
    description: "Интеллект 13"
  },
  "Друид": {
    abilities: { wisdom: 13 },
    description: "Мудрость 13"
  },
  "Жрец": {
    abilities: { wisdom: 13 },
    description: "Мудрость 13"
  },
  "Колдун": {
    abilities: { charisma: 13 },
    description: "Харизма 13"
  },
  "Монах": {
    abilities: { dexterity: 13, wisdom: 13 },
    description: "Ловкость 13 и Мудрость 13"
  },
  "Паладин": {
    abilities: { strength: 13, charisma: 13 },
    description: "Сила 13 и Харизма 13"
  },
  "Плут": {
    abilities: { dexterity: 13 },
    description: "Ловкость 13"
  },
  "Следопыт": {
    abilities: { dexterity: 13, wisdom: 13 },
    description: "Ловкость 13 и Мудрость 13"
  },
  "Чародей": {
    abilities: { charisma: 13 },
    description: "Харизма 13"
  }
};

export default function CharacterMulticlassing() {
  const [selectedClass, setSelectedClass] = useState<ClassRequirement | null>(null);
  const classNames = Object.keys(MULTICLASS_REQUIREMENTS);

  const handleSelectClass = (className: string) => {
    setSelectedClass(MULTICLASS_REQUIREMENTS[className]);
  };

  return (
    <div>
      <h2>Требования для мультиклассирования</h2>
      <p>Для взятия уровня в новом классе необходимо соответствовать минимальным требованиям к характеристикам:</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {classNames.map((className) => (
          <Card 
            key={className} 
            className="cursor-pointer hover:border-primary transition-all"
            onClick={() => handleSelectClass(className)}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{className}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm">
              <p>{MULTICLASS_REQUIREMENTS[className].description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedClass && (
        <div className="mt-6">
          <h3 className="text-xl font-bold">Детали требований</h3>
          <p>{selectedClass.description}</p>
        </div>
      )}
    </div>
  );
}
