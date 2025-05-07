
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import NavigationButtons from './NavigationButtons';
import SectionHeader from '@/components/ui/section-header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SelectionCard } from '@/components/ui/selection-card';
import { useSubraceSelection } from '@/hooks/useSubraceSelection';
import { Button } from '@/components/ui/button';
import AbilityBonusSelector from './AbilityBonusSelector';
import FeatSelector from './FeatSelector';
import { getRaceByName } from '@/data/races';

interface CharacterSubraceSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSubraceSelection: React.FC<CharacterSubraceSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const { 
    selectedSubrace, 
    availableSubraces, 
    hasSubraces,
    handleSubraceSelect 
  } = useSubraceSelection({
    race: character.race || '',
    initialSubrace: character.subrace || '',
    onSubraceSelect: (subrace) => updateCharacter({ subrace })
  });

  // Определяем бонусы для выбора характеристик
  const [abilityBonuses, setAbilityBonuses] = useState<{
    amount: number;
    options?: string[];
    fixed?: Record<string, number>;
  }>({ amount: 0 });

  // Определяем количество доступных черт
  const [availableFeats, setAvailableFeats] = useState<number>(0);

  // Обработка бонусов для расы и подрасы
  useEffect(() => {
    if (character.race) {
      const raceData = getRaceByName(character.race);
      
      if (raceData) {
        // Получаем бонусы для расы
        const raceBonuses: Record<string, number> = {};
        let selectableAmount = 0;
        
        if (raceData.abilityScoreIncrease) {
          // Фиксированные бонусы
          Object.entries(raceData.abilityScoreIncrease).forEach(([ability, value]) => {
            if (ability !== 'all' && ability !== 'custom') {
              raceBonuses[ability] = value as number;
            } else if (ability === 'all') {
              // Например, для стандартного человека +1 ко всем
              raceBonuses['strength'] = 1;
              raceBonuses['dexterity'] = 1;
              raceBonuses['constitution'] = 1;
              raceBonuses['intelligence'] = 1;
              raceBonuses['wisdom'] = 1;
              raceBonuses['charisma'] = 1;
            } else if (ability === 'custom') {
              // Для вариативных бонусов (например, +1 к двум на выбор)
              selectableAmount = value as number;
            }
          });
        }
        
        // Если это вариант человека, обрабатываем особый случай
        if (character.race === 'Человек' && character.subrace === 'Вариант человека') {
          // Сбрасываем фиксированные бонусы для варианта
          setAbilityBonuses({
            amount: 2,  // Вариант человека может выбрать 2 характеристики
            options: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
            fixed: {}
          });
          
          // Даем одну черту
          setAvailableFeats(1);
        }
        // Иначе применяем стандартные бонусы расы
        else {
          setAbilityBonuses({
            amount: selectableAmount,
            fixed: Object.keys(raceBonuses).length > 0 ? raceBonuses : undefined
          });
          
          // По умолчанию нет черт
          setAvailableFeats(0);
        }
        
        // Если выбрана подраса, ищем дополнительные бонусы
        if (character.subrace && character.subrace !== 'Вариант человека') {
          const subrace = availableSubraces.find(sr => sr.name === character.subrace);
          
          if (subrace && subrace.abilityScoreIncrease) {
            // Применяем бонусы подрасы
            Object.entries(subrace.abilityScoreIncrease).forEach(([ability, value]) => {
              if (raceBonuses[ability]) {
                raceBonuses[ability] += value as number;
              } else {
                raceBonuses[ability] = value as number;
              }
            });
            
            setAbilityBonuses({
              amount: selectableAmount,
              fixed: raceBonuses
            });
          }
        }
      }
    }
  }, [character.race, character.subrace, availableSubraces]);

  // Если у расы нет подрас, автоматически переходим к следующему шагу
  useEffect(() => {
    if (!hasSubraces && character.race) {
      // Но сначала проверяем, нужно ли выбирать бонусы
      const needToSelectBonuses = abilityBonuses.amount > 0 || availableFeats > 0;
      
      if (!needToSelectBonuses) {
        // Если не нужно выбирать бонусы, переходим к следующему шагу
        nextStep();
      }
    }
  }, [hasSubraces, character.race, abilityBonuses, availableFeats]);

  // Если нет расы, возвращаемся к выбору расы
  if (!character.race) {
    prevStep();
    return null;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Настройка расы"
        description={
          hasSubraces 
            ? "Выберите подрасу и распределите бонусные очки характеристик" 
            : "Распределите бонусные очки характеристик для вашей расы"
        }
      />

      {hasSubraces && (
        <Card>
          <CardHeader>
            <CardTitle>Подрасы</CardTitle>
            <CardDescription>Выберите подрасу для вашего персонажа</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 gap-4">
                {availableSubraces.map((subrace) => (
                  <SelectionCard
                    key={subrace.name}
                    title={subrace.name}
                    description={subrace.description}
                    selected={selectedSubrace === subrace.name}
                    onClick={() => handleSubraceSelect(subrace.name)}
                  >
                    {subrace.traits && subrace.traits.length > 0 && (
                      <div className="mt-2">
                        <strong>Особенности:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {subrace.traits.map((trait, idx) => (
                            <li key={idx} className="text-sm">{trait}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </SelectionCard>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Селектор бонусов к характеристикам */}
      {abilityBonuses.amount > 0 && (
        <AbilityBonusSelector
          character={character}
          updateCharacter={updateCharacter}
          abilityBonuses={abilityBonuses}
        />
      )}

      {/* Селектор черт, если доступны */}
      {availableFeats > 0 && (
        <FeatSelector
          character={character}
          updateCharacter={updateCharacter}
          numberOfFeats={availableFeats}
        />
      )}

      <NavigationButtons
        allowNext={
          (!hasSubraces || !!selectedSubrace) && 
          (abilityBonuses.amount === 0 || character.abilities?.strength !== 10)
        }
        nextStep={nextStep}
        prevStep={prevStep}
      />
    </div>
  );
};

export default CharacterSubraceSelection;
