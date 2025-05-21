import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { calculateModifier, calculateProficiencyBonus } from '@/utils/characterUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface AbilitiesTabProps {
  character: Character;
  onUpdateCharacter: (updates: Partial<Character>) => void;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdateCharacter }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [abilities, setAbilities] = useState({
    strength: character.strength || character.abilities?.strength || character.abilities?.STR || 10,
    dexterity: character.dexterity || character.abilities?.dexterity || character.abilities?.DEX || 10,
    constitution: character.constitution || character.abilities?.constitution || character.abilities?.CON || 10,
    intelligence: character.intelligence || character.abilities?.intelligence || character.abilities?.INT || 10,
    wisdom: character.wisdom || character.abilities?.wisdom || character.abilities?.WIS || 10,
    charisma: character.charisma || character.abilities?.charisma || character.abilities?.CHA || 10
  });

  const [skills, setSkills] = useState(character.skills || {});
  const [savingThrows, setSavingThrows] = useState<Record<string, boolean>>(
    character.savingThrows || {}
  );

  // Calculate proficiency bonus based on character level
  const proficiencyBonus = character.proficiencyBonus || calculateProficiencyBonus(character.level);

  // Update character when abilities change
  useEffect(() => {
    const updatedAbilities = {
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
    };

    onUpdateCharacter({
      abilities: updatedAbilities,
      strength: abilities.strength,
      dexterity: abilities.dexterity,
      constitution: abilities.constitution,
      intelligence: abilities.intelligence,
      wisdom: abilities.wisdom,
      charisma: abilities.charisma,
      skills,
      savingThrows
    });
  }, [abilities, skills, savingThrows, onUpdateCharacter]);

  // Handle ability score change
  const handleAbilityChange = (ability: keyof typeof abilities, value: string) => {
    const numValue = parseInt(value) || 0;
    setAbilities(prev => ({
      ...prev,
      [ability]: numValue
    }));
  };

  // Handle skill proficiency toggle
  const handleSkillProficiencyToggle = (skillName: string) => {
    setSkills(prev => {
      const currentSkill = prev[skillName] || { proficient: false };
      return {
        ...prev,
        [skillName]: {
          ...currentSkill,
          proficient: !currentSkill.proficient
        }
      };
    });
  };

  // Handle saving throw proficiency toggle
  const handleSavingThrowToggle = (ability: string) => {
    setSavingThrows(prev => ({
      ...prev,
      [ability]: !prev[ability]
    }));
  };

  // Get ability modifier
  const getModifier = (score: number) => {
    return calculateModifier(score);
  };

  // Format modifier for display
  const formatModifier = (mod: number) => {
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Get saving throw bonus
  const getSavingThrowBonus = (ability: string) => {
    const abilityScore = abilities[ability as keyof typeof abilities];
    const modifier = getModifier(abilityScore);
    const isProficient = savingThrows[ability] || false;
    
    return isProficient ? modifier + proficiencyBonus : modifier;
  };

  // Get skill bonus
  const getSkillBonus = (skillName: string, ability: keyof typeof abilities) => {
    const abilityModifier = getModifier(abilities[ability]);
    const skillInfo = skills[skillName] || { proficient: false, expertise: false };
    
    let bonus = abilityModifier;
    
    if (skillInfo.proficient) {
      bonus += proficiencyBonus;
    }
    
    if (skillInfo.expertise) {
      bonus += proficiencyBonus;
    }
    
    return bonus;
  };

  // Skill definitions with their associated abilities
  const skillDefinitions = [
    { name: 'Акробатика', ability: 'dexterity' },
    { name: 'Анализ', ability: 'intelligence' },
    { name: 'Атлетика', ability: 'strength' },
    { name: 'Восприятие', ability: 'wisdom' },
    { name: 'Выживание', ability: 'wisdom' },
    { name: 'Запугивание', ability: 'charisma' },
    { name: 'История', ability: 'intelligence' },
    { name: 'Ловкость рук', ability: 'dexterity' },
    { name: 'Магия', ability: 'intelligence' },
    { name: 'Медицина', ability: 'wisdom' },
    { name: 'Обман', ability: 'charisma' },
    { name: 'Природа', ability: 'intelligence' },
    { name: 'Проницательность', ability: 'wisdom' },
    { name: 'Религия', ability: 'intelligence' },
    { name: 'Скрытность', ability: 'dexterity' },
    { name: 'Убеждение', ability: 'charisma' },
    { name: 'Уход за животными', ability: 'wisdom' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ability Scores */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Характеристики</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(abilities).map(([key, value]) => (
                <div key={key} className="flex flex-col items-center">
                  <Label className="mb-1 text-center capitalize">
                    {key === 'strength' ? 'Сила' :
                     key === 'dexterity' ? 'Ловкость' :
                     key === 'constitution' ? 'Телосложение' :
                     key === 'intelligence' ? 'Интеллект' :
                     key === 'wisdom' ? 'Мудрость' :
                     key === 'charisma' ? 'Харизма' : key}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleAbilityChange(key as keyof typeof abilities, (value - 1).toString())}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => handleAbilityChange(key as keyof typeof abilities, e.target.value)}
                      className="w-16 text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleAbilityChange(key as keyof typeof abilities, (value + 1).toString())}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="mt-1 text-sm">
                    {formatModifier(getModifier(value))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Saving Throws */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Спасброски</h3>
            <div className="space-y-2">
              {Object.entries(abilities).map(([key]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`save-${key}`}
                      checked={savingThrows[key] || false}
                      onCheckedChange={() => handleSavingThrowToggle(key)}
                    />
                    <Label htmlFor={`save-${key}`} className="capitalize">
                      {key === 'strength' ? 'Сила' :
                       key === 'dexterity' ? 'Ловкость' :
                       key === 'constitution' ? 'Телосложение' :
                       key === 'intelligence' ? 'Интеллект' :
                       key === 'wisdom' ? 'Мудрость' :
                       key === 'charisma' ? 'Харизма' : key}
                    </Label>
                  </div>
                  <span className="font-medium">
                    {formatModifier(getSavingThrowBonus(key))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Навыки</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {skillDefinitions.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill.name}`}
                      checked={(skills[skill.name]?.proficient) || false}
                      onCheckedChange={() => handleSkillProficiencyToggle(skill.name)}
                    />
                    <Label htmlFor={`skill-${skill.name}`}>
                      {skill.name} ({skill.ability.charAt(0).toUpperCase()})
                    </Label>
                  </div>
                  <span className="font-medium">
                    {formatModifier(getSkillBonus(skill.name, skill.ability as keyof typeof abilities))}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Other Stats */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Прочие характеристики</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="proficiency">Бонус мастерства</Label>
              <Input
                id="proficiency"
                value={`+${proficiencyBonus}`}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="initiative">Инициатива</Label>
              <Input
                id="initiative"
                value={formatModifier(getModifier(abilities.dexterity))}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="passive-perception">Пассивное восприятие</Label>
              <Input
                id="passive-perception"
                value={10 + getSkillBonus('Восприятие', 'wisdom')}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="passive-investigation">Пассивный анализ</Label>
              <Input
                id="passive-investigation"
                value={10 + getSkillBonus('Анализ', 'intelligence')}
                disabled
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbilitiesTab;
