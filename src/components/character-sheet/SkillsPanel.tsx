
import React from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateModifier } from "@/utils/characterUtils";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { cn } from '@/lib/utils';

interface SkillsPanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Функция для определения бонуса навыка
const getSkillBonus = (
  character: Character,
  ability: keyof typeof abilityToSkillsMap,
  skillName: string
): number => {
  const abilityScore = character[ability] || character.abilities?.[ability] || 10;
  const abilityMod = calculateModifier(abilityScore);
  const profBonus = character.proficiencyBonus || Math.max(2, Math.floor((character.level - 1) / 4) + 2);
  
  // Проверка на владение навыком
  let isProficient = false;
  let isExpert = false;
  
  if (character.skills && skillName in character.skills) {
    const skillValue = character.skills[skillName];
    if (typeof skillValue === 'boolean') {
      isProficient = skillValue;
    } else if (skillValue && typeof skillValue === 'object' && 'proficient' in skillValue) {
      isProficient = Boolean(skillValue.proficient);
      // Проверка на экспертизу
      if ('expertise' in skillValue) {
        isExpert = Boolean(skillValue.expertise);
      }
    }
  }
  
  // Проверяем экспертизу в массиве expertise
  if (character.expertise && Array.isArray(character.expertise)) {
    isExpert = character.expertise.includes(skillName);
  }
  
  // Расчет бонуса навыка
  let bonus = abilityMod;
  if (isProficient) bonus += profBonus;
  if (isExpert) bonus += profBonus; // При экспертизе удваиваем бонус мастерства
  
  return bonus;
};

// Преобразование английской аббревиатуры в русское название характеристики
const abilityNameMap: Record<string, string> = {
  STR: 'Сила',
  DEX: 'Ловкость',
  CON: 'Телосложение',
  INT: 'Интеллект',
  WIS: 'Мудрость',
  CHA: 'Харизма',
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма'
};

// Соответствие характеристик и навыков
const abilityToSkillsMap = {
  STR: ['Атлетика'],
  DEX: ['Акробатика', 'Ловкость рук', 'Скрытность'],
  CON: [],
  INT: ['История', 'Магия', 'Религия', 'Природа', 'Расследование'],
  WIS: ['Восприятие', 'Выживание', 'Медицина', 'Проницательность', 'Уход за животными'],
  CHA: ['Выступление', 'Запугивание', 'Обман', 'Убеждение']
};

// Преобразование английского названия навыка в русское
const skillNameMap: Record<string, string> = {
  'athletics': 'Атлетика',
  'acrobatics': 'Акробатика',
  'sleight-of-hand': 'Ловкость рук',
  'stealth': 'Скрытность',
  'arcana': 'Магия',
  'history': 'История',
  'investigation': 'Расследование',
  'nature': 'Природа',
  'religion': 'Религия',
  'animal-handling': 'Уход за животными',
  'insight': 'Проницательность',
  'medicine': 'Медицина',
  'perception': 'Восприятие',
  'survival': 'Выживание',
  'deception': 'Обман',
  'intimidation': 'Запугивание',
  'performance': 'Выступление',
  'persuasion': 'Убеждение'
};

const SkillsPanel: React.FC<SkillsPanelProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Обработчик изменения владения навыком
  const handleToggleSkillProficiency = (skillName: string) => {
    const currentSkills = character.skills || {};
    const currentSkillValue = currentSkills[skillName];
    
    let newSkillValue;
    
    if (typeof currentSkillValue === 'boolean') {
      // Если текущее значение - boolean, просто меняем на противоположное
      newSkillValue = !currentSkillValue;
    } else if (typeof currentSkillValue === 'object' && currentSkillValue !== null) {
      // Если объект, меняем свойство proficient
      newSkillValue = {
        ...currentSkillValue,
        proficient: !((currentSkillValue as any).proficient)
      };
    } else {
      // Если значения нет, устанавливаем true
      newSkillValue = true;
    }
    
    const updatedSkills = {
      ...currentSkills,
      [skillName]: newSkillValue
    };
    
    onUpdate({ skills: updatedSkills });
  };

  // Обработчик изменения экспертизы в навыке
  const handleToggleExpertise = (skillName: string) => {
    // Получаем текущие expertise или инициализируем пустой массив
    const currentExpertise = Array.isArray(character.expertise) ? [...character.expertise] : [];
    
    // Проверяем, есть ли навык в списке экспертиз
    const hasExpertise = currentExpertise.includes(skillName);
    
    // Обновляем список экспертиз
    const updatedExpertise = hasExpertise
      ? currentExpertise.filter(skill => skill !== skillName)
      : [...currentExpertise, skillName];
    
    onUpdate({ expertise: updatedExpertise });
  };

  // Проверка, является ли навык экспертным
  const isSkillExpert = (skillName: string): boolean => {
    if (!character.expertise) return false;
    return Array.isArray(character.expertise) && character.expertise.includes(skillName);
  };

  // Проверка, владеет ли персонаж навыком
  const isSkillProficient = (skillName: string): boolean => {
    if (!character.skills) return false;
    
    const skillValue = character.skills[skillName];
    
    if (typeof skillValue === 'boolean') {
      return skillValue;
    } else if (skillValue && typeof skillValue === 'object') {
      return 'proficient' in skillValue ? Boolean(skillValue.proficient) : false;
    }
    
    return false;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <span style={{ color: currentTheme.textColor }}>Навыки</span>
          <Badge variant="outline" style={{ color: currentTheme.accent, borderColor: currentTheme.accent }}>
            Мастерство +{character.proficiencyBonus || 2}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Выводим навыки по группам характеристик */}
          {Object.entries(abilityToSkillsMap).map(([ability, skills]) => (
            <div key={ability} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: currentTheme.textColor }}>
                  {abilityNameMap[ability] || ability}
                </span>
                <span style={{ color: currentTheme.accent }}>
                  {calculateModifier(character[ability.toLowerCase() as keyof Character] as number || character.abilities?.[ability] || 10) >= 0 ? '+' : ''}
                  {calculateModifier(character[ability.toLowerCase() as keyof Character] as number || character.abilities?.[ability] || 10)}
                </span>
              </div>
              
              {skills.map(skill => {
                const skillBonus = getSkillBonus(character, ability as keyof typeof abilityToSkillsMap, skill);
                const isProficient = isSkillProficient(skill);
                const isExpert = isSkillExpert(skill);
                
                return (
                  <div 
                    key={skill} 
                    className="flex justify-between items-center pl-4 py-1 hover:bg-accent/10 rounded cursor-pointer"
                    onClick={() => handleToggleSkillProficiency(skill)}
                  >
                    <div className="flex items-center">
                      <span 
                        className={cn(
                          "text-sm",
                          isProficient && "font-medium"
                        )}
                        style={{ color: currentTheme.textColor }}
                      >
                        {skill}
                      </span>
                      {isProficient && (
                        <Badge 
                          variant="outline" 
                          className="ml-2 text-xs py-0 h-5"
                          style={{ 
                            borderColor: isExpert ? currentTheme.accent : currentTheme.mutedTextColor,
                            color: isExpert ? currentTheme.accent : currentTheme.mutedTextColor
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isProficient) handleToggleExpertise(skill);
                          }}
                        >
                          {isExpert ? 'Эксперт' : 'Владение'}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm" style={{ color: currentTheme.accent }}>
                      {skillBonus >= 0 ? '+' : ''}{skillBonus}
                    </span>
                  </div>
                );
              })}
              
              {skills.length > 0 && <Separator className="my-1" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsPanel;
