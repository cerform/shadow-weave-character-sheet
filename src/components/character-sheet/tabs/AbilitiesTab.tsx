
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Character } from '@/types/character';
import { calculateModifier, getAbilityNameFull } from '@/utils/abilityUtils';
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import AbilityScoreBox from "../AbilityScoreBox";
import { updateCharacterProficiencyBonus } from '@/utils/characterUtils';

// Перечисление навыков по порядку
const SKILLS = [
  { name: 'acrobatics', ability: 'dexterity', label: 'Акробатика' },
  { name: 'animalHandling', ability: 'wisdom', label: 'Уход за животными' },
  { name: 'arcana', ability: 'intelligence', label: 'Магия' },
  { name: 'athletics', ability: 'strength', label: 'Атлетика' },
  { name: 'deception', ability: 'charisma', label: 'Обман' },
  { name: 'history', ability: 'intelligence', label: 'История' },
  { name: 'insight', ability: 'wisdom', label: 'Проницательность' },
  { name: 'intimidation', ability: 'charisma', label: 'Запугивание' },
  { name: 'investigation', ability: 'intelligence', label: 'Расследование' },
  { name: 'medicine', ability: 'wisdom', label: 'Медицина' },
  { name: 'nature', ability: 'intelligence', label: 'Природа' },
  { name: 'perception', ability: 'wisdom', label: 'Восприятие' },
  { name: 'performance', ability: 'charisma', label: 'Выступление' },
  { name: 'persuasion', ability: 'charisma', label: 'Убеждение' },
  { name: 'religion', ability: 'intelligence', label: 'Религия' },
  { name: 'sleightOfHand', ability: 'dexterity', label: 'Ловкость рук' },
  { name: 'stealth', ability: 'dexterity', label: 'Скрытность' },
  { name: 'survival', ability: 'wisdom', label: 'Выживание' }
];

