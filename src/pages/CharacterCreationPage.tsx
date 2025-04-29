import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CharacterRaceSelection from "@/components/character-creation/CharacterRaceSelection";
import CharacterClassSelection from "@/components/character-creation/CharacterClassSelection";
import CharacterSpellSelection from "@/components/character-creation/CharacterSpellSelection";
import CharacterBasicInfo from "@/components/character-creation/CharacterBasicInfo";
import CharacterAbilityScores from "@/components/character-creation/CharacterAbilityScores";
import CharacterBackground from "@/components/character-creation/CharacterBackground";
import CharacterReview from "@/components/character-creation/CharacterReview";
import CharacterEquipmentSelection from "@/components/character-creation/CharacterEquipmentSelection";
import CharacterLanguagesSelection from "@/components/character-creation/CharacterLanguagesSelection";
import { Character, AbilityScores, SpellSlots, Spell } from "@/contexts/CharacterContext";

const steps = [
  { id: "race", title: "Выбор расы" },
  { id: "class", title: "Выбор класса" },
  { id: "stats", title: "Распределение характеристик" },
  { id: "spells", title: "Выбор заклинаний" },
  { id: "equipment", title: "Снаряжение" },
  { id: "languages", title: "Языки и навыки" },
  { id: "info", title: "Основная информация" },
  { id: "background", title: "Предыстория" },
  { id: "review", title: "Обзор персонажа" },
];

const CharacterCreationPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [abilitiesMethod, setAbilitiesMethod] = useState<"pointbuy" | "standard" | "roll">("standard");
  const [diceResults, setDiceResults] = useState<number[][]>([]);

  // Updated character state with all required properties from Character interface
  const [character, setCharacter] = useState({
    race: "",
    subrace: "",
    class: "",
    subclass: "",
    spells: [] as string[],
    equipment: [] as string[],
    languages: [] as string[],
    proficiencies: [] as string[],
    name: "",
    gender: "",
    alignment: "",
    stats: {
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    },
    background: "",
    // Adding the missing properties required by Character interface
    className: "",
    level: 1,
    abilities: {
      STR: 8,
      DEX: 8,
      CON: 8, 
      INT: 8,
      WIS: 8,
      CHA: 8
    } as AbilityScores,
    spellsKnown: [] as Spell[],
    spellSlots: {} as SpellSlots
  });

  useEffect(() => {
    // Если выбран способ распределения характеристик через броски, генерируем результаты
    if (abilitiesMethod === "roll" && diceResults.length === 0) {
      rollAllAbilities();
    }
  }, [abilitiesMethod]);

  // When stats change, update the abilities property to match
  useEffect(() => {
    if (character.stats) {
      setCharacter(prev => ({
        ...prev,
        abilities: {
          STR: prev.stats.strength,
          DEX: prev.stats.dexterity,
          CON: prev.stats.constitution,
          INT: prev.stats.intelligence,
          WIS: prev.stats.wisdom,
          CHA: prev.stats.charisma
        },
        // Set className based on class and subclass
        className: `${prev.class}${prev.subclass ? ` (${prev.subclass})` : ''}`,
        // Convert raw spell names to Spell objects
        spellsKnown: prev.spells.map((name, index) => ({
          id: String(index),
          name: name,
          level: 0
        })),
        // Create basic spell slots based on class
        spellSlots: isMagicClass(prev.class) ? { 1: { max: 2, used: 0 } } : {}
      }));
    }
  }, [character.stats, character.class, character.subclass, character.spells]);

  const rollAllAbilities = () => {
    // Генерируем 6 наборов бросков (по 4d6 для каждой характеристики)
    const rolls = [];
    for (let i = 0; i < 6; i++) {
      const diceRolls = [];
      for (let j = 0; j < 4; j++) {
        diceRolls.push(Math.floor(Math.random() * 6) + 1);
      }
      rolls.push(diceRolls);
    }
    setDiceResults(rolls);
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const nextStep = () => {
    // При переходе с выбора класса сразу к характеристикам, если класс не магический
    if (currentStep === 1 && !isMagicClass(character.class)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    // При переходе назад от характеристик к классу, если класс не магический
    if (currentStep === 3 && !isMagicClass(character.class)) {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const isMagicClass = (className: string) => {
    const magicClasses = ['Волшебник', 'Чародей', 'Чернокнижник', 'Бард', 'Жрец', 'Друид', 'Паладин', 'Следопыт'];
    return magicClasses.includes(className);
  };

  const updateCharacter = (updates: any) => {
    setCharacter((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const goToHomePage = () => {
    navigate('/');
  };

  return (
    <div className={`p-6 min-h-screen bg-background text-foreground theme-${theme}`}>
      <Button 
        onClick={goToHomePage} 
        variant="outline" 
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        На главную
      </Button>

      <h1 className="text-3xl font-bold mb-8 text-center">Создание персонажа</h1>

      {/* Прогресс шагов */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {steps.map((step, index) => {
          // Пропускаем шаг заклинаний для не-магических классов
          if (step.id === "spells" && character.class && !isMagicClass(character.class)) {
            return null;
          }
          
          return (
            <div
              key={index}
              className={`p-2 rounded-md font-semibold text-sm ${
                currentStep === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.title}
            </div>
          );
        })}
      </div>

      {/* Контент шага */}
      <div className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-lg">
        {currentStep === 0 && (
          <CharacterRaceSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 1 && (
          <CharacterClassSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 2 && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Выберите способ распределения характеристик</h3>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Button
                  onClick={() => setAbilitiesMethod("standard")}
                  variant={abilitiesMethod === "standard" ? "default" : "outline"}
                >
                  Стандартный набор
                </Button>
                <Button
                  onClick={() => setAbilitiesMethod("pointbuy")}
                  variant={abilitiesMethod === "pointbuy" ? "default" : "outline"}
                >
                  Покупка очков
                </Button>
                <Button
                  onClick={() => {
                    setAbilitiesMethod("roll");
                    rollAllAbilities();
                  }}
                  variant={abilitiesMethod === "roll" ? "default" : "outline"}
                >
                  Бросок кубиков
                </Button>
              </div>
              
              {abilitiesMethod === "roll" && (
                <div className="bg-muted/30 p-4 rounded-md mb-4">
                  <h4 className="font-semibold mb-2">Результаты бросков (4d6, отбрасывая наименьшее):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {diceResults.map((roll, idx) => {
                      // Сортировка и удаление наименьшего значения
                      const sorted = [...roll].sort((a, b) => b - a);
                      const total = sorted.slice(0, 3).reduce((a, b) => a + b, 0);
                      
                      return (
                        <div key={idx} className="p-2 bg-background rounded-md text-center">
                          <div className="font-semibold">{total}</div>
                          <div className="text-sm text-muted-foreground">
                            {roll.join(', ')} → {sorted.slice(0, 3).join(' + ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button onClick={rollAllAbilities} className="mt-2">Перебросить все</Button>
                </div>
              )}
            </div>
            
            <CharacterAbilityScores
              character={character}
              updateCharacter={updateCharacter}
              nextStep={nextStep}
              prevStep={prevStep}
              abilitiesMethod={abilitiesMethod}
              diceResults={diceResults}
              getModifier={getModifier}
            />
          </div>
        )}

        {currentStep === 3 && isMagicClass(character.class) && (
          <CharacterSpellSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === (isMagicClass(character.class) ? 4 : 3) && (
          <CharacterEquipmentSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === (isMagicClass(character.class) ? 5 : 4) && (
          <CharacterLanguagesSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === (isMagicClass(character.class) ? 6 : 5) && (
          <CharacterBasicInfo
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === (isMagicClass(character.class) ? 7 : 6) && (
          <CharacterBackground
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === (isMagicClass(character.class) ? 8 : 7) && (
          <CharacterReview
            character={character}
            prevStep={prevStep}
          />
        )}
      </div>
    </div>
  );
};

export default CharacterCreationPage;
