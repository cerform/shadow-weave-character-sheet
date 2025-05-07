import React, { useState } from 'react';
import { Character } from '@/types/character';
import { getAbilityModifier, getAbilityModifierString, abilityNames, abilityFullNames } from '@/utils/abilityUtils';

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const [strength, setStrength] = useState(character.abilities?.strength || 10);
  const [dexterity, setDexterity] = useState(character.abilities?.dexterity || 10);
  const [constitution, setConstitution] = useState(character.abilities?.constitution || 10);
  const [intelligence, setIntelligence] = useState(character.abilities?.intelligence || 10);
  const [wisdom, setWisdom] = useState(character.abilities?.wisdom || 10);
  const [charisma, setCharisma] = useState(character.abilities?.charisma || 10);

  const handleAbilityChange = (ability: string, value: number) => {
    const updatedAbilities = {
      ...character.abilities,
      [ability]: value,
      strength: character.abilities?.strength,
      dexterity: character.abilities?.dexterity,
      constitution: character.abilities?.constitution,
      intelligence: character.abilities?.intelligence,
      wisdom: character.abilities?.wisdom,
      charisma: character.abilities?.charisma
    };

    switch (ability) {
      case 'strength':
        setStrength(value);
        updatedAbilities.STR = value;
        break;
      case 'dexterity':
        setDexterity(value);
        updatedAbilities.DEX = value;
        break;
      case 'constitution':
        setConstitution(value);
        updatedAbilities.CON = value;
        break;
      case 'intelligence':
        setIntelligence(value);
        updatedAbilities.INT = value;
        break;
      case 'wisdom':
        setWisdom(value);
        updatedAbilities.WIS = value;
        break;
      case 'charisma':
        setCharisma(value);
        updatedAbilities.CHA = value;
        break;
    }

    onUpdate({ abilities: updatedAbilities });
  };

  const handleToggleSavingThrow = (ability: string) => {
    const proficiencies = character.savingThrowProficiencies || {};
    const updatedProficiencies: Record<string, boolean> = { ...proficiencies };
    
    // Toggle the proficiency
    updatedProficiencies[ability] = !updatedProficiencies[ability];
    
    onUpdate({ 
      savingThrowProficiencies: updatedProficiencies 
    });
  };

  const handleToggleSkillProficiency = (skillName: string) => {
    const currentProficiencies = character.skillProficiencies || [];
    let updatedProficiencies: string[];
    
    if (currentProficiencies.includes(skillName)) {
      updatedProficiencies = currentProficiencies.filter(p => p !== skillName);
    } else {
      updatedProficiencies = [...currentProficiencies, skillName];
    }
    
    onUpdate({ 
      skillProficiencies: updatedProficiencies 
    });
  };

  const handleToggleExpertise = (skillName: string) => {
    const currentExpertise = character.expertise || [];
    let updatedExpertise: string[];
    
    if (currentExpertise.includes(skillName)) {
      updatedExpertise = currentExpertise.filter(e => e !== skillName);
    } else {
      updatedExpertise = [...currentExpertise, skillName];
    }
    
    onUpdate({ 
      expertise: updatedExpertise 
    });
  };

  const handleSkillBonusChange = (skillName: string, value: number) => {
    const skillBonuses = character.skillBonuses || {};
    const updatedBonuses = { ...skillBonuses };
    
    updatedBonuses[skillName] = value;
    
    onUpdate({
      skillBonuses: updatedBonuses
    });
  };

  const renderAbility = (ability: string) => {
    const abilityValue = character.abilities?.[ability] || 10;
    const modifier = getAbilityModifier(abilityValue);
    const modifierString = getAbilityModifierString(abilityValue);
    const isProficient = isSavingThrowProficient(ability.toLowerCase());

    return (
      <div key={ability} className="mb-4">
        <h4 className="font-semibold">{abilityFullNames[ability]}</h4>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={abilityValue}
            onChange={(e) => handleAbilityChange(ability, Number(e.target.value))}
            className="w-20 border rounded px-2 py-1"
          />
          <span className="text-gray-500">Модификатор: {modifierString}</span>
          <button
            onClick={() => handleToggleSavingThrow(ability.toLowerCase())}
            className={`px-3 py-1 rounded ${isProficient ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500'}`}
          >
            {isProficient ? 'Спас-бросок: владеет' : 'Спас-бросок: не владеет'}
          </button>
        </div>
      </div>
    );
  };

  const renderSkill = (skillName: string) => {
    const isProficient = isSkillProficient(skillName);
    const hasExpertise = hasExpertise(skillName);
    const skillBonus = character.skillBonuses?.[skillName] || 0;

    return (
      <div key={skillName} className="mb-2">
        <div className="flex items-center space-x-2">
          <label className="w-32">{skillName}</label>
          <button
            onClick={() => handleToggleSkillProficiency(skillName)}
            className={`px-2 py-1 rounded ${isProficient ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'}`}
          >
            {isProficient ? 'Владеет' : 'Не владеет'}
          </button>
          <button
            onClick={() => handleToggleExpertise(skillName)}
            className={`px-2 py-1 rounded ${hasExpertise ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}
          >
            {hasExpertise ? 'Эксперт' : 'Не эксперт'}
          </button>
          <input
            type="number"
            value={skillBonus}
            onChange={(e) => handleSkillBonusChange(skillName, Number(e.target.value))}
            className="w-16 border rounded px-2 py-1"
          />
        </div>
      </div>
    );
  };

  const isSavingThrowProficient = (ability: string): boolean => {
    const proficiencies = character.savingThrowProficiencies || {};
    return !!proficiencies[ability];
  };
  
  const isSkillProficient = (skillName: string): boolean => {
    const proficiencies = character.skillProficiencies || [];
    return proficiencies.includes(skillName);
  };
  
  const hasExpertise = (skillName: string): boolean => {
    const expertise = character.expertise || [];
    return expertise.includes(skillName);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Характеристики</h3>
        <div className="grid grid-cols-2 gap-4">
          {abilityNames.map(ability => renderAbility(ability))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Навыки</h3>
        <div>
          {/* Replace with actual skill names from your data */}
          {['Акробатика', 'Атлетика', 'Внимательность', 'Выживание', 'Выступление', 'Запугивание', 'История', 'Колдовство', 'Ловкость рук', 'Медицина', 'Обман', 'Природа', 'Проницательность', 'Религия', 'Скрытность', 'Убеждение', 'Угроза', 'Анализ'].map(skill => renderSkill(skill))}
        </div>
      </div>
    </div>
  );
};

export default AbilitiesTab;
