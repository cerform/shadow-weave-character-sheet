
import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAbilityModifier, calculateProficiencyBonus } from '@/utils/characterUtils';
import { Check, Plus, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AbilitiesTabProps {
  character: Character;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character }) => {
  const { updateCharacter } = useCharacter();
  
  // Список характеристик
  const abilities = [
    { key: 'strength', name: 'Сила', short: 'СИЛ', skills: ['Атлетика'] },
    { key: 'dexterity', name: 'Ловкость', short: 'ЛОВ', skills: ['Акробатика', 'Ловкость рук', 'Скрытность'] },
    { key: 'constitution', name: 'Телосложение', short: 'ТЕЛ', skills: [] },
    { key: 'intelligence', name: 'Интеллект', short: 'ИНТ', skills: ['Анализ', 'История', 'Магия', 'Природа', 'Религия'] },
    { key: 'wisdom', name: 'Мудрость', short: 'МДР', skills: ['Внимательность', 'Выживание', 'Медицина', 'Проницательность', 'Уход за животными'] },
    { key: 'charisma', name: 'Харизма', short: 'ХАР', skills: ['Запугивание', 'Обман', 'Переговоры', 'Выступление'] },
  ];
  
  // Список всех навыков
  const allSkills = [
    { name: 'Атлетика', ability: 'strength' },
    { name: 'Акробатика', ability: 'dexterity' },
    { name: 'Ловкость рук', ability: 'dexterity' },
    { name: 'Скрытность', ability: 'dexterity' },
    { name: 'Анализ', ability: 'intelligence' },
    { name: 'История', ability: 'intelligence' },
    { name: 'Магия', ability: 'intelligence' },
    { name: 'Природа', ability: 'intelligence' },
    { name: 'Религия', ability: 'intelligence' },
    { name: 'Внимательность', ability: 'wisdom' },
    { name: 'Выживание', ability: 'wisdom' },
    { name: 'Медицина', ability: 'wisdom' },
    { name: 'Проницательность', ability: 'wisdom' },
    { name: 'Уход за животными', ability: 'wisdom' },
    { name: 'Запугивание', ability: 'charisma' },
    { name: 'Обман', ability: 'charisma' },
    { name: 'Переговоры', ability: 'charisma' },
    { name: 'Выступление', ability: 'charisma' },
  ];
  
  // Инициализация состояний
  const [savingThrows, setSavingThrows] = useState<string[]>([]);
  const [skillProficiencies, setSkillProficiencies] = useState<string[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [skillBonuses, setSkillBonuses] = useState<Record<string, number>>({});
  
  // Загрузка данных из персонажа
  useEffect(() => {
    // Загрузка владения спасбросками
    const savingThrowProficiencies = character.savingThrowProficiencies || [];
    setSavingThrows(savingThrowProficiencies);
    
    // Загрузка владения навыками
    let skills: string[] = [];
    if (character.proficiencies && typeof character.proficiencies === 'object' && 'skills' in character.proficiencies) {
      skills = character.proficiencies.skills || [];
    } else if (character.skillProficiencies) {
      skills = character.skillProficiencies;
    }
    setSkillProficiencies(skills);
    
    // Загрузка экспертизы
    setExpertise(character.expertise || []);
    
    // Загрузка бонусов навыков
    setSkillBonuses(character.skillBonuses || {});
  }, [character]);
  
  // Изменение владения спасброском
  const toggleSavingThrow = (ability: string) => {
    if (savingThrows.includes(ability)) {
      updateCharacter({
        savingThrowProficiencies: savingThrows.filter(a => a !== ability)
      });
    } else {
      updateCharacter({
        savingThrowProficiencies: [...savingThrows, ability]
      });
    }
  };
  
  // Изменение владения навыком
  const toggleSkillProficiency = (skill: string) => {
    if (skillProficiencies.includes(skill)) {
      updateCharacter({
        skillProficiencies: skillProficiencies.filter(s => s !== skill)
      });
      
      if (expertise.includes(skill)) {
        updateCharacter({
          expertise: expertise.filter(s => s !== skill)
        });
      }
    } else {
      updateCharacter({
        skillProficiencies: [...skillProficiencies, skill]
      });
    }
  };
  
  // Изменение экспертизы навыка
  const toggleExpertise = (skill: string) => {
    if (!skillProficiencies.includes(skill)) return; // Нельзя иметь экспертизу без владения
    
    if (expertise.includes(skill)) {
      updateCharacter({
        expertise: expertise.filter(s => s !== skill)
      });
    } else {
      updateCharacter({
        expertise: [...expertise, skill]
      });
    }
  };
  
  // Изменение бонуса навыка
  const updateSkillBonus = (skill: string, value: number) => {
    const updatedBonuses = { ...skillBonuses, [skill]: value };
    updateCharacter({
      skillBonuses: updatedBonuses
    });
  };
  
  // Расчёт бонуса характеристики
  const getAbilityBonus = (abilityKey: string) => {
    const value = character[abilityKey as keyof Character] as number || 
                character.abilities?.[abilityKey as keyof typeof character.abilities] || 10;
    return getAbilityModifier(value);
  };
  
  // Расчёт бонуса спасброска
  const getSavingThrowBonus = (ability: string) => {
    const abilityBonus = getAbilityBonus(ability);
    const profBonus = calculateProficiencyBonus(character.level);
    
    if (savingThrows.includes(ability)) {
      return abilityBonus + profBonus;
    }
    
    return abilityBonus;
  };
  
  // Расчёт бонуса навыка
  const getSkillBonus = (skill: string, abilityKey: string) => {
    const abilityBonus = getAbilityBonus(abilityKey);
    const profBonus = calculateProficiencyBonus(character.level);
    const customBonus = skillBonuses[skill] || 0;
    
    let total = abilityBonus + customBonus;
    
    if (expertise.includes(skill)) {
      total += profBonus * 2;
    } else if (skillProficiencies.includes(skill)) {
      total += profBonus;
    }
    
    return total;
  };
  
  return (
    <div className="space-y-6">
      {/* Характеристики */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-4">Характеристики</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {abilities.map(ability => {
              const value = character[ability.key as keyof Character] as number || 
                          character.abilities?.[ability.key as keyof typeof character.abilities] || 10;
              const modifier = getAbilityModifier(value);
              const modifierDisplay = modifier >= 0 ? `+${modifier}` : `${modifier}`;
              
              return (
                <div key={ability.key} className="text-center border rounded-lg p-3">
                  <div className="text-sm text-gray-500">{ability.name}</div>
                  <div className="text-3xl font-bold my-1">{value}</div>
                  <div className="bg-accent/20 rounded-md py-1">{modifierDisplay}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Спасброски */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-4">Спасброски</h3>
          
          <div className="space-y-3">
            {abilities.map(ability => {
              const bonus = getSavingThrowBonus(ability.key);
              const bonusDisplay = bonus >= 0 ? `+${bonus}` : `${bonus}`;
              const isProficient = savingThrows.includes(ability.key);
              
              return (
                <div key={`save-${ability.key}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      id={`save-${ability.key}`}
                      checked={isProficient}
                      onCheckedChange={() => toggleSavingThrow(ability.key)}
                      className="mr-2"
                    />
                    <Label 
                      htmlFor={`save-${ability.key}`}
                      className={`${isProficient ? 'font-medium' : ''} cursor-pointer`}
                    >
                      {ability.name}
                    </Label>
                  </div>
                  <div className="font-medium">{bonusDisplay}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Навыки */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-4">Навыки</h3>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {allSkills.map(skill => {
                const abilityKey = skill.ability;
                const ability = abilities.find(a => a.key === abilityKey);
                const isProficient = skillProficiencies.includes(skill.name);
                const isExpert = expertise.includes(skill.name);
                const bonus = getSkillBonus(skill.name, abilityKey);
                const bonusDisplay = bonus >= 0 ? `+${bonus}` : `${bonus}`;
                
                return (
                  <div key={`skill-${skill.name}`} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex space-x-2 mr-3 items-center">
                        {/* Владение */}
                        <Checkbox
                          id={`prof-${skill.name}`}
                          checked={isProficient}
                          onCheckedChange={() => toggleSkillProficiency(skill.name)}
                          className="mr-1"
                        />
                        
                        {/* Экспертиза */}
                        <Checkbox
                          id={`exp-${skill.name}`}
                          checked={isExpert}
                          onCheckedChange={() => toggleExpertise(skill.name)}
                          disabled={!isProficient}
                          className={`${!isProficient ? 'opacity-50' : ''}`}
                        />
                      </div>
                      
                      <Label 
                        htmlFor={`prof-${skill.name}`}
                        className={`${isProficient ? 'font-medium' : ''} cursor-pointer flex-1`}
                      >
                        {skill.name} <span className="text-gray-500 text-sm">({ability?.short})</span>
                      </Label>
                    </div>
                    
                    {/* Бонус навыка */}
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 p-0"
                        onClick={() => updateSkillBonus(skill.name, (skillBonuses[skill.name] || 0) - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="font-medium w-10 text-center">{bonusDisplay}</div>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6 p-0"
                        onClick={() => updateSkillBonus(skill.name, (skillBonuses[skill.name] || 0) + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbilitiesTab;
