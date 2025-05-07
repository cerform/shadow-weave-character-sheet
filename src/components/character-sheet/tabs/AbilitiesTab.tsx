import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getAbilityModifier, getAbilityModifierString } from '@/utils/abilityUtils';

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const ABILITIES = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
};

const ABILITY_SKILLS = {
  strength: ['athletics'],
  dexterity: ['acrobatics', 'sleight-of-hand', 'stealth'],
  intelligence: ['arcana', 'history', 'investigation', 'nature', 'religion'],
  wisdom: ['animal-handling', 'insight', 'medicine', 'perception', 'survival'],
  charisma: ['deception', 'intimidation', 'performance', 'persuasion'],
};

const SKILL_NAMES = {
  athletics: 'Атлетика',
  acrobatics: 'Акробатика',
  'sleight-of-hand': 'Ловкость рук',
  stealth: 'Скрытность',
  arcana: 'Магия',
  history: 'История',
  investigation: 'Анализ',
  nature: 'Природа',
  religion: 'Религия',
  'animal-handling': 'Уход за животными',
  insight: 'Проницательность',
  medicine: 'Медицина',
  perception: 'Восприятие',
  survival: 'Выживание',
  deception: 'Обман',
  intimidation: 'Запугивание',
  performance: 'Выступление',
  persuasion: 'Убеждение',
};

