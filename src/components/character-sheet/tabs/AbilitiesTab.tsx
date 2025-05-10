
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { calculateAbilityModifier, getModifierString, hasValue } from '@/utils/characterUtils';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Ability scores component
const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const [tempAbilities, setTempAbilities] = useState(character.abilities || {});
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Handle ability score change
  const handleAbilityChange = (ability: string, value: number) => {
    const newAbilities = { ...tempAbilities };
    
    // Update both formats of the ability score for compatibility
    switch(ability.toLowerCase()) {
      case 'strength':
      case 'str':
        newAbilities.STR = newAbilities.strength = value;
        break;
      case 'dexterity':
      case 'dex':
        newAbilities.DEX = newAbilities.dexterity = value;
        break;
      case 'constitution':
      case 'con':
        newAbilities.CON = newAbilities.constitution = value;
        break;
      case 'intelligence':
      case 'int':
        newAbilities.INT = newAbilities.intelligence = value;
        break;
      case 'wisdom':
      case 'wis':
        newAbilities.WIS = newAbilities.wisdom = value;
        break;
      case 'charisma':
      case 'cha':
        newAbilities.CHA = newAbilities.charisma = value;
        break;
    }
    
    setTempAbilities(newAbilities);
  };
  
  // Save ability scores
  const saveAbilities = () => {
    onUpdate({ abilities: tempAbilities });
  };
  
  // Handle saving throw proficiency toggle
  const toggleSavingThrow = (ability: string) => {
    const newSavingThrows = { ...(character.savingThrows || {}) };
    
    // Get current proficiency
    const isProficient = !!newSavingThrows[ability];
    
    // Set proficiency for both formats of the ability
    switch(ability.toLowerCase()) {
      case 'strength':
      case 'str':
        newSavingThrows.STR = newSavingThrows.strength = isProficient ? 0 : 1;
        break;
      case 'dexterity':
      case 'dex':
        newSavingThrows.DEX = newSavingThrows.dexterity = isProficient ? 0 : 1;
        break;
      case 'constitution':
      case 'con':
        newSavingThrows.CON = newSavingThrows.constitution = isProficient ? 0 : 1;
        break;
      case 'intelligence':
      case 'int':
        newSavingThrows.INT = newSavingThrows.intelligence = isProficient ? 0 : 1;
        break;
      case 'wisdom':
      case 'wis':
        newSavingThrows.WIS = newSavingThrows.wisdom = isProficient ? 0 : 1;
        break;
      case 'charisma':
      case 'cha':
        newSavingThrows.CHA = newSavingThrows.charisma = isProficient ? 0 : 1;
        break;
    }
    
    onUpdate({ savingThrows: newSavingThrows });
  };
  
  // Handle skill proficiency toggle
  const toggleSkillProficiency = (skill: string) => {
    const newSkills = { ...(character.skills || {}) };
    
    // Get current proficiency (0 = not proficient, 1 = proficient, 2 = expertise)
    let currentProficiency = newSkills[skill] || 0;
    
    // Cycle through proficiency levels: 0 -> 1 -> 2 -> 0
    currentProficiency = (currentProficiency + 1) % 3;
    
    // Update skill proficiency
    newSkills[skill] = currentProficiency;
    
    onUpdate({ skills: newSkills });
  };
  
  // Calculate saving throw bonus
  const calculateSavingThrow = (ability: string) => {
    const abilityScore = tempAbilities[ability] || 10;
    const modifier = calculateAbilityModifier(abilityScore);
    const profBonus = character.proficiencyBonus || 2;
    const isProficient = character.savingThrows && character.savingThrows[ability];
    
    return modifier + (isProficient ? profBonus : 0);
  };
  
  // Calculate skill bonus
  const calculateSkillBonus = (skill: string, ability: string) => {
    const abilityScore = tempAbilities[ability] || 10;
    const modifier = calculateAbilityModifier(abilityScore);
    const profBonus = character.proficiencyBonus || 2;
    const skillValue = character.skills && character.skills[skill];
    
    if (skillValue === 2) {
      // Expertise
      return modifier + (profBonus * 2);
    } else if (skillValue === 1) {
      // Proficient
      return modifier + profBonus;
    }
    
    // Not proficient
    return modifier;
  };

  // This is just a small fix for the "always truthy" expression
  const hasSkillProficiency = (skill: string): boolean => {
    if (!character.skills) return false;
    return hasValue(character.skills[skill]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Abilities Column */}
      <div className="space-y-4">
        <Card style={{ backgroundColor: currentTheme.cardBackground }}>
          <CardContent className="pt-4">
            <h3 className="text-lg font-bold mb-4" style={{ color: currentTheme.textColor }}>
              Характеристики
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'STR', name: 'Сила', fullName: 'strength' },
                { key: 'DEX', name: 'Ловкость', fullName: 'dexterity' },
                { key: 'CON', name: 'Телосложение', fullName: 'constitution' },
                { key: 'INT', name: 'Интеллект', fullName: 'intelligence' },
                { key: 'WIS', name: 'Мудрость', fullName: 'wisdom' },
                { key: 'CHA', name: 'Харизма', fullName: 'charisma' },
              ].map((ability) => (
                <div key={ability.key} className="flex flex-col items-center">
                  <span className="text-sm" style={{ color: currentTheme.textColor }}>{ability.name}</span>
                  <Input
                    type="number"
                    value={tempAbilities[ability.key] || 10}
                    onChange={(e) => handleAbilityChange(ability.key, parseInt(e.target.value) || 0)}
                    className="w-16 text-center"
                    min={1}
                    max={30}
                  />
                  <span className="text-lg font-bold" style={{ color: currentTheme.accent }}>
                    {getModifierString(tempAbilities[ability.key] || 10)}
                  </span>
                </div>
              ))}
            </div>
            <Button 
              onClick={saveAbilities} 
              className="w-full mt-4"
              style={{ 
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              Сохранить характеристики
            </Button>
          </CardContent>
        </Card>
        
        {/* Saving Throws */}
        <Card style={{ backgroundColor: currentTheme.cardBackground }}>
          <CardContent className="pt-4">
            <h3 className="text-lg font-bold mb-2" style={{ color: currentTheme.textColor }}>
              Спасброски
            </h3>
            <div className="space-y-2">
              {[
                { key: 'STR', name: 'Сила' },
                { key: 'DEX', name: 'Ловкость' },
                { key: 'CON', name: 'Телосложение' },
                { key: 'INT', name: 'Интеллект' },
                { key: 'WIS', name: 'Мудрость' },
                { key: 'CHA', name: 'Харизма' },
              ].map((ability) => (
                <div key={`save-${ability.key}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!!(character.savingThrows && character.savingThrows[ability.key])}
                      onCheckedChange={() => toggleSavingThrow(ability.key)}
                    />
                    <span style={{ color: currentTheme.textColor }}>{ability.name}</span>
                  </div>
                  <span 
                    className="font-medium"
                    style={{ 
                      color: character.savingThrows && character.savingThrows[ability.key] ? 
                        currentTheme.accent : currentTheme.textColor 
                    }}
                  >
                    {calculateSavingThrow(ability.key) >= 0 ? '+' : ''}
                    {calculateSavingThrow(ability.key)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Skills Column */}
      <Card style={{ backgroundColor: currentTheme.cardBackground }}>
        <CardContent className="pt-4">
          <h3 className="text-lg font-bold mb-2" style={{ color: currentTheme.textColor }}>
            Навыки
          </h3>
          <Separator className="my-2" />
          <div className="space-y-1">
            {/* Dexterity Skills */}
            <div className="text-sm font-medium" style={{ color: currentTheme.accent }}>
              Ловкость (DEX)
            </div>
            {[
              { key: 'acrobatics', name: 'Акробатика' },
              { key: 'sleightOfHand', name: 'Ловкость рук' },
              { key: 'stealth', name: 'Скрытность' },
            ].map((skill) => (
              <div key={skill.key} className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleSkillProficiency(skill.key)}
                >
                  <div 
                    className="w-4 h-4 flex items-center justify-center border rounded"
                    style={{ 
                      borderColor: currentTheme.accent,
                      backgroundColor: hasSkillProficiency(skill.key) ? 
                        (character.skills[skill.key] === 2 ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: character.skills[skill.key] === 2 ? 
                            currentTheme.cardBackground : currentTheme.accent
                        }}
                      />
                    )}
                  </div>
                  <span style={{ color: currentTheme.textColor }}>{skill.name}</span>
                </div>
                <span 
                  className="font-medium"
                  style={{ 
                    color: hasSkillProficiency(skill.key) ? 
                      currentTheme.accent : currentTheme.textColor
                  }}
                >
                  {calculateSkillBonus(skill.key, 'DEX') >= 0 ? '+' : ''}
                  {calculateSkillBonus(skill.key, 'DEX')}
                </span>
              </div>
            ))}
            
            {/* More skills for other abilities */}
            <Separator className="my-1" />
            <div className="text-sm font-medium" style={{ color: currentTheme.accent }}>
              Сила (STR)
            </div>
            {[
              { key: 'athletics', name: 'Атлетика' },
            ].map((skill) => (
              <div key={skill.key} className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleSkillProficiency(skill.key)}
                >
                  <div 
                    className="w-4 h-4 flex items-center justify-center border rounded"
                    style={{ 
                      borderColor: currentTheme.accent,
                      backgroundColor: hasSkillProficiency(skill.key) ? 
                        (character.skills[skill.key] === 2 ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: character.skills[skill.key] === 2 ? 
                            currentTheme.cardBackground : currentTheme.accent 
                        }}
                      />
                    )}
                  </div>
                  <span style={{ color: currentTheme.textColor }}>{skill.name}</span>
                </div>
                <span 
                  className="font-medium"
                  style={{ 
                    color: hasSkillProficiency(skill.key) ? 
                      currentTheme.accent : currentTheme.textColor 
                  }}
                >
                  {calculateSkillBonus(skill.key, 'STR') >= 0 ? '+' : ''}
                  {calculateSkillBonus(skill.key, 'STR')}
                </span>
              </div>
            ))}
            
            {/* Intelligence Skills */}
            <Separator className="my-1" />
            <div className="text-sm font-medium" style={{ color: currentTheme.accent }}>
              Интеллект (INT)
            </div>
            {[
              { key: 'arcana', name: 'Магия' },
              { key: 'history', name: 'История' },
              { key: 'investigation', name: 'Расследование' },
              { key: 'nature', name: 'Природа' },
              { key: 'religion', name: 'Религия' },
            ].map((skill) => (
              <div key={skill.key} className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleSkillProficiency(skill.key)}
                >
                  <div 
                    className="w-4 h-4 flex items-center justify-center border rounded"
                    style={{ 
                      borderColor: currentTheme.accent,
                      backgroundColor: hasSkillProficiency(skill.key) ? 
                        (character.skills[skill.key] === 2 ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: character.skills[skill.key] === 2 ? 
                            currentTheme.cardBackground : currentTheme.accent
                        }}
                      />
                    )}
                  </div>
                  <span style={{ color: currentTheme.textColor }}>{skill.name}</span>
                </div>
                <span 
                  className="font-medium"
                  style={{ 
                    color: hasSkillProficiency(skill.key) ? 
                      currentTheme.accent : currentTheme.textColor 
                  }}
                >
                  {calculateSkillBonus(skill.key, 'INT') >= 0 ? '+' : ''}
                  {calculateSkillBonus(skill.key, 'INT')}
                </span>
              </div>
            ))}
            
            {/* Wisdom Skills */}
            <Separator className="my-1" />
            <div className="text-sm font-medium" style={{ color: currentTheme.accent }}>
              Мудрость (WIS)
            </div>
            {[
              { key: 'animalHandling', name: 'Обращение с животными' },
              { key: 'insight', name: 'Проницательность' },
              { key: 'medicine', name: 'Медицина' },
              { key: 'perception', name: 'Внимательность' },
              { key: 'survival', name: 'Выживание' },
            ].map((skill) => (
              <div key={skill.key} className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleSkillProficiency(skill.key)}
                >
                  <div 
                    className="w-4 h-4 flex items-center justify-center border rounded"
                    style={{ 
                      borderColor: currentTheme.accent,
                      backgroundColor: hasSkillProficiency(skill.key) ? 
                        (character.skills[skill.key] === 2 ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: character.skills[skill.key] === 2 ? 
                            currentTheme.cardBackground : currentTheme.accent
                        }}
                      />
                    )}
                  </div>
                  <span style={{ color: currentTheme.textColor }}>{skill.name}</span>
                </div>
                <span 
                  className="font-medium"
                  style={{ 
                    color: hasSkillProficiency(skill.key) ? 
                      currentTheme.accent : currentTheme.textColor
                  }}
                >
                  {calculateSkillBonus(skill.key, 'WIS') >= 0 ? '+' : ''}
                  {calculateSkillBonus(skill.key, 'WIS')}
                </span>
              </div>
            ))}
            
            {/* Charisma Skills */}
            <Separator className="my-1" />
            <div className="text-sm font-medium" style={{ color: currentTheme.accent }}>
              Харизма (CHA)
            </div>
            {[
              { key: 'deception', name: 'Обман' },
              { key: 'intimidation', name: 'Запугивание' },
              { key: 'performance', name: 'Выступление' },
              { key: 'persuasion', name: 'Убеждение' },
            ].map((skill) => (
              <div key={skill.key} className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleSkillProficiency(skill.key)}
                >
                  <div 
                    className="w-4 h-4 flex items-center justify-center border rounded"
                    style={{ 
                      borderColor: currentTheme.accent,
                      backgroundColor: hasSkillProficiency(skill.key) ? 
                        (character.skills[skill.key] === 2 ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: character.skills[skill.key] === 2 ? 
                            currentTheme.cardBackground : currentTheme.accent
                        }}
                      />
                    )}
                  </div>
                  <span style={{ color: currentTheme.textColor }}>{skill.name}</span>
                </div>
                <span 
                  className="font-medium"
                  style={{ 
                    color: hasSkillProficiency(skill.key) ? 
                      currentTheme.accent : currentTheme.textColor
                  }}
                >
                  {calculateSkillBonus(skill.key, 'CHA') >= 0 ? '+' : ''}
                  {calculateSkillBonus(skill.key, 'CHA')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Export both named and default export
export { AbilitiesTab };
export default AbilitiesTab;
