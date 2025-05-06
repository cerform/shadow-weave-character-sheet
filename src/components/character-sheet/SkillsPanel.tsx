import React from 'react';
import { Character } from '@/types/character';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getAbilityModifier } from '@/utils/characterUtils';

interface SkillsPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ character, onUpdate }) => {
  const { toast } = useToast();

  // Группировка навыков по характеристикам
  const skillsByAbility = {
    strength: ['athletics'],
    dexterity: ['acrobatics', 'sleight_of_hand', 'stealth'],
    intelligence: ['arcana', 'history', 'investigation', 'nature', 'religion'],
    wisdom: ['animal_handling', 'insight', 'medicine', 'perception', 'survival'],
    charisma: ['deception', 'intimidation', 'performance', 'persuasion']
  };

  // Преобразование навыков из snake_case в читаемый формат
  const getSkillDisplayName = (skillKey: string): string => {
    const nameMap: Record<string, string> = {
      athletics: 'Атлетика',
      acrobatics: 'Акробатика',
      sleight_of_hand: 'Ловкость рук',
      stealth: 'Скрытность',
      arcana: 'Магия',
      history: 'История',
      investigation: 'Расследование',
      nature: 'Природа',
      religion: 'Религия',
      animal_handling: 'Уход за животными',
      insight: 'Проницательность',
      medicine: 'Медицина',
      perception: 'Восприятие',
      survival: 'Выживание',
      deception: 'Обман',
      intimidation: 'Запугивание',
      performance: 'Выступление',
      persuasion: 'Убеждение'
    };
    return nameMap[skillKey] || skillKey;
  };

  const toggleProficiency = (skillKey: string) => {
    // Получаем текущее значение навыка
    const currentSkills = character.skills || {};
    const currentSkill = currentSkills[skillKey] || { proficient: false };
    
    // Определяем, к какой характеристике относится навык
    const ability = Object.entries(skillsByAbility)
      .find(([_, skills]) => skills.includes(skillKey))?.[0] || 'dexterity';
    
    // Получаем модификатор характеристики
    const abilityScore = character.stats?.[ability as keyof typeof character.stats] || 10;
    const abilityMod = getAbilityModifier(abilityScore);
    
    // Вычисляем значение навыка
    const profBonus = character.proficiencyBonus || 2;
    let skillValue = abilityMod;
    
    if (!currentSkill.proficient) {
      skillValue += profBonus;
    }
    
    // Обновляем состояние навыка
    const updatedSkills = {
      ...currentSkills,
      [skillKey]: {
        ...currentSkill,
        proficient: !currentSkill.proficient,
        value: !currentSkill.proficient ? abilityMod + profBonus : abilityMod,
        bonus: !currentSkill.proficient ? abilityMod + profBonus : abilityMod
      }
    };
    
    // Обновляем персонажа
    let updatedProficiencies = { 
      ...character.proficiencies
    };
    
    // Проверяем тип proficiencies и обновляем соответственно
    if (typeof updatedProficiencies === 'object' && !Array.isArray(updatedProficiencies)) {
      // Создаем массив навыков, если его нет
      const skillsList = updatedProficiencies.skills || [];
      
      if (!currentSkill.proficient) {
        // Добавляем навык в список владений
        updatedProficiencies = {
          ...updatedProficiencies,
          skills: [...skillsList, skillKey]
        };
      } else {
        // Удаляем навык из списка владений
        updatedProficiencies = {
          ...updatedProficiencies,
          skills: skillsList.filter(skill => skill !== skillKey)
        };
      }
    }
    
    onUpdate({
      skills: updatedSkills,
      proficiencies: updatedProficiencies
    });
    
    // Показываем уведомление
    toast({
      title: `Навык ${getSkillDisplayName(skillKey)}`,
      description: !currentSkill.proficient 
        ? "Добавлен в список владений" 
        : "Удален из списка владений",
    });
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Навыки</h3>
      
      <div className="space-y-6">
        {Object.entries(skillsByAbility).map(([ability, skills]) => (
          <div key={ability} className="space-y-2">
            <h4 className="text-md font-medium capitalize">{ability === 'strength' ? 'Сила' 
              : ability === 'dexterity' ? 'Ловкость'
              : ability === 'constitution' ? 'Телосложение'
              : ability === 'intelligence' ? 'Интеллект'
              : ability === 'wisdom' ? 'Мудрость'
              : 'Харизма'}</h4>
            
            {skills.map(skillKey => {
              const skillInfo = character.skills?.[skillKey] || { proficient: false };
              return (
                <div key={skillKey} className="flex items-center justify-between">
                  <span>{getSkillDisplayName(skillKey)}</span>
                  <div className="flex items-center gap-4">
                    <span>{skillInfo.proficient ? '+' : ''}</span>
                    <Switch
                      checked={skillInfo.proficient}
                      onCheckedChange={() => toggleProficiency(skillKey)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SkillsPanel;