// Вспомогательная функция для определения зависимости навыка от характеристики
const getSkillAbility = (skill: string): string => {
  for (const [ability, skills] of Object.entries(ABILITY_SKILLS)) {
    if ((skills as string[]).includes(skill)) {
      return ability;
    }
  }
  return '';
};

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const [tab, setTab] = useState('abilities');
  
  // Обработчик изменения значения характеристики
  const handleAbilityChange = useCallback((ability: string, value: number) => {
    onUpdate({
      stats: {
        ...character.stats,
        [ability]: value,
      },
    });
  }, [character.stats, onUpdate]);
  
  // Обработчик изменения владения спасброском
  const handleSavingThrowChange = useCallback((ability: string, value: boolean) => {
    // Инициализация объекта savingThrowProficiencies, если он не существует
    const savingThrowProficiencies = character.savingThrowProficiencies || {};
    
    if (value) {
      onUpdate({
        savingThrowProficiencies: {
          ...savingThrowProficiencies,
          [ability]: true,
        },
      });
    } else {
      // Создаем новый объект без этого свойства
      const newSavingThrows = { ...savingThrowProficiencies };
      delete newSavingThrows[ability];
      onUpdate({ savingThrowProficiencies: newSavingThrows });
    }
  }, [character.savingThrowProficiencies, onUpdate]);
  
  // Обработчик изменения владения навыком
  const handleSkillProficiencyChange = useCallback((skill: string, value: boolean) => {
    // Инициализация массива skillProficiencies, если он не существует
    const skillProficiencies = character.skillProficiencies || [];
    
    if (value) {
      // Добавляем навык в массив, если его там нет
      if (!skillProficiencies.includes(skill)) {
        onUpdate({ skillProficiencies: [...skillProficiencies, skill] });
      }
    } else {
      // Удаляем навык из массива
      onUpdate({ skillProficiencies: skillProficiencies.filter(s => s !== skill) });
    }
  }, [character.skillProficiencies, onUpdate]);
  
  // Обработчик изменения мастерства
  const handleExpertiseChange = useCallback((skill: string, value: boolean) => {
    // Инициализация массива expertise, если он не существует
    const expertise = character.expertise || [];
    
    if (value) {
      // Добавляем навык в массив мастерства, если его там нет
      if (!expertise.includes(skill)) {
        onUpdate({ expertise: [...expertise, skill] });
      }
    } else {
      // Удаляем навык из массива мастерства
      onUpdate({ expertise: expertise.filter(s => s !== skill) });
    }
  }, [character.expertise, onUpdate]);
  
  // Обработчик изменения бонуса навыка
  const handleSkillBonusChange = useCallback((skill: string, value: string) => {
    // Инициализация объекта skillBonuses, если он не существует
    const skillBonuses = character.skillBonuses || {};
    
    // Преобразуем строку в число или используем 0, если строка пустая
    const numericValue = value === '' ? 0 : parseInt(value);
    
    onUpdate({
      skillBonuses: {
        ...skillBonuses,
        [skill]: isNaN(numericValue) ? 0 : numericValue,
      },
    });
  }, [character.skillBonuses, onUpdate]);
  
  // Получение модификатора характеристики
  const getModifier = useCallback((ability: string): number => {
    const value = character.stats?.[ability as keyof typeof character.stats];
    return getAbilityModifier(value || 10);
  }, [character.stats]);
  
  // Получение строки модификатора характеристики
  const getModifierString = useCallback((ability: string): string => {
    return getAbilityModifierString(getModifier(ability));
  }, [getModifier]);
  
  // Проверка, владеет ли персонаж спасброском
  const hasSavingThrowProficiency = useCallback((ability: string): boolean => {
    const proficiencies = character.savingThrowProficiencies || {};
    return !!proficiencies[ability];
  }, [character.savingThrowProficiencies]);
  
  // Получение бонуса спасброска
  const getSavingThrowBonus = useCallback((ability: string): number => {
    const base = getModifier(ability);
    const profBonus = character.proficiencyBonus || 0;
    return base + (hasSavingThrowProficiency(ability) ? profBonus : 0);
  }, [getModifier, hasSavingThrowProficiency, character.proficiencyBonus]);
  
  // Получение строки бонуса спасброска
  const getSavingThrowBonusString = useCallback((ability: string): string => {
    const bonus = getSavingThrowBonus(ability);
    return bonus >= 0 ? `+${bonus}` : `${bonus}`;
  }, [getSavingThrowBonus]);
  
  // Проверка, владеет ли персонаж навыком
  const hasSkillProficiency = useCallback((skill: string): boolean => {
    const proficiencies = character.skillProficiencies || [];
    return proficiencies.includes(skill);
  }, [character.skillProficiencies]);
  
  // Проверка, имеет ли персонаж мастерство в навыке
  const hasExpertise = useCallback((skill: string): boolean => {
    const expertiseList = character.expertise || [];
    return expertiseList.includes(skill);
  }, [character.expertise]);
  
  // Получение дополнительного бонуса навыка
  const getSkillBonus = useCallback((skill: string): number => {
    const bonuses = character.skillBonuses || {};
    return bonuses[skill] || 0;
  }, [character.skillBonuses]);
  
  // Получение полного бонуса навыка
  const getTotalSkillBonus = useCallback((skill: string): number => {
    const ability = getSkillAbility(skill);
    const base = getModifier(ability);
    const profBonus = character.proficiencyBonus || 0;
    const extraBonus = getSkillBonus(skill);
    
    let total = base + extraBonus;
    
    if (hasSkillProficiency(skill)) {
      total += profBonus;
    }
    
    if (hasExpertise(skill)) {
      total += profBonus;
    }
    
    return total;
  }, [getModifier, hasSkillProficiency, hasExpertise, getSkillBonus, character.proficiencyBonus]);
  
  // Получение строки полного бонуса навыка
  const getTotalSkillBonusString = useCallback((skill: string): string => {
    const bonus = getTotalSkillBonus(skill);
    return bonus >= 0 ? `+${bonus}` : `${bonus}`;
  }, [getTotalSkillBonus]);
  
  return (
    <div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="abilities">Характеристики</TabsTrigger>
          <TabsTrigger value="saving-throws">Спасброски</TabsTrigger>
          <TabsTrigger value="skills">Навыки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="abilities">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Object.entries(ABILITIES).map(([key, name]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-lg font-medium">
                      {name} ({key.substring(0, 3).toUpperCase()})
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id={key}
                        type="number"
                        min="1"
                        max="30"
                        className="w-16 text-center"
                        value={character.stats?.[key as keyof typeof character.stats] || 10}
                        onChange={e => handleAbilityChange(key, parseInt(e.target.value))}
                      />
                      <span className="text-lg font-semibold min-w-[40px] text-center">
                        {getModifierString(key)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saving-throws">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Object.entries(ABILITIES).map(([key, name]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`save-${key}`}
                        checked={hasSavingThrowProficiency(key)}
                        onCheckedChange={checked => handleSavingThrowChange(key, !!checked)}
                      />
                      <Label htmlFor={`save-${key}`}>{name}</Label>
                    </div>
                    <span className="font-semibold">{getSavingThrowBonusString(key)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Object.entries(SKILL_NAMES).map(([skill, name]) => {
                  const ability = getSkillAbility(skill);
                  const abilityAbbr = ability.substring(0, 3).toUpperCase();
                  
                  return (
                    <div key={skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center mr-1">
                          <Checkbox
                            id={`skill-${skill}`}
                            checked={hasSkillProficiency(skill)}
                            onCheckedChange={checked => handleSkillProficiencyChange(skill, !!checked)}
                          />
                          <div className="h-2"></div>
                          <Checkbox
                            id={`expertise-${skill}`}
                            checked={hasExpertise(skill)}
                            onCheckedChange={checked => handleExpertiseChange(skill, !!checked)}
                            disabled={!hasSkillProficiency(skill)}
                          />
                        </div>
                        <Label htmlFor={`skill-${skill}`} className="flex-grow">
                          {name} <span className="text-muted-foreground">({abilityAbbr})</span>
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`bonus-${skill}`}
                          type="number"
                          className="w-12 text-center"
                          value={getSkillBonus(skill)}
                          onChange={e => handleSkillBonusChange(skill, e.target.value)}
                        />
                        <span className="font-semibold min-w-[40px] text-center">
                          {getTotalSkillBonusString(skill)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AbilitiesTab;
