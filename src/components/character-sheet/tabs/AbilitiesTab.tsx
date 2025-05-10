
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { getModifierString } from '@/utils/characterUtils';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Define AbilitiesTabProps interface
interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Fix the issue where function expected 2 arguments
const calculateSkillModifier = (character: Character, skillKey: string): number => {
  // Get base ability for skill
  const abilityMap: Record<string, keyof typeof character.abilities> = {
    acrobatics: 'DEX',
    animalHandling: 'WIS',
    arcana: 'INT',
    athletics: 'STR',
    deception: 'CHA',
    history: 'INT',
    insight: 'WIS',
    intimidation: 'CHA',
    investigation: 'INT',
    medicine: 'WIS',
    nature: 'INT',
    perception: 'WIS',
    performance: 'CHA',
    persuasion: 'CHA',
    religion: 'INT',
    sleightOfHand: 'DEX',
    stealth: 'DEX',
    survival: 'WIS'
  };

  // Get the ability score
  const ability = abilityMap[skillKey];
  if (!ability) return 0;
  
  // Get ability modifier
  const abilityScore = character.abilities[ability] || 10;
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  
  // Get proficiency bonus
  const profBonus = character.proficiencyBonus || 2;
  
  // Check if character is proficient in skill
  const isProficient = character.skills && 
    character.skills[skillKey] && 
    character.skills[skillKey].proficient;
  
  // Check if character has expertise
  const hasExpertise = character.skills && 
    character.skills[skillKey] && 
    character.skills[skillKey].expertise;
    
  // Calculate skill bonus
  let skillBonus = abilityModifier;
  if (isProficient) skillBonus += profBonus;
  if (hasExpertise) skillBonus += profBonus;
  
  // Add any additional bonuses from character.skillBonuses
  if (character.skillBonuses && character.skillBonuses[skillKey]) {
    skillBonus += character.skillBonuses[skillKey];
  }
  
  return skillBonus;
};

