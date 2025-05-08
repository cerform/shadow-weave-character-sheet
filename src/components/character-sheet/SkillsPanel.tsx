import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Character } from '@/types/character';
import { getAbilityModifierValue, hasSavingThrowProficiency } from '@/utils/abilityUtils';

interface SkillsPanelProps {
  character: any;
  onUpdate?: (updates: Partial<any>) => void;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const skillsData = {
    athletics: { ability: 'strength', label: 'Атлетика' },
    acrobatics: { ability: 'dexterity', label: 'Акробатика' },
    sleightOfHand: { ability: 'dexterity', label: 'Ловкость рук' },
    stealth: { ability: 'dexterity', label: 'Скрытность' },
    arcana: { ability: 'intelligence', label: 'Магия' },
    history: { ability: 'intelligence', label: 'История' },
    investigation: { ability: 'intelligence', label: 'Анализ' },
    nature: { ability: 'intelligence', label: 'Природа' },
    religion: { ability: 'intelligence', label: 'Религия' },
    animalHandling: { ability: 'wisdom', label: 'Уход за животными' },
    insight: { ability: 'wisdom', label: 'Проницательность' },
    medicine: { ability: 'wisdom', label: 'Медицина' },
    perception: { ability: 'wisdom', label: 'Внимательность' },
    survival: { ability: 'wisdom', label: 'Выживание' },
    deception: { ability: 'charisma', label: 'Обман' },
    intimidation: { ability: 'charisma', label: 'Запугивание' },
    performance: { ability: 'charisma', label: 'Выступление' },
    persuasion: { ability: 'charisma', label: 'Убеждение' },
  };

  const getSkillModifier = (skillKey: string) => {
    const skill = skillsData[skillKey];
    if (!skill) return 'N/A';

    const abilityKey = skill.ability;
    if (!character || !character.abilities || !character.skills) return 'N/A';

    const abilityMod = getAbilityModifierValue(
      typeof character.abilities[abilityKey] === 'number' 
        ? character.abilities[abilityKey] as number 
        : 10 // Default value if not a number
    );
    
    const proficiency = character.skills[skillKey] === true;
    const proficiencyBonus = character.proficiencyBonus || 2;
    
    if (proficiency) {
      return abilityMod + proficiencyBonus;
    } else {
      return abilityMod;
    }
  };

  const toggleSkillProficiency = (skillKey: string) => {
    if (!character || !character.skills || !onUpdate) return;

    const currentProficiency = character.skills[skillKey] === true;
    const updatedSkills = {
      ...character.skills,
      [skillKey]: !currentProficiency,
    };

    onUpdate({ skills: updatedSkills });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle style={{ color: currentTheme.textColor }}>Навыки</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {Object.entries(skillsData).map(([skillKey, skill]) => (
          <div key={skillKey} className="flex items-center justify-between">
            <div className="flex items-center">
              <span style={{ color: currentTheme.textColor }}>{skill.label}</span>
              <Badge className="ml-2">{getSkillModifier(skillKey)}</Badge>
            </div>
            {onUpdate && (
              <button onClick={() => toggleSkillProficiency(skillKey)}>
                {character.skills && character.skills[skillKey] === true ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SkillsPanel;
