
import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { formatModifier } from '@/utils/stringUtils';
import AbilityScore from '@/components/character-sheet/AbilityScore';
import { SavingThrow, Skill } from '@/types/character';
import { Button } from '@/components/ui/button';
import { AbilityScores } from '@/types/character';

const AbilitiesTab: React.FC = () => {
  const { character, updateCharacter } = useCharacter();
  
  // Make sure we have all required ability scores with default values if needed
  const abilityScores: AbilityScores = {
    STR: character.strength || 10,
    DEX: character.dexterity || 10,
    CON: character.constitution || 10,
    INT: character.intelligence || 10,
    WIS: character.wisdom || 10,
    CHA: character.charisma || 10
  };
  
  const [savingThrows, setSavingThrows] = useState<Record<string, SavingThrow>>({
    STR: { proficient: false, expertise: false, value: 0 },
    DEX: { proficient: false, expertise: false, value: 0 },
    CON: { proficient: false, expertise: false, value: 0 },
    INT: { proficient: false, expertise: false, value: 0 },
    WIS: { proficient: false, expertise: false, value: 0 },
    CHA: { proficient: false, expertise: false, value: 0 }
  });

  const [skills, setSkills] = useState<Record<string, Skill>>({
    acrobatics: { ability: 'DEX', proficient: false, expertise: false, value: 0 },
    animalHandling: { ability: 'WIS', proficient: false, expertise: false, value: 0 },
    arcana: { ability: 'INT', proficient: false, expertise: false, value: 0 },
    athletics: { ability: 'STR', proficient: false, expertise: false, value: 0 },
    deception: { ability: 'CHA', proficient: false, expertise: false, value: 0 },
    history: { ability: 'INT', proficient: false, expertise: false, value: 0 },
    insight: { ability: 'WIS', proficient: false, expertise: false, value: 0 },
    intimidation: { ability: 'CHA', proficient: false, expertise: false, value: 0 },
    investigation: { ability: 'INT', proficient: false, expertise: false, value: 0 },
    medicine: { ability: 'WIS', proficient: false, expertise: false, value: 0 },
    nature: { ability: 'INT', proficient: false, expertise: false, value: 0 },
    perception: { ability: 'WIS', proficient: false, expertise: false, value: 0 },
    performance: { ability: 'CHA', proficient: false, expertise: false, value: 0 },
    persuasion: { ability: 'CHA', proficient: false, expertise: false, value: 0 },
    religion: { ability: 'INT', proficient: false, expertise: false, value: 0 },
    sleightOfHand: { ability: 'DEX', proficient: false, expertise: false, value: 0 },
    stealth: { ability: 'DEX', proficient: false, expertise: false, value: 0 },
    survival: { ability: 'WIS', proficient: false, expertise: false, value: 0 }
  });

  // Calculate proficiency bonus based on character level
  const proficiencyBonus = Math.floor((character.level || 1 - 1) / 4) + 2;

  useEffect(() => {
    // Update saving throws values
    const newSavingThrows = { ...savingThrows };
    
    Object.keys(newSavingThrows).forEach((ability) => {
      const abilityScore = abilityScores[ability as keyof AbilityScores];
      const abilityMod = Math.floor((abilityScore - 10) / 2);
      
      newSavingThrows[ability].value = abilityMod + 
        (newSavingThrows[ability].proficient ? proficiencyBonus : 0);
    });
    
    setSavingThrows(newSavingThrows);
    
    // Update skills values
    const newSkills = { ...skills };
    
    Object.keys(newSkills).forEach((skill) => {
      const abilityMod = Math.floor((abilityScores[newSkills[skill].ability as keyof AbilityScores] - 10) / 2);
      let bonus = 0;
      
      if (newSkills[skill].expertise) {
        bonus = proficiencyBonus * 2;
      } else if (newSkills[skill].proficient) {
        bonus = proficiencyBonus;
      }
      
      newSkills[skill].value = abilityMod + bonus;
    });
    
    setSkills(newSkills);
  }, [abilityScores, character.level, proficiencyBonus]);

  // Handle toggling proficiency and expertise for saving throws
  const toggleSavingThrowProficiency = (ability: string) => {
    setSavingThrows(prev => {
      const updated = { ...prev };
      updated[ability].proficient = !updated[ability].proficient;
      
      // Update the value
      const abilityScore = abilityScores[ability as keyof AbilityScores];
      const abilityMod = Math.floor((abilityScore - 10) / 2);
      updated[ability].value = abilityMod + 
        (updated[ability].proficient ? proficiencyBonus : 0);
      
      return updated;
    });
  };

  // Handle toggling proficiency and expertise for skills
  const toggleSkillProficiency = (skillName: string) => {
    setSkills(prev => {
      const updated = { ...prev };
      
      // If expertise is true, set both to false
      if (updated[skillName].expertise) {
        updated[skillName].proficient = false;
        updated[skillName].expertise = false;
      } 
      // If proficient is true, enable expertise
      else if (updated[skillName].proficient) {
        updated[skillName].expertise = true;
      } 
      // If neither is true, enable proficiency
      else {
        updated[skillName].proficient = true;
      }
      
      // Update the value
      const abilityMod = Math.floor((abilityScores[updated[skillName].ability as keyof AbilityScores] - 10) / 2);
      let bonus = 0;
      
      if (updated[skillName].expertise) {
        bonus = proficiencyBonus * 2;
      } else if (updated[skillName].proficient) {
        bonus = proficiencyBonus;
      }
      
      updated[skillName].value = abilityMod + bonus;
      
      return updated;
    });
  };

  // Save changes to character
  const saveChanges = () => {
    updateCharacter({
      // Save saving throws and skills proficiencies
      proficiencies: {
        ...character.proficiencies,
        savingThrows: Object.entries(savingThrows)
          .filter(([_, value]) => value.proficient)
          .map(([key]) => key),
        skills: Object.entries(skills)
          .filter(([_, value]) => value.proficient || value.expertise)
          .map(([key, value]) => ({
            name: key,
            proficient: value.proficient,
            expertise: value.expertise
          }))
      }
    });
  };

  const getSkillNameTranslation = (skill: string): string => {
    const translations: Record<string, string> = {
      acrobatics: 'Акробатика',
      animalHandling: 'Уход за животными',
      arcana: 'Магия',
      athletics: 'Атлетика',
      deception: 'Обман',
      history: 'История',
      insight: 'Проницательность',
      intimidation: 'Запугивание',
      investigation: 'Расследование',
      medicine: 'Медицина',
      nature: 'Природа',
      perception: 'Восприятие',
      performance: 'Выступление',
      persuasion: 'Убеждение',
      religion: 'Религия',
      sleightOfHand: 'Ловкость рук',
      stealth: 'Скрытность',
      survival: 'Выживание'
    };
    
    return translations[skill] || skill;
  };

  const getAbilityNameTranslation = (ability: string): string => {
    const translations: Record<string, string> = {
      STR: 'Сила',
      DEX: 'Ловкость',
      CON: 'Телосложение',
      INT: 'Интеллект',
      WIS: 'Мудрость',
      CHA: 'Харизма'
    };
    
    return translations[ability] || ability;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Характеристики и навыки</h2>
      
      {/* Ability Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
        <AbilityScore 
          name="STR" 
          label="Сила" 
          value={abilityScores.STR} 
          modifier={formatModifier(Math.floor((abilityScores.STR - 10) / 2))}
        />
        <AbilityScore 
          name="DEX" 
          label="Ловкость" 
          value={abilityScores.DEX} 
          modifier={formatModifier(Math.floor((abilityScores.DEX - 10) / 2))}
        />
        <AbilityScore 
          name="CON" 
          label="Телосложение" 
          value={abilityScores.CON} 
          modifier={formatModifier(Math.floor((abilityScores.CON - 10) / 2))}
        />
        <AbilityScore 
          name="INT" 
          label="Интеллект" 
          value={abilityScores.INT} 
          modifier={formatModifier(Math.floor((abilityScores.INT - 10) / 2))}
        />
        <AbilityScore 
          name="WIS" 
          label="Мудрость" 
          value={abilityScores.WIS} 
          modifier={formatModifier(Math.floor((abilityScores.WIS - 10) / 2))}
        />
        <AbilityScore 
          name="CHA" 
          label="Харизма" 
          value={abilityScores.CHA} 
          modifier={formatModifier(Math.floor((abilityScores.CHA - 10) / 2))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Saving Throws */}
        <div className="bg-card/30 rounded-lg p-4">
          <h3 className="text-xl font-bold mb-3 border-b pb-2">Спасброски</h3>
          <div className="space-y-2">
            {Object.entries(savingThrows).map(([ability, save]) => (
              <div 
                key={ability} 
                className="flex items-center justify-between p-2 hover:bg-accent/10 rounded cursor-pointer"
                onClick={() => toggleSavingThrowProficiency(ability)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border ${save.proficient ? 'bg-primary border-primary' : 'border-gray-400'}`}></div>
                  <span className="text-sm">{getAbilityNameTranslation(ability)}</span>
                </div>
                <span className={`text-sm font-medium ${save.proficient ? 'text-primary' : ''}`}>
                  {formatModifier(save.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Skills */}
        <div className="bg-card/30 rounded-lg p-4">
          <h3 className="text-xl font-bold mb-3 border-b pb-2">Навыки</h3>
          <div className="space-y-1">
            {Object.entries(skills).map(([skillName, skill]) => (
              <div 
                key={skillName} 
                className="flex items-center justify-between p-1.5 hover:bg-accent/10 rounded cursor-pointer"
                onClick={() => toggleSkillProficiency(skillName)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border
                    ${skill.expertise 
                      ? 'bg-yellow-500 border-yellow-500' 
                      : skill.proficient 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-400'}`}
                  ></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">{skill.ability}</span>
                    <span className="text-sm">{getSkillNameTranslation(skillName)}</span>
                  </div>
                </div>
                <span className={`text-sm font-medium 
                  ${skill.expertise 
                    ? 'text-yellow-500' 
                    : skill.proficient 
                      ? 'text-primary' 
                      : ''}`}
                >
                  {formatModifier(skill.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={saveChanges} variant="default">
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};

export default AbilitiesTab;
