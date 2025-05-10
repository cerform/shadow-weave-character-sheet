// Import dependencies
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { backgrounds } from '@/data/backgrounds';

// Define props interface
export interface CharacterBackgroundProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  backgrounds?: any[];
  nextStep: () => void;
  prevStep: () => void;
}

// Component implementation
const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  onUpdate,
  nextStep,
  prevStep,
  backgrounds: propBackgrounds
}) => {
  // Use provided backgrounds or default ones
  const backgroundOptions = propBackgrounds || backgrounds;
  
  // Local state for background details
  const [selectedBackground, setSelectedBackground] = useState(character.background || '');
  const [personalityTraits, setPersonalityTraits] = useState(character.personalityTraits || '');
  const [ideals, setIdeals] = useState(character.ideals || '');
  const [bonds, setBonds] = useState(character.bonds || '');
  const [flaws, setFlaws] = useState(character.flaws || '');
  
  // Effect to update character when background changes
  useEffect(() => {
    if (selectedBackground) {
      const background = backgroundOptions.find(bg => bg.name === selectedBackground);
      if (background) {
        // When applying a background, initialize a proper proficiencies object
        const updatedProficiencies = {
          languages: background.languages || [],
          tools: background.tools || [],
          skills: background.skills || []
        };
        
        onUpdate({ 
          background: selectedBackground,
          proficiencies: updatedProficiencies
        });
      }
    }
  }, [selectedBackground, backgroundOptions, onUpdate]);
  
  // Handle save and continue
  const handleSaveAndContinue = () => {
    onUpdate({
      personalityTraits,
      ideals,
      bonds,
      flaws
    });
    nextStep();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold">Выберите предысторию</h4>
        <p className="text-sm text-muted-foreground">
          Выберите предысторию для вашего персонажа.
        </p>
      </div>
      
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">
          Предыстория
        </label>
        <select
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={selectedBackground}
          onChange={(e) => setSelectedBackground(e.target.value)}
        >
          <option value="">Выберите предысторию</option>
          {backgroundOptions.map((background) => (
            <option key={background.name} value={background.name}>
              {background.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Личные качества
        </label>
        <textarea
          className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          value={personalityTraits}
          onChange={(e) => setPersonalityTraits(e.target.value)}
        />
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Идеалы
        </label>
        <textarea
          className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          value={ideals}
          onChange={(e) => setIdeals(e.target.value)}
        />
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Привязанности
        </label>
        <textarea
          className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          value={bonds}
          onChange={(e) => setBonds(e.target.value)}
        />
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Слабости
        </label>
        <textarea
          className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          value={flaws}
          onChange={(e) => setFlaws(e.target.value)}
        />
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={prevStep}
        >
          Назад
        </button>
        <button
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
          onClick={handleSaveAndContinue}
        >
          Сохранить и продолжить
        </button>
      </div>
    </div>
  );
};

export default CharacterBackground;
