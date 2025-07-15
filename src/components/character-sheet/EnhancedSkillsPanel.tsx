import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Character } from '@/types/character';
import { getAbilityScore } from '@/utils/characterNormalizer';
import { 
  calculateAbilityModifier, 
  formatModifier, 
  calculateProficiencyBonusByLevel,
  skillDefinitions 
} from '@/utils/characterCalculations';

interface SkillsPanelProps {
  character?: Character | null;
  onUpdate?: (updates: Partial<Character>) => void;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ character, onUpdate }) => {
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

  const proficiencyBonus = calculateProficiencyBonusByLevel(character.level);

  // Получаем значения характеристик
  const abilities = {
    strength: getAbilityScore(character, 'strength'),
    dexterity: getAbilityScore(character, 'dexterity'),
    constitution: getAbilityScore(character, 'constitution'),
    intelligence: getAbilityScore(character, 'intelligence'),
    wisdom: getAbilityScore(character, 'wisdom'),
    charisma: getAbilityScore(character, 'charisma')
  };

  // Функция для получения состояния навыка
  const getSkillInfo = (skillName: string) => {
    const skills = character.skills || {};
    const proficiencies = character.proficiencies;
    
    // Проверяем разные форматы хранения владения навыками
    let isProficient = false;
    
    if (skills[skillName]?.proficient) {
      isProficient = true;
    } else if (Array.isArray(proficiencies)) {
      isProficient = proficiencies.includes(skillName);
    } else if (proficiencies?.skills && Array.isArray(proficiencies.skills)) {
      isProficient = proficiencies.skills.includes(skillName);
    }
    
    return {
      proficient: isProficient,
      expertise: skills[skillName]?.expertise || false
    };
  };

  // Функция для расчета бонуса навыка
  const calculateSkillBonus = (abilityName: string, skillName: string) => {
    const abilityScore = abilities[abilityName as keyof typeof abilities];
    const abilityModifier = calculateAbilityModifier(abilityScore);
    const skillInfo = getSkillInfo(skillName);
    
    let bonus = abilityModifier;
    
    if (skillInfo.proficient) {
      bonus += proficiencyBonus;
    }
    
    if (skillInfo.expertise) {
      bonus += proficiencyBonus; // Экспертиза удваивает бонус мастерства
    }
    
    return bonus;
  };

  // Обработчик изменения владения навыком
  const handleSkillToggle = (skillName: string, abilityName: string) => {
    if (!onUpdate) return;
    
    const currentSkills = character.skills || {};
    const currentSkillInfo = getSkillInfo(skillName);
    
    const updatedSkills = {
      ...currentSkills,
      [skillName]: {
        ...currentSkills[skillName],
        proficient: !currentSkillInfo.proficient,
        expertise: currentSkillInfo.expertise
      }
    };
    
    onUpdate({ skills: updatedSkills });
  };

  // Группируем навыки по характеристикам
  const skillsByAbility = skillDefinitions.reduce((acc, skill) => {
    const abilityKey = skill.ability as keyof typeof abilities;
    if (!acc[abilityKey]) {
      acc[abilityKey] = [];
    }
    acc[abilityKey].push(skill);
    return acc;
  }, {} as Record<string, typeof skillDefinitions[number][]>);

  const abilityNames = {
    strength: 'Сила',
    dexterity: 'Ловкость', 
    constitution: 'Телосложение',
    intelligence: 'Интеллект',
    wisdom: 'Мудрость',
    charisma: 'Харизма'
  };

  return (
    <Card className="rpg-panel-elevated">
      <CardHeader className="pb-4">
        <CardTitle className="font-fantasy-header text-glow">Навыки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(skillsByAbility).map(([abilityKey, skills]) => (
          <div key={abilityKey} className="space-y-3">
            <h4 className="font-fantasy-header text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {abilityNames[abilityKey as keyof typeof abilityNames]} 
              <span className="text-xs ml-2">
                ({formatModifier(calculateAbilityModifier(abilities[abilityKey as keyof typeof abilities]))})
              </span>
            </h4>
            
            <div className="space-y-2">
              {skills.map((skill) => {
                const skillInfo = getSkillInfo(skill.englishName.toLowerCase().replace(/\s+/g, '_'));
                const skillBonus = calculateSkillBonus(abilityKey, skill.englishName.toLowerCase().replace(/\s+/g, '_'));
                
                return (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={skillInfo.proficient}
                        onCheckedChange={() => handleSkillToggle(
                          skill.englishName.toLowerCase().replace(/\s+/g, '_'), 
                          abilityKey
                        )}
                        disabled={!onUpdate}
                      />
                      <div className="flex flex-col">
                        <span className="font-fantasy-body text-sm">
                          {skill.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({skill.englishName})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {skillInfo.expertise && (
                        <Badge variant="secondary" className="text-xs">
                          Экспертиза
                        </Badge>
                      )}
                      <Badge 
                        variant={skillInfo.proficient ? "default" : "outline"}
                        className="font-fantasy-header"
                      >
                        {formatModifier(skillBonus)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Пассивные навыки */}
        <div className="border-t border-border/50 pt-4 mt-6">
          <h4 className="font-fantasy-header text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Пассивные навыки
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between">
              <span className="text-sm font-fantasy-body">Пассивное Восприятие</span>
              <Badge variant="outline">
                {10 + calculateSkillBonus('wisdom', 'perception')}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-fantasy-body">Пассивный Анализ</span>
              <Badge variant="outline">
                {10 + calculateSkillBonus('intelligence', 'investigation')}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsPanel;