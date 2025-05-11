import React from 'react';
import { Character } from '@/types/character';
import AbilityScore from '@/components/character-sheet/AbilityScore';
import { getModifier } from '@/utils/abilityUtils';

// Определяем типы SavingThrow и Skill
interface SavingThrow {
  proficient: boolean;
  expertise: boolean;
  value: number;
}

interface Skill {
  proficient: boolean;
  expertise: boolean;
  value: number;
}

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  // Convert ability scores to numbers before passing them
  const abilities = {
    strength: Number(character.abilities?.STR || character.strength || 10),
    dexterity: Number(character.abilities?.DEX || character.dexterity || 10),
    constitution: Number(character.abilities?.CON || character.constitution || 10),
    intelligence: Number(character.abilities?.INT || character.intelligence || 10),
    wisdom: Number(character.abilities?.WIS || character.wisdom || 10),
    charisma: Number(character.abilities?.CHA || character.charisma || 10),
  };

  // Make sure modifiers are calculated on numbers, not strings
  const modifiers = {
    strength: Math.floor((Number(abilities.strength) - 10) / 2),
    dexterity: Math.floor((Number(abilities.dexterity) - 10) / 2),
    constitution: Math.floor((Number(abilities.constitution) - 10) / 2),
    intelligence: Math.floor((Number(abilities.intelligence) - 10) / 2),
    wisdom: Math.floor((Number(abilities.wisdom) - 10) / 2),
    charisma: Math.floor((Number(abilities.charisma) - 10) / 2),
  };

  // Получаем модификаторы характеристик
  const strMod = modifiers.strength;
  const dexMod = modifiers.dexterity;
  const conMod = modifiers.constitution;
  const intMod = modifiers.intelligence;
  const wisMod = modifiers.wisdom;
  const chaMod = modifiers.charisma;
  
  // Заготовка для спасбросков (будет реализована позже)
  const savingThrows: Record<string, SavingThrow> = {
    strength: { proficient: false, expertise: false, value: strMod },
    dexterity: { proficient: false, expertise: false, value: dexMod },
    constitution: { proficient: false, expertise: false, value: conMod },
    intelligence: { proficient: false, expertise: false, value: intMod },
    wisdom: { proficient: false, expertise: false, value: wisMod },
    charisma: { proficient: false, expertise: false, value: chaMod }
  };

  // Заготовка для навыков (будет реализована позже)
  const skills: Record<string, Skill> = {
    acrobatics: { proficient: false, expertise: false, value: dexMod },
    animalHandling: { proficient: false, expertise: false, value: wisMod },
    arcana: { proficient: false, expertise: false, value: intMod },
    // ...и так далее для всех навыков
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Характеристики</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <AbilityScore name="Сила" abbr="СИЛ" score={character.strength} modifier={strMod} 
          onUpdate={(value) => onUpdate({ strength: value })} />
        <AbilityScore name="Ловкость" abbr="ЛОВ" score={character.dexterity} modifier={dexMod} 
          onUpdate={(value) => onUpdate({ dexterity: value })} />
        <AbilityScore name="Телосложение" abbr="ТЕЛ" score={character.constitution} modifier={conMod} 
          onUpdate={(value) => onUpdate({ constitution: value })} />
        <AbilityScore name="Интеллект" abbr="ИНТ" score={character.intelligence} modifier={intMod} 
          onUpdate={(value) => onUpdate({ intelligence: value })} />
        <AbilityScore name="Мудрость" abbr="МДР" score={character.wisdom} modifier={wisMod} 
          onUpdate={(value) => onUpdate({ wisdom: value })} />
        <AbilityScore name="Харизма" abbr="ХАР" score={character.charisma} modifier={chaMod} 
          onUpdate={(value) => onUpdate({ charisma: value })} />
      </div>

      {/* Здесь будут спасброски и навыки */}
    </div>
  );
};

export default AbilitiesTab;
