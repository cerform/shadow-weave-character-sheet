
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { Character, AbilityScores } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterUtils';
import CharacterContext from '@/contexts/CharacterContext';
import { useCharacter } from '@/contexts/CharacterContext';
import { calculateAbilityModifier } from '@/utils/characterUtils';
import { v4 as uuidv4 } from 'uuid';
import {
  calculateStatBonuses,
  calculateInitiative,
  calculateArmorClass,
  calculateMaxHP,
} from '@/utils/characterUtils';
import CharacterCreationContent from '@/components/character-creation/CharacterCreationContent';
import NavigationButtons from '@/components/character-creation/NavigationButtons';

// Interface for roll history records
interface RollHistoryItem {
  ability: string;
  rolls: number[];
  total: number;
}

const CharacterCreationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [character, setCharacter] = useState<Character>(createDefaultCharacter());
  const [abilityScorePoints, setAbilityScorePoints] = useState(27);
  const [maxAbilityScore, setMaxAbilityScore] = useState(15);
  const [rollsHistory, setRollsHistory] = useState<RollHistoryItem[]>([]);
  const [diceResults, setDiceResults] = useState<number[][]>([]);
  const [abilitiesMethod, setAbilitiesMethod] = useState<"pointbuy" | "standard" | "roll" | "manual">("pointbuy");
  const navigate = useNavigate();
  const { themeStyles } = useTheme();
  const { addCharacter, updateCharacter: updateCharacterContext } = useCharacter() as { 
    addCharacter: (character: Character) => void, 
    updateCharacter: (character: Character) => void 
  };
  const { toast } = useToast();
  
  // Функция для обновления состояния персонажа
  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter(prevCharacter => ({ ...prevCharacter, ...updates }));
  };
  
  // Функция, которая определяет, является ли класс магическим
  const isMagicClass = useCallback(() => {
    const magicClasses = ['Волшебник', 'Жрец', 'Друид', 'Бард', 'Колдун', 'Чародей', 'Паладин', 'Следопыт'];
    return magicClasses.includes(character.class);
  }, [character.class]);
  
  // Функция для генерации случайного числа в диапазоне
  const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  // Функция для броска 4d6 и выбора 3 лучших значений
  const rollAbility = (): number => {
    const rolls = Array.from({ length: 4 }, () => getRandomNumber(1, 6));
    rolls.sort((a, b) => b - a);
    const result = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    return result;
  };
  
  // Функция для броска всех характеристик
  const rollAllAbilities = () => {
    const newDiceResults = Array.from({ length: 6 }, () => 
      Array.from({ length: 4 }, () => getRandomNumber(1, 6))
    );
    setDiceResults(newDiceResults);
    
    const newAbilities: AbilityScores = {
      STR: rollAbility(),
      DEX: rollAbility(),
      CON: rollAbility(),
      INT: rollAbility(),
      WIS: rollAbility(),
      CHA: rollAbility(),
      strength: rollAbility(),
      dexterity: rollAbility(),
      constitution: rollAbility(),
      intelligence: rollAbility(),
      wisdom: rollAbility(),
      charisma: rollAbility()
    };
    
    updateCharacter({ abilities: newAbilities });
  };
  
  // Функция для броска одной характеристики
  const rollSingleAbility = (ability: string): { rolls: number[], total: number } => {
    const rolls = Array.from({ length: 4 }, () => getRandomNumber(1, 6));
    rolls.sort((a, b) => b - a);
    const total = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    
    const newRollHistory: RollHistoryItem = {
      ability,
      rolls,
      total
    };
    
    setRollsHistory(prev => [...prev, newRollHistory]);
    
    setCharacter(prevState => ({
      ...prevState,
      abilities: {
        ...prevState.abilities!,
        [ability]: total,
        // Обновляем оба формата свойств для совместимости
        ...(ability === 'strength' ? { STR: total } : {}),
        ...(ability === 'dexterity' ? { DEX: total } : {}),
        ...(ability === 'constitution' ? { CON: total } : {}),
        ...(ability === 'intelligence' ? { INT: total } : {}),
        ...(ability === 'wisdom' ? { WIS: total } : {}),
        ...(ability === 'charisma' ? { CHA: total } : {})
      },
    }));
    
    return { rolls, total };
  };
  
  // Получить модификатор для отображения с + знаком
  const getModifier = (score: number): string => {
    const modifier = calculateAbilityModifier(score);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };
  
  // Обработчик изменения уровня
  const handleLevelChange = () => {
    // Реализация обработчика
  };
  
  // Функция для перехода к следующему шагу
  const nextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };
  
  // Функция для перехода к предыдущему шагу
  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };
  
  // Функция для сохранения персонажа
  const saveCharacter = () => {
    // Проверяем, существует ли уже персонаж с таким ID
    if (character.id) {
      // Если ID существует, обновляем существующего персонажа
      updateCharacterContext(character);
      toast({
        title: "Персонаж обновлен",
        description: `${character.name} успешно обновлен.`,
      });
    } else {
      // Если ID не существует, добавляем нового персонажа
      const newCharacter = { ...character, id: uuidv4() };
      addCharacter(newCharacter);
      toast({
        title: "Персонаж создан",
        description: `${character.name} успешно создан.`,
      });
    }
    
    navigate('/characters');
  };
  
  // Рендеринг компонентов пошаговой формы
  const renderCreationStepContent = () => {
    switch (currentStep) {
      case 1:
        // Основная информация о персонаже
        return (
          <Card>
            <CardContent className="p-6">
              <CharacterCreationContent
                currentStep={currentStep}
                character={character}
                updateCharacter={updateCharacter}
                nextStep={nextStep}
                prevStep={prevStep}
                abilitiesMethod={abilitiesMethod}
                setAbilitiesMethod={setAbilitiesMethod}
                diceResults={diceResults}
                getModifier={getModifier}
                rollAbility={rollAbility}
                rollAllAbilities={rollAllAbilities}
                rollSingleAbility={(index: number) => {
                  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                  return rollSingleAbility(abilities[index]);
                }}
                abilityScorePoints={abilityScorePoints}
                isMagicClass={isMagicClass()}
                rollsHistory={rollsHistory}
                onLevelChange={handleLevelChange}
                maxAbilityScore={maxAbilityScore}
              />
            </CardContent>
          </Card>
        );
      case 2:
        // Характеристики
        return (
          <Card>
            <CardContent className="p-6">
              <CharacterCreationContent
                currentStep={currentStep}
                character={character}
                updateCharacter={updateCharacter}
                nextStep={nextStep}
                prevStep={prevStep}
                abilitiesMethod={abilitiesMethod}
                setAbilitiesMethod={setAbilitiesMethod}
                diceResults={diceResults}
                getModifier={getModifier}
                rollAbility={rollAbility}
                rollAllAbilities={rollAllAbilities}
                rollSingleAbility={(index: number) => {
                  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                  return rollSingleAbility(abilities[index]);
                }}
                abilityScorePoints={abilityScorePoints}
                isMagicClass={isMagicClass()}
                rollsHistory={rollsHistory}
                onLevelChange={handleLevelChange}
                maxAbilityScore={maxAbilityScore}
              />
            </CardContent>
          </Card>
        );
      case 3:
        // Предыстория
        return (
          <Card>
            <CardContent className="p-6">
              <CharacterCreationContent
                currentStep={currentStep}
                character={character}
                updateCharacter={updateCharacter}
                nextStep={nextStep}
                prevStep={prevStep}
                abilitiesMethod={abilitiesMethod}
                setAbilitiesMethod={setAbilitiesMethod}
                diceResults={diceResults}
                getModifier={getModifier}
                rollAbility={rollAbility}
                rollAllAbilities={rollAllAbilities}
                rollSingleAbility={(index: number) => {
                  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                  return rollSingleAbility(abilities[index]);
                }}
                abilityScorePoints={abilityScorePoints}
                isMagicClass={isMagicClass()}
                rollsHistory={rollsHistory}
                onLevelChange={handleLevelChange}
                maxAbilityScore={maxAbilityScore}
              />
            </CardContent>
          </Card>
        );
      case 4:
        // Снаряжение
        return (
          <Card>
            <CardContent className="p-6">
              <CharacterCreationContent
                currentStep={currentStep}
                character={character}
                updateCharacter={updateCharacter}
                nextStep={nextStep}
                prevStep={prevStep}
                abilitiesMethod={abilitiesMethod}
                setAbilitiesMethod={setAbilitiesMethod}
                diceResults={diceResults}
                getModifier={getModifier}
                rollAbility={rollAbility}
                rollAllAbilities={rollAllAbilities}
                rollSingleAbility={(index: number) => {
                  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
                  return rollSingleAbility(abilities[index]);
                }}
                abilityScorePoints={abilityScorePoints}
                isMagicClass={isMagicClass()}
                rollsHistory={rollsHistory}
                onLevelChange={handleLevelChange}
                maxAbilityScore={maxAbilityScore}
              />
            </CardContent>
          </Card>
        );
      default:
        return <div>Шаг не найден</div>;
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: themeStyles?.textColor }}>Создание персонажа</h1>
      
      {renderCreationStepContent()}
      
      <NavigationButtons
        onPrev={prevStep}
        onNext={nextStep}
        disablePrev={currentStep === 1}
        disableNext={false}
        nextLabel={currentStep === 4 ? "Сохранить" : "Далее"}
      />
    </div>
  );
};

export default CharacterCreationPage;
