
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { classes } from '@/data/classes';

interface CharacterClassSelectionProps {
  character: any;
  onUpdateCharacter: (updates: any) => void;
}

export const CharacterClassSelection = ({ character, onUpdateCharacter }: CharacterClassSelectionProps) => {
  const [selectedClass, setSelectedClass] = useState<string>(character.class || '');
  const [selectedSubclass, setSelectedSubclass] = useState<string>(character.subclass || '');
  
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedSubclass('');
    onUpdateCharacter({ 
      class: value,
      subclass: '' 
    });
  };
  
  const currentClass = classes.find(c => c.name === selectedClass);
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Выберите класс</h2>
        <p className="mb-4 text-muted-foreground">
          Класс определяет основной архетип вашего персонажа, его способности, 
          навыки и роль в приключении.
        </p>
        
        <RadioGroup
          value={selectedClass}
          onValueChange={handleClassChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {classes.map(classItem => (
            <div key={classItem.name} className="relative">
              <RadioGroupItem
                value={classItem.name}
                id={classItem.name}
                className="peer sr-only"
              />
              <Label
                htmlFor={classItem.name}
                className="flex flex-col p-4 rounded-md border-2 border-muted bg-primary/5 hover:bg-primary/10 cursor-pointer peer-data-[state=checked]:border-primary transition-colors"
              >
                <span className="font-semibold text-lg">{classItem.name}</span>
                <span className="text-sm text-muted-foreground">{classItem.description}</span>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Кость хитов: </span>
                    <span>{classItem.hitDie}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Основная хар-ка: </span>
                    <span>{classItem.primaryAbility}</span>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {selectedClass && (
        <Card className="mt-8 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Особенности класса: {selectedClass}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Владение оружием и доспехами</h4>
                <p className="text-sm text-muted-foreground">{currentClass?.proficiencies}</p>
              </div>
              <div>
                <h4 className="font-medium">Спасброски</h4>
                <p className="text-sm text-muted-foreground">{currentClass?.savingThrows}</p>
              </div>
              <div>
                <h4 className="font-medium">Классовые особенности 1 уровня</h4>
                <div className="space-y-2 mt-1">
                  {currentClass?.features.map((feature, index) => (
                    <div key={index}>
                      <h5 className="text-sm font-medium">{feature.name}</h5>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
