
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavigationButtons from './NavigationButtons';
import SectionHeader from '@/components/ui/section-header';
import { SelectionCard, SelectionCardGrid } from '@/components/ui/selection-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { isEquipmentEmpty } from '@/utils/safetyUtils';

// Интерфейс для предыстории
interface Background {
  name: string;
  description: string;
  proficiencies: {
    skills: string[];
    tools: string[];
    languages: string[];
    equipment: string;
  };
  feature: {
    name: string;
    description: string;
  };
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

// Интерфейс для props компонента
export interface CharacterBackgroundProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
  backgrounds: Background[]; // Добавляем backgrounds в интерфейс
}

const CharacterBackgroundSelection: React.FC<CharacterBackgroundProps> = ({
  character,
  onUpdate,
  nextStep,
  prevStep,
  backgrounds
}) => {
  const [selectedBackground, setSelectedBackground] = useState<string>(character.background || '');
  const [activeTab, setActiveTab] = useState<string>('description');
  const { toast } = useToast();

  // Проверяем, есть ли предыстории
  useEffect(() => {
    if (!backgrounds || backgrounds.length === 0) {
      toast({
        title: "Ошибка загрузки предысторий",
        description: "Не удалось загрузить список предысторий. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    }
  }, [backgrounds, toast]);

  // Найдем выбранную предысторию
  const currentBackground = backgrounds.find(bg => bg.name === selectedBackground);

  // Обработчик выбора предыстории
  const handleSelectBackground = (name: string) => {
    setSelectedBackground(name);
    onUpdate({ background: name });
  };

  // Обработчик перехода к следующему шагу
  const handleNext = () => {
    if (selectedBackground) {
      // Определим, какие параметры нужно обновить при переходе
      const updates: Partial<Character> = {
        background: selectedBackground,
      };

      // Добавим владение навыками из предыстории
      if (currentBackground && currentBackground.proficiencies.skills.length > 0) {
        // Создаем массив навыков, если его нет
        let proficiencyUpdates: string[] = [];
        
        // Если proficiencies уже существует и это массив, используем его
        if (Array.isArray(character.proficiencies)) {
          proficiencyUpdates = [...character.proficiencies];
        } 
        // Иначе, если это объект, создаем новый массив
        else if (character.proficiencies && typeof character.proficiencies === 'object') {
          // Конвертируем объект в массив для обновления
          const existingProficiencies = character.proficiencies as {
            weapons?: string[];
            tools?: string[];
            languages?: string[];
          };
          if (existingProficiencies.weapons) proficiencyUpdates.push(...existingProficiencies.weapons);
          if (existingProficiencies.tools) proficiencyUpdates.push(...existingProficiencies.tools);
          if (existingProficiencies.languages) proficiencyUpdates.push(...existingProficiencies.languages);
        }
        
        // Добавляем навыки из предыстории, если их ещё нет
        currentBackground.proficiencies.skills.forEach(skill => {
          if (!proficiencyUpdates.includes(skill)) {
            proficiencyUpdates.push(skill);
          }
        });
        
        updates.proficiencies = proficiencyUpdates;
      }

      // Обновляем данные персонажа
      onUpdate(updates);
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Выбор предыстории"
        description="Предыстория отражает происхождение персонажа, его место в мире и первоначальные навыки."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Выбор предыстории */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Доступные предыстории</CardTitle>
            </CardHeader>
            <CardContent>
              <SelectionCardGrid>
                {backgrounds.map((bg) => (
                  <SelectionCard
                    key={bg.name}
                    title={bg.name}
                    selected={selectedBackground === bg.name}
                    onClick={() => handleSelectBackground(bg.name)}
                  />
                ))}
              </SelectionCardGrid>
            </CardContent>
          </Card>
        </div>

        {/* Детали предыстории */}
        <div className="md:col-span-2">
          {currentBackground ? (
            <Card>
              <CardHeader>
                <CardTitle>{currentBackground.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="description">Описание</TabsTrigger>
                    <TabsTrigger value="proficiencies">Владения</TabsTrigger>
                    <TabsTrigger value="feature">Умения</TabsTrigger>
                    <TabsTrigger value="characteristics">Характеристики</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description">
                    <p>{currentBackground.description}</p>
                  </TabsContent>

                  <TabsContent value="proficiencies">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Навыки:</h3>
                        <p>{currentBackground.proficiencies.skills.join(', ')}</p>
                      </div>
                      {currentBackground.proficiencies.tools.length > 0 && (
                        <div>
                          <h3 className="font-semibold">Инструменты:</h3>
                          <p>{currentBackground.proficiencies.tools.join(', ')}</p>
                        </div>
                      )}
                      {currentBackground.proficiencies.languages.length > 0 && (
                        <div>
                          <h3 className="font-semibold">Языки:</h3>
                          <p>{currentBackground.proficiencies.languages.join(', ')}</p>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">Снаряжение:</h3>
                        <p>{currentBackground.proficiencies.equipment}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="feature">
                    <div>
                      <h3 className="font-semibold">{currentBackground.feature.name}</h3>
                      <p className="mt-2">{currentBackground.feature.description}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="characteristics">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Черты характера:</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {currentBackground.personalityTraits.map((trait, index) => (
                            <li key={index}>{trait}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold">Идеалы:</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {currentBackground.ideals.map((ideal, index) => (
                            <li key={index}>{ideal}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold">Привязанности:</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {currentBackground.bonds.map((bond, index) => (
                            <li key={index}>{bond}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold">Слабости:</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          {currentBackground.flaws.map((flaw, index) => (
                            <li key={index}>{flaw}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Выберите предысторию, чтобы увидеть подробную информацию
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <NavigationButtons
        allowNext={!!selectedBackground}
        onNext={handleNext}
        onPrev={prevStep}
        isFirstStep={false}
        nextStep={nextStep}
        prevStep={prevStep}
      />
    </div>
  );
};

export default CharacterBackgroundSelection;
