
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import {
  calculateAbilityModifier,
  formatModifier,
  calculateProficiencyBonusByLevel,
  calculateSavingThrow,
  calculateSkillBonus,
  calculateInitiative,
  calculatePassivePerception,
  calculatePassiveInvestigation,
  skillDefinitions,
  type AbilityName
} from '@/utils/characterCalculations';

interface AbilitiesTabProps {
  character: Character;
  onUpdateCharacter: (updates: Partial<Character>) => void;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdateCharacter }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [abilities, setAbilities] = useState({
    strength: character.strength || character.abilities?.strength || 10,
    dexterity: character.dexterity || character.abilities?.dexterity || 10,
    constitution: character.constitution || character.abilities?.constitution || 10,
    intelligence: character.intelligence || character.abilities?.intelligence || 10,
    wisdom: character.wisdom || character.abilities?.wisdom || 10,
    charisma: character.charisma || character.abilities?.charisma || 10
  });

  const [skills, setSkills] = useState(character.skills || {});
  const [savingThrows, setSavingThrows] = useState<Record<string, boolean>>(
    character.savingThrows || {}
  );

  // Автоматический расчет proficiency bonus по уровню
  const proficiencyBonus = calculateProficiencyBonusByLevel(character.level);

  // Обновление персонажа при изменении данных
  useEffect(() => {
    const updatedCharacter = {
      abilities: {
        STR: abilities.strength,
        DEX: abilities.dexterity,
        CON: abilities.constitution,
        INT: abilities.intelligence,
        WIS: abilities.wisdom,
        CHA: abilities.charisma,
        strength: abilities.strength,
        dexterity: abilities.dexterity,
        constitution: abilities.constitution,
        intelligence: abilities.intelligence,
        wisdom: abilities.wisdom,
        charisma: abilities.charisma
      },
      strength: abilities.strength,
      dexterity: abilities.dexterity,
      constitution: abilities.constitution,
      intelligence: abilities.intelligence,
      wisdom: abilities.wisdom,
      charisma: abilities.charisma,
      skills,
      savingThrows,
      proficiencyBonus,
      initiative: calculateInitiative(abilities.dexterity)
    };

    onUpdateCharacter(updatedCharacter);
  }, [abilities, skills, savingThrows, proficiencyBonus]);


  const handleSkillProficiencyToggle = (skillName: string) => {
    setSkills(prev => {
      const currentSkill = prev[skillName] || { proficient: false, expertise: false };
      return {
        ...prev,
        [skillName]: {
          ...currentSkill,
          proficient: !currentSkill.proficient
        }
      };
    });
  };

  const handleSavingThrowToggle = (ability: string) => {
    setSavingThrows(prev => ({
      ...prev,
      [ability]: !prev[ability]
    }));
  };

  const getSavingThrowBonus = (ability: AbilityName) => {
    const abilityScore = abilities[ability];
    const isProficient = savingThrows[ability] || false;
    return calculateSavingThrow(abilityScore, proficiencyBonus, isProficient);
  };

  const getSkillBonus = (skillName: string, ability: AbilityName) => {
    const abilityScore = abilities[ability];
    const skillInfo = skills[skillName] || { proficient: false, expertise: false };
    return calculateSkillBonus(abilityScore, proficiencyBonus, skillInfo.proficient, skillInfo.expertise);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Характеристики */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Характеристики</h3>
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(abilities).map(([key, value]) => {
                const abilityKey = key as AbilityName;
                const modifier = calculateAbilityModifier(value);
                const abilityNames: Record<AbilityName, string> = {
                  strength: 'Сила',
                  dexterity: 'Ловкость', 
                  constitution: 'Телосложение',
                  intelligence: 'Интеллект',
                  wisdom: 'Мудрость',
                  charisma: 'Харизма'
                };
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label className="font-medium">
                      {abilityNames[abilityKey]}
                    </Label>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{value}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {formatModifier(modifier)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          модификатор
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Спасброски */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Спасброски</h3>
            <div className="space-y-3">
              {Object.keys(abilities).map((key) => {
                const abilityKey = key as AbilityName;
                const bonus = getSavingThrowBonus(abilityKey);
                const abilityNames: Record<AbilityName, string> = {
                  strength: 'Сила',
                  dexterity: 'Ловкость', 
                  constitution: 'Телосложение',
                  intelligence: 'Интеллект',
                  wisdom: 'Мудрость',
                  charisma: 'Харизма'
                };
                
                return (
                  <div key={key} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`save-${key}`}
                        checked={savingThrows[key] || false}
                        onCheckedChange={() => handleSavingThrowToggle(key)}
                      />
                      <Label htmlFor={`save-${key}`}>
                        {abilityNames[abilityKey]}
                      </Label>
                    </div>
                    <span className="font-medium text-lg">
                      {formatModifier(bonus)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Навыки */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Навыки</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {skillDefinitions.map((skill) => {
                const skillAbility = skill.ability as AbilityName;
                const bonus = getSkillBonus(skill.name, skillAbility);
                const skillInfo = skills[skill.name] || { proficient: false };
                
                const abilityAbbreviations: Record<AbilityName, string> = {
                  strength: 'Сил',
                  dexterity: 'Лов',
                  constitution: 'Тел',
                  intelligence: 'Инт',
                  wisdom: 'Мдр',
                  charisma: 'Хар'
                };
                
                return (
                  <div key={skill.name} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.name}`}
                        checked={skillInfo.proficient || false}
                        onCheckedChange={() => handleSkillProficiencyToggle(skill.name)}
                      />
                      <Label htmlFor={`skill-${skill.name}`} className="flex-1">
                        {skill.name} 
                        <span className="text-muted-foreground ml-1">
                          ({abilityAbbreviations[skillAbility]})
                        </span>
                      </Label>
                    </div>
                    <span className="font-medium text-lg min-w-[3rem] text-right">
                      {formatModifier(bonus)}
                    </span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Дополнительные характеристики */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Дополнительные характеристики</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg text-center">
              <Label className="text-sm text-muted-foreground">Бонус мастерства</Label>
              <div className="text-2xl font-bold">+{proficiencyBonus}</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Label className="text-sm text-muted-foreground">Инициатива</Label>
              <div className="text-2xl font-bold">
                {formatModifier(calculateInitiative(abilities.dexterity))}
              </div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Label className="text-sm text-muted-foreground">Пассивное восприятие</Label>
              <div className="text-2xl font-bold">
                {calculatePassivePerception(
                  abilities.wisdom, 
                  proficiencyBonus, 
                  skills['Восприятие']?.proficient || false
                )}
              </div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Label className="text-sm text-muted-foreground">Пассивный анализ</Label>
              <div className="text-2xl font-bold">
                {calculatePassiveInvestigation(
                  abilities.intelligence, 
                  proficiencyBonus, 
                  skills['Анализ']?.proficient || false
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbilitiesTab;
