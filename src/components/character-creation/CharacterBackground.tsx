
import React, { useState } from 'react';
import type { Character } from "@/types/character";
import { getAllBackgrounds } from '@/data/backgrounds';
import NavigationButtons from "./NavigationButtons";
import SectionHeader from "@/components/ui/section-header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/use-theme';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CharacterBackgroundProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  onUpdate,
  nextStep,
  prevStep
}) => {
  const [selectedBackground, setSelectedBackground] = useState<string>(character.background || '');
  const [activeTab, setActiveTab] = useState<string>('description');
  const { themeStyles } = useTheme();
  
  // Получаем все предыстории
  const backgrounds = getAllBackgrounds();
  
  // Находим выбранную предысторию
  const currentBackground = backgrounds.find(bg => bg.name === selectedBackground);

  // Функция выбора предыстории
  const handleSelectBackground = (name: string) => {
    setSelectedBackground(name);
    // Задержка для предотвращения мерцания
    setTimeout(() => {
      onUpdate({ background: name });
    }, 0);
  };

  // Переход к следующему шагу
  const handleNext = () => {
    if (selectedBackground) {
      // Определим, какие параметры нужно обновить при переходе
      const updates: Partial<Character> = {
        background: selectedBackground,
      };

      // Добавим владение навыками из предыстории
      if (currentBackground && currentBackground.proficiencies.skills.length > 0) {
        const proficiencyUpdates: string[] = [];
        
        // Если proficiencies уже существует и это массив, используем его
        if (Array.isArray(character.proficiencies)) {
          proficiencyUpdates.push(...character.proficiencies);
        } 
        // Иначе, если это объект, создаем новый массив
        else if (character.proficiencies) {
          const existingProficiencies = character.proficiencies;
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

      // Обновляем с задержкой для предотвращения мерцания
      setTimeout(() => {
        onUpdate(updates);
        nextStep();
      }, 0);
    }
  };

  // Вспомогательная функция для безопасного рендеринга массивов или строк
  const renderSafelyAsArray = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'string') {
      return value;
    } else if (!value) {
      return '';
    }
    return String(value);
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
          <Card style={{ 
            background: `${themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.8)'}`,
            color: themeStyles?.textColor,
            borderColor: `${themeStyles?.accent}30`
          }}>
            <CardHeader>
              <CardTitle style={{ color: themeStyles?.accent }}>Доступные предыстории</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {backgrounds.map((bg) => (
                    <Card 
                      key={bg.name}
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedBackground === bg.name ? 'ring-2' : 'hover:bg-accent/10'
                      }`}
                      style={{ 
                        background: selectedBackground === bg.name
                          ? `${themeStyles?.accent}20`
                          : 'rgba(0, 0, 0, 0.6)',
                        color: themeStyles?.textColor,
                        borderColor: selectedBackground === bg.name
                          ? themeStyles?.accent
                          : 'rgba(255, 255, 255, 0.1)'
                      }}
                      onClick={() => handleSelectBackground(bg.name)}
                    >
                      <CardContent className="p-3 text-center">
                        <span style={{ color: selectedBackground === bg.name ? themeStyles?.accent : themeStyles?.textColor }}>
                          {bg.name}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Детали предыстории */}
        <div className="md:col-span-2">
          {currentBackground ? (
            <Card style={{ 
              background: `${themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.8)'}`,
              color: themeStyles?.textColor,
              borderColor: `${themeStyles?.accent}30` 
            }}>
              <CardHeader>
                <CardTitle style={{ color: themeStyles?.accent }}>{currentBackground.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="description">Описание</TabsTrigger>
                    <TabsTrigger value="proficiencies">Владения</TabsTrigger>
                    <TabsTrigger value="feature">Умения</TabsTrigger>
                    <TabsTrigger value="characteristics">Характеристики</TabsTrigger>
                  </TabsList>

                  <ScrollArea className="h-[400px] pr-4">
                    <TabsContent value="description" className="mt-0">
                      <p>{currentBackground.description}</p>
                    </TabsContent>

                    <TabsContent value="proficiencies" className="mt-0">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold" style={{ color: themeStyles?.accent }}>Навыки:</h3>
                          <p>{renderSafelyAsArray(currentBackground.proficiencies.skills)}</p>
                        </div>
                        {currentBackground.proficiencies.tools && (
                          <div>
                            <h3 className="font-semibold" style={{ color: themeStyles?.accent }}>Инструменты:</h3>
                            <p>{renderSafelyAsArray(currentBackground.proficiencies.tools)}</p>
                          </div>
                        )}
                        {currentBackground.proficiencies.languages && currentBackground.proficiencies.languages.length > 0 && (
                          <div>
                            <h3 className="font-semibold" style={{ color: themeStyles?.accent }}>Языки:</h3>
                            <p>{renderSafelyAsArray(currentBackground.proficiencies.languages)}</p>
                          </div>
                        )}
                        {currentBackground.proficiencies.equipment && (
                          <div>
                            <h3 className="font-semibold" style={{ color: themeStyles?.accent }}>Снаряжение:</h3>
                            <p>{currentBackground.proficiencies.equipment}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="feature" className="mt-0">
                      <div>
                        <h3 className="font-semibold" style={{ color: themeStyles?.accent }}>{currentBackground.feature.name}</h3>
                        <p className="mt-2">{currentBackground.feature.description}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="characteristics" className="mt-0">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold" style={{ color: themeStyles?.accent }}>Черты характера:</h3>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {currentBackground.personalityTraits.map((trait, index) => (
                              <li key={index}>{trait}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{ color: themeStyles?.accent }}>Идеалы:</h3>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {currentBackground.ideals.map((ideal, index) => (
                              <li key={index}>{ideal}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{ color: themeStyles?.accent }}>Привязанности:</h3>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {currentBackground.bonds.map((bond, index) => (
                              <li key={index}>{bond}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{ color: themeStyles?.accent }}>Слабости:</h3>
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {currentBackground.flaws.map((flaw, index) => (
                              <li key={index}>{flaw}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card style={{ 
              background: `${themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.8)'}`,
              color: themeStyles?.textColor,
              borderColor: `${themeStyles?.accent}30`
            }}>
              <CardContent className="p-6 text-center text-muted-foreground">
                Выберите предысторию, чтобы увидеть подробную информацию
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <NavigationButtons
        allowNext={!!selectedBackground}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterBackground;
