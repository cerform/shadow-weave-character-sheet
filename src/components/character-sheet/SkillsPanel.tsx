
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { getAbilityModifier } from '@/utils/characterUtils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SkillsPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ character, onUpdate }) => {
  const [skills, setSkills] = useState(character.skills || {});
  
  useEffect(() => {
    setSkills(character.skills || {});
  }, [character.skills]);
  
  const getAbilityMod = (ability: string): number => {
    // Make sure to pass character as both the first and second parameters
    return getAbilityModifier(character, ability);
  };
  
  const calculateSkillValue = (skillName: string, proficient: boolean, expertise: boolean): number => {
    let baseValue = getAbilityMod(skillName.slice(0, 3).toUpperCase());
    if (proficient) {
      baseValue += character.proficiencyBonus || 2;
    }
    if (expertise) {
      baseValue += (character.proficiencyBonus || 2) * 2;
    }
    return baseValue;
  };
  
  // Normalize skills structure to ensure all skills have the required properties
  const handleSkillChange = (skillName: string, proficient: boolean, expertise: boolean = false) => {
    const updatedSkills: Record<string, { proficient: boolean; expertise: boolean; value: number }> = {};
    
    // Copy existing skills and ensure they have all required properties
    for (const [key, skill] of Object.entries(character.skills || {})) {
      updatedSkills[key] = {
        proficient: skill.proficient || false,
        expertise: 'expertise' in skill ? skill.expertise : false,
        value: skill.value || 0
      };
    }
    
    // Update the specific skill
    updatedSkills[skillName] = {
      proficient,
      expertise,
      value: calculateSkillValue(skillName, proficient, expertise)
    };
    
    onUpdate({ skills: updatedSkills });
  };

  const skillList = [
    { name: 'acrobatics', label: 'Акробатика (DEX)', ability: 'DEX' },
    { name: 'animalHandling', label: 'Уход за животными (WIS)', ability: 'WIS' },
    { name: 'arcana', label: 'Магия (INT)', ability: 'INT' },
    { name: 'athletics', label: 'Атлетика (STR)', ability: 'STR' },
    { name: 'deception', label: 'Обман (CHA)', ability: 'CHA' },
    { name: 'history', label: 'История (INT)', ability: 'INT' },
    { name: 'insight', label: 'Проницательность (WIS)', ability: 'WIS' },
    { name: 'intimidation', label: 'Запугивание (CHA)', ability: 'CHA' },
    { name: 'investigation', label: 'Анализ (INT)', ability: 'INT' },
    { name: 'medicine', label: 'Медицина (WIS)', ability: 'WIS' },
    { name: 'nature', label: 'Природа (INT)', ability: 'INT' },
    { name: 'perception', label: 'Внимательность (WIS)', ability: 'WIS' },
    { name: 'performance', label: 'Выступление (CHA)', ability: 'CHA' },
    { name: 'persuasion', label: 'Убеждение (CHA)', ability: 'CHA' },
    { name: 'religion', label: 'Религия (INT)', ability: 'INT' },
    { name: 'sleightOfHand', label: 'Ловкость рук (DEX)', ability: 'DEX' },
    { name: 'stealth', label: 'Скрытность (DEX)', ability: 'DEX' },
    { name: 'survival', label: 'Выживание (WIS)', ability: 'WIS' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Навыки</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {skillList.map((skill) => (
          <div key={skill.name} className="flex items-center justify-between">
            <span>{skill.label}</span>
            <div className="flex items-center space-x-2">
              <button
                className={`px-2 py-1 rounded ${skills[skill.name]?.proficient ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleSkillChange(skill.name, !skills[skill.name]?.proficient, skills[skill.name]?.expertise || false)}
              >
                Владение
              </button>
              <button
                className={`px-2 py-1 rounded ${skills[skill.name]?.expertise ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleSkillChange(skill.name, skills[skill.name]?.proficient || false, !skills[skill.name]?.expertise)}
                disabled={!skills[skill.name]?.proficient}
              >
                Экспертность
              </button>
              <span>
                {calculateSkillValue(skill.name, skills[skill.name]?.proficient || false, skills[skill.name]?.expertise || false)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
