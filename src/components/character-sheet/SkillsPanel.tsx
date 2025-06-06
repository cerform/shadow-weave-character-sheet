
import React from 'react';
import { Character } from '@/types/character';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getAbilityModifierValue } from '@/utils/abilityUtils';

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

  // Безопасное получение списка навыков, с которыми персонаж владеет
  const getSkillProficiencies = (): string[] => {
    if (!character.proficiencies) return [];
    
    if (Array.isArray(character.proficiencies)) {
      return character.proficiencies;
    }
    
    // Проверка наличия skills в объекте proficiencies
    if (typeof character.proficiencies === 'object' && character.proficiencies.skills) {
      return character.proficiencies.skills;
    }
    
    return [];
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
    const abilityMod = getAbilityModifierValue(abilityScore);
    
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
    
    // Обновляем персонажа - обрабатываем структуру proficiencies
    let updatedProficiencies: any = { ...(character.proficiencies || {}) };
    
    // Если proficiencies это массив, конвертируем его в объект
    if (Array.isArray(character.proficiencies)) {
      updatedProficiencies = {
        skills: character.proficiencies || []
      };
    }
    
    // Работаем с навыками
    let skillsList: string[] = [];
    
    // Безопасно получаем текущий список навыков
    if (Array.isArray(updatedProficiencies.skills)) {
      skillsList = [...updatedProficiencies.skills];
    } else if (Array.isArray(updatedProficiencies)) {
      skillsList = [...updatedProficiencies];
      // Преобразуем в объект с полем skills
      updatedProficiencies = { skills: skillsList };
    } else {
      updatedProficiencies.skills = updatedProficiencies.skills || [];
      skillsList = [...updatedProficiencies.skills];
    }
    
    if (!currentSkill.proficient) {
      // Добавляем навык в список владений
      skillsList.push(skillKey);
    } else {
      // Удаляем навык из списка владений
      skillsList = skillsList.filter(skill => skill !== skillKey);
    }
    
    // Обновляем список навыков в proficiencies
    updatedProficiencies.skills = skillsList;
    
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