interface AbilitiesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const AbilitiesTab: React.FC<AbilitiesTabProps> = ({ character, onUpdate }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [abilities, setAbilities] = useState({
    strength: character.strength || character.abilities?.STR || character.abilities?.strength || 10,
    dexterity: character.dexterity || character.abilities?.DEX || character.abilities?.dexterity || 10,
    constitution: character.constitution || character.abilities?.CON || character.abilities?.constitution || 10,
    intelligence: character.intelligence || character.abilities?.INT || character.abilities?.intelligence || 10,
    wisdom: character.wisdom || character.abilities?.WIS || character.abilities?.wisdom || 10,
    charisma: character.charisma || character.abilities?.CHA || character.abilities?.charisma || 10,
  });
  
  // Инициализация профессий спасбросков
  const [savingThrows, setSavingThrows] = useState<{
    strength: boolean;
    dexterity: boolean;
    constitution: boolean;
    intelligence: boolean;
    wisdom: boolean;
    charisma: boolean;
  }>({
    strength: character.savingThrows?.strength || false,
    dexterity: character.savingThrows?.dexterity || false,
    constitution: character.savingThrows?.constitution || false,
    intelligence: character.savingThrows?.intelligence || false,
    wisdom: character.savingThrows?.wisdom || false,
    charisma: character.savingThrows?.charisma || false,
  });
  
  // Инициализация профессий навыков
  const [skills, setSkills] = useState<Record<string, boolean>>({});
  
  // Инициализация владения навыками из персонажа
  useEffect(() => {
    const initialSkills: Record<string, boolean> = {};
    
    // Инициализируем все навыки как непрофессиональные
    SKILLS.forEach(skill => {
      initialSkills[skill.name] = false;
    });
    
    // Применяем профессионализм из персонажа
    if (character.skills) {
      Object.entries(character.skills).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          initialSkills[key] = value;
        } else if (value && typeof value === 'object' && 'proficient' in value) {
          initialSkills[key] = Boolean(value.proficient);
        }
      });
    }
    
    // Также проверяем профессии в профессиях
    if (character.proficiencies && Array.isArray(character.proficiencies.skills)) {
      character.proficiencies.skills.forEach(skill => {
        // Преобразование имен навыков из русского в английский
        const skillMap: Record<string, string> = {
          'акробатика': 'acrobatics',
          'уход за животными': 'animalHandling',
          'магия': 'arcana',
          'атлетика': 'athletics',
          'обман': 'deception',
          'история': 'history',
          'проницательность': 'insight',
          'запугивание': 'intimidation',
          'расследование': 'investigation',
          'медицина': 'medicine',
          'природа': 'nature',
          'восприятие': 'perception',
          'выступление': 'performance',
          'убеждение': 'persuasion',
          'религия': 'religion',
          'ловкость рук': 'sleightOfHand',
          'скрытность': 'stealth',
          'выживание': 'survival'
        };
        
        const skillName = skillMap[skill.toLowerCase()] || skill.toLowerCase();
        if (skillName in initialSkills) {
          initialSkills[skillName] = true;
        }
      });
    }
    
    setSkills(initialSkills);
  }, [character]);
  
  // Отслеживаем обновление и сохраняем
  useEffect(() => {
    // Записываем текущее состояние обратно в персонажа
    const updatedCharacter: Partial<Character> = {
      strength: abilities.strength,
      dexterity: abilities.dexterity,
      constitution: abilities.constitution,
      intelligence: abilities.intelligence,
      wisdom: abilities.wisdom,
      charisma: abilities.charisma,
      abilities: {
        STR: abilities.strength,
        DEX: abilities.dexterity,
        CON: abilities.constitution,
        INT: abilities.intelligence,
        WIS: abilities.wisdom,
        CHA: abilities.charisma,
        strength: abilities.strength,
        dexterity: abilities.dexterity,
        constitution: abilities.constitution,
        intelligence: abilities.intelligence,
        wisdom: abilities.wisdom,
        charisma: abilities.charisma,
      },
      // Сохраняем профессии спасбросков
      savingThrows: savingThrows,
      // Сохраняем профессии навыков
      skills: skills as Record<string, boolean>,
    };
    
    // Обновляем бонус мастерства, основываясь на уровне
    const profBonus = updateCharacterProficiencyBonus({
      ...character,
      ...updatedCharacter
    });
    
    // Сохраняем обновления
    onUpdate({...updatedCharacter, ...profBonus});
  }, [abilities, savingThrows, skills]);
  
  // Handler for ability score changes
  const handleAbilityChange = (ability: keyof typeof abilities, value: number) => {
    // Ensure value is within valid ranges (3-20 for standard, up to 30 for special cases)
    const clampedValue = Math.max(3, Math.min(30, value));
    setAbilities(prev => ({ ...prev, [ability]: clampedValue }));
  };

  // Handler for saving throw proficiency changes
  const handleSavingThrowChange = (ability: string, checked: boolean) => {
    setSavingThrows(prev => ({ ...prev, [ability]: checked } as typeof savingThrows));
  };

  // Handler for skill proficiency changes
  const handleSkillChange = (skill: string, checked: boolean) => {
    setSkills(prev => ({ ...prev, [skill]: checked }));
  };
  
  // Calculate saving throw bonus
  const getSavingThrowBonus = (ability: keyof typeof abilities) => {
    const abilityMod = calculateModifier(abilities[ability]);
    const profBonus = character.proficiencyBonus || 2;
    const isProficient = savingThrows[ability as keyof typeof savingThrows];
    
    return abilityMod + (isProficient ? profBonus : 0);
  };
  
  // Calculate skill bonus
  const getSkillBonus = (skill: string, ability: keyof typeof abilities) => {
    const abilityMod = calculateModifier(abilities[ability]);
    const profBonus = character.proficiencyBonus || 2;
    const isProficient = skills[skill] || false;
    
    // Проверяем, есть ли особые бонусы для этого навыка
    const extraBonus = character.skillBonuses?.[skill] || 0;
    
    return abilityMod + (isProficient ? profBonus : 0) + extraBonus;
  };

  return (
    <div className="space-y-6">
      {/* MAIN ABILITIES SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Характеристики</CardTitle>
          <CardDescription>
            Основные показатели персонажа, определяющие его сильные и слабые стороны.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <AbilityScoreBox 
              name="STR"
              fullName="Сила"
              value={abilities.strength}
              modifier={calculateModifier(abilities.strength)}
              onChange={(value) => handleAbilityChange('strength', value)}
            />
            <AbilityScoreBox 
              name="DEX"
              fullName="Ловкость"
              value={abilities.dexterity}
              modifier={calculateModifier(abilities.dexterity)}
              onChange={(value) => handleAbilityChange('dexterity', value)}
            />
            <AbilityScoreBox 
              name="CON"
              fullName="Телосложение"
              value={abilities.constitution}
              modifier={calculateModifier(abilities.constitution)}
              onChange={(value) => handleAbilityChange('constitution', value)}
            />
            <AbilityScoreBox 
              name="INT"
              fullName="Интеллект"
              value={abilities.intelligence}
              modifier={calculateModifier(abilities.intelligence)}
              onChange={(value) => handleAbilityChange('intelligence', value)}
            />
            <AbilityScoreBox 
              name="WIS"
              fullName="Мудрость"
              value={abilities.wisdom}
              modifier={calculateModifier(abilities.wisdom)}
              onChange={(value) => handleAbilityChange('wisdom', value)}
            />
            <AbilityScoreBox 
              name="CHA"
              fullName="Харизма"
              value={abilities.charisma}
              modifier={calculateModifier(abilities.charisma)}
              onChange={(value) => handleAbilityChange('charisma', value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* SAVING THROWS AND SKILLS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SAVING THROWS */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex justify-between items-center">
                <span>Спасброски</span>
                <Badge variant="outline" className="font-normal">
                  {character.proficiencyBonus ? `+${character.proficiencyBonus}` : '+2'} бонус мастерства
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((ability) => (
                <div key={ability} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/40">
                  <Checkbox 
                    id={`st-${ability}`}
                    checked={savingThrows[ability] || false}
                    onCheckedChange={(checked) => handleSavingThrowChange(ability, Boolean(checked))}
                  />
                  <Label htmlFor={`st-${ability}`} className="flex-1 flex justify-between cursor-pointer">
                    <span>{getAbilityNameFull(ability as keyof typeof abilities)}</span>
                    <span className={`${savingThrows[ability] ? 'font-bold' : 'text-muted-foreground'}`}>
                      {getSavingThrowBonus(ability as keyof typeof abilities) >= 0 ? '+' : ''}
                      {getSavingThrowBonus(ability as keyof typeof abilities)}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* SKILLS */}
        <Card>
          <CardHeader>
            <CardTitle>Навыки</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto max-h-[400px]">
            <div className="space-y-1">
              {SKILLS.map(skill => (
                <div key={skill.name} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/40">
                  <Checkbox 
                    id={`skill-${skill.name}`}
                    checked={skills[skill.name] || false}
                    onCheckedChange={(checked) => handleSkillChange(skill.name, Boolean(checked))}
                  />
                  <Label 
                    htmlFor={`skill-${skill.name}`}
                    className="flex-1 flex justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center">
                        {getAbilityNameFull(skill.ability as keyof typeof abilities).charAt(0)}
                      </Badge>
                      <span>{skill.label}</span>
                    </div>
                    <span className={`${skills[skill.name] ? 'font-bold' : 'text-muted-foreground'}`}>
                      {getSkillBonus(skill.name, skill.ability as keyof typeof abilities) >= 0 ? '+' : ''}
                      {getSkillBonus(skill.name, skill.ability as keyof typeof abilities)}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* PROFICIENCIES SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Владение</CardTitle>
          <CardDescription>
            Владение оружием, доспехами, инструментами и языками.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Languages */}
            <div>
              <h4 className="font-semibold mb-2">Языки</h4>
              <div className="flex flex-wrap gap-2">
                {character.proficiencies?.languages && character.proficiencies.languages.length > 0 ? (
                  character.proficiencies.languages.map((lang, index) => (
                    <Badge key={`lang-${index}`} variant="secondary">
                      {lang}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Нет владения языками</p>
                )}
              </div>
            </div>
            
            {/* Weapons */}
            <div>
              <h4 className="font-semibold mb-2">Оружие</h4>
              <div className="flex flex-wrap gap-2">
                {character.proficiencies?.weapons && character.proficiencies.weapons.length > 0 ? (
                  character.proficiencies.weapons.map((weapon, index) => (
                    <Badge key={`weapon-${index}`} variant="secondary">
                      {weapon}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Нет владения оружием</p>
                )}
              </div>
            </div>
            
            {/* Tools */}
            <div>
              <h4 className="font-semibold mb-2">Инструменты</h4>
              <div className="flex flex-wrap gap-2">
                {character.proficiencies?.tools && character.proficiencies.tools.length > 0 ? (
                  character.proficiencies.tools.map((tool, index) => (
                    <Badge key={`tool-${index}`} variant="secondary">
                      {tool}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Нет владения инструментами</p>
                )}
              </div>
            </div>
            
            {/* Armor */}
            <div>
              <h4 className="font-semibold mb-2">Доспехи</h4>
              <div className="flex flex-wrap gap-2">
                {character.proficiencies?.armor && character.proficiencies.armor.length > 0 ? (
                  character.proficiencies.armor.map((armor, index) => (
                    <Badge key={`armor-${index}`} variant="secondary">
                      {armor}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Нет владения доспехами</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbilitiesTab;
