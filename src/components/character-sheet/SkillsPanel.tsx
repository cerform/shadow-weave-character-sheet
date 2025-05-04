
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Check } from 'lucide-react';
import { getNumericModifier, getModifierString, getProficiencyBonus } from '@/utils/characterUtils';

interface SkillsPanelProps {
  character: any;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ character }) => {
  const skills = [
    { key: 'acrobatics', name: 'Акробатика', ability: 'dexterity' },
    { key: 'animalHandling', name: 'Обращение с животными', ability: 'wisdom' },
    { key: 'arcana', name: 'Магия', ability: 'intelligence' },
    { key: 'athletics', name: 'Атлетика', ability: 'strength' },
    { key: 'deception', name: 'Обман', ability: 'charisma' },
    { key: 'history', name: 'История', ability: 'intelligence' },
    { key: 'insight', name: 'Проницательность', ability: 'wisdom' },
    { key: 'intimidation', name: 'Запугивание', ability: 'charisma' },
    { key: 'investigation', name: 'Расследование', ability: 'intelligence' },
    { key: 'medicine', name: 'Медицина', ability: 'wisdom' },
    { key: 'nature', name: 'Природа', ability: 'intelligence' },
    { key: 'perception', name: 'Восприятие', ability: 'wisdom' },
    { key: 'performance', name: 'Выступление', ability: 'charisma' },
    { key: 'persuasion', name: 'Убеждение', ability: 'charisma' },
    { key: 'religion', name: 'Религия', ability: 'intelligence' },
    { key: 'sleightOfHand', name: 'Ловкость рук', ability: 'dexterity' },
    { key: 'stealth', name: 'Скрытность', ability: 'dexterity' },
    { key: 'survival', name: 'Выживание', ability: 'wisdom' },
  ];

  const isProficient = (skill: string) => {
    if (!character || !character.skills) return false;
    return character.skills.includes(skill);
  };

  const getAbilityModifier = (abilityKey: string) => {
    if (!character || !character.abilities) return 0;
    const score = character.abilities[abilityKey] || 10;
    return getNumericModifier(score);
  };

  const getSkillModifier = (skill: { key: string, ability: string }) => {
    const abilityMod = getAbilityModifier(skill.ability);
    const profBonus = isProficient(skill.key) ? getProficiencyBonus(character?.level || 1) : 0;
    return abilityMod + profBonus;
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3">Навыки</h3>
        <div className="space-y-1">
          {skills.map((skill) => (
            <div 
              key={skill.key} 
              className="flex justify-between items-center py-1 px-2 hover:bg-primary/5 rounded-sm"
            >
              <div className="flex items-center gap-2">
                {isProficient(skill.key) && (
                  <Check className="h-3 w-3 text-primary" />
                )}
                <span className={`${isProficient(skill.key) ? 'font-medium' : ''}`}>
                  {skill.name}
                </span>
              </div>
              <div className="text-sm">
                {getModifierString(getSkillModifier(skill))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsPanel;
