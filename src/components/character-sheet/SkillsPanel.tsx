
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface SkillsPanelProps {
  character: any;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ character }) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Get character skills and proficiency bonus
  const skills = character?.skills || [];
  const proficiencyBonus = Math.ceil(1 + (character?.level || 1) / 4);
  
  // Map abilities to skills
  const skillMap = {
    acrobatics: { ability: 'dexterity', label: 'Акробатика' },
    animalHandling: { ability: 'wisdom', label: 'Обращение с животными' },
    arcana: { ability: 'intelligence', label: 'Магия' },
    athletics: { ability: 'strength', label: 'Атлетика' },
    deception: { ability: 'charisma', label: 'Обман' },
    history: { ability: 'intelligence', label: 'История' },
    insight: { ability: 'wisdom', label: 'Проницательность' },
    intimidation: { ability: 'charisma', label: 'Запугивание' },
    investigation: { ability: 'intelligence', label: 'Расследование' },
    medicine: { ability: 'wisdom', label: 'Медицина' },
    nature: { ability: 'intelligence', label: 'Природа' },
    perception: { ability: 'wisdom', label: 'Восприятие' },
    performance: { ability: 'charisma', label: 'Выступление' },
    persuasion: { ability: 'charisma', label: 'Убеждение' },
    religion: { ability: 'intelligence', label: 'Религия' },
    sleightOfHand: { ability: 'dexterity', label: 'Ловкость рук' },
    stealth: { ability: 'dexterity', label: 'Скрытность' },
    survival: { ability: 'wisdom', label: 'Выживание' }
  };

  // Calculate ability modifier
  const getModifier = (abilityName: string) => {
    const abilityScore = character?.abilities?.[abilityName] || 10;
    return Math.floor((abilityScore - 10) / 2);
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3" style={{ color: currentTheme.textColor }}>
          Навыки
        </h3>
        <div className="space-y-1">
          {Object.entries(skillMap).map(([key, { ability, label }]) => {
            const isProficient = skills.includes(key);
            const abilityMod = getModifier(ability);
            const bonus = isProficient ? abilityMod + proficiencyBonus : abilityMod;
            
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className={`w-3 h-3 rounded-full mr-2 ${isProficient ? 'bg-primary' : 'border border-gray-400'}`}
                  />
                  <span className="text-sm">{label}</span>
                  <span className="text-xs ml-1 text-muted-foreground">({ability.slice(0, 3).toUpperCase()})</span>
                </div>
                <span 
                  className="text-sm font-medium" 
                  style={{ color: currentTheme.accent }}
                >
                  {bonus >= 0 ? `+${bonus}` : bonus}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsPanel;
