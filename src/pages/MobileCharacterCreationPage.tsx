import React, { useState } from 'react';
import { Character } from '@/types/character';
import { useCharacter } from '@/contexts/CharacterContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Обновляем интерфейсы
interface CharacterComponentProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Используем общий интерфейс для всех компонентов выбора персонажа
const CharacterRaceSelection: React.FC<CharacterComponentProps> = ({ character, onUpdate }) => <div>Race Selection</div>;
const CharacterSubraceSelection: React.FC<CharacterComponentProps> = ({ character, onUpdate }) => <div>Subrace Selection</div>;
const CharacterClassSelection: React.FC<CharacterComponentProps> = ({ character, onUpdate }) => <div>Class Selection</div>;
const CharacterLevelSelection: React.FC<CharacterComponentProps> = ({ character, onUpdate }) => <div>Level Selection</div>;
const CharacterAbilityScores: React.FC<CharacterComponentProps> = ({ character, onUpdate }) => <div>Ability Scores</div>;
const CharacterHitPointsCalculator: React.FC<CharacterComponentProps> = ({ character, onUpdate }) => <div>Hit Points</div>;
const CharacterBasicInfo: React.FC<CharacterComponentProps> = ({ character, onUpdate }) => <div>Basic Info</div>;
const CharacterSpellSelection: React.FC<CharacterComponentProps> = ({ character, onUpdate }) => <div>Spell Selection</div>;

// Расширенный интерфейс для компонента с дополнительными свойствами
interface CharacterBackgroundProps extends CharacterComponentProps {
  nextStep: () => void;
  prevStep: () => void;
  backgrounds: any[];
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = () => <div>Background</div>;

const MobileCharacterCreationPage: React.FC = () => {
  const { character, updateCharacter, saveCurrentCharacter } = useCharacter();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('race');
  
  // Храним фиктивный список фонов для компонента CharacterBackground
  const backgrounds = [
    { id: 'acolyte', name: 'Служитель' },
    { id: 'criminal', name: 'Преступник' },
    { id: 'folk_hero', name: 'Народный герой' },
    { id: 'sage', name: 'Мудрец' },
    { id: 'soldier', name: 'Солдат' }
  ];
  
  if (!character) {
    return <div>Loading...</div>;
  }
  
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleUpdate = (updates: Partial<Character>) => {
    updateCharacter(updates);
  };
  
  const finalizeCharacter = async () => {
    try {
      await saveCurrentCharacter();
      // Redirect to character list or character sheet
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-background border-b">
        <h1 className="text-lg font-bold">Создание персонажа</h1>
        
        {/* Вкладки для мобильной версии */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="race">Раса</TabsTrigger>
            <TabsTrigger value="class">Класс</TabsTrigger>
            <TabsTrigger value="abilities">Характеристики</TabsTrigger>
            <TabsTrigger value="details">Детали</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Содержимое в зависимости от активной вкладки */}
        {activeTab === 'race' && (
          <>
            <CharacterRaceSelection
              character={character}
              onUpdate={handleUpdate}
            />
            <CharacterSubraceSelection
              character={character}
              onUpdate={handleUpdate}
            />
          </>
        )}
        
        {activeTab === 'class' && (
          <>
            <CharacterClassSelection
              character={character}
              onUpdate={handleUpdate}
            />
            <CharacterLevelSelection
              character={character}
              onUpdate={handleUpdate}
            />
            <CharacterAbilityScores
              character={character}
              onUpdate={handleUpdate}
            />
            <CharacterBackground
              character={character}
              onUpdate={handleUpdate}
              nextStep={nextStep}
              prevStep={prevStep}
              backgrounds={backgrounds}
            />
            <CharacterHitPointsCalculator
              character={character}
              onUpdate={handleUpdate}
            />
          </>
        )}
        
        {activeTab === 'abilities' && (
          <CharacterBasicInfo
            character={character}
            onUpdate={handleUpdate}
          />
        )}
        
        {activeTab === 'details' && (
          <CharacterSpellSelection
            character={character}
            onUpdate={handleUpdate}
          />
        )}
      </div>
      
      <div className="p-4 bg-background border-t flex justify-between">
        <Button variant="outline" onClick={() => setActiveTab(prevTab(activeTab))}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        
        <Button onClick={() => {
          const next = nextTab(activeTab);
          if (next) {
            setActiveTab(next);
          } else {
            finalizeCharacter();
          }
        }}>
          {nextTab(activeTab) ? (
            <>Далее <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            'Завершить'
          )}
        </Button>
      </div>
    </div>
  );
};

// Вспомогательные функции для навигации между вкладками
const tabOrder = ['race', 'class', 'abilities', 'details'];

function prevTab(currentTab: string): string {
  const currentIndex = tabOrder.indexOf(currentTab);
  if (currentIndex <= 0) return currentTab;
  return tabOrder[currentIndex - 1];
}

function nextTab(currentTab: string): string | null {
  const currentIndex = tabOrder.indexOf(currentTab);
  if (currentIndex >= tabOrder.length - 1) return null;
  return tabOrder[currentIndex + 1];
}

export default MobileCharacterCreationPage;
