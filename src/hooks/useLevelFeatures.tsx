import { useState, useEffect } from 'react';
import { LevelFeature, UseLevelFeaturesResult } from '@/types/characterCreation';
import { Character } from '@/types/character';

const initialAvailableLanguages = [
  'Common', 'Elvish', 'Dwarvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 
  'Orc', 'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 'Infernal', 'Primordial', 
  'Sylvan', 'Undercommon'
];

const initialAvailableSkills = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 
  'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'
];

const useLevelFeatures = (character: Partial<Character>): UseLevelFeaturesResult => {
  const [selectedFeatures, setSelectedFeatures] = useState<{ [key: string]: string }>({});
  
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(initialAvailableLanguages);
  const [availableSkills, setAvailableSkills] = useState<string[]>(initialAvailableSkills);
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [availableWeaponTypes, setAvailableWeaponTypes] = useState<string[]>([]);
  const [availableArmorTypes, setAvailableArmorTypes] = useState<string[]>([]);
  
  // Define the available features based on class, race, and level
  const availableFeatures: LevelFeature[] = [];
  
  // Add ability score increase feature at appropriate levels
  if (character.level === 4 || character.level === 8 || character.level === 12 || character.level === 16 || character.level === 19) {
    availableFeatures.push({
      id: 'ability-increase',
      title: 'Ability Score Increase',
      level: character.level || 1,
      description: 'You can increase one ability score of your choice by 2, or increase two ability scores of your choice by 1 each.',
      type: 'ability_increase'
    });
  }
  
  // Add class-specific features
  if (character.class && character.level) {
    if (character.class.toLowerCase() === 'fighter' && character.level >= 5) {
      availableFeatures.push({
        id: 'extra-attack',
        title: 'Extra Attack',
        level: 5,
        description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
        type: 'extra_attack'
      });
    }
    
    if (character.class.toLowerCase() === 'wizard' && character.level >= 2) {
      availableFeatures.push({
        id: 'arcane-tradition',
        title: 'Arcane Tradition',
        level: 2,
        description: 'Choose an arcane tradition, which shapes your practice of magic.',
        type: 'subclass'
      });
    }
    
    if (character.class.toLowerCase() === 'rogue' && character.level >= 3) {
      availableFeatures.push({
        id: 'roguish-archetype',
        title: 'Roguish Archetype',
        level: 3,
        description: 'Choose a roguish archetype that you emulate in the exercise of your rogue abilities.',
        type: 'subclass'
      });
    }
  }
  
  // Helper function to handle feature selection
  const selectFeature = (featureType: string, value: string) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [featureType]: value
    }));
  };
  
  // Get hit dice info based on character class
  const getHitDiceInfo = (className: string): { dieType: string; value: string } => {
    const classLower = className.toLowerCase();
    let dieType = 'd8'; // default
    
    if (classLower === 'barbarian') {
      dieType = 'd12';
    } else if (['fighter', 'paladin', 'ranger'].includes(classLower)) {
      dieType = 'd10';
    } else if (['sorcerer', 'wizard'].includes(classLower)) {
      dieType = 'd6';
    }
    
    return {
      dieType,
      value: `${character.level || 1}${dieType}`
    };
  };
  
  // Get the level at which a class gets their subclass
  const getSubclassLevel = (className: string): number => {
    const classLower = className.toLowerCase();
    
    if (['sorcerer', 'warlock', 'wizard'].includes(classLower)) {
      return 1;
    } else if (['druid', 'fighter', 'wizard'].includes(classLower)) {
      return 2;
    } else {
      return 3; // Most classes get subclass at level 3
    }
  };
  
  // Handler for language selection
  const handleLanguageSelection = (language: string, selected: boolean) => {
    // Implementation of language selection
    console.log(`Language ${language} is ${selected ? 'selected' : 'deselected'}`);
  };
  
  // Handler for skill selection
  const handleSkillSelection = (skill: string, selected: boolean) => {
    // Implementation of skill selection
    console.log(`Skill ${skill} is ${selected ? 'selected' : 'deselected'}`);
  };
  
  // Handler for tool selection
  const handleToolSelection = (tool: string, selected: boolean) => {
    // Implementation of tool selection
    console.log(`Tool ${tool} is ${selected ? 'selected' : 'deselected'}`);
  };
  
  // Handler for weapon type selection
  const handleWeaponTypeSelection = (weaponType: string, selected: boolean) => {
    // Implementation of weapon type selection
    console.log(`Weapon type ${weaponType} is ${selected ? 'selected' : 'deselected'}`);
  };
  
  // Handler for armor type selection
  const handleArmorTypeSelection = (armorType: string, selected: boolean) => {
    // Implementation of armor type selection
    console.log(`Armor type ${armorType} is ${selected ? 'selected' : 'deselected'}`);
  };
  
  return {
    availableFeatures,
    selectedFeatures,
    selectFeature,
    getHitDiceInfo,
    getSubclassLevel,
    availableLanguages,
    availableSkills,
    availableTools,
    availableWeaponTypes,
    availableArmorTypes,
    handleLanguageSelection,
    handleSkillSelection,
    handleToolSelection,
    handleWeaponTypeSelection,
    handleArmorTypeSelection
  };
};

export default useLevelFeatures;
