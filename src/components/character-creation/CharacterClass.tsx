
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Character } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface CharacterClassProps {
  classes: any[];
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterClass: React.FC<CharacterClassProps> = ({
  classes,
  character,
  onUpdate,
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState(character.class || '');
  const [selectedSubclass, setSelectedSubclass] = useState(character.subclass || '');

  const handleClassSelect = (className: string) => {
    setSelectedClass(className);
    setSelectedSubclass(''); // Сбрасываем подкласс при смене класса
  };

  const handleNext = () => {
    if (selectedClass) {
      onUpdate({ 
        class: selectedClass,
        subclass: selectedSubclass
      });
      
      // Уведомляем пользователя о выборе
      toast({
        title: "Класс выбран",
        description: `Вы выбрали класс ${selectedClass}`
      });
      
      nextStep();
    } else {
      toast({
        title: "Выберите класс",
        description: "Пожалуйста, выберите класс персонажа перед тем, как продолжить.",
        variant: "destructive"
      });
    }
  };

  // Получаем информацию о выбранном классе
  const selectedClassInfo = classes.find(cls => cls.name === selectedClass);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выбор класса</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {classes.map((cls) => (
          <Card 
            key={cls.name} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedClass === cls.name ? 'border-primary shadow-sm' : ''
            }`}
            onClick={() => handleClassSelect(cls.name)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{cls.name}</CardTitle>
                {cls.isMagicClass && (
                  <Badge variant="secondary" className="text-xs">
                    Магия
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">{cls.description}</CardDescription>
              <div className="text-xs text-muted-foreground space-y-1">
                <div><strong>Кость хитов:</strong> {cls.hitDie}</div>
                <div><strong>Основная характеристика:</strong> {cls.primaryAbility}</div>
                <div><strong>Спасброски:</strong> {cls.savingThrows}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Детальная информация о выбранном классе */}
      {selectedClassInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{selectedClassInfo.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-1">Владения</h3>
                <p className="text-sm text-muted-foreground">{selectedClassInfo.proficiencies}</p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Особенности класса</h3>
                <div className="space-y-2">
                  {selectedClassInfo.features.map((feature: any, index: number) => (
                    <div key={index} className="border-l-2 border-muted pl-3">
                      <h4 className="font-medium text-sm">{feature.name}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <NavigationButtons
        allowNext={!!selectedClass}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterClass;
