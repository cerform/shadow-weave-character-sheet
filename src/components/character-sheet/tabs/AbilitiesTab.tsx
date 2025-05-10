import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Character, AbilityScores } from '@/types/character';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { calculateAbilityModifier, getModifierString } from '@/utils/characterUtils';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Separator } from '@/components/ui/separator';

export interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

type SkillType = {
  proficient: boolean;
  expertise: boolean;
  value: number;
};

// Default ability scores to use if none exist
const defaultAbilityScores: AbilityScores = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
};

// Utility function to check if a value exists
const hasValue = (value: any): boolean => {
  return value !== undefined && value !== null;
};

// Ability scores component
const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Use default ability scores if none exist
  const abilities = character.abilities || defaultAbilityScores;
  
  // State for abilities values
  const [abilityValues, setAbilityValues] = useState<AbilityScores>({
    STR: abilities.STR || abilities.strength || 10,
    DEX: abilities.DEX || abilities.dexterity || 10,
    CON: abilities.CON || abilities.constitution || 10,
    INT: abilities.INT || abilities.intelligence || 10,
    WIS: abilities.WIS || abilities.wisdom || 10,
    CHA: abilities.CHA || abilities.charisma || 10,
    strength: abilities.STR || abilities.strength || 10,
    dexterity: abilities.DEX || abilities.dexterity || 10,
    constitution: abilities.CON || abilities.constitution || 10,
    intelligence: abilities.INT || abilities.intelligence || 10,
    wisdom: abilities.WIS || abilities.wisdom || 10,
    charisma: abilities.CHA || abilities.charisma || 10
  });
  
  // State for skills
  const [skills, setSkills] = useState<Record<string, SkillType>>(
    character.skills as Record<string, SkillType> || {}
  );
  
  // State for saving throws
  const [savingThrows, setSavingThrows] = useState(character.savingThrows || {});
  
  // Languages, tools, and other proficiencies
  const [languages, setLanguages] = useState<string[]>(character.proficiencies?.languages || []);
  const [tools, setTools] = useState<string[]>(character.proficiencies?.tools || []);
  const [weapons, setWeapons] = useState<string[]>(character.proficiencies?.weapons || []);
  const [armor, setArmor] = useState<string[]>(character.proficiencies?.armor || []);
  const [proficiencyText, setProficiencyText] = useState('');
  
  // Handler for ability score changes
  const handleAbilityChange = (key: keyof AbilityScores, value: number) => {
    // Update both abbreviated and full name values
    let updates: Partial<AbilityScores> = {};
    
    switch(key) {
      case 'STR':
      case 'strength':
        updates.STR = value;
        updates.strength = value;
        break;
      case 'DEX':
      case 'dexterity':
        updates.DEX = value;
        updates.dexterity = value;
        break;
      case 'CON':
      case 'constitution':
        updates.CON = value;
        updates.constitution = value;
        break;
      case 'INT':
      case 'intelligence':
        updates.INT = value;
        updates.intelligence = value;
        break;
      case 'WIS':
      case 'wisdom':
        updates.WIS = value;
        updates.wisdom = value;
        break;
      case 'CHA':
      case 'charisma':
        updates.CHA = value;
        updates.charisma = value;
        break;
    }
    
    setAbilityValues(prev => ({ ...prev, ...updates }));
    onUpdate({ abilities: { ...abilityValues, ...updates } });
  };
  
  // Handler for skill proficiency changes
  const handleSkillChange = (skillKey: string, field: 'proficient' | 'expertise', value: boolean) => {
    const updatedSkills = { ...skills };
    
    // Initialize the skill object if it doesn't exist
    if (!updatedSkills[skillKey]) {
      updatedSkills[skillKey] = {
        proficient: false,
        expertise: false,
        value: 0
      };
    }
    
    // Update the specific field
    updatedSkills[skillKey] = {
      ...updatedSkills[skillKey],
      [field]: value
    };
    
    // Calculate skill value
    let abilityMod = 0;
    let profBonus = character.proficiencyBonus || 2;
    
    // Map skill to ability
    switch(skillKey) {
      case 'athletics':
        abilityMod = calculateAbilityModifier(abilityValues.STR);
        break;
      case 'acrobatics':
      case 'sleightOfHand':
      case 'stealth':
        abilityMod = calculateAbilityModifier(abilityValues.DEX);
        break;
      case 'arcana':
      case 'history':
      case 'investigation':
      case 'nature':
      case 'religion':
        abilityMod = calculateAbilityModifier(abilityValues.INT);
        break;
      case 'animalHandling':
      case 'insight':
      case 'medicine':
      case 'perception':
      case 'survival':
        abilityMod = calculateAbilityModifier(abilityValues.WIS);
        break;
      case 'deception':
      case 'intimidation':
      case 'performance':
      case 'persuasion':
        abilityMod = calculateAbilityModifier(abilityValues.CHA);
        break;
      default:
        abilityMod = 0;
    }
    
    // Calculate skill value
    let skillValue = abilityMod;
    if (updatedSkills[skillKey].proficient) {
      skillValue += profBonus;
    }
    if (updatedSkills[skillKey].expertise) {
      skillValue += profBonus;
    }
    
    updatedSkills[skillKey].value = skillValue;
    
    setSkills(updatedSkills);
    onUpdate({ skills: updatedSkills });
  };
  
  // Function to check if a skill has proficiency
  const hasSkillProficiency = (skillKey: string): boolean => {
    return !!(skills[skillKey] && skills[skillKey].proficient);
  };
  
  // Function to toggle skill proficiency
  const toggleSkillProficiency = (skillKey: string) => {
    if (!skills[skillKey]) {
      handleSkillChange(skillKey, 'proficient', true);
    } else {
      handleSkillChange(skillKey, 'proficient', !skills[skillKey].proficient);
    }
  };
  
  // Function to calculate skill bonus
  const calculateSkillBonus = (skillKey: string, ability: keyof AbilityScores): number => {
    const abilityMod = calculateAbilityModifier(abilityValues[ability]);
    const profBonus = character.proficiencyBonus || 2;
    
    if (skills[skillKey] && skills[skillKey].proficient) {
      return abilityMod + profBonus + (skills[skillKey].expertise ? profBonus : 0);
    }
    
    return abilityMod;
  };
  
  // Handler for saving throw proficiency changes
  const handleSavingThrowChange = (ability: string, value: boolean) => {
    const updatedSavingThrows = { ...savingThrows };
    
    const profBonus = character.proficiencyBonus || 2;
    const abilityMod = calculateAbilityModifier(abilityValues[ability as keyof AbilityScores] || 10);
    
    updatedSavingThrows[ability] = value ? abilityMod + profBonus : abilityMod;
    
    setSavingThrows(updatedSavingThrows);
    onUpdate({ savingThrows: updatedSavingThrows });
  };
  
  // Function to toggle saving throw proficiency
  const toggleSavingThrow = (ability: string) => {
    const currentValue = !!(character.savingThrows && character.savingThrows[ability]);
    handleSavingThrowChange(ability, !currentValue);
  };
  
  // Function to calculate saving throw value
  const calculateSavingThrow = (ability: string): number => {
    const abilityMod = calculateAbilityModifier(abilityValues[ability as keyof AbilityScores] || 10);
    const profBonus = character.proficiencyBonus || 2;
    
    if (character.savingThrows && character.savingThrows[ability]) {
      return abilityMod + profBonus;
    }
    
    return abilityMod;
  };
  
  // Update proficiency text - fixed to use Textarea instead of Input
  const handleProficiencyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProficiencyText(e.target.value);
    
    // Parse text to extract proficiencies
    const text = e.target.value.toLowerCase();
    const newLanguages: string[] = [];
    const newTools: string[] = [];
    const newWeapons: string[] = [];
    const newArmor: string[] = [];
    
    // Simple parsing logic - could be improved
    if (text.includes('common') || text.includes('общий')) newLanguages.push('Общий');
    if (text.includes('dwarvish') || text.includes('гномий')) newLanguages.push('Гномий');
    if (text.includes('elvish') || text.includes('эльфий')) newLanguages.push('Эльфийский');
    
    if (text.includes('thieves') || text.includes('воров')) newTools.push('Воровские инструменты');
    if (text.includes('smith') || text.includes('кузнечные')) newTools.push('Кузнечные инструменты');
    
    if (text.includes('simple') || text.includes('простое')) newWeapons.push('Простое оружие');
    if (text.includes('martial') || text.includes('воинское')) newWeapons.push('Воинское оружие');
    
    if (text.includes('light') || text.includes('легкий')) newArmor.push('Легкий доспех');
    if (text.includes('medium') || text.includes('средний')) newArmor.push('Средний доспех');
    if (text.includes('heavy') || text.includes('тяжелый')) newArmor.push('Тяжелый доспех');
    
    setLanguages(newLanguages.length > 0 ? newLanguages : character.proficiencies?.languages || []);
    setTools(newTools.length > 0 ? newTools : character.proficiencies?.tools || []);
    setWeapons(newWeapons.length > 0 ? newWeapons : character.proficiencies?.weapons || []);
    setArmor(newArmor.length > 0 ? newArmor : character.proficiencies?.armor || []);
    
    onUpdate({
      proficiencies: {
        languages: newLanguages.length > 0 ? newLanguages : character.proficiencies?.languages || [],
        tools: newTools.length > 0 ? newTools : character.proficiencies?.tools || [],
        weapons: newWeapons.length > 0 ? newWeapons : character.proficiencies?.weapons || [],
        armor: newArmor.length > 0 ? newArmor : character.proficiencies?.armor || [],
        skills: character.proficiencies?.skills || []
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Ability Scores */}
      <Card style={{ backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.accent + '30' }}>
        <CardHeader className="pb-2">
          <CardTitle style={{ color: currentTheme.textColor }}>
            Характеристики
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {/* STR */}
          <div className="flex flex-col items-center border p-2 rounded-md" 
               style={{ borderColor: currentTheme.accent + '50' }}>
            <span className="font-bold mb-1" style={{color: currentTheme.textColor}}>СИЛ</span>
            <Input 
              type="number" 
              value={abilityValues.STR}
              onChange={(e) => handleAbilityChange('STR', parseInt(e.target.value) || 10)}
              className="w-12 text-center mb-1"
              style={{backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor}}
            />
            <span className="text-lg font-medium" style={{color: currentTheme.accent}}>
              {getModifierString(abilityValues.STR)}
            </span>
          </div>
          
          {/* DEX */}
          <div className="flex flex-col items-center border p-2 rounded-md" 
               style={{ borderColor: currentTheme.accent + '50' }}>
            <span className="font-bold mb-1" style={{color: currentTheme.textColor}}>ЛОВ</span>
            <Input 
              type="number" 
              value={abilityValues.DEX}
              onChange={(e) => handleAbilityChange('DEX', parseInt(e.target.value) || 10)}
              className="w-12 text-center mb-1"
              style={{backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor}}
            />
            <span className="text-lg font-medium" style={{color: currentTheme.accent}}>
              {getModifierString(abilityValues.DEX)}
            </span>
          </div>
          
          {/* CON */}
          <div className="flex flex-col items-center border p-2 rounded-md" 
               style={{ borderColor: currentTheme.accent + '50' }}>
            <span className="font-bold mb-1" style={{color: currentTheme.textColor}}>ТЕЛ</span>
            <Input 
              type="number" 
              value={abilityValues.CON}
              onChange={(e) => handleAbilityChange('CON', parseInt(e.target.value) || 10)}
              className="w-12 text-center mb-1"
              style={{backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor}}
            />
            <span className="text-lg font-medium" style={{color: currentTheme.accent}}>
              {getModifierString(abilityValues.CON)}
            </span>
          </div>
          
          {/* INT */}
          <div className="flex flex-col items-center border p-2 rounded-md" 
               style={{ borderColor: currentTheme.accent + '50' }}>
            <span className="font-bold mb-1" style={{color: currentTheme.textColor}}>ИНТ</span>
            <Input 
              type="number" 
              value={abilityValues.INT}
              onChange={(e) => handleAbilityChange('INT', parseInt(e.target.value) || 10)}
              className="w-12 text-center mb-1"
              style={{backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor}}
            />
            <span className="text-lg font-medium" style={{color: currentTheme.accent}}>
              {getModifierString(abilityValues.INT)}
            </span>
          </div>
          
          {/* WIS */}
          <div className="flex flex-col items-center border p-2 rounded-md" 
               style={{ borderColor: currentTheme.accent + '50' }}>
            <span className="font-bold mb-1" style={{color: currentTheme.textColor}}>МДР</span>
            <Input 
              type="number" 
              value={abilityValues.WIS}
              onChange={(e) => handleAbilityChange('WIS', parseInt(e.target.value) || 10)}
              className="w-12 text-center mb-1"
              style={{backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor}}
            />
            <span className="text-lg font-medium" style={{color: currentTheme.accent}}>
              {getModifierString(abilityValues.WIS)}
            </span>
          </div>
          
          {/* CHA */}
          <div className="flex flex-col items-center border p-2 rounded-md" 
               style={{ borderColor: currentTheme.accent + '50' }}>
            <span className="font-bold mb-1" style={{color: currentTheme.textColor}}>ХАР</span>
            <Input 
              type="number" 
              value={abilityValues.CHA}
              onChange={(e) => handleAbilityChange('CHA', parseInt(e.target.value) || 10)}
              className="w-12 text-center mb-1"
              style={{backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor}}
            />
            <span className="text-lg font-medium" style={{color: currentTheme.accent}}>
              {getModifierString(abilityValues.CHA)}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Saving Throws */}
      <Card style={{ backgroundColor: currentTheme.cardBackground }}>
        <CardContent className="pt-4">
          <h3 className="text-lg font-bold mb-2" style={{ color: currentTheme.textColor }}>
            Спасброски
          </h3>
          <Separator className="my-2" />
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
      
      {/* Skills */}
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
                        (skills[skill.key] && skills[skill.key].expertise ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: skills[skill.key] && skills[skill.key].expertise ? 
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
                        (skills[skill.key] && skills[skill.key].expertise ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: skills[skill.key] && skills[skill.key].expertise ? 
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
                        (skills[skill.key] && skills[skill.key].expertise ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: skills[skill.key] && skills[skill.key].expertise ? 
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
                        (skills[skill.key] && skills[skill.key].expertise ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: skills[skill.key] && skills[skill.key].expertise ? 
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
                        (skills[skill.key] && skills[skill.key].expertise ? currentTheme.accent : 'transparent') : 'transparent'
                    }}
                  >
                    {hasSkillProficiency(skill.key) && (
                      <div 
                        className={`w-2 h-2 rounded-full`}
                        style={{ 
                          backgroundColor: skills[skill.key] && skills[skill.key].expertise ? 
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
      
      {/* Proficiencies */}
      <Card style={{ backgroundColor: currentTheme.cardBackground }}>
        <CardContent className="pt-4">
          <h3 className="text-lg font-bold mb-2" style={{ color: currentTheme.textColor }}>
            Профили
          </h3>
          <Separator className="my-2" />
          <div className="space-y-1">
            <div className="text-sm font-medium" style={{ color: currentTheme.accent }}>
              Языки
            </div>
            <div className="flex items-center gap-2">
              <Textarea 
                value={languages.join(', ')}
                onChange={handleProficiencyTextChange}
                className="w-full"
                style={{ backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor }}
              />
            </div>
            
            <Separator className="my-1" />
            <div className="text-sm font-medium" style={{ color: currentTheme.accent }}>
              Инструменты
            </div>
            <div className="flex items-center gap-2">
              <Textarea 
                value={tools.join(', ')}
                onChange={handleProficiencyTextChange}
                className="w-full"
                style={{ backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor }}
              />
            </div>
            
            <Separator className="my-1" />
            <div className="text-sm font-medium" style={{ color: currentTheme.accent }}>
              Оружие
            </div>
            <div className="flex items-center gap-2">
              <Textarea 
                value={weapons.join(', ')}
                onChange={handleProficiencyTextChange}
                className="w-full"
                style={{ backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor }}
              />
            </div>
            
            <Separator className="my-1" />
            <div className="text-sm font-medium" style={{ color: currentTheme.accent }}>
              Доспех
            </div>
            <div className="flex items-center gap-2">
              <Textarea 
                value={armor.join(', ')}
                onChange={handleProficiencyTextChange}
                className="w-full"
                style={{ backgroundColor: currentTheme.cardBackground, color: currentTheme.textColor }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbilitiesTab;
