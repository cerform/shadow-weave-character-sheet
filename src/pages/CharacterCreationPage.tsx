
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { useTheme } from '@/hooks/use-theme';
import { CharacterRaceSelection } from '@/components/character-creation/CharacterRaceSelection';
import { CharacterClassSelection } from '@/components/character-creation/CharacterClassSelection';
import { CharacterBasicInfo } from '@/components/character-creation/CharacterBasicInfo';
import { CharacterAbilityScores } from '@/components/character-creation/CharacterAbilityScores';
import { CharacterBackground } from '@/components/character-creation/CharacterBackground';
import { CharacterInventory } from '@/components/character-creation/CharacterInventory';
import { CharacterSpellSelection } from '@/components/character-creation/CharacterSpellSelection';
import { CharacterReview } from '@/components/character-creation/CharacterReview';

const steps = [
  { id: 'race', title: 'Раса' },
  { id: 'class', title: 'Класс' },
  { id: 'basic', title: 'Основная информация' },
  { id: 'abilities', title: 'Характеристики' },
  { id: 'spells', title: 'Заклинания' },
  { id: 'inventory', title: 'Инвентарь' },
  { id: 'background', title: 'Предыстория' },
  { id: 'review', title: 'Обзор' },
];

const CharacterCreationPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [character, setCharacter] = useState({
    name: '',
    race: '',
    subrace: '',
    class: '',
    subclass: '',
    level: 1,
    background: '',
    alignment: '',
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    appearance: '',
    backstory: '',
    spells: [],
    inventory: []
  });

  useEffect(() => {
    // This ensures the theme actually gets applied
    if (theme) {
      document.body.className = theme;
    }
  }, [theme]);

  const handleNextStep = () => {
    // Validate current step before proceeding
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentStepId = steps[currentStep].id;
    
    switch (currentStepId) {
      case 'race':
        if (!character.race) {
          toast.error("Выберите расу персонажа");
          return false;
        }
        return true;
      case 'class':
        if (!character.class) {
          toast.error("Выберите класс персонажа");
          return false;
        }
        return true;
      case 'basic':
        if (!character.name) {
          toast.error("Введите имя персонажа");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleUpdateCharacter = (updates: Partial<typeof character>) => {
    setCharacter({ ...character, ...updates });
  };

  const handleFinishCreation = () => {
    // Save the character data to local storage
    const savedCharacters = JSON.parse(localStorage.getItem('dnd-characters') || '[]');
    const updatedCharacters = [...savedCharacters, { ...character, id: Date.now(), createdAt: new Date().toISOString() }];
    localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));
    
    // Navigate to the character sheet
    toast.success('Персонаж успешно создан!');
    navigate('/sheet', { state: { character } });
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'race':
        return <CharacterRaceSelection 
          character={character} 
          onUpdateCharacter={handleUpdateCharacter} 
        />;
      case 'class':
        return <CharacterClassSelection 
          character={character} 
          onUpdateCharacter={handleUpdateCharacter} 
        />;
      case 'basic':
        return <CharacterBasicInfo 
          character={character} 
          onUpdateCharacter={handleUpdateCharacter} 
        />;
      case 'abilities':
        return <CharacterAbilityScores 
          character={character} 
          onUpdateCharacter={handleUpdateCharacter} 
        />;
      case 'spells':
        return <CharacterSpellSelection 
          character={character} 
          onUpdateCharacter={handleUpdateCharacter} 
        />;
      case 'inventory':
        return <CharacterInventory 
          character={character} 
          onUpdateCharacter={handleUpdateCharacter} 
        />;
      case 'background':
        return <CharacterBackground 
          character={character} 
          onUpdateCharacter={handleUpdateCharacter} 
        />;
      case 'review':
        return <CharacterReview 
          character={character} 
          onFinish={handleFinishCreation} 
        />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 ${theme}`}>
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Создание персонажа D&D 5e</h1>
          <p className="text-muted-foreground">Шаг {currentStep + 1} из {steps.length}: {steps[currentStep].title}</p>
        </header>

        <div className="mb-6">
          <div className="w-full bg-primary/10 h-2 rounded-full">
            <div 
              className="h-2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground overflow-x-auto">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`px-1 ${index === currentStep ? 'text-primary font-medium' : ''}`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePreviousStep} 
            disabled={currentStep === 0}
          >
            Назад
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNextStep}>Далее</Button>
          ) : (
            <Button onClick={handleFinishCreation}>Создать персонажа</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationPage;
