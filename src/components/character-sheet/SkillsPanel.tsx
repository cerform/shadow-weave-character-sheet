
import React from 'react';
import { Card } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useCharacter } from '@/contexts/CharacterContext';
import { Badge } from "@/components/ui/badge";

interface SkillsPanelProps {
  character?: any;
}

export const SkillsPanel = ({ character }: SkillsPanelProps) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const { updateCharacter } = useCharacter();
  
  // Функция для вычисления модификатора характеристики
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  
  // Список всех навыков и связанных с ними характеристик
  const skills = [
    { name: 'Акробатика', ability: 'DEX', rus: 'Акробатика' },
    { name: 'Анализ', ability: 'INT', rus: 'Анализ' },
    { name: 'Атлетика', ability: 'STR', rus: 'Атлетика' },
    { name: 'Восприятие', ability: 'WIS', rus: 'Восприятие' },
    { name: 'Выживание', ability: 'WIS', rus: 'Выживание' },
    { name: 'Выступление', ability: 'CHA', rus: 'Выступление' },
    { name: 'Запугивание', ability: 'CHA', rus: 'Запугивание' },
    { name: 'История', ability: 'INT', rus: 'История' },
    { name: 'Ловкость рук', ability: 'DEX', rus: 'Ловкость рук' },
    { name: 'Магия', ability: 'INT', rus: 'Магия' },
    { name: 'Медицина', ability: 'WIS', rus: 'Медицина' },
    { name: 'Обман', ability: 'CHA', rus: 'Обман' },
    { name: 'Природа', ability: 'INT', rus: 'Природа' },
    { name: 'Проницательность', ability: 'WIS', rus: 'Проницательность' },
    { name: 'Религия', ability: 'INT', rus: 'Религия' },
    { name: 'Скрытность', ability: 'DEX', rus: 'Скрытность' },
    { name: 'Убеждение', ability: 'CHA', rus: 'Убеждение' },
    { name: 'Уход за животными', ability: 'WIS', rus: 'Уход за животными' }
  ];

  // Получить модификатор навыка
  const getSkillModifier = (skill: typeof skills[0]) => {
    if (!character || !character.abilities) return '+0';
    
    const abilityScore = character.abilities[skill.ability] || 10;
    const baseModifier = Math.floor((abilityScore - 10) / 2);
    
    // Проверяем, есть ли у персонажа владение этим навыком
    const proficient = character.skillProficiencies && 
                       character.skillProficiencies[skill.name];
                       
    // Бонус мастерства зависит от уровня
    const profBonus = character.level ? Math.ceil(1 + (character.level / 4)) : 2;
    
    // Если есть владение, добавляем бонус мастерства
    const modifier = proficient ? baseModifier + profBonus : baseModifier;
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };
  
  // Изменить владение навыком
  const toggleProficiency = (skillName: string) => {
    if (!character) return;
    
    const currentProficiencies = character.skillProficiencies || {};
    const newProficiencies = { 
      ...currentProficiencies,
      [skillName]: !currentProficiencies[skillName]
    };
    
    updateCharacter({ 
      skillProficiencies: newProficiencies 
    });
  };

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.textColor }}>
        Навыки
      </h3>
      
      <div className="space-y-2">
        {skills.map((skill) => {
          const modifier = getSkillModifier(skill);
          const isProficient = character?.skillProficiencies?.[skill.name] || false;
          const isPositiveModifier = !modifier.includes('-');
          
          return (
            <div 
              key={skill.name} 
              className="flex justify-between items-center p-2 hover:bg-black/20 rounded cursor-pointer"
              onClick={() => toggleProficiency(skill.name)}
            >
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2" style={{ color: currentTheme.textColor }}>
                  {skill.rus} 
                </span>
                <span className="text-xs opacity-70" style={{ color: currentTheme.mutedTextColor }}>
                  ({skill.ability})
                </span>
              </div>
              
              <div className="flex items-center">
                {isProficient && (
                  <Badge 
                    variant="outline" 
                    className="mr-2 bg-primary/20"
                    style={{ color: currentTheme.accent }}
                  >
                    ✓
                  </Badge>
                )}
                <span 
                  className={`px-2 py-1 rounded text-sm ${
                    isPositiveModifier ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                  }`}
                >
                  {modifier}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
