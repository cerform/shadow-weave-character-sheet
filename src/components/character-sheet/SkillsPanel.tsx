
import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { getAbilityScore } from '@/utils/characterNormalizer';
import { calculateAbilityModifier, formatModifier, calculateProficiencyBonusByLevel } from '@/utils/characterCalculations';
import { Zap, Target, Heart, Brain, Eye, Sparkles } from 'lucide-react';

interface SkillsPanelProps {
  character?: Character | null;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ character }) => {
  if (!character) {
    return (
      <Card className="rpg-panel">
        <CardHeader>
          <CardTitle className="font-fantasy-header text-glow">Навыки</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Персонаж не загружен</p>
        </CardContent>
      </Card>
    );
  }

  // Получаем значения характеристик
  const abilities = {
    strength: getAbilityScore(character, 'strength'),
    dexterity: getAbilityScore(character, 'dexterity'),
    constitution: getAbilityScore(character, 'constitution'),
    intelligence: getAbilityScore(character, 'intelligence'),
    wisdom: getAbilityScore(character, 'wisdom'),
    charisma: getAbilityScore(character, 'charisma')
  };

  const proficiencyBonus = calculateProficiencyBonusByLevel(character.level);

  // Определение навыков и их связанных характеристик
  const skills = [
    { key: 'acrobatics', name: 'Акробатика', ability: 'dexterity', short: 'ЛОВ' },
    { key: 'animal_handling', name: 'Обращение с животными', ability: 'wisdom', short: 'МУД' },
    { key: 'arcana', name: 'Магия', ability: 'intelligence', short: 'ИНТ' },
    { key: 'athletics', name: 'Атлетика', ability: 'strength', short: 'СИЛ' },
    { key: 'deception', name: 'Обман', ability: 'charisma', short: 'ХАР' },
    { key: 'history', name: 'История', ability: 'intelligence', short: 'ИНТ' },
    { key: 'insight', name: 'Проницательность', ability: 'wisdom', short: 'МУД' },
    { key: 'intimidation', name: 'Запугивание', ability: 'charisma', short: 'ХАР' },
    { key: 'investigation', name: 'Расследование', ability: 'intelligence', short: 'ИНТ' },
    { key: 'medicine', name: 'Медицина', ability: 'wisdom', short: 'МУД' },
    { key: 'nature', name: 'Природа', ability: 'intelligence', short: 'ИНТ' },
    { key: 'perception', name: 'Восприятие', ability: 'wisdom', short: 'МУД' },
    { key: 'performance', name: 'Выступление', ability: 'charisma', short: 'ХАР' },
    { key: 'persuasion', name: 'Убеждение', ability: 'charisma', short: 'ХАР' },
    { key: 'religion', name: 'Религия', ability: 'intelligence', short: 'ИНТ' },
    { key: 'sleight_of_hand', name: 'Ловкость рук', ability: 'dexterity', short: 'ЛОВ' },
    { key: 'stealth', name: 'Скрытность', ability: 'dexterity', short: 'ЛОВ' },
    { key: 'survival', name: 'Выживание', ability: 'wisdom', short: 'МУД' }
  ];

  // Проверяем владение навыком
  const isSkillProficient = (skillKey: string): boolean => {
    // Проверяем в proficiencies
    if (character.proficiencies) {
      if (Array.isArray(character.proficiencies)) {
        return character.proficiencies.includes(skillKey);
      }
      if (character.proficiencies.skills && Array.isArray(character.proficiencies.skills)) {
        return character.proficiencies.skills.includes(skillKey);
      }
    }
    
    // Проверяем в skills
    if (character.skills && character.skills[skillKey]) {
      return character.skills[skillKey].proficient || false;
    }
    
    return false;
  };

  // Рассчитываем модификатор навыка
  const getSkillModifier = (skill: any): number => {
    const abilityScore = abilities[skill.ability as keyof typeof abilities];
    const abilityModifier = calculateAbilityModifier(abilityScore);
    const isProficient = isSkillProficient(skill.key);
    
    return abilityModifier + (isProficient ? proficiencyBonus : 0);
  };

  return (
    <Card className="rpg-panel-elevated">
      <CardHeader className="pb-4">
        <CardTitle className="font-fantasy-header text-glow flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Навыки
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {skills.map((skill) => {
            const isProficient = isSkillProficient(skill.key);
            const modifier = getSkillModifier(skill);
            
            return (
              <div 
                key={skill.key} 
                className="flex items-center justify-between p-2 rounded-lg bg-card/50 border border-border/30 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={isProficient}
                    disabled
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1">
                    <div className="font-fantasy-body text-sm">
                      {skill.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({skill.short})
                    </div>
                  </div>
                </div>
                
                <Badge 
                  variant={isProficient ? "default" : "secondary"}
                  className="font-fantasy-header font-bold min-w-[3rem] justify-center"
                >
                  {formatModifier(modifier)}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsPanel;