// Define the AbilitiesTab component
export const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [activeSection, setActiveSection] = useState<'abilities' | 'savingThrows' | 'skills'>('abilities');

  // Ability scores labels
  const abilityLabels = {
    STR: 'Сила',
    DEX: 'Ловкость',
    CON: 'Телосложение',
    INT: 'Интеллект',
    WIS: 'Мудрость',
    CHA: 'Харизма'
  };

  // Skill labels and their associated abilities
  const skills = {
    acrobatics: { name: 'Акробатика', ability: 'DEX' },
    animalHandling: { name: 'Обращение с животными', ability: 'WIS' },
    arcana: { name: 'Магия', ability: 'INT' },
    athletics: { name: 'Атлетика', ability: 'STR' },
    deception: { name: 'Обман', ability: 'CHA' },
    history: { name: 'История', ability: 'INT' },
    insight: { name: 'Проницательность', ability: 'WIS' },
    intimidation: { name: 'Запугивание', ability: 'CHA' },
    investigation: { name: 'Расследование', ability: 'INT' },
    medicine: { name: 'Медицина', ability: 'WIS' },
    nature: { name: 'Природа', ability: 'INT' },
    perception: { name: 'Восприятие', ability: 'WIS' },
    performance: { name: 'Выступление', ability: 'CHA' },
    persuasion: { name: 'Убеждение', ability: 'CHA' },
    religion: { name: 'Религия', ability: 'INT' },
    sleightOfHand: { name: 'Ловкость рук', ability: 'DEX' },
    stealth: { name: 'Скрытность', ability: 'DEX' },
    survival: { name: 'Выживание', ability: 'WIS' }
  };

  // Toggle proficiency for a skill
  const toggleSkillProficiency = (skillKey: string) => {
    const currentSkills = character.skills || {};
    const currentSkill = currentSkills[skillKey] || { proficient: false, expertise: false, value: 0 };
    
    const updatedSkills = {
      ...currentSkills,
      [skillKey]: {
        ...currentSkill,
        proficient: !currentSkill.proficient,
        // Remove expertise if removing proficiency
        expertise: !currentSkill.proficient ? false : currentSkill.expertise
      }
    };
    
    onUpdate({ skills: updatedSkills });
  };

  // Toggle expertise for a skill
  const toggleSkillExpertise = (skillKey: string) => {
    const currentSkills = character.skills || {};
    const currentSkill = currentSkills[skillKey] || { proficient: false, expertise: false, value: 0 };
    
    // Can only have expertise if already proficient
    if (!currentSkill.proficient) return;
    
    const updatedSkills = {
      ...currentSkills,
      [skillKey]: {
        ...currentSkill,
        expertise: !currentSkill.expertise
      }
    };
    
    onUpdate({ skills: updatedSkills });
  };

  // Toggle saving throw proficiency
  const toggleSavingThrowProficiency = (ability: keyof typeof character.savingThrows) => {
    // Get current saving throw value
    const currentValue = character.savingThrows[ability];
    
    // Calculate the ability modifier
    const abilityScore = character.abilities[ability] || 10;
    const abilityModifier = Math.floor((abilityScore - 10) / 2);
    
    // Toggle proficiency
    // If savingThrowProficiencies exists, use it to determine proficiency
    const isProficient = character.savingThrowProficiencies && 
      character.savingThrowProficiencies.includes(ability as string);
    
    const updatedProficiencies = character.savingThrowProficiencies 
      ? (isProficient 
          ? character.savingThrowProficiencies.filter(a => a !== ability)
          : [...character.savingThrowProficiencies, ability as string]) 
      : [ability as string];
    
    // Update saving throw value based on proficiency
    const updatedSavingThrows = {
      ...character.savingThrows,
      [ability]: abilityModifier + (isProficient ? 0 : character.proficiencyBonus)
    };
    
    onUpdate({ 
      savingThrows: updatedSavingThrows,
      savingThrowProficiencies: updatedProficiencies
    });
  };
  
  // Update all skills based on ability scores
  const updateAllSkillValues = () => {
    const updatedSkills = { ...character.skills } || {};
    
    Object.keys(skills).forEach(skillKey => {
      const skill = skills[skillKey as keyof typeof skills];
      const ability = skill.ability as keyof typeof character.abilities;
      
      // Get ability modifier
      const abilityScore = character.abilities[ability] || 10;
      const abilityModifier = Math.floor((abilityScore - 10) / 2);
      
      // Get proficiency status
      const currentSkill = updatedSkills[skillKey] || { proficient: false, expertise: false, value: 0 };
      const isProficient = currentSkill.proficient;
      const hasExpertise = currentSkill.expertise;
      
      // Calculate skill value
      let skillValue = abilityModifier;
      if (isProficient) skillValue += character.proficiencyBonus;
      if (hasExpertise) skillValue += character.proficiencyBonus;
      
      // Add any bonuses from skillBonuses
      if (character.skillBonuses && character.skillBonuses[skillKey]) {
        skillValue += character.skillBonuses[skillKey];
      }
      
      // Update skill value
      updatedSkills[skillKey] = {
        ...currentSkill,
        value: skillValue
      };
    });
    
    onUpdate({ skills: updatedSkills });
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button 
          variant={activeSection === 'abilities' ? 'default' : 'outline'}
          onClick={() => setActiveSection('abilities')}
          style={{ color: activeSection === 'abilities' ? currentTheme.buttonText : currentTheme.textColor }}
        >
          Характеристики
        </Button>
        <Button 
          variant={activeSection === 'savingThrows' ? 'default' : 'outline'}
          onClick={() => setActiveSection('savingThrows')}
          style={{ color: activeSection === 'savingThrows' ? currentTheme.buttonText : currentTheme.textColor }}
        >
          Спасброски
        </Button>
        <Button 
          variant={activeSection === 'skills' ? 'default' : 'outline'}
          onClick={() => setActiveSection('skills')}
          style={{ color: activeSection === 'skills' ? currentTheme.buttonText : currentTheme.textColor }}
        >
          Навыки
        </Button>
      </div>
      
      {activeSection === 'abilities' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ color: currentTheme.textColor }}>Характеристики</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(abilityLabels).map(([ability, label]) => {
              const abilityKey = ability as keyof typeof character.abilities;
              const score = character.abilities[abilityKey] || 10;
              const modifier = Math.floor((score - 10) / 2);
              
              return (
                <div key={ability} className="flex flex-col items-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold" style={{ color: currentTheme.textColor }}>{label}</div>
                  <div className="text-3xl font-bold my-2" style={{ color: currentTheme.accent }}>{score}</div>
                  <div className="text-md" style={{ color: currentTheme.textColor }}>
                    {getModifierString(modifier)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      
      {activeSection === 'savingThrows' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ color: currentTheme.textColor }}>Спасброски</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(abilityLabels).map(([ability, label]) => {
                const abilityKey = ability as keyof typeof character.savingThrows;
                const isProficient = character.savingThrowProficiencies && 
                  character.savingThrowProficiencies.includes(ability);
                
                // Get the modifier directly from abilities
                const abilityScore = character.abilities[abilityKey as keyof typeof character.abilities] || 10;
                const baseModifier = Math.floor((abilityScore - 10) / 2);
                
                // Add proficiency bonus if proficient
                const totalModifier = isProficient 
                  ? baseModifier + (character.proficiencyBonus || 2)
                  : baseModifier;
                
                return (
                  <div key={ability} className="flex items-center space-x-3 py-1">
                    <Checkbox 
                      id={`save-${ability}`} 
                      checked={!!isProficient}
                      onCheckedChange={() => toggleSavingThrowProficiency(abilityKey)}
                    />
                    <div className="inline-block w-6 text-right font-medium" style={{ color: currentTheme.textColor }}>
                      {getModifierString(totalModifier)}
                    </div>
                    <label 
                      htmlFor={`save-${ability}`}
                      className="text-sm font-medium cursor-pointer flex-1"
                      style={{ color: currentTheme.textColor }}
                    >
                      {label}
                    </label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeSection === 'skills' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span style={{ color: currentTheme.textColor }}>Навыки</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={updateAllSkillValues}
                style={{ color: currentTheme.textColor }}
              >
                Пересчитать навыки
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(skills).map(([skillKey, { name, ability }]) => {
                const currentSkill = character.skills && character.skills[skillKey];
                
                const isProficient = currentSkill?.proficient || false;
                const hasExpertise = currentSkill?.expertise || false;
                
                // Calculate skill modifier
                const skillModifier = calculateSkillModifier(character, skillKey);
                
                return (
                  <div key={skillKey} className="flex items-center space-x-3 py-1">
                    <div className="flex items-center space-x-1">
                      <Checkbox 
                        id={`skill-${skillKey}-prof`} 
                        checked={isProficient}
                        onCheckedChange={() => toggleSkillProficiency(skillKey)}
                      />
                      {isProficient && (
                        <Checkbox 
                          id={`skill-${skillKey}-exp`} 
                          checked={hasExpertise}
                          onCheckedChange={() => toggleSkillExpertise(skillKey)}
                        />
                      )}
                    </div>
                    <div className="inline-block w-6 text-right font-medium" style={{ color: currentTheme.textColor }}>
                      {getModifierString(skillModifier)}
                    </div>
                    <label 
                      htmlFor={`skill-${skillKey}-prof`}
                      className="text-sm font-medium cursor-pointer flex-1"
                      style={{ color: currentTheme.textColor }}
                    >
                      {name} <span className="text-muted-foreground">({abilityLabels[ability as keyof typeof abilityLabels]})</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AbilitiesTab;
